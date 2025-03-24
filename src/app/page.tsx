"use client";

import { useEffect, useState, useRef } from "react";
import {
  Search,
  TrendingUp,
  BarChart2,
  Lightbulb,
  Compass,
  Sparkles,
  HomeIcon,
  Flame as Fire,
  LineChart,
  Zap,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import VideoGrid from "@/components/VideoGrid";
import TrendingTopics from "@/components/TrendingTopics";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import ContentRecommendations from "@/components/ContentRecommendations";
import {
  searchVideos,
  getTrendingVideos,
  getVideosByCategory,
  YouTubeVideo,
} from "@/lib/youtube-api";

export default function Home() {
  const [activeTab, setActiveTab] = useState("discover");
  const [nicheVideos, setNicheVideos] = useState<{
    [key: string]: YouTubeVideo[];
  }>({});
  const niches = [
    "Entertainment",
    "Sports",
    "Business",
    "Artificial Intelligence",
    "Science",
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [hasMore, setHasMore] = useState(true);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<YouTubeVideo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [currentFilters, setCurrentFilters] = useState<any>({});
  const [layout, setLayout] = useState<"grid" | "masonry">("grid");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load initial trending videos and niche videos
  useEffect(() => {
    const loadInitialVideos = async () => {
      if (initialLoadComplete) return;

      setIsLoading(true);
      console.log("Loading initial videos...");
      try {
        // Load trending videos
        console.log("Fetching trending videos...");
        const trending = await getTrendingVideos();
        console.log(`Fetched ${trending.length} trending videos`);
        setTrendingVideos(trending);

        // Load videos for each niche
        const nicheResults: { [key: string]: YouTubeVideo[] } = {};
        console.log("Fetching niche videos...");

        // Process niches sequentially to avoid rate limiting
        for (const niche of niches) {
          try {
            console.log(`Fetching videos for niche: ${niche}`);
            const videos = await getVideosByCategory(niche, 8);
            console.log(`Fetched ${videos.length} videos for niche: ${niche}`);
            nicheResults[niche] = videos;
          } catch (error) {
            console.error(`Error loading ${niche} videos:`, error);
            nicheResults[niche] = [];
          }
        }

        console.log("Setting niche videos state...");
        setNicheVideos(nicheResults);
        setInitialLoadComplete(true);
        console.log("Initial video loading complete");
      } catch (error) {
        console.error("Error loading initial videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialVideos();
  }, [niches, initialLoadComplete]);

  // Handle search
  const handleSearch = async (query: string, filters = {}) => {
    if (!query.trim()) return;

    setActiveTab("search");
    setIsLoading(true);
    setCurrentFilters(filters);
    setSearchQuery(query);

    try {
      const result = await searchVideos(query, undefined, filters);
      setVideos(result.videos);
      setNextPageToken(result.nextPageToken);
      setHasMore(!!result.nextPageToken);
    } catch (error) {
      console.error("Error searching videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more videos for infinite scroll
  const loadMoreVideos = async () => {
    if (!nextPageToken || isLoading) return;

    setIsLoading(true);
    try {
      const result = await searchVideos(
        searchQuery,
        nextPageToken,
        currentFilters,
      );
      setVideos([...videos, ...result.videos]);
      setNextPageToken(result.nextPageToken);
      setHasMore(!!result.nextPageToken);
    } catch (error) {
      console.error("Error loading more videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        !isLoading &&
        hasMore
      ) {
        loadMoreVideos();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasMore, nextPageToken]);

  // Handle filter changes from SearchFilters component
  const handleFilterChange = (filters: any) => {
    handleSearch(filters.searchTerm, filters);
  };

  return (
    <main className="min-h-screen bg-background w-full pb-24">
      <Header onSearch={(term) => handleSearch(term)} />

      <div className="w-full px-4 py-6 max-w-7xl mx-auto">
        {/* Main Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          {/* Discover Tab Content */}
          <TabsContent value="discover" className="space-y-8">
            <SearchFilters onLayoutChange={setLayout} />

            {niches.map((niche) => (
              <div key={niche} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {niche === "Entertainment" && (
                      <Sparkles className="h-5 w-5 text-primary" />
                    )}
                    {niche === "Sports" && (
                      <TrendingUp className="h-5 w-5 text-primary" />
                    )}
                    {niche === "Business" && (
                      <BarChart2 className="h-5 w-5 text-primary" />
                    )}
                    {niche === "Artificial Intelligence" && (
                      <Zap className="h-5 w-5 text-primary" />
                    )}
                    {niche === "Science" && (
                      <Lightbulb className="h-5 w-5 text-primary" />
                    )}
                    {niche}
                  </h2>
                </div>
                <VideoGrid
                  videos={nicheVideos[niche] || []}
                  isLoading={isLoading && !nicheVideos[niche]?.length}
                  layout={layout}
                />
              </div>
            ))}

            <div className="lg:hidden mt-8">
              <TrendingTopics />
            </div>
          </TabsContent>

          {/* Search Results Tab Content */}
          <TabsContent value="search" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="col-span-full">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      Search Results
                    </h2>
                    {searchQuery && (
                      <p className="text-muted-foreground">
                        Showing results for "{searchQuery}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <SearchFilters
                onSearch={handleFilterChange}
                onLayoutChange={setLayout}
                hideSearchInput={false}
              />
              <VideoGrid
                videos={videos}
                isLoading={isLoading}
                hasMore={hasMore}
                onLoadMore={loadMoreVideos}
                layout={layout}
              />
            </div>
          </TabsContent>

          {/* Trending Tab Content */}
          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="col-span-full">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                      <Fire className="h-5 w-5 text-primary" />
                      Trending Now
                    </h2>
                    <p className="text-muted-foreground">
                      Discover what's popular on YouTube right now
                    </p>
                  </div>
                </div>
              </div>
              <VideoGrid
                videos={trendingVideos}
                isLoading={isLoading && !trendingVideos.length}
                layout="masonry"
              />
            </div>
          </TabsContent>

          {/* Analytics Tab Content */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          {/* Ideas Tab Content */}
          <TabsContent value="ideas" className="space-y-6">
            <ContentRecommendations />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg">
        <div className="max-w-xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-transparent py-2 grid grid-cols-4 h-auto">
              <TabsTrigger
                value="discover"
                className="flex flex-col items-center justify-center py-2 data-[state=active]:bg-primary/10 rounded-lg"
              >
                <HomeIcon className="h-5 w-5 mb-1" />
                <span className="text-xs">Discover</span>
              </TabsTrigger>
              <TabsTrigger
                value="trending"
                className="flex flex-col items-center justify-center py-2 data-[state=active]:bg-primary/10 rounded-lg"
              >
                <Fire className="h-5 w-5 mb-1" />
                <span className="text-xs">Trending</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex flex-col items-center justify-center py-2 data-[state=active]:bg-primary/10 rounded-lg"
              >
                <LineChart className="h-5 w-5 mb-1" />
                <span className="text-xs">Analytics</span>
              </TabsTrigger>
              <TabsTrigger
                value="ideas"
                className="flex flex-col items-center justify-center py-2 data-[state=active]:bg-primary/10 rounded-lg"
              >
                <Sparkles className="h-5 w-5 mb-1" />
                <span className="text-xs">Ideas</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
