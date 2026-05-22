import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  MoreHorizontal,
  Smile,
  Paperclip,
  Image,
  Mic,
  Send,
  Pencil,
  Users,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MessageBubble } from "../messaging/MessageBubble";
import { formatMessageDate, groupMessagesByDate } from "@/lib/helper";

export function DealRoomView({
  room,
  messages,
  currentUserId,
  onBack,
  onSendMessage,
  onRetryMessage,
  onDeleteMessage,
  onUpdateRoomName,
  onDeleteRoom,
  onAddMember,
  onRemoveMember,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [editNameValue, setEditNameValue] = useState(room.name);
  const [addMemberSearch, setAddMemberSearch] = useState("");

  const [hasAcknowledgedNDA, setHasAcknowledgedNDA] = useState(false);
  const [showNDABanner, setShowNDABanner] = useState(true);

  const [showAcknowledgedMessage, setShowAcknowledgedMessage] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const handleAcknowledgeNDA = () => {
    localStorage.setItem(
      `nda_acknowledged_${room.id}_${currentUserId}`,
      "true",
    );
    setHasAcknowledgedNDA(true);
    setShowNDABanner(false);

    // Show the success message with progress bar
    setShowAcknowledgedMessage(true);
    setProgress(100);

    // Clear any existing timers
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    // Start progress bar countdown
    const startTime = Date.now();
    const duration = 5000; // 5 seconds

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, ((duration - elapsed) / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(progressTimerRef.current);
      }
    }, 16); // Update roughly every frame (60fps)

    // Hide the message after 5 seconds
    hideTimerRef.current = setTimeout(() => {
      setShowAcknowledgedMessage(false);
      setProgress(100);
      clearInterval(progressTimerRef.current);
    }, duration);

    // Optional: Send a system message that user acknowledged
    // onSendMessage(`[System] ${currentUser.name} has acknowledged the confidentiality agreement`);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const onlineCount = room.onlineCount ?? room.members?.length ?? 0;
  const members = room.members || [];
  const documents = room.documents || [];

  // Check if current user has acknowledged NDA for this room
  useEffect(() => {
    const acknowledged = localStorage.getItem(
      `nda_acknowledged_${room.id}_${currentUserId}`,
    );
    if (acknowledged === "true") {
      setHasAcknowledgedNDA(true);
      setShowNDABanner(false);
    }
  }, [room.id, currentUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEditNameOpen = () => {
    setEditNameValue(room.name);
    setEditNameOpen(true);
  };

  const handleEditNameSubmit = () => {
    if (editNameValue.trim() && editNameValue.trim() !== room.name) {
      onUpdateRoomName?.(room.id, editNameValue.trim());
    }
    setEditNameOpen(false);
  };

  const handleAddMember = () => {
    if (addMemberSearch.trim()) {
      // Pass the search string as userId — in a future iteration this
      // should be a user-search autocomplete that provides real IDs
      onAddMember?.(room.id, addMemberSearch.trim());
      setAddMemberSearch("");
    }
  };

  const handleDeleteRoom = () => {
    onDeleteRoom?.(room.id);
    onBack?.();
  };

  // Group messages by date
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Avatar className="h-10 w-10">
            <AvatarImage src={room.avatar} alt={room.name} />
            <AvatarFallback>
              {room.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-semibold text-foreground">{room.name}</h2>
            <p className="text-sm text-primary">
              {onlineCount} member{onlineCount !== 1 ? "s" : ""} online
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Room options">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleEditNameOpen}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMembersOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              View members
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDocumentsOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleDeleteRoom}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete deal room
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit room name modal */}
      <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit room name</DialogTitle>
            <DialogDescription>Update the name of the room</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              placeholder="Room name"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleEditNameSubmit}
              className="bg-stp-blue-light text-white hover:bg-stp-blue-light/90"
            >
              Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members modal */}
      <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Add new member
              </p>
              <div className="flex gap-2">
                <Input
                  value={addMemberSearch}
                  onChange={(e) => setAddMemberSearch(e.target.value)}
                  placeholder="Search for a user name"
                  className="flex-1"
                />
                <Button
                  onClick={handleAddMember}
                  className="bg-stp-blue-light text-white hover:bg-stp-blue-light/90"
                >
                  Add
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                List of member{members.length !== 1 ? "s" : ""}
              </p>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  >
                    <span className="text-sm">
                      {member.name || member.firstName || "Member"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        onRemoveMember?.(room.id, member.userId || member.id)
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Documents modal */}
      <Dialog open={documentsOpen} onOpenChange={setDocumentsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Documents</DialogTitle>
            <DialogDescription>
              Uploaded documents for this deal room
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No documents have been uploaded for this room yet.
              </p>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {documents.map((doc) => (
                  <li
                    key={doc.id || doc.name}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-stp-blue-light text-[10px] font-semibold text-white">
                      PDF
                    </span>
                    <span className="text-sm truncate flex-1">{doc.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-6 max-w-3xl mx-auto">
          {/* NDA ACKNOWLEDGMENT BANNER - Shows in chat until acknowledged */}
          {showNDABanner && !hasAcknowledgedNDA && (
            <div className="mb-6 animate-in slide-in-from-top duration-300">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg overflow-hidden">
                <div className="bg-amber-100 px-4 py-2 border-b border-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-700" />
                    <span className="text-sm font-semibold text-amber-900">
                      Confidentiality Agreement Required
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-sm text-amber-800">
                    Before participating in this deal room, you must acknowledge
                    and agree to the following:
                  </p>

                  <ul className="space-y-2 text-sm text-amber-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>
                        All information shared is{" "}
                        <span className="font-semibold">
                          strictly confidential
                        </span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>
                        You will not share, copy, or distribute any documents
                        outside this platform
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>
                        All communications are for internal deal purposes only
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>
                        Unauthorized disclosure may result in legal consequences
                      </span>
                    </li>
                  </ul>

                  <button
                    onClick={handleAcknowledgeNDA}
                    className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />I Acknowledge & Agree to
                    the Confidentiality Terms
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Persistent NDA Reminder Banner (smaller, after acknowledgment) */}
          {showAcknowledgedMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg overflow-hidden animate-in slide-in-from-top duration-300">
              <div className="p-3">
                <div className="flex items-center gap-2 text-xs text-green-800">
                  <CheckCircle className="h-3 w-3 text-green-600 shrink-0" />
                  <span className="flex-1">
                    You've acknowledged the confidentiality agreement for this
                    deal room.
                  </span>
                </div>
              </div>
              {/* Progress bar trailing indicator */}
              <div className="h-1 bg-green-100">
                <div
                  className="h-full bg-green-500 transition-all duration-50 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {Array.from(messageGroups.entries()).map(
            ([dateKey, dateMessages]) => (
              <div key={dateKey}>
                {/* Date separator */}
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-muted px-3 py-1 rounded-full">
                    <span className="text-xs text-muted-foreground">
                      {formatMessageDate(new Date(dateKey))}
                    </span>
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-4">
                  {dateMessages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      senderAvatar={message.senderAvatar || room.avatar}
                      senderName={message.senderName || room.name}
                      onRetry={() => onRetryMessage(message.id)}
                      onDelete={() => onDeleteMessage(message.id)}
                    />
                  ))}
                </div>
              </div>
            ),
          )}

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-muted/50 rounded-2xl px-4 py-2">
            <Textarea
              ref={textareaRef}
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-1 min-h-[24px] max-h-[120px] resize-none"
              rows={1}
            />

            <div className="flex items-center gap-1 flex-shrink-0 pb-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
              >
                <Image className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full transition-all",
                  newMessage.trim()
                    ? "bg-stp-blue-light hover:bg-stp-blue-light"
                    : "bg-stp-blue-light/50 cursor-not-allowed",
                )}
                onClick={handleSend}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
