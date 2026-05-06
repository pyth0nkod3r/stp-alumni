"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {  useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "@/i18n/routing";
import { useToggleSave } from "./useNewsfeed";

export default function PostCard({ post, variant = "grid" }) {
  const [isSavedLocal, setIsSavedLocal] = useState(post.isSaved);

  // 👇 Save mutation (wired internally)

  console.log("PostCard render - post:", post);
  const saveMutation = useToggleSave(post.id);

  const handleSave = (e) => {
    e?.stopPropagation(); // Prevent card link navigation
    saveMutation.mutate(post.id);
    setIsSavedLocal((prev) => !prev); // Instant local feedback
  };

  const isFeatured = variant === "featured";

  // 👇 Shared card content (for clickable area in grid variant)
  const CardContent = () => (
    <>
      {/* Image Section */}
      <div
        className={cn(
          "relative overflow-hidden",
          isFeatured ? "aspect-[21/9] sm:aspect-[21/10]" : "aspect-[16/9]"
        )}
      >
        <img
          src={
            post.image ||
            "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop"
          }
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t transition-opacity",
            isFeatured
              ? "from-black/60 via-black/20 to-transparent"
              : "from-black/40 to-transparent opacity-0 group-hover:opacity-100"
          )}
        />
        <Badge
          className={cn(
            "bg-white/90 text-slate-900 hover:bg-white border-0 text-xs font-medium backdrop-blur-sm",
           "absolute top-3 left-3"
          )}
        >
          {post.category}
        </Badge>

        {/* Featured overlay text */}
        {isFeatured && (
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight mb-3 line-clamp-2">
              {post.title}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-white/80">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback className="bg-stp-blue-light text-white text-xs">
                    {post.author.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-semibold text-white">
                    {post.author.name}
                  </span>
                  {post.author.company && (
                    <span className="text-xs text-white/70 block">
                      {post.author.company}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-white/60">
                {format(new Date(post.timestamp), "d MMM yyyy")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={cn("p-5 sm:p-6 lg:p-8", !isFeatured && "p-4 sm:p-5")}>
        {!isFeatured && (
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight mb-3 line-clamp-2 group-hover:text-stp-blue-light transition-colors">
            {post.title}
          </h3>
        )}

        {!isFeatured && (
          <div className="flex items-center gap-2.5 mb-4">
            <Avatar className="h-7 w-7">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback className="bg-stp-blue-light text-white text-xs">
                {post.author.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <span className="text-xs font-medium text-slate-900 truncate block">
                {post.author.name}
              </span>
              <span className="text-xs text-slate-500">
                {format(new Date(post.timestamp), "d MMM yyyy")}
              </span>
            </div>
          </div>
        )}

        <p
          className={cn(
            "text-slate-600 leading-relaxed line-clamp-3",
            isFeatured ? "text-sm sm:text-base mb-6" : "text-xs sm:text-sm mb-4 line-clamp-2"
          )}
        >
          {post.excerpt}
        </p>

        {/* Featured: Action Bar */}
        {isFeatured && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <Link href={`/dashboard/newsfeed/${post.id}`} passHref>
              <Button className="bg-stp-blue-light hover:bg-stp-blue-light/90 text-white rounded-full px-6 h-10 text-sm font-medium transition-all shadow-md shadow-stp-blue-light/20 hover:shadow-lg hover:shadow-stp-blue-light/30">
                Read Full Article
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>

            <div className="flex items-center gap-1.5">
              {/* Like - commented */}
              <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-slate-600 bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-all`}>
                <Heart className="h-4 w-4" />
                <span className="font-medium">{post.likes}</span>
              </button>
              

              {/* Comment - commented */}
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-all">
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium">{post.comments}</span>
              </button>

              {/* Save - ACTIVE */}
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className={cn(
                  "p-1.5 rounded-full transition-all",
                  saveMutation.isPending && "opacity-60 cursor-wait",
                  isSavedLocal
                    ? "bg-amber-50 text-amber-500"
                    : "bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-500"
                )}
                title={isSavedLocal ? "Saved" : "Save for later"}
              >
                <Bookmark
                  className={cn("h-4 w-4", isSavedLocal && "fill-current")}
                />
              </button>

              <button className="p-1.5 rounded-full text-slate-600 bg-slate-50 hover:bg-green-50 hover:text-green-600 transition-all">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  // 👇 Render based on variant
  if (isFeatured) {
    return (
      <article className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent />
      </article>
    );
  }

  // Grid variant: clickable card + separate action bar
  return (
    <article className="group bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md hover:border-stp-blue-light/30 transition-all duration-300">
      {/* Clickable area (image + content) */}
      <Link href={`/dashboard/newsfeed/${post.id}`} className="block">
        <CardContent />
      </Link>

      {/* Action bar (outside link to avoid nested anchors) */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-slate-100">
        <div className="flex items-center justify-between pt-3">
          <Link href={`/dashboard/newsfeed/${post.id}`} passHref>
            <Button
              variant="ghost"
              size="sm"
              className="text-stp-blue-light hover:text-stp-blue-light/80 hover:bg-stp-blue-light/10 px-0 gap-1 font-medium text-sm"
            >
              Read more
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

          <div className="flex items-center gap-1">
            {/* Like - commented */}
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
              <Heart className="h-3.5 w-3.5" />
            </button>

            {/* Comment - commented */}
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
              <MessageCircle className="h-3.5 w-3.5" />
            </button>

            {/* Save - ACTIVE */}
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                saveMutation.isPending && "opacity-60 cursor-wait",
                isSavedLocal
                  ? "text-amber-500 bg-amber-50"
                  : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"
              )}
              title={isSavedLocal ? "Saved" : "Save for later"}
            >
              <Bookmark
                className={cn("h-3.5 w-3.5", isSavedLocal && "fill-current")}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}