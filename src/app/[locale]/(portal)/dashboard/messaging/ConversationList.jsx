import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Users,
  Mail,
  Check,
  X,
  PenSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
// import { formatRelativeTime } from "@/lib/helper";
import useAuthStore from "@/lib/store/useAuthStore";
import { ModernScrollArea } from "@/components/shared/ScrollArea";
import { formatDistanceToNow, parseISO } from "date-fns";

function ConversationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
};

export function ConversationList({
  conversations = [],
  selectedId,
  searchQuery,
  sortBy,
  isLoading,
  onSearchChange,
  onSortChange,
  onSelect,
  invitations = [],
  onAcceptInvitation,
  onDeclineInvitation,
  onBrowseGroups,
  onNewMessage,
}) {
  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "invitations"
   const { token } = useAuthStore();

  const sortLabels = {
    recent: "Most Recent",
    unread: "Unread First",
    name: "Name (A-Z)",
  };

  const pendingCount = invitations.length;
  // console.log(conversations.filter(ele=>(ele.online)), "conversations");
  // console.table(conversations)

  return (
    <div className="flex flex-col h-full w-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-stp-blue-light">
            Messages
          </h2>
          <div className="flex items-center gap-1">
            {onNewMessage && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onNewMessage}
                title="New message"
              >
                <PenSquare className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={(v) => onSortChange(v)}
                >
                  <DropdownMenuRadioItem value="recent">
                    Most Recent
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="unread">
                    Unread First
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name">
                    Name (A-Z)
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs: Chats / Invitations */}
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("chats")}
            className={cn(
              "flex-1 text-sm font-medium py-1.5 rounded-md transition-colors",
              activeTab === "chats"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Chats
          </button>
          {/* <button
            onClick={() => setActiveTab("invitations")}
            className={cn(
              "flex-1 text-sm font-medium py-1.5 rounded-md transition-colors relative",
              activeTab === "invitations"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Invitations
            {pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 min-w-[1.25rem] h-5 rounded-full bg-stp-blue-light text-white text-xs font-medium inline-flex items-center justify-center">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </button> */}
        </div>

        {/* Search (chats tab only) */}
        {activeTab === "chats" && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-muted/50 border-0"
            />
          </div>
        )}

        {/* Sort indicator */}
        {activeTab === "chats" && sortBy !== "recent" && (
          <p className="text-xs text-muted-foreground">
            Sorted by: {sortLabels[sortBy]}
          </p>
        )}
      </div>

      {/* Content */}
      <ModernScrollArea className="flex-1 w-full">
        {activeTab === "chats" ? (
          // /* ── Conversations List ── */
          (isLoading || !token) ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <ConversationSkeleton key={i} />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <p className="text-sm">No conversations found</p>
              {searchQuery && (
                <p className="text-xs mt-1">Try a different search term</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {conversations.map((conversation) => (
                <button
                  key={conversation.conversationId}
                  onClick={() => onSelect(conversation)}
                  className={cn(
                    "w-full flex items-start gap-2 p-3 sm:p-4 text-left hover:bg-muted/50 transition-colors",
                    selectedId === conversation.conversationId && "bg-muted",
                    "px-3 py-3 md:px-4 md:py-4",
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarImage
                        src={conversation.avatar}
                        alt={conversation.name}
                      />
                      <AvatarFallback>
                        {getInitials(conversation.name)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <span className="absolute bottom-0 right-0 h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500 border border-card sm:border-2" />
                    )}
                    {/* Group indicator */}
                    {conversation.type === "PUBLIC_GROUP" && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-stp-blue-light flex items-center justify-center">
                        <Users className="h-2.5 w-2.5 text-white" />
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "font-medium text-xs sm:text-sm truncate",
                          conversation.unread
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {conversation.name}
                      </span>

                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {
                          conversation?.lastMessage
                            ? formatRelativeTime(
                                conversation.lastMessageAt,
                              )
                            : formatRelativeTime(conversation.createdAt) // Fallback to chat creation time
                        }
                      </span>
                    </div>

                    <p
                      className={cn(
                        "text-xs sm:text-sm truncate mt-0.5",
                        conversation.unread
                          ? "text-stp-blue-light font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      {/* ✅ Fix: Extract content from lastMessage object */}
                      {conversation.lastMessage
                        ? typeof conversation.lastMessage === "object"
                          ? conversation.lastMessage.content ||
                            conversation.lastMessage.text ||
                            "No messages yet"
                          : conversation.lastMessage
                        : "No messages yet"}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {conversation.unread && conversation.unreadCount > 0 && (
                    <span className="px-1.5 min-w-[1.75rem] h-6 rounded-full bg-stp-blue-light text-primary-foreground text-xs font-medium flex items-center justify-center shrink-0">
                      {conversation.unreadCount > 9
                        ? "9+"
                        : conversation.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )
        ) : // /* ── Invitations List ── */
        invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Mail className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No pending invitations</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {invitations.map((inv) => {
              const name = `${inv.firstName} ${inv.lastName}` || "Someone";
              const avatar =
                inv.senderAvatar || inv.sender?.profileImagePath || null;
              const message = inv.shortMessage || "Wants to connect with you";
              const invId = inv.invitationId || inv.id;

              return (
                <div key={invId} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">
                        {name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {message}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pl-13">
                    <Button
                      size="sm"
                      className="bg-stp-blue-light hover:bg-stp-blue-light/90 text-white flex-1"
                      onClick={() => onAcceptInvitation?.(invId)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onDeclineInvitation?.(invId)}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ModernScrollArea>

      {/* Browse Groups Button */}
      {onBrowseGroups && (
        <div className="p-3 border-t border-border">
          <Button
            variant="outline"
            className="w-full border-stp-blue-light text-stp-blue-light hover:bg-stp-blue-light hover:text-white"
            onClick={onBrowseGroups}
          >
            <Users className="h-4 w-4 mr-2" />
            Browse Groups
          </Button>
        </div>
      )}
    </div>
  );
}
