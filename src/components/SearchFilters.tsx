"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Clock,
  Tag,
  ThumbsUp,
  MessageSquare,
  Eye,
  Filter,
  X,
  SlidersHorizontal,
  LayoutGrid,
  Columns,
  RefreshCw,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarUI, type DateRange } from "./ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { getVideoCategories } from "@/lib/youtube-api";

interface SearchFiltersProps {
  onSearch?: (filters: FilterState) => void;
  onLayoutChange?: (layout: "grid" | "masonry") => void;
  className?: string;
  hideSearchInput?: boolean;
}

export interface FilterState {
  searchTerm: string;
  dateRange: DateRange;
  duration: [number, number];
  category: string;
  minViews: number;
  minLikes: number;
  minComments: number;
  activeFilters: string[];
  order?: string;
  regionCode?: string;
}

const defaultVideoCategories = [
  { id: "all", name: "All Categories" },
  { id: "10", name: "Music" },
  { id: "20", name: "Gaming" },
  { id: "22", name: "People & Blogs" },
  { id: "23", name: "Comedy" },
  { id: "24", name: "Entertainment" },
  { id: "25", name: "News & Politics" },
  { id: "26", name: "How-to & Style" },
  { id: "27", name: "Education" },
  { id: "28", name: "Science & Technology" },
];

const orderOptions = [
  { id: "relevance", name: "Relevance" },
  { id: "date", name: "Upload Date" },
  { id: "viewCount", name: "View Count" },
  { id: "rating", name: "Rating" },
];

const regionOptions = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "BR", name: "Brazil" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
];

