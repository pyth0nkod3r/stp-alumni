"use client";
import React, { useState, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  LogOut,
  Image as ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Users,
  Info,
  Link,
  FlagIcon,
  ChevronDown,
  Loader2,
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
import {
  useGroupById,
  useGroupMembers,
  useToggleMembership,
  useGroupPosts,
  useReportGroup,
} from "@/lib/hooks/useGroupQueries";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import groupService from "@/lib/services/groupService";
import { useAuth } from "@/lib/hooks/useUser";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { ReportModal } from "./ReportModal";
import PostCard from "./PostCard";
import CreatePostCard from "./CreatePostCard";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getInitials(name = "") {
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


// ─── Members Modal ────────────────────────────────────────────────────────────

function MembersModal({ open, onOpenChange, groupId, isAdmin }) {
  const { data: members = [], isLoading } = useGroupMembers(groupId);
  const queryClient = useQueryClient();

  const { mutate: removeMember, isPending: isRemoving } = useMutation({
    mutationFn: (userId) => groupService.removeMember(groupId, userId),
    onSuccess: () => {
      toast.success("Member removed from group");
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to remove member");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#233389]">
            <Users className="h-4 w-4" />
            Group Members
            {members.length > 0 && (
              <Badge variant="secondary" className="rounded-full">{members.length}</Badge>
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
                  m.name || `${m.firstName || ""} ${m.lastName || ""}`.trim() || "Member";
                const isGroupAdmin = m.memberRole === "ADMIN" || m.role === "ADMIN";
                const memberUserId = m.userId || m.id;

                return (
                  <div
                    key={memberUserId}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={m.profileImagePath || m.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        {(m.title || m.companyName) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {m.title}
                            {m.title && m.companyName ? " · " : ""}
                            {m.companyName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isGroupAdmin ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Admin
                        </Badge>
                      ) : (
                        isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                            disabled={isRemoving}
                            onClick={() => removeMember(memberUserId)}
                          >
                            Remove
                          </Button>
                        )
                      )}
                    </div>
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

// ─── Join Requests Modal ──────────────────────────────────────────────────────

function JoinRequestsModal({ open, onOpenChange, groupId }) {
  const queryClient = useQueryClient();
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["group-join-requests", groupId],
    queryFn: () => groupService.getJoinRequests(groupId),
    enabled: open,
  });

  const { mutate: respondToRequest, isPending: isResponding } = useMutation({
    mutationFn: ({ requestId, action }) =>
      groupService.respondToJoinRequest(groupId, requestId, action),
    onSuccess: (_, vars) => {
      toast.success(
        vars.action === "ACCEPT" ? "Join request accepted" : "Join request rejected"
      );
      queryClient.invalidateQueries({ queryKey: ["group-join-requests", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to respond to request");
    },
  });

  const requests = Array.isArray(requestsData?.data)
    ? requestsData.data
    : Array.isArray(requestsData)
    ? requestsData
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#233389]">
            <UserPlus className="h-4 w-4" />
            Join Requests ({requests.length})
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-6">
              No pending join requests.
            </p>
          ) : (
            <div className="space-y-3 pr-2">
              {requests.map((req) => {
                const name =
                  req.name ||
                  `${req.firstName || ""} ${req.lastName || ""}`.trim() ||
                  req.user?.name ||
                  "User";
                const reqId = req.requestId || req.id;

                return (
                  <div
                    key={reqId}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={req.profileImagePath || req.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        {req.user?.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {req.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-[#233389] hover:bg-[#1a2866] text-white rounded-lg"
                        disabled={isResponding}
                        onClick={() =>
                          respondToRequest({ requestId: reqId, action: "ACCEPT" })
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
                        disabled={isResponding}
                        onClick={() =>
                          respondToRequest({ requestId: reqId, action: "REJECT" })
                        }
                      >
                        Decline
                      </Button>
                    </div>
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
  const [joinRequestsOpen, setJoinRequestsOpen] = useState(false);
  const { data: authData } = useAuth();

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

  const [reportOpen, setReportOpen] = useState(false);
  const { mutate: reportGroup, isPending: isReporting } = useReportGroup(id);

  const isMember = group?.isMember ?? false;
  const memberRole = group?.memberRole || null;
  const currentUserId = authData?.data?.id || authData?.data?.userId;
  const isUserAdmin =
    memberRole === "ADMIN" ||
    authData?.data?.role === "ADMIN" ||
    group?.createdById === currentUserId;

  const { mutate: generateInviteLink, isPending: isGeneratingLink } = useMutation({
    mutationFn: () => groupService.generateInviteLink(id),
    onSuccess: (res) => {
      const inviteUrl =
        res?.data?.inviteUrl ||
        `${window.location.origin}/dashboard/groups?invite=${res?.data?.token || res?.token || id}`;
      navigator.clipboard.writeText(inviteUrl);
      toast.success("Invite link copied to clipboard!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to generate invite link");
    },
  });

  const handleReportGroup = (reason, description) => {
    return new Promise((resolve, reject) => {
      reportGroup(
        { groupId: id, reason, description },
        {
          onSuccess: resolve,
          onError: reject,
        },
      );
    });
  };

  const posts = postsData?.pages.flat() || [];

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
          content={
            group?.description ||
            "Discover and connect with alumni in your group."
          }
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
                      <DropdownMenuItem
                        onClick={() => generateInviteLink()}
                        disabled={isGeneratingLink}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {isGeneratingLink ? "Generating link..." : "Generate invite link"}
                      </DropdownMenuItem>
                      {isUserAdmin && (
                        <DropdownMenuItem
                          onClick={() => setJoinRequestsOpen(true)}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Manage join requests
                        </DropdownMenuItem>
                      )}
                      {isMember && (
                        <DropdownMenuItem
                          onClick={() => toggleMembership("LEAVE")}
                          className="text-destructive focus:text-destructive"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Leave this group
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setReportOpen(true)}
                        className="text-destructive focus:text-destructive"
                      >
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
          isAdmin={isUserAdmin}
        />

        {/* Join requests modal */}
        <JoinRequestsModal
          open={joinRequestsOpen}
          onOpenChange={setJoinRequestsOpen}
          groupId={id}
        />
      </div>

      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        onReport={handleReportGroup}
        type="group"
        name={group?.name}
      />
    </>
  );
}
