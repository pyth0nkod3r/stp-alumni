import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { formatRelativeTime } from "@/lib/helper";

function RoomSkeleton() {
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

export function DealRoomList({
  rooms,
  selectedId,
  searchQuery,
  sortBy,
  isLoading,
  onSearchChange,
  onSortChange,
  onSelect,
  onCreateRoom,
}) {
  const sortLabels = {
    recent: "Most Recent",
    unread: "Unread First",
    name: "Name (A-Z)",
  };

  return (
    <div className="flex flex-col h-full w-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-stp-blue-light">
            Deal Room
          </h2>
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-muted/50 border-0"
          />
        </div>

        {/* Sort indicator */}
        {sortBy !== "recent" && (
          <p className="text-xs text-muted-foreground">
            Sorted by: {sortLabels[sortBy]}
          </p>
        )}
      </div>

      {/* Rooms */}
      <ScrollArea className="flex-1 ">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <RoomSkeleton key={i} />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p className="text-sm">No rooms found</p>
            {searchQuery && (
              <p className="text-xs mt-1">Try a different search term</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rooms?.map((room) => {
              console.log(room,"room")
              return(
              <button
                key={room.id}
                onClick={() => onSelect(room)}
                className={cn(
                  // Base styles
                  "w-full flex items-start gap-2 p-3 sm:p-4 text-left hover:bg-muted/50 transition-colors",
                  // Selected state
                  selectedId === room.id && "bg-muted",
                  // Responsive padding
                  "px-3 py-3 md:px-4 md:py-4",
                )}
              >
                {/* Avatar section */}
                <div className="relative shrink-0">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage
                      src={room.avatar}
                      alt={room.name}
                    />
                    <AvatarFallback>
                      {room.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {room.online && (
                    <span className="absolute bottom-0 right-0 h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500 border border-card sm:border-2" />
                  )}
                </div>

                {/* Content section */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "font-medium text-xs sm:text-sm truncate",
                        room.unread
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {room.name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatRelativeTime(room.lastMessageAt)}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-xs sm:text-sm truncate mt-0.5",
                      room.unread
                        ? "text-stp-blue-light font-medium"
                        : "text-muted-foreground",
                    )}
                  >
                    {room.lastMessage.content}
                  </p>
                </div>

                {/* Unread badge */}
                {room.unread && room.unreadCount > 0 && (
                  <span className="px-1.5 min-w-[1.75rem] h-6 rounded-full bg-stp-blue-light text-primary-foreground text-xs font-medium flex items-center justify-center shrink-0">
                    {room.unreadCount > 9
                      ? "9+"
                      : room.unreadCount}
                  </span>
                )}
              </button>
            )})}
          </div>
        )}
      </ScrollArea>

      {/* Create a Room Button */}
      <div className="p-3 border-t border-border">
        <Button 
          onClick={onCreateRoom}
          className="w-full bg-stp-blue-light hover:bg-stp-blue-light/90 text-white rounded-full py-6"
        >
          Create a Room
        </Button>
      </div>
    </div>
  );
}
