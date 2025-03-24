"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Flame, Hash, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendingTopic {
  name: string;
  count: number;
  growth: number;
  category: string;
}

interface TrendingKeyword {
  keyword: string;
  volume: number;
  growth: number;
}

interface TrendingTopicsProps {
  topics?: TrendingTopic[];
  keywords?: TrendingKeyword[];
  className?: string;
}

export default function TrendingTopics({
  topics = [
    { name: "Home Workouts", count: 1245, growth: 23, category: "Fitness" },
    { name: "Meal Prep", count: 987, growth: 15, category: "Food" },
    { name: "Coding Tutorials", count: 876, growth: 18, category: "Tech" },
    { name: "Book Reviews", count: 654, growth: 12, category: "Literature" },
    { name: "Travel Vlogs", count: 543, growth: 9, category: "Travel" },
  ],
  keywords = [
    { keyword: "#homeoffice", volume: 2345, growth: 28 },
    { keyword: "#productivity", volume: 1876, growth: 22 },
    { keyword: "#selfcare", volume: 1654, growth: 19 },
    { keyword: "#minimalism", volume: 1432, growth: 15 },
    { keyword: "#sustainableliving", volume: 1298, growth: 17 },
  ],
  className,
}: TrendingTopicsProps) {
  return (
    <Card className={cn("h-full bg-card", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trending Topics
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            Last 7 days
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="topics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="topics" className="flex items-center gap-1">
              <Flame className="h-4 w-4" />
              Topics
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              Keywords
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="space-y-4">
            {topics.map((topic, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <div>
                  <h4 className="font-medium">{topic.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {topic.category}
                    </Badge>
                    <span>{topic.count} videos</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-500">
                  <BarChart2 className="h-4 w-4" />
                  <span className="font-medium">+{topic.growth}%</span>
                </div>
              </div>
            ))}

            <button className="w-full text-center text-sm text-primary hover:underline mt-2">
              View all trending topics
            </button>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            {keywords.map((keyword, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <div>
                  <h4 className="font-medium">{keyword.keyword}</h4>
                  <div className="text-sm text-muted-foreground">
                    <span>{keyword.volume.toLocaleString()} mentions</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-500">
                  <BarChart2 className="h-4 w-4" />
                  <span className="font-medium">+{keyword.growth}%</span>
                </div>
              </div>
            ))}

            <button className="w-full text-center text-sm text-primary hover:underline mt-2">
              View all trending keywords
            </button>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Suggested Content Ideas</h4>
          <div className="space-y-2">
            <div className="text-sm p-2 bg-accent/50 rounded-md">
              Create a video about &quot;Home Office Productivity Tips&quot;
            </div>
            <div className="text-sm p-2 bg-accent/50 rounded-md">
              Explore &quot;Sustainable Living on a Budget&quot;
            </div>
            <div className="text-sm p-2 bg-accent/50 rounded-md">
              Share &quot;Quick Fitness Routines for Busy People&quot;
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
