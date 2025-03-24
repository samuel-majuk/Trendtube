// YouTube API service

const API_KEY = "AIzaSyBSmIqBMhoA4GizqulGW1cK6l9es5E5jxY";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideo {
  id: string;
  title: string;
  channelName: string;
  channelId: string;
  channelAvatar: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  publishedAt: string;
  category: string;
  description: string;
}

export interface SearchResult {
  videos: YouTubeVideo[];
  nextPageToken?: string;
}

// Format ISO 8601 duration to readable format
const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "0:00";

  const hours = match[1] ? parseInt(match[1].slice(0, -1)) : 0;
  const minutes = match[2] ? parseInt(match[2].slice(0, -1)) : 0;
  const seconds = match[3] ? parseInt(match[3].slice(0, -1)) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Format date to relative time (e.g., "2 weeks ago")
const formatPublishedDate = (publishedAt: string): string => {
  const published = new Date(publishedAt);
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - published.getTime()) / 1000,
  );

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  if (diffInSeconds < intervals.minute) {
    return "just now";
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};

// Get video category name from category ID
const getCategoryName = async (categoryId: string): Promise<string> => {
  try {
    const response = await fetch(
      `${BASE_URL}/videoCategories?part=snippet&id=${categoryId}&key=${API_KEY}`,
    );
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.title;
    }
    return "Uncategorized";
  } catch (error) {
    console.error("Error fetching category:", error);
    return "Uncategorized";
  }
};

// Search videos with query and filters
export const searchVideos = async (
  query: string = "",
  pageToken?: string,
  filters: any = {},
): Promise<SearchResult> => {
  try {
    // Build search URL with query and filters
    let url = `${BASE_URL}/search?part=snippet&maxResults=12&type=video&q=${encodeURIComponent(
      query || "popular videos",
    )}&key=${API_KEY}`;

    // Add page token if available
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    // Add filters
    if (filters.publishedAfter) {
      url += `&publishedAfter=${filters.publishedAfter}`;
    }
    if (filters.publishedBefore) {
      url += `&publishedBefore=${filters.publishedBefore}`;
    }
    if (filters.videoCategoryId) {
      url += `&videoCategoryId=${filters.videoCategoryId}`;
    }
    if (filters.videoDuration) {
      url += `&videoDuration=${filters.videoDuration}`;
    }

    console.log(`Fetching search results for: ${query || "popular videos"}`);
    // Fetch search results
    const searchResponse = await fetch(url);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.log("No search results found, returning fallback videos");
      return {
        videos: generateFallbackVideos(12, query || "Search"),
        nextPageToken: undefined,
      };
    }

    // Get video IDs for detailed info
    const videoIds = searchData.items
      .map((item: any) => item.id.videoId)
      .join(",");

    // Fetch detailed video information
    const videoResponse = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`,
    );
    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      console.log("No detailed video data found, returning fallback videos");
      return {
        videos: generateFallbackVideos(12, query || "Search"),
        nextPageToken: undefined,
      };
    }

    // Process video data directly without additional API calls
    const videos = videoData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelName: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      channelAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.snippet.channelTitle}`,
      thumbnailUrl:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.default?.url,
      viewCount: parseInt(item.statistics.viewCount || "0"),
      likeCount: parseInt(item.statistics.likeCount || "0"),
      commentCount: parseInt(item.statistics.commentCount || "0"),
      duration: formatDuration(item.contentDetails.duration),
      publishedAt: formatPublishedDate(item.snippet.publishedAt),
      category: query || "Search Results",
      description: item.snippet.description || "",
    }));

    console.log(
      `Successfully fetched ${videos.length} videos for search: ${query || "popular videos"}`,
    );
    return {
      videos,
      nextPageToken: searchData.nextPageToken,
    };
  } catch (error) {
    console.error("Error fetching videos:", error);
    return {
      videos: generateFallbackVideos(12, query || "Search"),
      nextPageToken: undefined,
    };
  }
};

// Get trending videos
export const getTrendingVideos = async (
  regionCode = "US",
  categoryId = "",
): Promise<YouTubeVideo[]> => {
  try {
    // For testing purposes, use search instead of mostPopular to ensure we get results
    let url = `${BASE_URL}/search?part=snippet&maxResults=24&type=video&q=trending&relevanceLanguage=en&key=${API_KEY}`;

    const searchResponse = await fetch(url);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.log("No trending videos found");
      return [];
    }

    // Get video IDs for detailed info
    const videoIds = searchData.items
      .map((item: any) => item.id.videoId)
      .join(",");

    // Fetch detailed video information
    const videoResponse = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`,
    );
    const videoData = await videoResponse.json();

    if (!videoData.items) {
      console.log("No detailed data found for trending videos");
      return [];
    }

    // Process video data directly without additional API calls
    const videos = videoData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelName: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      channelAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.snippet.channelTitle}`,
      thumbnailUrl:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.default?.url,
      viewCount: parseInt(item.statistics.viewCount || "0"),
      likeCount: parseInt(item.statistics.likeCount || "0"),
      commentCount: parseInt(item.statistics.commentCount || "0"),
      duration: formatDuration(item.contentDetails.duration),
      publishedAt: formatPublishedDate(item.snippet.publishedAt),
      category: "Trending",
      description: item.snippet.description || "",
    }));

    console.log(`Successfully fetched ${videos.length} trending videos`);
    return videos;
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    // Return fallback videos for testing
    return generateFallbackVideos(8, "Trending");
  }
};

