"use client";

import { useState } from "react";
import { Search, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import networkService from "@/lib/services/networkService";
import { useSendInvitation } from "@/lib/hooks/useMessagingQueries";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Dialog for starting a new direct message.
 * Step 1: Search and select a user from the network.
 * Step 2: Write a short intro message and send the invitation.
 */
export function NewMessageDialog({ open, onOpenChange, conversations }) {
  const [step, setStep] = useState("search"); // "search" | "compose"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [shortMessage, setShortMessage] = useState("");

  const { mutate: sendInvitation, isPending } = useSendInvitation();

  // Fetch network users for the search
  const { data: networkData, isLoading } = useQuery({
    queryKey: ["network", searchQuery],
    queryFn: () =>
      networkService.getNetwork({ search: searchQuery || undefined }),
    enabled: open,
    staleTime: 30 * 1000,
  });

  // Replace the existing users filter with:
  const users = (() => {
    const raw = networkData?.data || [];
    const seen = new Set();
    const uniqueUsers = raw.filter((u) => {
      if (seen.has(u.userId)) return false;
      seen.add(u.userId);
      return true;
    });

    // Only show ACCEPTED connections that don't have existing conversations
    const chattedUserIds = new Set(
      conversations
        ?.filter((conv) => conv.type === "DIRECT" && conv.lastMessage !== null)
        .map((conv) => conv.userId) || [],
    );

    return uniqueUsers.filter(
      (user) =>
        user.connectionStatus === "ACCEPTED" &&
        !chattedUserIds.has(user.userId),
    );
  })();

  console.log(users, "network users for messaging");

  // Filter by search
  const filteredUsers = searchQuery.trim()
    ? users.filter((u) => {
        const name =
          `${u.firstName || ""} ${u.lastName || ""} ${u.name || ""}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
      })
    : users;

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setStep("compose");
  };

  const handleSend = () => {
    if (!selectedUser) return;
    const userId = selectedUser.userId || selectedUser.id;

    sendInvitation(
      {
        recipientId: userId,
        shortMessage:
          shortMessage.trim() || "Hi, I'd like to connect with you!",
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  const handleClose = () => {
    setStep("search");
    setSearchQuery("");
    setSelectedUser(null);
    setShortMessage("");
    onOpenChange(false);
  };

  const handleBack = () => {
    setStep("search");
    setSelectedUser(null);
    setShortMessage("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => (v ? onOpenChange(v) : handleClose())}
    >
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === "search" ? "New Message" : "Send Invitation"}
          </DialogTitle>
          <DialogDescription>
            {step === "search"
              ? "Search for someone in your network to start a conversation."
              : `Send a message request to ${selectedUser?.firstName || selectedUser?.name || "this user"}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "search" ? (
          <div className="flex flex-col flex-1 min-h-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 max-h-72 space-y-1">
              {isLoading ? (
                <div className="space-y-3 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {searchQuery ? "No users found" : "Your network is empty"}
                </p>
              ) : (
                filteredUsers.slice(0, 20).map((user) => {
                  const fullName =
                    user.name ||
                    `${user.firstName || ""} ${user.lastName || ""}`.trim();
                  const avatar = user.profileImageUrl || user.avatar || null;

                  let role = "";
                  try {
                    const sectors = Array.isArray(user.sector)
                      ? user.sector
                      : JSON.parse(user.sector || "[]");
                    role = sectors.length > 0 ? sectors.join(", ") : "";
                  } catch {
                    role = user.sector || "";
                  }

                  return (
                    <button
                      key={user.userId}
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={avatar} alt={fullName} />
                        <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {fullName}
                        </p>
                        {role && (
                          <p className="text-xs text-muted-foreground truncate">
                            {role}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected user preview */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage
                  src={selectedUser?.profileImageUrl || selectedUser?.avatar}
                  alt={selectedUser?.firstName}
                />
                <AvatarFallback>
                  {getInitials(
                    selectedUser?.name ||
                      `${selectedUser?.firstName || ""} ${selectedUser?.lastName || ""}`,
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {selectedUser?.name ||
                    `${selectedUser?.firstName || ""} ${selectedUser?.lastName || ""}`.trim()}
                </p>
              </div>
            </div>

            <Textarea
              placeholder="Write a short intro message (optional)..."
              value={shortMessage}
              onChange={(e) => setShortMessage(e.target.value)}
              rows={3}
              disabled={isPending}
              autoFocus
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleBack}
                disabled={isPending}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-stp-blue-light hover:bg-stp-blue-light/90 text-white"
                onClick={handleSend}
                disabled={isPending}
              >
                {isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1.5" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
