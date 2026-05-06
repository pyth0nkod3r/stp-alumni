"use client";

import { useParams, useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Bookmark,
  MessageCircle,
  Share2,
  ArrowLeft,
  Clock,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  usePost,
  useToggleLike,
  useAddComment,
  useToggleSave,
  usePostComments,
} from "../useNewsfeed";
import { toast } from "sonner";

export default function PostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading, isError } = usePost(id);
  const { data: commentsData, isLoading: commentsLoading } = usePostComments(
    id,
    1
  );
  const likeMutation = useToggleLike(id);
  const saveMutation = useToggleSave(id);
  const commentMutation = useAddComment(id);
  const [commentBody, setCommentBody] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stp-blue-light" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Article not found
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/news")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News Feed
        </Button>
      </div>
    );
  }

  const post = data.data;
  const comments = commentsData?.data || [];

  console.log(comments,"comments")
    console.log("PostCard render - post:", post);

  const handleCommentSubmit = () => {
    if (!commentBody.trim()) return;
    commentMutation.mutate(commentBody, {
      onSuccess: () => 
      {

        setCommentBody("")
        toast.success("Comment posted successfully!")
      }
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      // Could show a toast here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Estimate reading time (~200 words/min)
  const readingTime = Math.ceil(post.body.split(/\s+/).length / 200);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-stp-blue-light mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to News Feed
        </button>

        <article className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          {/* Hero Image */}
          {post.coverImage && (
            <div className="relative aspect-21/9 sm:aspect-21/10 overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
                <Badge className="mb-3 bg-white/90 text-slate-900 hover:bg-white border-0 text-xs font-medium backdrop-blur-sm">
                  {post.category}
                </Badge>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight mb-3">
                  {post.title}
                </h1>
              </div>
            </div>
          )}

          {/* Header Info */}
          <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarImage src={post.profileImagePath} alt={post.firstName} />
                  <AvatarFallback className="bg-stp-blue-light text-white text-sm">
                    {post.firstName?.[0]}
                    {post.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900">
                    {post.firstName} {post.lastName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {post.authorTitle && (
                      <span>{post.authorTitle}</span>
                    )}
                    {post.authorTitle && post.companyName && (
                      <span>•</span>
                    )}
                    {post.companyName && <span>{post.companyName}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
                <span>•</span>
                <time dateTime={post.createdAt}>
                  {format(new Date(post.createdAt), "d MMM yyyy")}
                </time>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 lg:p-8">
            {!post.coverImage && (
              <>
                <Badge className="mb-4 bg-stp-blue-light/10 text-stp-blue-light hover:bg-stp-blue-light/20 border-0 text-xs font-medium">
                  {post.category}
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 leading-tight">
                  {post.title}
                </h1>
              </>
            )}

            <div
              className="prose prose-slate prose-lg max-w-none 
                prose-headings:font-semibold prose-headings:text-slate-900
                prose-p:text-slate-600 prose-p:leading-relaxed
                prose-a:text-stp-blue-light prose-a:no-underline hover:prose-a:underline
                prose-ul:list-disc prose-ol:list-decimal prose-li:text-slate-600
                prose-blockquote:border-l-stp-blue-light prose-blockquote:text-slate-600
                prose-img:rounded-lg prose-img:border prose-img:border-slate-200"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          </div>

          {/* Action Bar */}
          <div className="px-5 sm:px-6 lg:px-8 py-4 border-y border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    likeMutation.isPending && "opacity-70 cursor-wait",
                    post.hasUserLiked
                      ? "bg-red-50 text-red-500 hover:bg-red-100"
                      : "bg-white text-slate-600 hover:bg-red-50 hover:text-red-500 border border-slate-200"
                  )}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      post.hasUserLiked && "fill-current"
                    )}
                  />
                  <span>{post.likeCount}</span>
                </button>

                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  onClick={() =>
                    document
                      .getElementById("comments-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.commentCount}</span>
                </button>

                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className={cn(
                    "p-2 rounded-full transition-all border border-slate-200",
                    saveMutation.isPending && "opacity-70 cursor-wait",
                    post.isSaved
                      ? "bg-amber-50 text-amber-500 border-amber-200"
                      : "bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-500"
                  )}
                  title={post.isSaved ? "Saved" : "Save for later"}
                >
                  <Bookmark
                    className={cn(
                      "h-4 w-4",
                      post.isSaved && "fill-current"
                    )}
                  />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-full text-slate-600 bg-white border border-slate-200 hover:bg-green-50 hover:text-green-600 transition-all"
                  title="Share article"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-600"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <div id="comments-section" className="p-5 sm:p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-stp-blue-light" />
              Comments{" "}
              <Badge variant="secondary" className="ml-1">
                {comments.length}
              </Badge>
            </h3>

            {/* Comment Form */}
            <div className="flex gap-3 mb-8">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-stp-blue-light text-white text-sm">
                  Y
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  className="min-h-20 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.metaKey) {
                      e.preventDefault();
                      handleCommentSubmit();
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-400">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">⌘</kbd> +{" "}
                    <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">Enter</kbd> to post
                  </p>
                  <Button
                    size="sm"
                    onClick={handleCommentSubmit}
                    disabled={commentMutation.isPending || !commentBody.trim()}
                    className="gap-2"
                  >
                    {commentMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length > 0 ? (

              // {"json":{"commentId":"cmt_f50a401336e5b26e","comment":"test","createdAt":"2026-05-05 21:25:12","userId":"61ef00b8-3920-4bd2-93db-bc79b248731a","firstName":"STP","lastName":"Admin","profileImagePath":"https://app.gfa-tech.com/stp/uploads/profile-images/1777023857_e18ea66e74b97f2ec512.png","authorTitle":"CEO"}}
              <div className="space-y-6">
                {comments.map((c) => (
                  <div key={c.commentId} className="flex gap-3 group">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={c.profileImagePath} alt={c.firstName} />
                      <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                        {c.firstName?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="font-medium text-slate-900 text-sm">
                          {c.firstName} {c.lastName}
                        </p>
                        <time
                          dateTime={c.createdAt}
                          className="text-xs text-slate-400"
                          title={format(new Date(c.createdAt), "PPP p")}
                        >
                          {formatDistanceToNow(new Date(c.createdAt), {
                            addSuffix: true,
                          })}
                        </time>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {c.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl">
                <MessageCircle className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </div>
            )}
          </div>
        </article>

     
      </div>
    </div>
  );
}