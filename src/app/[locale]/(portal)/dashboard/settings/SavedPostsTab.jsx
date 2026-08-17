"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import PostCard from "@/components/posts/PostCard";
import PostSkeleton from "@/components/posts/PostSkeleton";
import { Button } from "@/components/ui/button";
import userService from "@/lib/services/userService";
import { useLikePost } from "@/lib/hooks/usePosts";
import { Bookmark, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function SavedPostsTab({ t }) {
  const {
    data: savedPostsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["savedPosts"],
    queryFn: userService.getSavedPosts,
    staleTime: 30 * 1000,
  });

  const { mutate: likePost } = useLikePost();

  const handleLike = (postId) => likePost(postId);
  const handleCopyLink = () => toast.success("Link copied!");

  const rawPosts = Array.isArray(savedPostsData?.data)
    ? savedPostsData.data
    : Array.isArray(savedPostsData)
    ? savedPostsData
    : [];

  // Normalize shape
  const posts = rawPosts.map((p) => ({
    ...p,
    id: p.postId || p.id,
    isSaved: true,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
        <p className="text-red-600 mb-4">Failed to load saved posts.</p>
        <Button
          onClick={() => refetch()}
          className="bg-[#233389] hover:bg-[#1d2a6e] text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
        <div className="h-14 w-14 rounded-full bg-blue-50 text-[#233389] mx-auto flex items-center justify-center mb-4">
          <Bookmark className="h-7 w-7" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          No Saved Posts
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          When you bookmark posts from the feed, they will appear here for easy access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {posts.length} saved {posts.length === 1 ? "post" : "posts"}
        </p>
      </div>
      {posts.map((post, index) => (
        <PostCard
          key={post.id || index}
          post={post}
          onLike={handleLike}
          onCopyLink={handleCopyLink}
        />
      ))}
    </div>
  );
}
