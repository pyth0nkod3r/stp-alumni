// In DashboardPage.jsx
"use client";
import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Calendar, ShoppingBag, ChevronRight, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useNavbar } from "@/contexts/NavbarContext";
import { usePostsFeed, useLikePost, useToggleSaveFeedPost } from "@/lib/hooks/usePosts";
import CreatePost from "@/components/posts/CreatePost";
import PostCard from "@/components/posts/PostCard";
import PostSkeleton from "@/components/posts/PostSkeleton";
import { toast } from "sonner";
import SidebarWidgets from "./SidebarWidgets";
import { useAuth } from "@/lib/hooks/useUser";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { userSize: { height } } = useNavbar();
  const { data } = useAuth();

  // Use the original hook
  const { data: posts, isLoading, error, refetch } = usePostsFeed();
  const { mutate: likePost } = useLikePost(data?.userId || "");
  const { mutate: toggleSavePost } = useToggleSaveFeedPost();
  
  // Client-side pagination state
  const [visibleCount, setVisibleCount] = useState(5);
  const postsPerPage = 5;
  
  // Get visible posts
  const visiblePosts = posts?.slice(0, visibleCount) || [];
  const hasMore = posts ? visibleCount < posts.length : false;
  const totalPosts = posts?.length || 0;
  
  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + postsPerPage, totalPosts));
  }, [totalPosts]);

  // Handlers
  const handleLike = (postId) => {
    likePost(postId);
  };

  const handleComment = (postId) => {
    console.log("Comment on post:", postId);
  };

  const handleFollow = (userId) => {
    console.log("Follow user:", userId);
    toast.success("Follow feature coming soon!");
  };

  const handleSave = (postId) => {
    toggleSavePost(postId);
  };

  const handleCopyLink = (postId) => {
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="p-3 sm:p-0">
      {/* Main Content */}
      <div className="">
        {/* Dashboard Title */}
        <h1 className="text-2xl lg:text-3xl font-bold text-stp-blue-light mb-6">
          {t("title")}
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 2xl:gap-20">
          {/* Left Column - Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* E-Learning Course Banner */}
            <div
              className="relative rounded-2xl overflow-hidden p-6 lg:p-8 text-white shadow-xl"
              style={{
                background:
                  "linear-gradient(135deg, #ED202D 0%, #233389 50%, #FBAD17 100%)",
              }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
              <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Live
                  </span>
                  <span className="text-xs font-light tracking-[0.2em] text-white/80">
                    CONNECT · SHARE · PARTICIPATE
                  </span>
                </div>

                <h2 className="text-2xl lg:text-4xl font-bold mb-3 leading-tight">
                  {t("courseTitle")}
                </h2>

                <p className="text-white/80 text-sm mb-6 max-w-md leading-relaxed">
                  Join our interactive learning community and grow your network
                  with industry experts.
                </p>

                <Link href={"/dashboard/events"}>
                  <Button className="group bg-white hover:bg-white/90 text-[#233389] rounded-full px-6 py-2.5 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    <span className="flex items-center gap-3">
                      {t("joinNow")}
                      <span className="bg-[#233389] group-hover:bg-[#1d2a6e] rounded-full p-1 transition-all duration-300 group-hover:scale-110">
                        <ChevronRight className="h-4 w-4 text-white" />
                      </span>
                    </span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  href: "/dashboard/network",
                  icon: Globe,
                  bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100/50",
                  iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
                  labelKey: "networking",
                  description: "Connect with peers",
                },
                {
                  href: "/dashboard/events",
                  icon: Calendar,
                  bgGradient: "bg-gradient-to-br from-red-50 to-red-100/50",
                  iconBg: "bg-gradient-to-br from-red-500 to-red-600",
                  labelKey: "events",
                  description: "Discover events",
                },
                {
                  href: "/dashboard/marketplace",
                  icon: ShoppingBag,
                  bgGradient: "bg-gradient-to-br from-amber-50 to-amber-100/50",
                  iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
                  labelKey: "marketplace",
                  description: "Explore business",
                },
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200/60 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                  >
                    <div
                      className={`absolute inset-0 ${action.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                    <div
                      className={`relative z-10 p-3 rounded-xl ${action.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="relative z-10 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#233389] transition-colors">
                        {t(action.labelKey)}
                      </h3>
                      <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                        {action.description}
                      </p>
                    </div>
                    <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                      <div className="p-1.5 rounded-full bg-[#233389]/10">
                        <ChevronRight className="h-4 w-4 text-[#233389]" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Post Creation */}
            <CreatePost onPostCreated={refetch} />

            {/* News Feed */}
            {isLoading && (
              <>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </>
            )}

            {error && (
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-red-600 mb-4">Failed to load posts</p>
                <Button
                  onClick={() => refetch()}
                  className="bg-[#233389] hover:bg-[#1d2a6e]"
                >
                  Try Again
                </Button>
              </div>
            )}

            {!isLoading && !error && visiblePosts.length > 0 && (
              <>
                {visiblePosts.map((post, index) => (
                  <PostCard
                    key={post.id || index}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onFollow={handleFollow}
                    onSave={handleSave}
                    onCopyLink={handleCopyLink}
                  />
                ))}
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center py-4">
                    <Button
                      onClick={loadMore}
                      variant="outline"
                      className="rounded-full px-8 border-[#233389] text-[#233389] hover:bg-[#233389] hover:text-white transition-all"
                    >
                      Load More Posts
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">
                      Showing {visiblePosts.length} of {totalPosts} posts
                    </p>
                  </div>
                )}
                
                {/* End of feed */}
                {!hasMore && totalPosts > 0 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
                    <p className="text-xs text-gray-400">You've seen all {totalPosts} posts</p>
                  </div>
                )}
              </>
            )}

            {!isLoading && !error && (!posts || posts.length === 0) && (
              <div className="bg-white rounded-lg p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-500 mb-2 font-medium">No posts yet</p>
                <p className="text-sm text-gray-400">
                  Be the first to share something with the community!
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar Widgets */}
          <SidebarWidgets t={t} height={height} />
        </div>
      </div>
    </div>
  );
}