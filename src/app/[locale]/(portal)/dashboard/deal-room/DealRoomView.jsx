"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  MoreHorizontal,
  Paperclip,
  Send,
  Pencil,
  Users,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MessageBubble } from "../messaging/MessageBubble";
import { formatMessageDate, groupMessagesByDate } from "@/lib/helper";

import MembersModal from "./MembersModal";
import { ModernScrollArea } from "@/components/shared/ScrollArea";
import DocumentsModal from "./DocumentsModal";
import NDAOverlay from "./NDAOverlay";


// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator({ users }) {
  if (!users?.length) return null;
  const names = users.map((u) => u.name).join(", ");
  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-muted-foreground">
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <span>
        {names} {users.length === 1 ? "is" : "are"} typing…
      </span>
    </div>
  );
}


// ─── Main DealRoomView ────────────────────────────────────────────────────────

export function DealRoomView({
  room,
  messages,
  currentUserId,
  typingUsers = [],
  isDeletePending,
  isRoomDetailLoading,
  onBack,
  onSendMessage,
  onSendTyping,
  onDeleteMessage,
  onAddMember,
  onRemoveMember,
  onUploadFile,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [editNameValue, setEditNameValue] = useState(room?.roomName || "");
  const [membersOpen, setMembersOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [ndaSigned, setNdaSigned] = useState(room?.hasSignedNda);

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
   const messagesEndRef = useRef(null);

  // Sync NDA state when room detail loads/changes
  useEffect(() => {
    if (room?.hasSignedNda !== undefined) {
      setNdaSigned(room.hasSignedNda);
    }
  }, [room?.hasSignedNda, room?.roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

    useEffect(() => {
    if (!isRoomDetailLoading && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [room?.roomId, isRoomDetailLoading]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120,
      )}px`;
    }
  }, [newMessage]);

  const handleSend = useCallback(() => {
    const text = newMessage.trim();
    if (!text) return;
    onSendMessage(text);
    setNewMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [newMessage, onSendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    // Debounced typing indicator
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onSendTyping?.();
    }, 300);
  };

  const handleFileAttach = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUploadFile?.(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const messageGroups = groupMessagesByDate(messages);
  const members = room?.members || [];

  // console.log(ndaSigned,"ndaSigned",isRoomDetailLoading,"isRoomDetailLoading")

  return (
    <div className="relative flex flex-col h-full bg-background overflow-hidden">
      {/* ── NDA Overlay (blocks everything until signed) ── */}
      {/* {true && ( */}
       {!isRoomDetailLoading && !ndaSigned  && (
        <NDAOverlay
          room={room}
          currentUserId={currentUserId}
          onSign={() => setNdaSigned(true)}
        />
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Avatar className="h-9 w-9">
            <AvatarImage src={room?.avatar} alt={room?.roomName} />
            <AvatarFallback className="text-xs font-semibold bg-stp-blue-light/10 text-stp-blue-light">
              {room?.roomName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h2 className="font-semibold text-sm text-foreground truncate leading-tight">
              {room?.roomName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {room?.memberCount ?? members.length}{" "}
                {(room?.memberCount ?? members.length) === 1
                  ? "member"
                  : "members"}
              </span>
              {ndaSigned && (
                <>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <ShieldCheck className="h-3 w-3" />
                    NDA signed
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* <DropdownMenuItem
              onClick={() => {
                setEditNameValue(room?.roomName || "");
                setEditNameOpen(true);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit name
            </DropdownMenuItem> */}
            <DropdownMenuItem onClick={() => setMembersOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Members
              {members.length > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {members.length}
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDocumentsOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Edit name dialog ── */}
      <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename room</DialogTitle>
          </DialogHeader>
          <Input
            value={editNameValue}
            onChange={(e) => setEditNameValue(e.target.value)}
            placeholder="Room name"
            className="mt-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // hook into parent if needed
                setEditNameOpen(false);
              }
            }}
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditNameOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-stp-blue-light text-white hover:bg-stp-blue-light/90 rounded-full"
              onClick={() => setEditNameOpen(false)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Members modal ── */}
      <MembersModal
        open={membersOpen}
        onOpenChange={setMembersOpen}
        room={room}
        onAddMember={onAddMember}
        onRemoveMember={onRemoveMember}
      />

      {/* ── Documents modal ── */}
      <DocumentsModal
        open={documentsOpen}
        onOpenChange={setDocumentsOpen}
        room={room}
        onUploadFile={onUploadFile}
      />

      {/* ── Messages ── */}
      <ModernScrollArea className="flex-1 w-full">
        <div className="p-4 space-y-6 max-w-5xl">
          {isRoomDetailLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stp-blue-light" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Send className="h-5 w-5 opacity-40" />
              </div>
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs mt-1 opacity-60">Start the conversation!</p>
            </div>
          ) : (
            Array.from(messageGroups.entries()).map(
              ([dateKey, dateMessages]) => (
                <div key={dateKey}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-muted px-3 py-1 rounded-full">
                      <span className="text-xs text-muted-foreground">
                        {formatMessageDate(new Date(dateKey))}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {dateMessages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        senderAvatar={message.senderAvatar}
                        senderName={message.senderName || ""}
                        onDelete={(callback) => onDeleteMessage?.(message.id, callback)}
                        isDeletePending={isDeletePending}
                      />
                    ))}
                  </div>
                </div>
              ),
            )
          )}
         <div ref={messagesEndRef} />
        </div>
      </ModernScrollArea>

      {/* ── Typing indicator ── */}
      <TypingIndicator users={typingUsers} />

      {/* ── Message input ── */}
      <div className="px-4 pb-4 pt-2 border-t border-border bg-card shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-muted/50 rounded-2xl px-3 py-2 border border-border focus-within:border-stp-blue-light/40 transition-colors">
            {/* File attach */}
            {/* <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0 pb-0.5"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button> */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileAttach}
            />

            <Textarea
              ref={textareaRef}
              placeholder="Type a message…"
              value={newMessage}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-1 min-h-[24px] max-h-[120px] resize-none text-sm"
              rows={1}
            />

            <div className="flex items-center gap-1 shrink-0 pb-0.5">
              <Button
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full transition-all",
                  newMessage.trim()
                    ? "bg-stp-blue-light hover:bg-stp-blue-light/90 text-white"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
                onClick={handleSend}
                disabled={!newMessage.trim()}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
