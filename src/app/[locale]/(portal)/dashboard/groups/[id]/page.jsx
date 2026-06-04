"use client";
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  LogOut,
  Image as ImageIcon,
  Video,
  BarChart3,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Bookmark,
  Link2,
  Users,
  Info,
  Link,
  FlagIcon,
  SendHorizontal,
  ChevronDown,
  Loader2,
  X,
  UserCheck,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useGroupById,
  useGroupMembers,
  useToggleMembership,
  useGroupPosts,
  useCreateGroupPost,
  useLikeGroupPost,
  usePostComments,
  useCommentOnPost,
} from "@/lib/hooks/useGroupQueries";
import { Helmet } from "react-helmet-async";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── Post Skeleton ────────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

// ─── Comment Section ──────────────────────────────────────────────────────────

function CommentsSection({ groupId, postId, onClose }) {
  const [commentText, setCommentText] = useState("");
  const { data, isLoading, fetchNextPage, hasNextPage } = usePostComments(
    groupId,
    postId,
  );
  const { mutate: submitComment, isPending } = useCommentOnPost(
    groupId,
    postId,
  );

  const comments = data?.pages.flat() || [];

  const handleSubmit = () => {
    if (!commentText.trim() || isPending) return;
    submitComment(commentText.trim(), {
      onSuccess: () => setCommentText(""),
    });
  };

  return (
    <div className="mt-4 pt-4 border-t space-y-3">
      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment…"
          className="min-h-[60px] resize-none text-sm flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button
          size="icon"
          className="h-9 w-9 shrink-0 self-end bg-stp-blue-light hover:bg-stp-blue-light/90 text-white rounded-full"
          disabled={!commentText.trim() || isPending}
          onClick={handleSubmit}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.commentId || c.id} className="flex items-start gap-2.5">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={c.authorAvatar || c.profileImagePath} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(
                    c.authorName || `${c.firstName || ""} ${c.lastName || ""}`,
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-xl px-3 py-2 flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {c.authorName ||
                    `${c.firstName || ""} ${c.lastName || ""}`.trim()}
                </p>
                <p className="text-sm text-foreground mt-0.5">
                  {c.comment || c.content}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatRelativeTime(c.createdAt)}
                </p>
              </div>
            </div>
          ))}
          {hasNextPage && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => fetchNextPage()}
            >
              Load more comments
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, groupId }) {
  const [showComments, setShowComments] = useState(false);
  const { mutate: likePost } = useLikeGroupPost(groupId);

  const authorName =
    post.authorName ||
    `${post.firstName || ""} ${post.lastName || ""}`.trim() ||
    "Member";
  const authorAvatar = post.authorAvatar || post.profileImagePath || null;
  const authorTitle = post.authorTitle || post.title || "";

  return (
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
              <DropdownMenuItem>
                <Bookmark className="h-4 w-4 mr-2" />
                Save post
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link2 className="h-4 w-4 mr-2" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
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

        {/* Images */}
        {post.images?.length > 0 && (
          <div
            className={cn(
              "mt-3 rounded-xl overflow-hidden gap-1",
              post.images.length === 1 ? "" : "grid grid-cols-2",
            )}
          >
            {post.images.slice(0, 4).map((img, i) => (
              <div
                key={i}
                className={cn(
                  "relative overflow-hidden",
                  post.images.length === 1 ? "h-64" : "h-40",
                )}
              >
                <img
                  src={img.url || img}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {i === 3 && post.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      +{post.images.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
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
  );
}

// ─── Create Post ──────────────────────────────────────────────────────────────

function CreatePostCard({ groupId, isMember }) {
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  const { mutate: createPost, isPending } = useCreateGroupPost(groupId);

  if (!isMember) return null;

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files].slice(0, 4));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!body.trim() || isPending) return;
    createPost(
      { body: body.trim(), images },
      {
        onSuccess: () => {
          setBody("");
          setImages([]);
        },
      },
    );
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <Textarea
          placeholder="Share something with the group…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-[72px] resize-none border-0 p-0 focus-visible:ring-0 text-sm"
        />

        {/* Image previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {images.map((file, i) => (
              <div
                key={i}
                className="relative h-16 w-16 rounded-lg overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() =>
                    setImages((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute top-0.5 right-0.5 h-4 w-4 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X className="h-2.5 w-2.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>
          <Button
            size="sm"
            className="bg-stp-blue-light hover:bg-stp-blue-light/90 text-white rounded-full gap-1.5"
            disabled={!body.trim() || isPending}
            onClick={handleSubmit}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <SendHorizontal className="h-3.5 w-3.5" />
            )}
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Members Modal ────────────────────────────────────────────────────────────

function MembersModal({ open, onOpenChange, groupId }) {
  const { data: members = [], isLoading } = useGroupMembers(groupId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
            {members.length > 0 && (
              <Badge variant="secondary">{members.length}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3 pr-2">
              {members.map((m) => {
                const name =
                  m.name || `${m.firstName || ""} ${m.lastName || ""}`.trim();
                return (
                  <div
                    key={m.userId || m.id}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={m.profileImagePath || m.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      {(m.title || m.companyName) && (
                        <p className="text-xs text-muted-foreground truncate">
                          {m.title}
                          {m.title && m.companyName ? " · " : ""}
                          {m.companyName}
                        </p>
                      )}
                    </div>
                    {m.memberRole === "ADMIN" && (
                      <Badge variant="secondary" className="text-[10px]">
                        Admin
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GroupDetailView({ params }) {
  const { id } = React.use(params);
  const [membersOpen, setMembersOpen] = useState(false);

  const { data: group, isLoading: groupLoading } = useGroupById(id);
  const { data: members = [] } = useGroupMembers(id);
  const {
    data: postsData,
    isLoading: postsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGroupPosts(id);
  const { mutate: toggleMembership, isPending: isTogglingMembership } =
    useToggleMembership(id);

  const posts = postsData?.pages.flat() || [];
  const isMember = group?.isMember ?? false;
  const memberRole = group?.memberRole || null;

  // Find admin from members list
  const admin = members.find((m) => m.memberRole === "ADMIN");

  // Suggested groups placeholder — replace with real query when endpoint available
  const suggestedGroups = [];

  if (groupLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            {[1, 2].map((i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Group Details | Blazing Torrent</title>
        <meta
          name="description"
          content={group?.description || "Discover and connect with alumni in your group."}
        />
      </Helmet>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Group header card */}
            <Card className="overflow-hidden pt-0">
              <div className="relative h-36 sm:h-48 w-full">
                {group?.coverImagePath || group?.thumbnail ? (
                  <img
                    src={group.coverImagePath || group.thumbnail}
                    alt={group?.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-stp-blue-light/80 to-stp-blue-light/40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Group icon */}
                <div className="absolute -bottom-8 left-4 sm:left-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl p-1 shadow-xl">
                    <div className="w-full h-full bg-gradient-to-br from-stp-blue-light to-stp-blue-light/70 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="pt-3">
                {/* Actions row */}
                <div className="flex items-center justify-end gap-1 mb-2">
                  {/* Join/Leave button */}
                  {isMember ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full gap-1.5 text-xs"
                      disabled={isTogglingMembership}
                      onClick={() => toggleMembership("LEAVE")}
                    >
                      {isTogglingMembership ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5" />
                      )}
                      Joined
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="rounded-full gap-1.5 text-xs bg-stp-blue-light hover:bg-stp-blue-light/90 text-white"
                      disabled={isTogglingMembership}
                      onClick={() => toggleMembership("JOIN")}
                    >
                      {isTogglingMembership ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="h-3.5 w-3.5" />
                      )}
                      Join Group
                    </Button>
                  )}

                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Info className="h-4 w-4 text-stp-blue-light" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-sm">
                      {group?.description || "No description available."}
                    </HoverCardContent>
                  </HoverCard>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4 text-stp-blue-light" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          navigator.clipboard.writeText(window.location.href)
                        }
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Copy link to group
                      </DropdownMenuItem>
                      {isMember && (
                        <DropdownMenuItem
                          onClick={() => toggleMembership("LEAVE")}
                          className="text-destructive focus:text-destructive"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Leave this group
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <FlagIcon className="h-4 w-4 mr-2" />
                        Report this group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h1 className="text-xl font-bold text-foreground mt-1">
                  {group?.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {group?.memberCount?.toLocaleString() ?? members.length}{" "}
                    members
                  </span>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <span className="text-sm text-muted-foreground capitalize">
                    {(group?.privacyMode || "Public").toLowerCase()} group
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Create post */}
            <CreatePostCard groupId={id} isMember={isMember} />

            {/* Filter tabs */}
            <div className="flex items-center gap-2">
              <Badge
                variant="default"
                className="bg-stp-blue-light text-white cursor-pointer"
              >
                All
              </Badge>
              {/* <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Recommended
            </Badge> */}
            </div>

            {/* Posts */}
            {postsLoading ? (
              <>
                <PostSkeleton />
                <PostSkeleton />
              </>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No posts yet</p>
                  {isMember && (
                    <p className="text-xs mt-1">Be the first to post!</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post.postId || post.id}
                    post={post}
                    groupId={id}
                  />
                ))}
                {hasNextPage && (
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    Load more posts
                  </Button>
                )}
              </>
            )}
          </div>

          {/* ── Sticky sidebar ── */}
          <div className="lg:sticky lg:top-25 space-y-4">
            {/* Members card */}
            <Card>
              <CardContent className="pt-4">
                <h3 className="text-2xl font-bold text-foreground">
                  {(group?.memberCount ?? members.length).toLocaleString()}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">members</p>

                {/* Member avatar stack */}
                {members.length > 0 && (
                  <div className="flex items-center mt-3 -space-x-2">
                    {members.slice(0, 5).map((m, i) => {
                      const name =
                        m.name ||
                        `${m.firstName || ""} ${m.lastName || ""}`.trim();
                      return (
                        <Avatar
                          key={m.userId || i}
                          className="h-7 w-7 ring-2 ring-background"
                        >
                          <AvatarImage src={m.profileImagePath || m.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                      );
                    })}
                    {members.length > 5 && (
                      <div className="h-7 w-7 rounded-full bg-muted ring-2 ring-background flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          +{members.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  className="w-full mt-4 bg-stp-blue-light hover:bg-stp-blue-light/90 text-white rounded-full"
                  onClick={() => setMembersOpen(true)}
                >
                  Show all members
                </Button>
              </CardContent>
            </Card>

            {/* Admin card */}
            {admin && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Admin
                  </h4>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage
                        src={admin.profileImagePath || admin.avatar}
                      />
                      <AvatarFallback>
                        {getInitials(
                          admin.name ||
                            `${admin.firstName || ""} ${admin.lastName || ""}`.trim(),
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {admin.name ||
                          `${admin.firstName || ""} ${admin.lastName || ""}`.trim()}
                      </p>
                      {(admin.title || admin.companyName) && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {admin.title}
                          {admin.title && admin.companyName ? " · " : ""}
                          {admin.companyName}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About card */}
            {group?.description && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    About
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {group.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Members modal */}
        <MembersModal
          open={membersOpen}
          onOpenChange={setMembersOpen}
          groupId={id}
        />
      </div>
    </>
  );
}
