"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Paperclip,
  X,
  FileText,
  CheckCircle2,
  ChevronRight,
  Search,
  UserPlus,
  UserCheck,
  Users,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import networkService from "@/lib/services/networkService";
import { useDealRoom } from "./useDealRoom";
import { useSearchParams } from "next/navigation";
import { useCreateDealroom } from "@/lib/hooks/useDealroomQueries";

const STEPS = ["name", "members", "documents"];
const STEP_LABELS = {
  name: "Name",
  members: "Members",
  documents: "Documents",
};

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((step, i) => {
        const idx = STEPS.indexOf(current);
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium transition-all",
                done && "bg-stp-blue-light text-white",
                active &&
                  "bg-stp-blue-light text-white ring-2 ring-stp-blue-light/30",
                !done && !active && "bg-muted text-muted-foreground",
              )}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-xs",
                active
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              {STEP_LABELS[step]}
            </span>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ConnectionItem({ connection, isSelected, onToggle }) {
  // Use connectionId as the unique identifier
  const connectionId = connection.connectionId;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
        isSelected
          ? "bg-stp-blue-light/10 border border-stp-blue-light/30"
          : "hover:bg-muted border border-transparent",
      )}
      onClick={() => onToggle(connectionId, connection)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(connectionId, connection);
        }
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage
            src={connection.profileImagePath || "/assets/Profile Image.jpg"}
          />
          <AvatarFallback>
            {connection.firstName?.[0] || connection.lastName?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {connection.firstName} {connection.lastName}
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
      <div
        className={cn(
          "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ml-2",
          isSelected
            ? "bg-stp-blue-light border-stp-blue-light"
            : "border-gray-300",
        )}
      >
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </div>
    </div>
  );
}

