"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  MoreHorizontal,
  Heart,
  MessageSquare,
  Bookmark,
  Link as LinkIcon,
  Plus,
  Send,
  Loader2,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "@/lib/helper";
import { usePostComments, useCommentPost } from "@/lib/hooks/usePosts";
// import useAuthStore from "@/lib/store/useAuthStore";
import { useAuth } from "@/lib/hooks/useUser";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Constants for word limits
const MAX_WORDS = 1250;
const WARNING_THRESHOLD = 0.8;

/**
 * CommentItem — renders a single comment bubble with modern styling
 */
function CommentItem({ comment }) {
  return (
    <div className="flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Avatar */}
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#233389]/10 to-[#233389]/5 overflow-hidden shrink-0 ring-2 ring-white shadow-sm">
        <Image
          src={
            comment.profileImagePath ||
            comment.user?.profileImage ||
            "/assets/Profile Image.jpg"
          }
          alt={comment.firstName || comment.user?.name || "User"}
          width={36}
          height={36}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Comment bubble */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 hover:bg-gray-100/80 rounded-2xl rounded-tl-sm px-4 py-3 transition-colors duration-200 border border-gray-100/80">
          <p className="text-sm font-semibold text-[#233389] leading-tight">
            {comment.firstName || comment.user?.name || "Anonymous"}{" "}
            {comment.lastName || ""}
          </p>
          <p className="text-sm text-gray-700 mt-1 break-words leading-relaxed">
            {comment.comment}
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 pl-2">
          {comment.createdAt
            ? formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })
            : "Just now"}
        </p>
      </div>
    </div>
  );
}

/**
 * CommentModal — Dialog for viewing & adding comments on a post
 */
