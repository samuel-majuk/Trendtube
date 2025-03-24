"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import VideoCard from "./VideoCard";
import { Loader2, VideoOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { YouTubeVideo } from "@/lib/youtube-api";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

interface VideoGridProps {
  videos?: YouTubeVideo[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  filters?: Record<string, any>;
  className?: string;
  layout?: "grid" | "masonry";
}

const VideoGrid = ({
  videos = [],
  isLoading = false,
  hasMore = true,
  onLoadMore = () => {},
  filters = {},
  className,
  layout = "grid",
}: VideoGridProps) => {
  const [displayedVideos, setDisplayedVideos] =
    useState<YouTubeVideo[]>(videos);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [animateIn, setAnimateIn] = useState(false);

  // Handle infinite scroll
  const lastVideoElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore],
  );

  // Update displayed videos when videos prop changes
  useEffect(() => {
    setDisplayedVideos(videos);
    // Add animation when videos load
    setAnimateIn(true);
    const timer = setTimeout(() => setAnimateIn(false), 500);
    return () => clearTimeout(timer);
  }, [videos]);

  // Determine grid layout based on screen size and layout prop
  const gridClass =
    layout === "masonry"
      ? "columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6"
      : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";

  // Render skeleton loaders when loading
  const renderSkeletons = () => {
    const skeletonCount = 8; // Number of skeleton cards to show
    const skeletons = [];

    for (let i = 0; i < skeletonCount; i++) {
      skeletons.push(
        <div key={`skeleton-${i}`} className="w-full">
          <div className="bg-card rounded-xl overflow-hidden border border-border/50 h-full flex flex-col shadow-sm">
            {/* Thumbnail skeleton */}
            <div className="aspect-video relative">
              <Skeleton className="w-full h-full" />
              {/* Duration skeleton */}
              <div className="absolute bottom-2 right-2">
                <Skeleton className="h-5 w-12 rounded-md" />
              </div>
              {/* Category skeleton */}
              <div className="absolute top-2 left-2">
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>

            {/* Title skeleton */}
            <div className="p-4 pb-2">
              <Skeleton className="h-5 w-full mb-1" />
              <Skeleton className="h-5 w-3/4" />
            </div>

            {/* Channel info skeleton */}
            <div className="p-4 pt-2 pb-3 flex-grow">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>

              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            {/* Footer skeleton */}
            <div className="p-4 pt-0 border-t flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>,
      );
    }

    return skeletons;
  };

  return (
    <div className={cn("w-full bg-background", className)}>
      <div
        className={cn(
          gridClass,
          animateIn && "animate-in fade-in-0 duration-500",
        )}
      >
        {/* Show skeletons when loading and no videos are displayed yet */}
        {isLoading && displayedVideos.length === 0
          ? renderSkeletons()
          : displayedVideos.map((video, index) => {
              const videoCard = (
                <VideoCard
                  id={video.id}
                  title={video.title}
                  channelName={video.channelName}
                  channelAvatar={video.channelAvatar}
                  thumbnailUrl={video.thumbnailUrl}
                  viewCount={video.viewCount}
                  likeCount={video.likeCount}
                  commentCount={video.commentCount}
                  duration={video.duration}
                  publishedAt={video.publishedAt}
                  category={video.category}
                  description={video.description}
                  onClick={() =>
                    window.open(
                      `https://youtube.com/watch?v=${video.id}`,
                      "_blank",
                    )
                  }
                />
              );

              if (layout === "masonry") {
                return (
                  <div
                    key={`${video.id}-${index}`}
                    className={`mb-6 ${displayedVideos.length === index + 1 ? "last-video" : ""}`}
                    ref={
                      displayedVideos.length === index + 1
                        ? lastVideoElementRef
                        : null
                    }
                  >
                    {videoCard}
                  </div>
                );
              } else {
                if (displayedVideos.length === index + 1) {
                  return (
                    <div
                      ref={lastVideoElementRef}
                      key={`${video.id}-${index}`}
                      className="transform transition-all duration-300 hover:scale-[1.02]"
                    >
                      {videoCard}
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={`${video.id}-${index}`}
                      className="transform transition-all duration-300 hover:scale-[1.02]"
                    >
                      {videoCard}
                    </div>
                  );
                }
              }
            })}
      </div>

      {/* Loading indicator for more videos */}
      {isLoading && displayedVideos.length > 0 && (
        <div
          ref={loadingRef}
          className="w-full flex justify-center items-center py-8"
        >
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              Loading more videos...
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {displayedVideos.length === 0 && !isLoading && (
        <div className="w-full flex flex-col items-center justify-center py-16 bg-muted/20 rounded-xl">
          <div className="bg-muted/30 p-6 rounded-full mb-4">
            <VideoOff className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No videos found</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Try adjusting your search filters or try a different search term.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset Filters
          </Button>
        </div>
      )}

      {/* End of results message */}
      {!hasMore && displayedVideos.length > 0 && !isLoading && (
        <div className="text-center my-8 py-4 border-t border-muted">
          <p className="text-muted-foreground">
            You've reached the end of the results
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