export function CreateDealRoomModal({ open, onOpenChange, onCreate }) {
  const [step, setStep] = useState("name");
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState(new Map()); // Key: connectionId, Value: connection object
  const [documents, setDocuments] = useState([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const fileInputRef = useRef(null);
    const searchParams = useSearchParams();

  const {addMember} = useDealRoom()

const { mutateAsync: createRoom, isPending: isLoading } = useCreateDealroom();

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep("name");
      setRoomName("");
      setRoomDescription("");
      setSearchQuery("");
      setSelectedMembers(new Map());
      setDocuments([]);
      setIsLaunching(false);
    }
  }, [open]);

  // Fetch all connections
  const { data: connectionsData, isLoading: isLoadingConnections } = useQuery({
    queryKey: ["my-connections"],
    queryFn: () => networkService.getConnections(),
    enabled: open && step === "members",
  });

  // Safely get connections array
  const allConnections = useMemo(() => {
    return connectionsData?.data || connectionsData || [];
  }, [connectionsData]);

  // Compute search results
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length < 2) return [];

    return allConnections.filter((conn) => {
      const fullName =
        `${conn.firstName || ""} ${conn.lastName || ""}`.toLowerCase();
      const company = (conn.companyName || "").toLowerCase();
      const title = (conn.title || "").toLowerCase();
      return (
        fullName.includes(query) ||
        company.includes(query) ||
        title.includes(query)
      );
    });
  }, [searchQuery, allConnections]);

  const handleToggleMember = (connectionId, connection) => {
    setSelectedMembers((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(connectionId)) {
        newMap.delete(connectionId);
      } else {
        newMap.set(connectionId, connection);
      }
      return newMap;
    });
  };

  const handleRemoveMember = (connectionId) => {
    setSelectedMembers((prev) => {
      const newMap = new Map(prev);
      newMap.delete(connectionId);
      return newMap;
    });
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocuments((prev) => [
      ...prev,
      {
        id: `doc_${Date.now()}`,
        name: file.name,
        file,
        uploadedAt: new Date(),
      },
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

const handleLaunch = async () => {
  if (!roomName.trim() || isLoading) return;

  try {
    const data = await createRoom({
      name: roomName.trim(),
      description: roomDescription.trim(),
    });

    // API returns { status, message, data: { roomId, ... } }
    const roomId = data?.data?.roomId;
    console.log("Room created, roomId:", roomId, "full response:", data);

    if (roomId) {
      const memberIds = Array.from(selectedMembers.keys());
      if (memberIds.length > 0) {
        await addMember(roomId, memberIds);
      }
    }

    onOpenChange(false);
  } catch (err) {
    console.error("Failed to create room:", err);
  }
};

// 3. Fix handleSkipToLaunch
const handleSkipToLaunch = async () => {
  if (!roomName.trim() || isLoading) return;

  try {
    const data = await createRoom({
      name: roomName.trim(),
      description: roomDescription.trim(),
    });

    const roomId = data?.data?.roomId;
    console.log("Room created (skip), roomId:", roomId);

    onOpenChange(false);
  } catch (err) {
    console.error("Failed to create room:", err);
  }
};
  const selectedConnectionsList = Array.from(selectedMembers.values());

  const renderNameStep = () => (
    <>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="room-name" className="text-sm font-medium">
            Room name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="room-name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="e.g. Series A Negotiations"
            className="w-full"
            onKeyDown={(e) =>
              e.key === "Enter" && roomName.trim() && setStep("members")
            }
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="room-desc" className="text-sm font-medium">
            Description{" "}
            <span className="text-muted-foreground text-xs font-normal">
              (optional)
            </span>
          </Label>
          <Input
            id="room-desc"
            value={roomDescription}
            onChange={(e) => setRoomDescription(e.target.value)}
            placeholder="Brief description of this deal room"
            className="w-full"
          />
        </div>
      </div>
      <DialogFooter className="mt-6">
        <Button
          className="w-full rounded-full bg-stp-blue-light text-white hover:bg-stp-blue-light/90"
          onClick={() => setStep("members")}
          disabled={!roomName.trim()}
        >
          Continue
        </Button>
      </DialogFooter>
    </>
  );

  const renderMembersStep = () => (
    <>
      <div className="space-y-4">
        {/* Selected Members Section */}
        {selectedConnectionsList.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Selected ({selectedConnectionsList.length})
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMembers(new Map())}
                className="text-xs text-red-500 hover:text-red-600 h-auto p-0"
              >
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg max-h-32 overflow-y-auto">
              {selectedConnectionsList.map((member) => (
                <Badge
                  key={member.connectionId}
                  variant="secondary"
                  className="pl-2 pr-1 py-1.5 gap-1"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={member.profileImagePath} />
                    <AvatarFallback className="text-[10px]">
                      {member.firstName?.[0] || member.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">
                    {member.firstName} {member.lastName}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMember(member.connectionId);
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Connections
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, or title..."
              className="pl-9"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {searchQuery.trim().length < 2 &&
              "Type at least 2 characters to search your connections"}
          </p>
        </div>

        {/* Loading State */}
        {isLoadingConnections && searchQuery.trim().length >= 2 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-stp-blue-light" />
          </div>
        )}

        {/* Search Results or Empty State */}
        {!isLoadingConnections && (
          <>
            {searchQuery.trim().length >= 2 ? (
              searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No connections found matching "{searchQuery}"
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Search Results ({searchResults.length})
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Click to select/deselect
                    </span>
                  </div>
                  <ScrollArea className="h-[200px] pr-3">
                    <div className="space-y-1">
                      {searchResults.map((connection) => (
                        <ConnectionItem
                          key={connection.connectionId}
                          connection={connection}
                          isSelected={selectedMembers.has(
                            connection.connectionId,
                          )}
                          onToggle={handleToggleMember}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )
            ) : (
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Search for connections to add
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Type at least 2 characters to start searching
                </p>
              </div>
            )}
          </>
        )}

        {/* Help Text */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            💡 Selected members will be added to this deal room automatically.
            They'll receive an invitation to join.
          </p>
        </div>
      </div>

      <DialogFooter className="mt-1 flex-row gap-2">
        <Button
          variant="outline"
          className="flex-1 rounded-full"
          onClick={() => setStep("name")}
        >
          Back
        </Button>
        <Button
          className="flex-1 rounded-full bg-stp-blue-light text-white hover:bg-stp-blue-light/90"
          onClick={() => setStep("documents")}
        >
          Continue{" "}
          {selectedConnectionsList.length > 0 &&
            `(${selectedConnectionsList.length})`}
        </Button>
      </DialogFooter>
    </>
  );

  const renderDocumentsStep = () => (
    <>
      <div className="space-y-5">
        {/* Member Summary Card */}
        {selectedConnectionsList.length > 0 && (
          <div className="bg-gradient-to-r from-stp-blue-light/10 to-transparent rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Members to add
              </span>
              <span className="text-xs font-semibold text-stp-blue-light">
                {selectedConnectionsList.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1 items-center">
              {selectedConnectionsList.slice(0, 5).map((member) => (
                <Avatar
                  key={member.connectionId}
                  className="h-6 w-6 ring-2 ring-white"
                >
                  <AvatarImage src={member.profileImagePath} />
                  <AvatarFallback className="text-[10px] bg-stp-blue-light text-white">
                    {member.firstName?.[0] || member.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
              {selectedConnectionsList.length > 5 && (
                <Badge variant="secondary" className="h-6 text-xs">
                  +{selectedConnectionsList.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Upload documents (optional)
          </Label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 hover:border-stp-blue-light/50 hover:bg-muted/30 transition-all group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-full bg-muted group-hover:bg-stp-blue-light/10 transition-colors flex items-center justify-center">
              <Paperclip className="h-4 w-4 text-muted-foreground group-hover:text-stp-blue-light transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Click to select a file</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                PDF, DOC, XLS, PPT up to 50MB
              </p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            disabled={isLoading}
            onChange={handleFileSelected}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          />
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Documents ({documents.length})
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDocuments([])}
                disabled={isLoading}
                className="text-xs text-red-500 h-auto p-0"
              >
                Clear all
              </Button>
            </div>
            <ScrollArea className="max-h-40">
              <ul className="space-y-1.5 pr-1">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 bg-white"
                  >
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-stp-blue-light/10 shrink-0">
                      <FileText className="h-4 w-4 text-stp-blue-light" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Ready to upload
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setDocuments((prev) =>
                          prev.filter((d) => d.id !== doc.id),
                        )
                      }
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
                      aria-label="Remove document"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}

        {/* Security Note */}
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <p className="text-xs text-amber-800">
            🔒 <span className="font-semibold">Security Note:</span> Documents
            can also be uploaded after the room is created. Only members who
            have signed the NDA can view them.
          </p>
        </div>
      </div>

      <DialogFooter className="mt-6 flex-col gap-2">
        <Button
          className=" rounded-full bg-stp-blue-light text-white hover:bg-stp-blue-light/90 py-5"
          onClick={handleLaunch}
          disabled={isLaunching || isLoading}
        >
          {isLaunching ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Deal Room...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create
            </>
          )}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => setStep("members")}
              disabled={isLoading}
          >
            Back
          </Button>
          <Button
            variant="ghost"
            className="flex-1 rounded-full text-muted-foreground"
            onClick={handleSkipToLaunch}
            disabled={isLaunching || isLoading}
          >
            Skip & Create
          </Button>
        </div>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Deal Room</DialogTitle>
          <DialogDescription>
            A secure, private space for confidential deal communications.
          </DialogDescription>
        </DialogHeader>

        <StepIndicator current={step} />

        {step === "name" && renderNameStep()}
        {step === "members" && renderMembersStep()}
        {step === "documents" && renderDocumentsStep()}
      </DialogContent>
    </Dialog>
  );
}
