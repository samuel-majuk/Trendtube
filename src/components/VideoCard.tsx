"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ThumbsUp,
  MessageCircle,
  Eye,
  Clock,
  Play,
  Share2,
  Bookmark,
  ExternalLink,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "./ui/button";

interface VideoCardProps {
  id?: string;
  title?: string;
  channelName?: string;
  channelAvatar?: string;
  thumbnailUrl?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  duration?: string;
  publishedAt?: string;
  category?: string;
  description?: string;
  onClick?: () => void;
}

const VideoCard = ({
  id = "dQw4w9WgXcQ",
  title = "Never Gonna Give You Up - Rick Astley",
  channelName = "Rick Astley",
  channelAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=rickastley",
  thumbnailUrl = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80",
  viewCount = 1243789,
  likeCount = 45678,
  commentCount = 3214,
  duration = "3:32",
  publishedAt = "2 weeks ago",
  category = "Music",
  description = "",
  onClick = () => {},
}: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format numbers for better readability
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Share functionality would go here
    if (navigator.share) {
      navigator
        .share({
          title: title,
          text: description || `Check out this video: ${title}`,
          url: `https://youtube.com/watch?v=${id}`,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard
        .writeText(`https://youtube.com/watch?v=${id}`)
        .then(() => alert("Link copied to clipboard!"))
        .catch((err) => console.error("Error copying link:", err));
    }
  };

  const handleWatchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://youtube.com/watch?v=${id}`, "_blank");
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Handle mouse enter/leave for video preview
  const handleMouseEnter = () => {
    setIsHovered(true);

    // Clear any existing timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
    }

    // Start playing after a short delay
    hoverTimeoutRef.current = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);

            // Stop playing after 5 seconds
            stopTimeoutRef.current = setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
              }
            }, 5000);
          })
          .catch((err) => console.error("Error playing video:", err));
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);

    // Clear timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    // Stop video
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }
    };
  }, []);

  // Generate YouTube video preview URL
  const getVideoPreviewUrl = () => {
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${id}`;
  };

  return (
    <Card
      className="w-full max-w-[350px] overflow-hidden hover:shadow-lg transition-all duration-300 bg-card h-full flex flex-col group rounded-xl border-transparent hover:border-primary/20"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative">
        <div className="aspect-video overflow-hidden relative rounded-t-xl">
          {/* Thumbnail image (shown when not hovering) */}
          <img
            src={thumbnailUrl}
            alt={title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
              isPlaying && "opacity-0",
            )}
            loading="lazy"
          />

          {/* Video preview (shown when hovering) */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 bg-black/20",
              isPlaying && "opacity-100",
            )}
          >
            {/* We're not actually playing videos on hover since YouTube doesn't allow direct embedding this way */}
            {/* Instead we're showing a hover effect with the thumbnail */}
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 scale-110"
            />
          </div>

          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
            {duration}
          </div>

          {/* Hover overlay with play button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-primary/90 hover:bg-primary text-white h-12 w-12 shadow-lg"
              onClick={handleWatchClick}
            >
              <Play className="h-6 w-6 fill-current" />
            </Button>

            {/* Mute/Unmute button (only shown when video is playing) */}
            {isPlaying && (
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full bg-black/50 hover:bg-black/70 text-white h-8 w-8 absolute bottom-2 left-2"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {/* Category badge */}
          <Badge
            className="absolute top-2 left-2 bg-primary/80 hover:bg-primary text-white border-none"
            variant="outline"
          >
            {category}
          </Badge>
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <h3
          className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors duration-200"
          title={title}
        >
          {title}
        </h3>
      </CardHeader>

      <CardContent className="p-4 pt-2 pb-3 flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-7 w-7 ring-2 ring-background">
            <AvatarImage src={channelAvatar} alt={channelName} />
            <AvatarFallback>{channelName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hover:text-primary transition-colors duration-200 truncate">
            {channelName}
          </span>
        </div>

        <div className="flex items-center text-xs text-muted-foreground gap-3">
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{formatNumber(viewCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{publishedAt}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t flex justify-between items-center">
        <TooltipProvider>
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors duration-200">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {formatNumber(likeCount)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{likeCount.toLocaleString()} likes</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors duration-200">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {formatNumber(commentCount)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{commentCount.toLocaleString()} comments</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={handleSave}
                >
                  <Bookmark
                    className="h-4 w-4"
                    fill={isSaved ? "currentColor" : "none"}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSaved ? "Saved" : "Save"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={handleWatchClick}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Watch on YouTube</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};

export default VideoCard;
