"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bookmark,
  TrendingUp,
  Lightbulb,
  ThumbsUp,
  MessageSquare,
  Eye,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendationProps {
  title: string;
  description: string;
  category: string;
  confidence: number;
  trendingScore: number;
  tags: string[];
  marketGap?: boolean;
}

interface ContentRecommendationsProps {
  recommendations?: RecommendationProps[];
  trendingTopics?: string[];
  marketGaps?: RecommendationProps[];
}

const ContentRecommendations = ({
  recommendations = [
    {
      title: "How to Build a Next.js Application with Tailwind CSS",
      description:
        "Step-by-step tutorial for creating modern web applications using Next.js and Tailwind CSS.",
      category: "Web Development",
      confidence: 92,
      trendingScore: 87,
      tags: ["nextjs", "tailwind", "tutorial", "webdev"],
      marketGap: true,
    },
    {
      title: "5 AI Tools Every Content Creator Should Be Using in 2023",
      description:
        "Discover the latest AI tools that can help you create better content faster.",
      category: "Technology",
      confidence: 88,
      trendingScore: 94,
      tags: ["ai", "tools", "content creation", "productivity"],
    },
    {
      title: "The Ultimate Guide to YouTube SEO",
      description:
        "Learn how to optimize your videos to rank higher in YouTube search results.",
      category: "Digital Marketing",
      confidence: 95,
      trendingScore: 89,
      tags: ["youtube", "seo", "marketing", "growth"],
    },
  ],
  trendingTopics = [
    "AI Tools for Creators",
    "Next.js 14 Features",
    "React Server Components",
    "YouTube Algorithm Changes",
    "Content Creator Economy",
    "Video Editing Shortcuts",
  ],
  marketGaps = [
    {
      title: "Simplified Explanations of Web3 Technologies",
      description:
        "There's a gap in easy-to-understand content about blockchain and Web3 applications.",
      category: "Technology",
      confidence: 89,
      trendingScore: 82,
      tags: ["web3", "blockchain", "explainer", "beginners"],
      marketGap: true,
    },
    {
      title: "Sustainable Tech Practices for Developers",
      description:
        "Content about environmentally conscious coding and development practices is underrepresented.",
      category: "Sustainability",
      confidence: 84,
      trendingScore: 78,
      tags: ["green coding", "sustainability", "eco-friendly tech"],
      marketGap: true,
    },
  ],
}: ContentRecommendationsProps) => {
  const [savedRecommendations, setSavedRecommendations] = useState<string[]>(
    [],
  );

  const handleSaveRecommendation = (title: string) => {
    if (savedRecommendations.includes(title)) {
      setSavedRecommendations(
        savedRecommendations.filter((item) => item !== title),
      );
    } else {
      setSavedRecommendations([...savedRecommendations, title]);
    }
  };

  return (
    <div className="w-full bg-background p-6 rounded-lg border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Content Recommendations
          </h2>
          <p className="text-muted-foreground">
            Discover video ideas based on trends and market gaps
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
          <Lightbulb className="h-4 w-4" />
          <span>{recommendations.length + marketGaps.length} Ideas</span>
        </Badge>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Recommendations</TabsTrigger>
          <TabsTrigger value="trending">Trending Topics</TabsTrigger>
          <TabsTrigger value="gaps">Market Gaps</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={index}
              recommendation={recommendation}
              isSaved={savedRecommendations.includes(recommendation.title)}
              onSave={handleSaveRecommendation}
            />
          ))}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Trending Topics</span>
              </CardTitle>
              <CardDescription>
                Topics gaining popularity among viewers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto flex items-center gap-1"
              >
                <span>Explore All Trends</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {recommendations
            .filter((rec) => rec.trendingScore > 85)
            .map((recommendation, index) => (
              <RecommendationCard
                key={index}
                recommendation={recommendation}
                isSaved={savedRecommendations.includes(recommendation.title)}
                onSave={handleSaveRecommendation}
              />
            ))}
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          {marketGaps.map((gap, index) => (
            <RecommendationCard
              key={index}
              recommendation={gap}
              isSaved={savedRecommendations.includes(gap.title)}
              onSave={handleSaveRecommendation}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: RecommendationProps;
  isSaved: boolean;
  onSave: (title: string) => void;
}

const RecommendationCard = ({
  recommendation,
  isSaved,
  onSave,
}: RecommendationCardProps) => {
  const {
    title,
    description,
    category,
    confidence,
    trendingScore,
    tags,
    marketGap,
  } = recommendation;

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        marketGap ? "border-l-4 border-l-amber-500" : "",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSave(title)}
            className={isSaved ? "text-primary" : "text-muted-foreground"}
          >
            <Bookmark
              className="h-5 w-5"
              fill={isSaved ? "currentColor" : "none"}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="px-2 py-0.5 text-xs"
            >
              #{tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{category}</Badge>
            {marketGap && (
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200"
              >
                Market Gap
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{confidence}% Match</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{trendingScore}% Trending</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full mt-2">
          Generate Content Brief
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContentRecommendations;
