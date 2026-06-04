"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Search, Send, UserPlus, X, Loader2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import debounce from "lodash/debounce";

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
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [shortMessage, setShortMessage] = useState("");
  
  const searchTimeoutRef = useRef(null);
  const { mutate: sendInvitation, isPending } = useSendInvitation();

  // Fetch all connections - using getConnections like the CreateDealRoomModal
  const { 
    data: connectionsData, 
    isLoading: isLoadingConnections 
  } = useQuery({
    queryKey: ["my-connections"],
    queryFn: () => networkService.getConnections(),
    enabled: open,
  });

  // Safely get connections array
  const allConnections = useMemo(() => {
    return connectionsData?.data || connectionsData || [];
  }, [connectionsData]);

  // Filter connections: only ACCEPTED status and no existing conversations
  const availableUsers = useMemo(() => {
    // Create a Set of user IDs that already have conversations
    const chattedUserIds = new Set(
      conversations
        ?.filter((conv) => conv.type === "DIRECT" && conv.lastMessage !== null)
        .map((conv) => conv.userId) || [],
    );

    // Filter connections
    return allConnections.filter(
      (connection) =>
        connection.status === "ACCEPTED" && // Use status field from connections API
        !chattedUserIds.has(connection.connectionId) // Use connectionId as the unique identifier
    );
  }, [allConnections, conversations]);

  // Debounced search function
  const performSearch = useCallback(
    debounce((query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      
      // Simulate async search with setTimeout for better UX
      setTimeout(() => {
        const results = availableUsers.filter(connection => {
          const fullName = `${connection.firstName || ''} ${connection.lastName || ''}`.toLowerCase();
          const company = (connection.companyName || '').toLowerCase();
          const title = (connection.title || '').toLowerCase();
          const searchLower = query.toLowerCase();
          
          // Also search in sectors
          let sectors = [];
          try {
            sectors = Array.isArray(connection.sector) 
              ? connection.sector 
              : JSON.parse(connection.sector || "[]");
          } catch {
            sectors = connection.sector ? [connection.sector] : [];
          }
          const sectorMatch = sectors.some(s => s.toLowerCase().includes(searchLower));
          
          return fullName.includes(searchLower) || 
                 company.includes(searchLower) || 
                 title.includes(searchLower) ||
                 sectorMatch;
        });
        
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
    }, 300),
    [availableUsers]
  );

  // Trigger search when search query changes
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
    
    return () => {
      performSearch.cancel();
    };
  }, [searchQuery, performSearch]);

  const handleSelectUser = (connection) => {
    setSelectedUser(connection);
    setStep("compose");
  };

  const handleSend = () => {
    if (!selectedUser) return;
    const userId = selectedUser.userId; // Use userId from the connection object

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
    setSearchResults([]);
    setSelectedUser(null);
    setShortMessage("");
    onOpenChange(false);
  };

  const handleBack = () => {
    setStep("search");
    setSelectedUser(null);
    setShortMessage("");
  };

  // Get user display name helper
  const getUserDisplayName = (connection) => {
    return `${connection.firstName || ""} ${connection.lastName || ""}`.trim();
  };

  // Get user role/sectors helper
  const getUserRole = (connection) => {
    try {
      const sectors = Array.isArray(connection.sector)
        ? connection.sector
        : JSON.parse(connection.sector || "[]");
      return sectors.length > 0 ? sectors.join(", ") : "";
    } catch {
      return connection.sector || connection.title || "";
    }
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
              : `Send a message request to ${selectedUser?.firstName || "this user"}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "search" ? (
          <div className="flex flex-col flex-1 min-h-0 space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, company, or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {searchQuery.trim().length < 2 && searchQuery.trim().length > 0 && "Type at least 2 characters to search"}
                {searchQuery.trim().length === 0 && `Showing ${availableUsers.length} available connections`}
              </p>
            </div>

            {/* Results Area */}
            <div className="flex-1 min-h-0">
              {isLoadingConnections ? (
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
              ) : searchQuery.trim().length >= 2 ? (
                <>
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-stp-blue-light" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No connections found matching "{searchQuery}"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try a different name or company
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Search Results ({searchResults.length})
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Click to select
                        </span>
                      </div>
                      <ScrollArea className="h-[320px] pr-3">
                        <div className="space-y-1">
                          {searchResults.map((connection) => {
                            const fullName = getUserDisplayName(connection);
                            const avatar = connection.profileImagePath || null;
                            const role = getUserRole(connection);

                            return (
                              <button
                                key={connection.connectionId}
                                onClick={() => handleSelectUser(connection)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all text-left group"
                              >
                                <Avatar className="h-10 w-10 shrink-0">
                                  <AvatarImage src={avatar} alt={fullName} />
                                  <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {fullName}
                                  </p>
                                  {connection.companyName && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {connection.companyName}
                                    </p>
                                  )}
                                  {role && !connection.companyName && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {role}
                                    </p>
                                  )}
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                >
                                  Select
                                </Badge>
                              </button>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No available connections
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect with more people to start conversations
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Your Connections ({availableUsers.length})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Type to search
                    </span>
                  </div>
                  <ScrollArea className="h-[320px] pr-3">
                    <div className="space-y-1">
                      {availableUsers.slice(0, 20).map((connection) => {
                        const fullName = getUserDisplayName(connection);
                        const avatar = connection.profileImagePath || null;
                        const role = getUserRole(connection);

                        return (
                          <button
                            key={connection.connectionId}
                            onClick={() => handleSelectUser(connection)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all text-left group"
                          >
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage src={avatar} alt={fullName} />
                              <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {fullName}
                              </p>
                              {connection.companyName && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {connection.companyName}
                                </p>
                              )}
                              {role && !connection.companyName && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {role}
                                </p>
                              )}
                            </div>
                            <Badge 
                              variant="outline" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            >
                              Select
                            </Badge>
                          </button>
                        );
                      })}
                      {availableUsers.length > 20 && (
                        <p className="text-xs text-center text-muted-foreground py-2">
                          +{availableUsers.length - 20} more connections. Use search to find them.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>

            {/* Info Box */}
            {availableUsers.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 You can only message users you're connected with. 
                  Search by name, company, or title to find them.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected user preview */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage
                  src={selectedUser?.profileImagePath}
                  alt={selectedUser?.firstName}
                />
                <AvatarFallback>
                  {getInitials(getUserDisplayName(selectedUser))}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {getUserDisplayName(selectedUser)}
                </p>
                {selectedUser?.companyName && (
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedUser.companyName}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={isPending}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
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
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Sending...
                  </>
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