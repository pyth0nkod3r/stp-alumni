"use client";
import { useState, useRef, useEffect } from "react";
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
import useAuthStore from "@/lib/store/useAuthStore";
import { useAuth } from "@/lib/hooks/useUser";
import { Link } from "@/i18n/routing";

/**
 * CommentItem — renders a single comment bubble
 */
function CommentItem({ comment }) {
  // console.log(comment,"comment")
  return (
    <div className="flex gap-3">
      <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden shrink-0">
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
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
          <p className="text-sm font-semibold text-[#233389] leading-tight">
            {comment.firstName || comment.user?.name || "Anonymous"}{" "}
            {comment.lastName || ""}
          </p>
          <p className="text-sm text-gray-700 mt-0.5 break-words">
            {comment.comment}
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-1 pl-2">
          {comment.createdAt
            ? formatDistanceToNow(new Date(comment.createdAt))
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
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  // GET comments — only fires when modal is open and post.id exists
  const {
    data,
    isLoading: isLoadingComments,
    error: commentsError,
  } = usePostComments(post?.id);

  const comments = data?.data || [];
  console.log(comments,"comments")

  // POST a new comment
  const { mutate: addComment, isPending: isSubmitting } = useCommentPost();

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
    if (!text || isSubmitting) return;

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
  const { data: currentUser } = useAuth();

  // console.log(currentUser,"sdnfknke")

  const commentCount = comments?.length ?? post?.comments?.count ?? 0;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <DialogTitle className="text-[#233389] text-base font-semibold">
            Comments{commentCount > 0 ? ` (${commentCount})` : ""}
          </DialogTitle>

          {/* Compact post preview */}
          <div className="flex gap-3 mt-3">
            <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden shrink-0">
              <Image
                src={post?.profileImagePath || "/assets/Profile Image.jpg"}
                alt={post?.authorFirstName || "User"}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#233389]">
                {post?.authorFirstName} {post?.authorLastName}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                {post?.body || post?.content}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* ── Comments list ── */}
        <ScrollArea style={{ maxHeight: "360px" }}>
          <div className="px-6 py-4 space-y-4">
            {isLoadingComments && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-[#233389]" />
              </div>
            )}

            {commentsError && (
              <p className="text-center text-sm text-red-500 py-4">
                Failed to load comments. Please try again.
              </p>
            )}

            {!isLoadingComments && !commentsError && comments?.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No comments yet.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Be the first to comment!
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
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-3 items-end">
            <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden shrink-0">
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
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a comment…"
                className="resize-none min-h-[44px] max-h-[120px] pr-12 rounded-2xl border-gray-200 focus-visible:ring-[#233389] text-sm py-2.5 bg-white"
                rows={1}
              />
              <button
                onClick={handleSubmit}
                disabled={!commentText.trim() || isSubmitting}
                className="absolute right-3 bottom-2.5 text-[#233389] disabled:text-gray-300 transition-colors hover:text-[#1d2a6e]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 pl-12">
            Ctrl + Enter to send
          </p>
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

  const handleLike = () => onLike?.(post.id);

  const handleComment = () => {
    setCommentModalOpen(true);
    // onComment?.(post.id); // still call the external callback if needed
  };

  const handleFollow = () => onFollow?.(post.author?.id);

  const handleSave = () => {
    setOpenDropdown(false);
    onSave?.(post.id);
  };

  const handleCopyLink = () => {
    setOpenDropdown(false);
    const postUrl = `${window.location.origin}/dashboard/newsfeed/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    onCopyLink?.(post.id);
  };

  return (
    <>
      <div className="bg-white rounded-lg p-4 lg:p-6">
        {/* ── Post Header ── */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-300 overflow-hidden shrink-0">
              <Image
                src={post.profileImagePath || "/assets/Profile Image.jpg"}
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
            {!post.author?.isFollowing && onFollow && (
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
        {/* ── Post Body with Read More ── */}
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
        {Array.isArray(post.images) && post.images.length > 0 && (
          <div
            className={`mb-4 gap-2 ${
              post.images.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2"
            }`}
            style={
              post.images.length === 3
                ? { gridTemplateRows: "repeat(2, minmax(0, 1fr))" }
                : {}
            }
          >
            {post.images.map((image, index) => (
              <div
                key={index}
                className={`relative bg-gray-200 rounded-lg overflow-hidden ${
                  post.images.length === 3 && index === 0
                    ? "row-span-2"
                    : "aspect-video"
                }`}
                style={
                  post.images.length === 3 && index === 0
                    ? { gridRow: "1 / 3" }
                    : {}
                }
              >
                <Image
                  src={image}
                  alt={`Post image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
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
                className="text-sm text-gray-600 hover:underline "
              >
                {post.commentCount}{" "}
                {post.commentCountt === 1 ? "comment" : "comments"}
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

      {/* ── Comment Modal (rendered outside the card) ── */}
      <CommentModal
        open={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        post={post}
      />
    </>
  );
}
