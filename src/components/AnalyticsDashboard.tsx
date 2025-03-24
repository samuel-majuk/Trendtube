"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  LineChart,
  PieChart,
  Activity,
  TrendingUp,
  Users,
  Eye,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  data?: {
    categoryPerformance: Array<{
      category: string;
      views: number;
      likes: number;
      comments: number;
    }>;
    contentTypePerformance: Array<{
      type: string;
      percentage: number;
    }>;
    engagementTrends: Array<{
      date: string;
      views: number;
      likes: number;
      comments: number;
    }>;
  };
}

const AnalyticsDashboard = ({ data }: AnalyticsDashboardProps = {}) => {
  const [timeRange, setTimeRange] = useState<string>("30days");

  // Default mock data if none is provided
  const defaultData = {
    categoryPerformance: [
      {
        category: "Entertainment",
        views: 1250000,
        likes: 87500,
        comments: 12300,
      },
      { category: "Gaming", views: 980000, likes: 72000, comments: 9800 },
      { category: "Education", views: 750000, likes: 52500, comments: 8200 },
      { category: "Music", views: 1450000, likes: 116000, comments: 14500 },
      { category: "Tech", views: 890000, likes: 62300, comments: 7800 },
    ],
    contentTypePerformance: [
      { type: "Tutorials", percentage: 35 },
      { type: "Reviews", percentage: 25 },
      { type: "Vlogs", percentage: 15 },
      { type: "Shorts", percentage: 20 },
      { type: "Live Streams", percentage: 5 },
    ],
    engagementTrends: [
      { date: "Jan", views: 850000, likes: 59500, comments: 8500 },
      { date: "Feb", views: 920000, likes: 64400, comments: 9200 },
      { date: "Mar", views: 980000, likes: 68600, comments: 9800 },
      { date: "Apr", views: 1050000, likes: 73500, comments: 10500 },
      { date: "May", views: 1120000, likes: 78400, comments: 11200 },
      { date: "Jun", views: 1250000, likes: 87500, comments: 12500 },
    ],
  };

  const dashboardData = data || defaultData;

  return (
    <div className="w-full bg-background p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Views"
          value="5.32M"
          change="+12.3%"
          trend="up"
          icon={<Eye className="h-5 w-5" />}
        />
        <MetricCard
          title="Avg. Watch Time"
          value="4:25"
          change="+8.7%"
          trend="up"
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          title="Engagement Rate"
          value="7.8%"
          change="-2.1%"
          trend="down"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="New Subscribers"
          value="14.2K"
          change="+5.4%"
          trend="up"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <Tabs defaultValue="category" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="category">Category Performance</TabsTrigger>
          <TabsTrigger value="content">Content Type Analysis</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>
                View performance metrics across different video categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                {/* Placeholder for actual chart implementation */}
                <div className="flex flex-col space-y-4">
                  {dashboardData.categoryPerformance.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {(category.views / 1000000).toFixed(1)}M views
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{
                            width: `${(category.views / 1450000) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{(category.likes / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{(category.comments / 1000).toFixed(1)}K</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Type Analysis</CardTitle>
              <CardDescription>
                Distribution of views by content format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full flex items-center justify-center">
                {/* Placeholder for pie chart */}
                <div className="relative h-64 w-64">
                  <PieChart className="h-full w-full text-muted-foreground" />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold">100%</span>
                    <span className="text-sm text-muted-foreground">
                      Total Content
                    </span>
                  </div>
                </div>
                <div className="ml-8 space-y-3">
                  {dashboardData.contentTypePerformance.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full bg-primary-${(index % 5) + 1}`}
                      ></div>
                      <span className="text-sm">
                        {item.type}: {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
              <CardDescription>
                View engagement metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                {/* Placeholder for line chart */}
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Views Trend</h4>
                    <div className="h-16 flex items-end space-x-2">
                      {dashboardData.engagementTrends.map((point, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="w-12 bg-primary rounded-t"
                            style={{
                              height: `${(point.views / 1250000) * 100}px`,
                            }}
                          ></div>
                          <span className="text-xs mt-1">{point.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Engagement Metrics
                    </h4>
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <LineChart className="h-24 w-full text-muted-foreground" />
                        <div className="text-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            Likes Trend
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <BarChart className="h-24 w-full text-muted-foreground" />
                        <div className="text-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            Comments Trend
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, trend, icon }: MetricCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
        </div>
        <div className="mt-4 flex items-center">
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" ? "text-green-500" : "text-red-500",
            )}
          >
            {change}
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            vs. previous period
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;