// Get videos by category
export const getVideosByCategory = async (
  category: string,
  maxResults = 12,
): Promise<YouTubeVideo[]> => {
  try {
    // Use direct API call to get videos by category search term
    let url = `${BASE_URL}/search?part=snippet&maxResults=${maxResults}&type=video&q=${encodeURIComponent(category)}&key=${API_KEY}`;

    const searchResponse = await fetch(url);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.log(`No videos found for category: ${category}`);
      return [];
    }

    // Get video IDs for detailed info
    const videoIds = searchData.items
      .map((item: any) => item.id.videoId)
      .join(",");

    // Fetch detailed video information
    const videoResponse = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`,
    );
    const videoData = await videoResponse.json();

    if (!videoData.items) {
      console.log(`No detailed data found for videos in category: ${category}`);
      return [];
    }

    // Process video data
    const videos = videoData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelName: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      channelAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.snippet.channelTitle}`,
      thumbnailUrl:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.default?.url,
      viewCount: parseInt(item.statistics.viewCount) || 0,
      likeCount: parseInt(item.statistics.likeCount) || 0,
      commentCount: parseInt(item.statistics.commentCount) || 0,
      duration: formatDuration(item.contentDetails.duration),
      publishedAt: formatPublishedDate(item.snippet.publishedAt),
      category: category,
      description: item.snippet.description,
    }));

    console.log(
      `Successfully fetched ${videos.length} videos for category: ${category}`,
    );
    return videos;
  } catch (error) {
    console.error(`Error fetching ${category} videos:`, error);
    return [];
  }
};

// Get video categories
export const getVideoCategories = async (regionCode = "US"): Promise<any[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/videoCategories?part=snippet&regionCode=${regionCode}&key=${API_KEY}`,
    );
    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: item.id,
      name: item.snippet.title,
    }));
  } catch (error) {
    console.error("Error fetching video categories:", error);
    return [];
  }
};

// Get search suggestions
export const getSearchSuggestions = async (
  query: string,
): Promise<string[]> => {
  if (!query || query.trim() === "") return [];

  try {
    // Using YouTube's suggestion API
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}&key=${API_KEY}`,
      { mode: "cors" },
    );

    // If CORS is an issue, we'll return some basic suggestions
    if (!response.ok) {
      return [
        `${query} tutorial`,
        `${query} review`,
        `${query} explained`,
        `best ${query}`,
        `${query} 2023`,
      ];
    }

    const data = await response.json();
    return data[1] || [];
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    // Fallback suggestions
    return [
      `${query} tutorial`,
      `${query} review`,
      `${query} explained`,
      `best ${query}`,
      `${query} 2023`,
    ];
  }
};

// Generate fallback videos for testing when API fails
const generateFallbackVideos = (
  count: number,
  category: string,
): YouTubeVideo[] => {
  const videos: YouTubeVideo[] = [];
  const titles = [
    "How to Build a Next.js Application with Tailwind CSS",
    "5 AI Tools Every Content Creator Should Be Using in 2023",
    "The Ultimate Guide to YouTube SEO",
    "React Server Components Explained",
    "Building a Modern Web Application from Scratch",
    "JavaScript Tips and Tricks You Need to Know",
    "Creating Responsive Layouts with CSS Grid",
    "TypeScript for Beginners - Full Course",
    "How to Optimize Your Website for Speed",
    "The Future of Web Development in 2023",
    "10 VS Code Extensions Every Developer Should Use",
    "Understanding Async/Await in JavaScript",
  ];

  const channels = [
    "TechTutorials",
    "CodeWithMe",
    "WebDevSimplified",
    "JavaScript Mastery",
    "CSS Tricks",
    "React University",
    "Next.js Official",
    "TypeScript Guru",
    "Frontend Masters",
  ];

  for (let i = 0; i < count; i++) {
    const title = titles[i % titles.length];
    const channelName = channels[i % channels.length];

    videos.push({
      id: `fallback-${i}-${Date.now()}`,
      title,
      channelName,
      channelId: `channel-${i}`,
      channelAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${channelName}`,
      thumbnailUrl: `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&q=80&random=${i}`,
      viewCount: 50000 + Math.floor(Math.random() * 950000),
      likeCount: 5000 + Math.floor(Math.random() * 45000),
      commentCount: 500 + Math.floor(Math.random() * 2500),
      duration: `${Math.floor(Math.random() * 10) + 1}:${(Math.floor(Math.random() * 59) + 1).toString().padStart(2, "0")}`,
      publishedAt: `${Math.floor(Math.random() * 4) + 1} weeks ago`,
      category,
      description: `This is a fallback video description for testing purposes. Category: ${category}`,
    });
  }

  return videos;
};

// Add TypeScript interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