function CommentModal({ open, onClose, post }) {
  const [commentText, setCommentText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  // GET comments
  const {
    data,
    isLoading: isLoadingComments,
    error: commentsError,
  } = usePostComments(post?.id);

  const comments = data?.data || [];

  // POST a new comment
  const { mutate: addComment, isPending: isSubmitting } = useCommentPost();

  // Calculate word count
  const wordCount = useMemo(() => {
    if (!commentText.trim()) return 0;
    return commentText.trim().split(/\s+/).length;
  }, [commentText]);

  const isOverLimit = wordCount > MAX_WORDS;
  const showWarning = wordCount > MAX_WORDS * WARNING_THRESHOLD;
  const wordPercentage = Math.min((wordCount / MAX_WORDS) * 100, 100);

  const getWordCountColor = () => {
    if (isOverLimit) return "text-red-500";
    if (showWarning) return "text-amber-500";
    return "text-emerald-500";
  };

  const getProgressColor = () => {
    if (isOverLimit) return "bg-red-500";
    if (showWarning) return "bg-amber-500";
    return "bg-emerald-500";
  };

  // Auto-focus the textarea when the modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    } else {
      setCommentText("");
    }
  }, [open]);

  // Scroll to the newest comment after the list updates
  useEffect(() => {
    if (comments?.length) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments?.length]);

  const handleSubmit = () => {
    const text = commentText.trim();
    if (!text || isSubmitting || isOverLimit) return;

    addComment(
      { postId: post.id, comment: text },
      {
        onSuccess: () => {
          setCommentText("");
          textareaRef.current?.focus();
        },
      },
    );
  };

  // Ctrl / Cmd + Enter to submit
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/);

    if (words.length > MAX_WORDS && words.length > wordCount) {
      const trimmedValue = value.split(/\s+/).slice(0, MAX_WORDS).join(" ");
      setCommentText(trimmedValue);
    } else {
      setCommentText(value);
    }
  };

  const { data: currentUser } = useAuth();
  const commentCount = comments?.length ?? post?.comments?.count ?? 0;
  const canSubmit = commentText.trim() && !isOverLimit && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl border-0">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#233389] text-base font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
              {commentCount > 0 && (
                <span className="ml-1 text-sm font-medium text-gray-400">
                  ({commentCount})
                </span>
              )}
            </DialogTitle>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {commentCount} {commentCount === 1 ? "comment" : "comments"}
            </span>
          </div>

          {/* Compact post preview */}
          <div className="flex gap-3 mt-4 p-3 bg-white/80 rounded-xl border border-gray-100/80">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#233389]/10 to-[#233389]/5 overflow-hidden shrink-0 ring-2 ring-white shadow-sm">
              <Image
                src={post?.profileImagePath || "/assets/Profile Image.jpg"}
                alt={post?.authorFirstName || "User"}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#233389]">
                {post?.authorFirstName} {post?.authorLastName}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">
                {post?.body || post?.content}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* ── Comments list ── */}
        <ScrollArea className="max-h-[360px]">
          <div className="px-6 py-4 space-y-4">
            {isLoadingComments && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#233389]" />
              </div>
            )}

            {commentsError && (
              <div className="text-center py-8">
                <div className="h-12 w-12 rounded-full bg-red-50 mx-auto flex items-center justify-center mb-3">
                  <MessageSquare className="h-5 w-5 text-red-400" />
                </div>
                <p className="text-sm text-red-500">Failed to load comments</p>
                <p className="text-xs text-gray-400 mt-1">
                  Please try again later
                </p>
              </div>
            )}

            {!isLoadingComments && !commentsError && comments?.length === 0 && (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-gray-50 mx-auto flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  No comments yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Be the first to start the conversation!
                </p>
              </div>
            )}

            {!isLoadingComments &&
              comments?.map((comment, idx) => (
                <CommentItem key={comment.id || idx} comment={comment} />
              ))}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* ── Comment input ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="flex gap-3 items-end">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#233389]/10 to-[#233389]/5 overflow-hidden shrink-0 ring-2 ring-white shadow-sm">
              <Image
                src={
                  currentUser?.data?.profileImagePath ||
                  "/assets/Profile Image.jpg"
                }
                alt="You"
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={commentText}
                onChange={handleCommentChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="Write a comment…"
                className={cn(
                  "resize-none min-h-[44px] max-h-[120px] pr-12 rounded-2xl border-2 text-sm py-2.5 bg-white transition-all duration-200",
                  isFocused
                    ? "border-[#233389] ring-4 ring-[#233389]/10"
                    : isOverLimit
                      ? "border-red-400"
                      : "border-gray-200 hover:border-gray-300",
                  isOverLimit && "focus-visible:ring-red-400/10",
                )}
                rows={1}
                style={{
                  minHeight: "44px",
                }}
              />

              {/* Word counter indicator */}
              {commentText.trim() && wordCount > 0 && (
                <div className="absolute -top-6 right-1 flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${getWordCountColor()}`}
                  >
                    {wordCount}/{MAX_WORDS}
                  </span>
                </div>
              )}

              {/* Progress bar */}
              {commentText.trim() && wordCount > 0 && (
                <div className="absolute -bottom-1.5 left-3 right-3 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${getProgressColor()}`}
                    style={{ width: `${Math.min(wordPercentage, 100)}%` }}
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  "absolute right-2.5 bottom-2.5 p-1.5 rounded-lg transition-all duration-200",
                  canSubmit
                    ? "text-[#233389] hover:bg-[#233389]/10 hover:scale-110 active:scale-95"
                    : "text-gray-300 cursor-not-allowed",
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between mt-2 pl-12">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">⌘ + Enter to send</span>
              {commentText.trim() && !isOverLimit && wordCount > 0 && (
                <>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-400">
                    {MAX_WORDS - wordCount} words remaining
                  </span>
                </>
              )}
            </div>

            {/* Warning message */}
            {commentText.trim() && showWarning && (
              <span className={`text-xs ${getWordCountColor()}`}>
                {isOverLimit ? "⚠️ Limit exceeded" : "⚠️ Approaching limit"}
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PostCard({
  post,
  onLike,
  onComment,
  onFollow,
  onSave,
  onCopyLink,
}) {
  const t = useTranslations("Dashboard");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [fullImageOpen, setFullImageOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const dropdownRef = useRef(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    // Check if content exceeds limit (e.g., 200 characters or 30 words)
    const content = post.body || post.content || "";
    const wordCount = content.split(/\s+/).length;
    const charCount = content.length;

    // Adjust threshold as needed (example: 200 chars OR 30 words)
    setShowReadMore(charCount > 200 || wordCount > 30);
  }, [post.body, post.content]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  // Prevent body scroll when full image modal is open
  useEffect(() => {
    if (fullImageOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [fullImageOpen]);

  const handleLike = () => onLike?.(post.id);

  const handleComment = () => {
    setCommentModalOpen(true);
  };

  const handleFollow = () => onFollow?.(post.author?.id);

  const handleSave = () => {
    setOpenDropdown(false);
    onSave?.(post.id);
  };

  const handleCopyLink = () => {
    setOpenDropdown(false);
    const postUrl = `${window.location.origin}/dashboard/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    onCopyLink?.(post.id);
  };

  const openFullImage = (index) => {
    setSelectedImageIndex(index);
    setFullImageOpen(true);
  };

  const closeFullImage = () => {
    setFullImageOpen(false);
  };

  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? post.images.length - 1 : prev - 1,
    );
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === post.images.length - 1 ? 0 : prev + 1,
    );
  };

  // Keyboard navigation for full image view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!fullImageOpen) return;

      if (e.key === "Escape") {
        closeFullImage();
      } else if (e.key === "ArrowLeft") {
        goToPreviousImage();
      } else if (e.key === "ArrowRight") {
        goToNextImage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [fullImageOpen, selectedImageIndex]);

  const images = post.images || [];
  const hasImages = images.length > 0;

  return (
    <>
      <div className="bg-white rounded-lg p-4 lg:p-6">
        {/* ── Post Header ── */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-300 overflow-hidden shrink-0">
              <Image
                src={
                  (post.profileImagePath.startsWith("http")
                    ? post.profileImagePath
                    : `${process.env.NEXT_PUBLIC_API_URL}/${post.profileImagePath}`) ||
                  "/assets/Profile Image.jpg"
                }
                alt={post.author?.firstName || "User"}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <Link
                href={`/dashboard/profile/${post.authorId}`}
                className="hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <h3 className="font-semibold text-[#233389]">
                  {post.firstName || "Anonymous"} {post.lastName || "User"}
                </h3>
              </Link>
              {post?.title && (
                <p className="text-sm text-gray-600">{post.title}</p>
              )}
              <p className="text-xs text-gray-500">
                {post.createdAt
                  ? formatDistanceToNow(new Date(post.createdAt))
                  : "Just now"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Follow Button */}
            {post.connectionStatus === null && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFollow}
                className="text-[#233389] border-[#233389] hover:bg-[#233389] hover:text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t("follow")}
              </Button>
            )}

            {/* {post.connectionStatus === "PENDING" && (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-gray-500 border-gray-300 bg-gray-50"
              >
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {t("pending")}
              </Button>
            )} */}

            {post.connectionStatus === "ACCEPTED" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <Check className="h-4 w-4 mr-1" />
                {t("following")}
              </Button>
            )}
            {/* Three-dot Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setOpenDropdown(!openDropdown)}
              >
                <MoreHorizontal className="h-5 w-5 text-[#233389]" />
              </button>
              {openDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={handleSave}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                  >
                    <Bookmark className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{t("save")}</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left rounded-b-lg"
                  >
                    <LinkIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-900">
                      {t("copyLink")}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Post Body ── */}
        {(post.body || post.content) && (
          <div className="mb-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {showReadMore && !isExpanded
                ? (post.body || post.content).slice(0, 200) + "..."
                : post.body || post.content}
            </p>
            {showReadMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#233389] hover:underline text-sm font-medium mt-1"
              >
                {isExpanded ? t("readLess") : t("readMore")}
              </button>
            )}
          </div>
        )}

        {/* ── Post Images ── */}
        {hasImages && (
          <div
            className={`mb-4 gap-2 ${
              images.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2"
            }`}
            style={
              images.length === 3
                ? { gridTemplateRows: "repeat(2, minmax(0, 1fr))" }
                : {}
            }
          >
            {images.map((image, index) => {
              const isFirstOfThree = images.length === 3 && index === 0;
              const remainingCount = images.length - 3;

              return (
                <div
                  key={index}
                  className={`relative bg-gray-200 rounded-lg overflow-hidden cursor-pointer group ${
                    isFirstOfThree ? "row-span-2" : "aspect-video"
                  }`}
                  style={isFirstOfThree ? { gridRow: "1 / 3" } : {}}
                  onClick={() => openFullImage(index)}
                >
                  <Image
                    src={image}
                    alt={`Post image ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Overlay with zoom icon */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2">
                      <svg
                        className="h-5 w-5 text-[#233389]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Show +N overlay for last image if there are more than 3 */}
                  {index === 2 && images.length > 3 && (
                    <div
                      className="absolute inset-0 bg-black/50 flex items-center justify-center"
                      onClick={() => openFullImage(2)}
                    >
                      <span className="text-white text-2xl font-bold">
                        +{images.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Engagement Metrics ── */}
        {(post.likeCount > 0 || post.commentCount > 0) && (
          <div className="flex items-center justify-between pt-4 mb-4">
            {post.likeCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs">
                    👍
                  </div>
                  <div className="h-6 w-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-xs">
                    👏
                  </div>
                  <div className="h-6 w-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-xs">
                    🤍
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
                </span>
              </div>
            )}
            {post.commentCount > 0 && (
              <button
                onClick={handleComment}
                className="text-sm text-gray-600 hover:underline"
              >
                {post.commentCount}{" "}
                {post.commentCount === 1 ? "comment" : "comments"}
              </button>
            )}
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex items-center pt-4 border-t border-gray-200">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 transition-colors ${
              post.hasUserLiked
                ? "text-[#ED202D]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Heart
              className={`h-5 w-5 ${post.hasUserLiked ? "fill-[#ED202D]" : ""}`}
              strokeWidth={2}
            />
            <span className="text-sm font-medium cursor-pointer">
              {t("like")}
            </span>
          </button>

          <button
            onClick={handleComment}
            className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MessageSquare className="h-5 w-5 text-[#2B7FFF]" strokeWidth={2} />
            <span className="text-sm font-medium cursor-pointer">
              {t("comment")}
            </span>
          </button>
        </div>
      </div>

      {/* ── Full Image Modal ── */}
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
            <Image
              src={images[selectedImageIndex]}
              alt={`Post image ${selectedImageIndex + 1}`}
              width={1200}
              height={800}
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

      {/* ── Comment Modal ── */}
      <CommentModal
        open={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        post={post}
      />
    </>
  );
}