const SearchFilters = ({
  onSearch = () => {},
  onLayoutChange = () => {},
  className,
  hideSearchInput = true,
}: SearchFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    dateRange: { from: undefined, to: undefined },
    duration: [0, 60], // in minutes
    category: "all",
    minViews: 0,
    minLikes: 0,
    minComments: 0,
    activeFilters: [],
    order: "relevance",
    regionCode: "US",
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const [isEngagementOpen, setIsEngagementOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [videoCategories, setVideoCategories] = useState(
    defaultVideoCategories,
  );
  const [layout, setLayout] = useState<"grid" | "masonry">("grid");

  // Fetch video categories from YouTube API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getVideoCategories(filters.regionCode);
        if (categories && categories.length > 0) {
          setVideoCategories([
            { id: "all", name: "All Categories" },
            ...categories,
          ]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [filters.regionCode]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchTerm: e.target.value });
  };

  const handleDateSelect = (range: DateRange) => {
    setFilters({
      ...filters,
      dateRange: range,
      activeFilters: updateActiveFilters(
        "date",
        range.from && range.to ? true : false,
      ),
    });
  };

  const handleDurationChange = (value: number[]) => {
    setFilters({
      ...filters,
      duration: [value[0], value[1]] as [number, number],
      activeFilters: updateActiveFilters("duration", true),
    });
  };

  const handleCategoryChange = (value: string) => {
    setFilters({
      ...filters,
      category: value,
      activeFilters: updateActiveFilters("category", value !== "all"),
    });
  };

  const handleOrderChange = (value: string) => {
    setFilters({
      ...filters,
      order: value,
      activeFilters: updateActiveFilters("order", value !== "relevance"),
    });
  };

  const handleRegionChange = (value: string) => {
    setFilters({
      ...filters,
      regionCode: value,
      activeFilters: updateActiveFilters("region", value !== "US"),
    });
  };

  const handleEngagementChange = (
    type: "views" | "likes" | "comments",
    value: number,
  ) => {
    setFilters({
      ...filters,
      [type === "views"
        ? "minViews"
        : type === "likes"
          ? "minLikes"
          : "minComments"]: value,
      activeFilters: updateActiveFilters(type, value > 0),
    });
  };

  const updateActiveFilters = (filter: string, isActive: boolean) => {
    const current = [...filters.activeFilters];
    if (isActive && !current.includes(filter)) {
      current.push(filter);
    } else if (!isActive && current.includes(filter)) {
      return current.filter((f) => f !== filter);
    }
    return current;
  };

  const removeFilter = (filter: string) => {
    let updatedFilters = { ...filters };

    switch (filter) {
      case "date":
        updatedFilters.dateRange = { from: undefined, to: undefined };
        break;
      case "duration":
        updatedFilters.duration = [0, 60];
        break;
      case "category":
        updatedFilters.category = "all";
        break;
      case "views":
        updatedFilters.minViews = 0;
        break;
      case "likes":
        updatedFilters.minLikes = 0;
        break;
      case "comments":
        updatedFilters.minComments = 0;
        break;
      case "order":
        updatedFilters.order = "relevance";
        break;
      case "region":
        updatedFilters.regionCode = "US";
        break;
    }

    updatedFilters.activeFilters = updatedFilters.activeFilters.filter(
      (f) => f !== filter,
    );
    setFilters(updatedFilters);
  };

  const resetAllFilters = () => {
    setFilters({
      searchTerm: filters.searchTerm, // Keep the search term
      dateRange: { from: undefined, to: undefined },
      duration: [0, 60],
      category: "all",
      minViews: 0,
      minLikes: 0,
      minComments: 0,
      activeFilters: [],
      order: "relevance",
      regionCode: "US",
    });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const toggleLayout = () => {
    const newLayout = layout === "grid" ? "masonry" : "grid";
    setLayout(newLayout);
    onLayoutChange(newLayout);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Convert date range to ISO strings for YouTube API
  const getDateRangeForAPI = () => {
    if (!filters.dateRange.from || !filters.dateRange.to) return {};

    // YouTube API requires RFC 3339 format
    const publishedAfter = filters.dateRange.from.toISOString();
    const publishedBefore = filters.dateRange.to.toISOString();

    return { publishedAfter, publishedBefore };
  };

  // Convert duration range to YouTube API format
  const getDurationForAPI = () => {
    const [min, max] = filters.duration;

    if (min === 0 && max >= 60) {
      return "any";
    } else if (min === 0 && max < 4) {
      return "short"; // Less than 4 minutes
    } else if (min >= 0 && max <= 20) {
      return "medium"; // Between 4 and 20 minutes
    } else {
      return "long"; // Longer than 20 minutes
    }
  };

  return (
    <div
      className={cn(
        "w-full bg-background p-4 rounded-lg border shadow-md",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        {/* Filter Controls Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filter Options
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleLayout}
              className="flex"
              title={
                layout === "grid"
                  ? "Switch to masonry layout"
                  : "Switch to grid layout"
              }
            >
              {layout === "grid" ? (
                <Columns className="h-4 w-4" />
              ) : (
                <LayoutGrid className="h-4 w-4" />
              )}
            </Button>
            {filters.activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAllFilters}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>

        {!hideSearchInput && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for videos..."
                value={filters.searchTerm}
                onChange={handleSearchChange}
                className="pl-10 w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-primary/90 hover:bg-primary"
            >
              Search
            </Button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {/* Date Range Filter */}
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" />
                <span>Date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarUI
                mode="range"
                selected={filters.dateRange}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Duration Filter */}
          <Popover open={isDurationOpen} onOpenChange={setIsDurationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Clock className="h-4 w-4" />
                <span>Duration</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="start">
              <div className="space-y-4">
                <h4 className="font-medium">Video Duration</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{formatDuration(filters.duration[0])}</span>
                    <span>{formatDuration(filters.duration[1])}</span>
                  </div>
                  <Slider
                    defaultValue={[filters.duration[0], filters.duration[1]]}
                    min={0}
                    max={60}
                    step={1}
                    onValueChange={handleDurationChange}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Category Filter */}
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-9 w-[180px] flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {videoCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Engagement Metrics Filter */}
          <Popover open={isEngagementOpen} onOpenChange={setIsEngagementOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Engagement</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="start">
              <div className="space-y-4">
                <h4 className="font-medium">Minimum Engagement</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Views
                      </label>
                      <span className="text-sm">
                        {filters.minViews.toLocaleString()}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[filters.minViews]}
                      min={0}
                      max={1000000}
                      step={1000}
                      onValueChange={(value) =>
                        handleEngagementChange("views", value[0])
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> Likes
                      </label>
                      <span className="text-sm">
                        {filters.minLikes.toLocaleString()}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[filters.minLikes]}
                      min={0}
                      max={100000}
                      step={100}
                      onValueChange={(value) =>
                        handleEngagementChange("likes", value[0])
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> Comments
                      </label>
                      <span className="text-sm">
                        {filters.minComments.toLocaleString()}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[filters.minComments]}
                      min={0}
                      max={10000}
                      step={10}
                      onValueChange={(value) =>
                        handleEngagementChange("comments", value[0])
                      }
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Advanced Filters */}
          <Popover
            open={isAdvancedFiltersOpen}
            onOpenChange={setIsAdvancedFiltersOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Advanced</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Sort By</h4>
                  <Select
                    value={filters.order}
                    onValueChange={handleOrderChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Region</h4>
                  <Select
                    value={filters.regionCode}
                    onValueChange={handleRegionChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regionOptions.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Reset Filters Button */}
          {filters.activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="flex items-center gap-1 ml-auto"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {filters.activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.activeFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                {filter === "date" && (
                  <>
                    <Calendar className="h-3 w-3" />
                    <span>
                      {filters.dateRange.from?.toLocaleDateString()} -{" "}
                      {filters.dateRange.to?.toLocaleDateString()}
                    </span>
                  </>
                )}
                {filter === "duration" && (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDuration(filters.duration[0])} -{" "}
                      {formatDuration(filters.duration[1])}
                    </span>
                  </>
                )}
                {filter === "category" && (
                  <>
                    <Tag className="h-3 w-3" />
                    <span>
                      {
                        videoCategories.find((c) => c.id === filters.category)
                          ?.name
                      }
                    </span>
                  </>
                )}
                {filter === "views" && (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Min {filters.minViews.toLocaleString()} views</span>
                  </>
                )}
                {filter === "likes" && (
                  <>
                    <ThumbsUp className="h-3 w-3" />
                    <span>Min {filters.minLikes.toLocaleString()} likes</span>
                  </>
                )}
                {filter === "comments" && (
                  <>
                    <MessageSquare className="h-3 w-3" />
                    <span>
                      Min {filters.minComments.toLocaleString()} comments
                    </span>
                  </>
                )}
                {filter === "order" && (
                  <>
                    <Filter className="h-3 w-3" />
                    <span>
                      {orderOptions.find((o) => o.id === filters.order)?.name}
                    </span>
                  </>
                )}
                {filter === "region" && (
                  <>
                    <Filter className="h-3 w-3" />
                    <span>
                      {
                        regionOptions.find((r) => r.code === filters.regionCode)
                          ?.name
                      }
                    </span>
                  </>
                )}
                <button
                  onClick={() => removeFilter(filter)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
