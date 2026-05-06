"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Clock,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import postService from "@/lib/services/postService";
import { format } from "date-fns";
import { Link } from "@/i18n/routing";
import { useToggleSave } from "./useNewsfeed";
import PostCard from "./NewsfeedCard";

const hotTopics = [
  {
    id: 1,
    title: "Lead with a Grounded Confidence in a Changing Market",
    date: "Fri, Dec 15, 2025",
    time: "7:00PM",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    title: "Understanding Market Volatility in Q1 2026",
    date: "Fri, Dec 15, 2025",
    time: "7:00PM",
    image:
      "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    title: "Sector Rotation Strategies for Growth",
    date: "Fri, Dec 15, 2025",
    time: "7:00PM",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=100&h=100&fit=crop",
  },
];

export default function NewsFeed() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["newsfeed"],
    queryFn: postService.getNewsfeed,
  });

  // 👇 Save mutation wired up

  const allPosts = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((ele) => ({
      id: ele.postId,
      postType: ele.postType,
      title: ele?.title || "",
      excerpt: ele.body,
      content: ele.body,
      author: {
        name: `${ele.firstName} ${ele.lastName}`,
        avatar: ele.authorImage || ele.profileImagePath,
        title: ele.authorTitle || "",
        company: ele.companyName || "",
      },
      timestamp: ele.createdAt,
      image:
        ele.coverImage ||
        (ele.imageUrls && ele.imageUrls.length > 0 ? ele.imageUrls[0] : null),
      likes: ele.likeCount || 0,
      comments: ele.commentCount || 0,
      hasUserLiked: ele.hasUserLiked || false,
      isSaved: ele.isSaved || false,
      category: ele.category || "General",
    }));
  }, [data]);

  // Extract unique categories from data and build filter tabs dynamically
  const filterTabs = useMemo(() => {
    const categories = new Set();
    allPosts.forEach((post) => {
      if (post.category) {
        categories.add(post.category);
      }
    });

    return [
      { key: "all", label: "All News" },
      ...Array.from(categories).map((cat) => ({
        key: cat.toLowerCase().replace(/\s+/g, "-"),
        label: cat,
      })),
    ];
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesTab =
        activeTab === "all" ||
        post.category.toLowerCase().replace(/\s+/g, "-") ===
          activeTab.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        post?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [allPosts, activeTab, searchQuery]);

  // 👇 Save handler wired to mutation
  const handleSave = (postId) => {
    saveMutation.mutate(postId);
    // Also update local state for immediate UI feedback
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  // const handleLike = (postId) => {
  //   setLikedPosts((prev) => {
  //     const next = new Set(prev);
  //     if (next.has(postId)) {
  //       next.delete(postId);
  //     } else {
  //       next.add(postId);
  //     }
  //     return next;
  //   });
  // };

  const featuredPost = filteredPosts?.[0];
  const gridPosts = filteredPosts?.slice(1) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-stp-blue-light border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-stp-blue-light/10 text-stp-blue-light hover:bg-stp-blue-light/20 text-xs font-medium px-2.5 py-0.5">
                  Latest Updates
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                News Feed
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                Stay informed with the latest market insights, industry updates,
                and expert analysis.
              </p>
            </div>
            <div className="text-sm text-slate-500 flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>
                {allPosts.length} article{allPosts.length !== 1 ? "s" : ""}{" "}
                available
              </span>
            </div>
          </div>
        </div>

        {/* Controls Bar - Sticky removed */}
        <div className="pb-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full lg:w-auto scrollbar-hide">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                    activeTab === tab.key
                      ? "bg-stp-blue-light text-white border-stp-blue-light shadow-md shadow-stp-blue-light/25"
                      : "bg-white text-slate-600 border-slate-200 hover:border-stp-blue-light/50 hover:text-stp-blue-light",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search articles, authors, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm bg-white border-slate-200 focus:border-stp-blue-light focus:ring-stp-blue-light/20 rounded-xl h-10"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {filteredPosts.length > 0 ? (
              <>
                {/* Featured Post */}
                {featuredPost && (
                  <PostCard post={featuredPost} variant="featured" />
                )}

                {/* Grid Posts */}
                {gridPosts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {gridPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Search className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  No articles found
                </h3>
                <p className="text-sm text-slate-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Hot Topics - Sticky kept */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-5 sm:p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="h-5 w-5 text-stp-blue-light" />
                <h3 className="font-semibold text-slate-900">
                  Hot Topics Right Now
                </h3>
              </div>

              <div className="space-y-4">
                {hotTopics.map((topic, index) => (
                  <div
                    key={topic.id}
                    className="group flex gap-3 cursor-pointer p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-stp-blue-light/10 flex items-center justify-center text-stp-blue-light font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-stp-blue-light transition-colors leading-snug">
                        {topic.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {topic.date}
                      </p>
                    </div>
                    {topic.image && (
                      <img
                        src={topic.image}
                        alt={topic.title}
                        className="w-14 h-14 object-cover rounded-lg shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                className="w-full mt-5 text-stp-blue-light hover:bg-stp-blue-light/10 font-medium text-sm rounded-lg"
              >
                View All Topics
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
