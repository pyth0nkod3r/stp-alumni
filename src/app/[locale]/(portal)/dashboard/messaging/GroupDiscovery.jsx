"use client";

import { useState } from "react";
import { Search, Plus, Users, Lock, Globe, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  usePublicGroups,
  useJoinGroup,
  useCreatePublicGroup,
} from "@/lib/hooks/useMessagingQueries";

function GroupSkeleton() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

/**
 * Group discovery panel — browse, search, join, and create public groups.
 * Rendered as a full-height panel that replaces the chat view area.
 */
export function GroupDiscovery({ onClose, onGroupJoined }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  // Fetch public groups
  const { data: groupsData, isLoading } = usePublicGroups({
    search: searchQuery || undefined,
    page: 1,
    limit: 50,
  });

  const groups = Array.isArray(groupsData?.data)
    ? groupsData.data
    : Array.isArray(groupsData)
      ? groupsData
      : [];

  const { mutate: joinGroup, isPending: isJoining } = useJoinGroup();

  const handleJoin = (groupId) => {
    joinGroup(
      { groupId },
      {
        onSuccess: (data) => {
          if (data?.data?.conversationId) {
            onGroupJoined?.(data.data.conversationId);
          }
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-stp-blue-light">
            Browse Groups
          </h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-stp-blue-light hover:bg-stp-blue-light/90 text-white"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Groups list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <GroupSkeleton key={i} />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
            <Users className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No groups found</p>
            <p className="text-xs mt-1">
              {searchQuery ? "Try a different search" : "Be the first to create one"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {groups.map((group) => {
              const id = group.groupId || group.conversationId || group.id;
              const isOpen =
                group.privacyMode === "PUBLIC" ||
                group.isOpen === 1 ||
                group.isOpen === "1" ||
                group.isOpen === true;
              const memberCount = group.memberCount || group.participants?.length || 0;
              const isMember = group.isMember || false;

              return (
                <div key={id} className="p-4 flex items-start gap-3">
                  <Avatar className="h-12 w-12 rounded-lg shrink-0">
                    <AvatarImage src={group.thumbnail || group.avatar} alt={group.name} />
                    <AvatarFallback className="rounded-lg bg-stp-blue-light/10 text-stp-blue-light">
                      {getInitials(group.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm text-foreground truncate">
                        {group.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 shrink-0 ${
                          isOpen
                            ? "border-green-300 text-green-700 bg-green-50"
                            : "border-amber-300 text-amber-700 bg-amber-50"
                        }`}
                      >
                        {isOpen ? (
                          <><Globe className="h-2.5 w-2.5 mr-0.5" /> Open</>
                        ) : (
                          <><Lock className="h-2.5 w-2.5 mr-0.5" /> Closed</>
                        )}
                      </Badge>
                    </div>

                    {group.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                        {group.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        <Users className="h-3 w-3 inline mr-1" />
                        {memberCount} member{memberCount !== 1 ? "s" : ""}
                      </span>

                      {isMember ? (
                        <Badge variant="secondary" className="text-xs">
                          Joined
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-stp-blue-light text-stp-blue-light hover:bg-stp-blue-light hover:text-white"
                          onClick={() => handleJoin(id)}
                          disabled={isJoining}
                        >
                          {isOpen ? "Join" : "Request to Join"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Create Group Modal */}
      <CreateGroupModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(conversationId) => {
          setCreateOpen(false);
          onGroupJoined?.(conversationId);
        }}
      />
    </div>
  );
}

/**
 * Modal for creating a new public group.
 */
function CreateGroupModal({ open, onOpenChange, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const { mutate: createGroup, isPending } = useCreatePublicGroup();

  const handleSubmit = () => {
    if (!name.trim()) return;

    createGroup(
      {
        name: name.trim(),
        description: description.trim(),
        isOpen: isOpen ? "1" : "0",
      },
      {
        onSuccess: (data) => {
          setName("");
          setDescription("");
          setIsOpen(true);
          onCreated?.(data?.data?.conversationId);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>
            Create a public group for alumni to discover and join.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. STP Tech Community"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-desc">Description</Label>
            <Textarea
              id="group-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={3}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Open Group</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isOpen
                  ? "Anyone can join instantly"
                  : "Members must request to join"}
              </p>
            </div>
            <Switch
              checked={isOpen}
              onCheckedChange={setIsOpen}
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isPending}
            className="bg-stp-blue-light hover:bg-stp-blue-light/90 text-white"
          >
            {isPending ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
