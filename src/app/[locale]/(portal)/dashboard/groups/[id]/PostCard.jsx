

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Link2,
  FlagIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// import { useReportPost } from "@/lib/hooks/useGroupQueries";
import { formatRelativeTime } from "@/lib/helper";
import { toast } from "sonner";
import CommentsSection from "./CommentsSection";
import { useLikeGroupPost } from "@/lib/hooks/useGroupQueries";
import { getInitials } from "./page";

function PostCard({ post, groupId }) {
  const [showComments, setShowComments] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [fullImageOpen, setFullImageOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const { mutate: likePost } = useLikeGroupPost(groupId);
//   const { mutate: reportPost } = useReportPost();

  const authorName =
    post.authorName ||
    `${post.firstName || ""} ${post.lastName || ""}`.trim() ||
    "Member";
  const authorAvatar = post.authorAvatar || post.profileImagePath || null;
  const authorTitle = post.authorTitle || post.title || "";
  
  const images = post.imageUrls || post.images || [];
  const hasImages = images.length > 0;

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/dashboard/post/${post.postId || post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast.info("Copied Successfully");
  };

//   const handleReportPost = (reason, description) => {
//     return new Promise((resolve, reject) => {
//       reportPost(
//         { groupId, postId: post.postId || post.id, reason, description },
//         {
//           onSuccess: resolve,
//           onError: reject,
//         }
//       );
//     });
//   };

  const openFullImage = (index) => {
    setSelectedImageIndex(index);
    setFullImageOpen(true);
  };

  const closeFullImage = () => {
    setFullImageOpen(false);
  };

  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <>
      <Card>
        <CardContent className="pt-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={authorAvatar} alt={authorName} />
                <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-semibold leading-tight">
                  {authorName}
                </h3>
                {authorTitle && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {authorTitle}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatRelativeTime(post.createdAt)}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setReportOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <FlagIcon className="h-4 w-4 mr-2" />
                  Report post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Body */}
          <p className="text-sm text-foreground mt-3 whitespace-pre-line leading-relaxed">
            {post.body || post.content}
          </p>

          {/* Video */}
          {(post.videoUrl || post.video || post.postVideo) && (
            <div className="mt-3 rounded-xl overflow-hidden bg-black aspect-video max-h-80 flex items-center justify-center shadow-xs">
              <video
                src={
                  (post.videoUrl || post.video || post.postVideo).startsWith("http")
                    ? post.videoUrl || post.video || post.postVideo
                    : `${process.env.NEXT_PUBLIC_API_URL}/${post.videoUrl || post.video || post.postVideo}`
                }
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Images */}
          {hasImages && (
            <div
              className={cn(
                "mt-3 rounded-xl overflow-hidden gap-1",
                images.length === 1 ? "" : "grid grid-cols-2",
              )}
            >
              {images.slice(0, 4).map((img, i) => {
                const imageUrl = typeof img === 'string' ? img : img.url;
                const isFirstOfThree = images.length === 3 && i === 0;
                
                return (
                  <div
                    key={i}
                    className={cn(
                      "relative overflow-hidden cursor-pointer group",
                      images.length === 1 ? "h-64" : "h-40",
                      isFirstOfThree && images.length === 3 ? "row-span-2 h-80" : ""
                    )}
                    onClick={() => openFullImage(i)}
                  >
                    <img
                      src={imageUrl}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Overlay with zoom icon */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2">
                        <svg className="h-4 w-4 text-[#233389]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>

                    {i === 3 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          +{images.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats */}
          {(post.likeCount > 0 || post.commentCount > 0) && (
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              {post.likeCount > 0 && (
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                  {post.likeCount.toLocaleString()}
                </span>
              )}
              {post.commentCount > 0 && (
                <button
                  className="hover:underline ml-auto"
                  onClick={() => setShowComments((v) => !v)}
                >
                  {post.commentCount} comment{post.commentCount !== 1 ? "s" : ""}
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2 text-sm",
                post.hasUserLiked
                  ? "text-red-500 hover:text-red-600"
                  : "text-muted-foreground",
              )}
              onClick={() => likePost(post.postId || post.id)}
            >
              <Heart
                className={cn("h-4 w-4", post.hasUserLiked && "fill-red-500")}
              />
              {post.hasUserLiked ? "Liked" : "Like"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-sm text-muted-foreground"
              onClick={() => setShowComments((v) => !v)}
            >
              <MessageCircle className="h-4 w-4" />
              Comment
            </Button>
          </div>

          {/* Comments */}
          {showComments && (
            <CommentsSection
              groupId={groupId}
              postId={post.postId || post.id}
              onClose={() => setShowComments(false)}
            />
          )}
        </CardContent>
      </Card>

      {/* Report Modal */}
      {/* <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        onReport={handleReportPost}
        type="post"
        name="this post"
      /> */}

      {/* Full Image Modal */}
      {fullImageOpen && hasImages && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeFullImage}
        >
          {/* Close button */}
          <button
            onClick={closeFullImage}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 p-2"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
            {selectedImageIndex + 1} / {images.length}
          </div>

          {/* Main image */}
          <div 
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={typeof images[selectedImageIndex] === 'string' ? images[selectedImageIndex] : images[selectedImageIndex].url}
              alt={`Post image ${selectedImageIndex + 1}`}
              className="object-contain max-w-[90vw] max-h-[90vh]"
            />
          </div>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPreviousImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 bg-black/50 hover:bg-black/70 rounded-full"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 bg-black/50 hover:bg-black/70 rounded-full"
              >
                <ChevronRight className="h-8 w-8" />
              </button>

              {/* Thumbnail navigation */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === selectedImageIndex
                        ? "w-8 bg-white"
                        : "w-2 bg-white/50 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Instructions */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-xs">
            {images.length > 1 && "Use arrow keys to navigate • ESC to close"}
          </div>
        </div>
      )}
    </>
  );
}

export default PostCard
