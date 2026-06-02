// Add these missing imports at the top of your file
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Search,
  X,
  Loader2,
  UserPlus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/hooks/useUser";

export default function MembersModal({
  open,
  onOpenChange,
  room,
  onAddMember,
  onRemoveMember,
}) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const { currentUserId } = useAuth();

  const isAdmin = currentUserId && currentUserId === room?.createdBy;

  const members = room?.members || [];
  //   console.log(isAdmin,"isAdmin")

  // Create a Set of existing member IDs for quick lookup
  const existingMemberIds = useMemo(() => {
    return new Set(members.map((m) => m.userId));
  }, [members]);

  // Fetch connections
  const {
    data: connectionsData,
    isLoading: isLoadingConnections,
    refetch: refetchConnections,
  } = useQuery({
    queryKey: ["my-connections"],
    queryFn: () => networkService.getConnections(),
    enabled: open, // Fetch when modal opens
  });

  const allConnections = useMemo(() => {
    return connectionsData?.data || connectionsData || [];
  }, [connectionsData]);

  // Filter out existing members from connections
  const availableConnections = useMemo(() => {
    return allConnections.filter(
      (conn) => !existingMemberIds.has(conn.connectionId),
    );
  }, [allConnections, existingMemberIds]);

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
        const results = availableConnections.filter((conn) => {
          const fullName =
            `${conn.firstName || ""} ${conn.lastName || ""}`.toLowerCase();
          const company = (conn.companyName || "").toLowerCase();
          const title = (conn.title || "").toLowerCase();
          const email = (conn.email || "").toLowerCase();
          const searchLower = query.toLowerCase();

          return (
            fullName.includes(searchLower) ||
            company.includes(searchLower) ||
            title.includes(searchLower) ||
            email.includes(searchLower)
          );
        });

        setSearchResults(results);
        setIsSearching(false);
      }, 300);
    }, 300),
    [availableConnections],
  );

  // Trigger search when search query changes
  useEffect(() => {
    if (search.trim().length >= 2) {
      performSearch(search);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      performSearch.cancel();
    };
  }, [search, performSearch]);

  const handleAddMember = (connection) => {
    onAddMember?.(room.id, [connection.userId]);
    setSearch("");
    setSearchResults([]);
  };

  const handleRemoveMember = (userId) => {
    onRemoveMember?.(room.id, userId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Manage Members
            <Badge variant="secondary" className="ml-1">
              {members.length}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {isAdmin
              ? "As the room creator, you can add or remove members here."
              : "Only the room creator can manage members."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Search and Add Member Section */}
          <div className="space-y-3">
            {isAdmin && (
              <>
                {/* Search Input Section */}
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Add new member
                  </p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name, company, or title..."
                      className="pl-9"
                      autoFocus
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {search.trim().length < 2 &&
                      search.trim().length > 0 &&
                      "Type at least 2 characters to search"}
                    {search.trim().length === 0 &&
                      "Search your connections to add them to this room"}
                  </p>
                </div>

                {/* Search Results Processing */}
                {search.trim().length >= 2 && (
                  <div className="mt-4">
                    {isLoadingConnections ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-stp-blue-light" />
                      </div>
                    ) : isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-stp-blue-light" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-center py-8">
                        <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No connections found matching "{search}"
                        </p>
                        {availableConnections.length === 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            You don't have any available connections to add
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-muted-foreground">
                            Search Results ({searchResults.length})
                          </p>
                          <span className="text-xs text-muted-foreground">
                            Click to add
                          </span>
                        </div>

                        <ScrollArea className="max-h-64 pr-3">
                          <div className="space-y-1">
                            {searchResults.map((connection) => (
                              <div
                                key={connection.connectionId}
                                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-stp-blue-light/30 hover:bg-stp-blue-light/5 cursor-pointer transition-all"
                                onClick={() => handleAddMember(connection)}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <Avatar className="h-9 w-9 shrink-0">
                                    <AvatarImage
                                      src={
                                        connection.profileImagePath ||
                                        "/assets/Profile Image.jpg"
                                      }
                                      alt={`${connection.firstName || ""} profile`}
                                    />
                                    <AvatarFallback>
                                      {connection.firstName?.[0] ||
                                        connection.lastName?.[0] ||
                                        "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">
                                      {connection.firstName}{" "}
                                      {connection.lastName}
                                    </p>
                                    {connection.title && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {connection.title}
                                      </p>
                                    )}
                                    {connection.companyName && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {connection.companyName}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Native UI click transfers nicely from parent line container */}
                                <Button
                                  size="sm"
                                  className="rounded-full bg-stp-blue-light text-white hover:bg-stp-blue-light/90 h-7 px-3 shrink-0 ml-2"
                                >
                                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                                  Add
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                )}

                {/* Fallback Instructional Banner */}
                {search.trim().length === 0 &&
                  availableConnections.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 mt-4">
                      <p className="text-xs text-blue-800">
                        💡 Search for connections by name, company, or title to
                        add them to this room.
                      </p>
                    </div>
                  )}
              </>
            )}
          </div>

          {/* Member List Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Current Members ({members.length})
              </p>
              {members.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {members.filter((m) => m.ndaSigned).length} signed NDA
                </span>
              )}
            </div>

            {members.length === 0 ? (
              <div className="text-center py-8 rounded-lg border border-dashed">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No members yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add members using the search above
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-64 pr-1">
                <ul className="space-y-2">
                  {members.map((member) => (
                    <li
                      key={member.userId}
                      className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 bg-white hover:bg-muted/30 transition-colors"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage
                          src={member.avatar || member.profileImagePath}
                        />
                        <AvatarFallback className="text-xs bg-stp-blue-light/10 text-stp-blue-light">
                          {(member.firstName?.[0] || "") +
                            (member.lastName?.[0] || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        {(member.title || member.companyName) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {member.title}
                            {member.title && member.companyName && " · "}
                            {member.companyName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {member.userId === room?.createdBy && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 bg-amber-100 text-amber-700"
                          >
                            Admin
                          </Badge>
                        )}
                        {member.ndaSigned ? (
                          <span title="NDA signed">
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                          </span>
                        ) : (
                          <span title="NDA not signed">
                            <ShieldAlert className="h-4 w-4 text-amber-400" />
                          </span>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveMember(member.userId)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}

            {/* Info box for admins */}
            {members.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" />
                  <span>
                    Members marked with{" "}
                    <ShieldCheck className="h-3 w-3 inline text-green-500" />{" "}
                    have signed the NDA
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
