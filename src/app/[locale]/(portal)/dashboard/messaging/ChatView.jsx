"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  MoreHorizontal,
  Smile,
  Paperclip,
  Image as ImageIcon,
  Send,
  Settings,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./MessageBubble";
import { formatMessageDate, groupMessagesByDate } from "@/lib/helper";
import { toast } from "sonner";
import { ModernScrollArea } from "@/components/shared/ScrollArea";
import { useRouter } from "@/i18n/routing";
import useAuthStore from "@/lib/store/useAuthStore";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useUser";

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOC_SIZE = 20 * 1024 * 1024; // 20MB

export function ChatView({
  conversation,
  messages,
  onBack,
  onSendMessage,
  onSendMediaFile,
  onRetryMessage,
  onDeleteMessage,
  onOpenGroupSettings,
  isLoading,
  onTyping,
  typingUsers,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);

  // console.log(messages, "messages")
  
  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const { token } = useAuthStore();
  const { data } = useAuth(); // ✅ Add this
const currentUserId = data?.data?.userId || data?.data?.id;
  const router = useRouter();
  const typingTimeoutRef = useRef(null);

  // Clear file preview
  const clearFilePreview = () => {
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (value) {
        onTyping?.();
      }
    }, 500);
  };

  const otherTypingUsers = Object.entries(typingUsers || {})
  .filter(([userId]) => userId !== currentUserId) // ✅ Filter out yourself
  .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});



  const hasTyping = Object.keys(otherTypingUsers).length > 0;
  const messagesEndRef = useRef(null);

  // console.log(typingUsers,"typingUsers")

  useEffect(() => {
    if (!isLoading && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [conversation?.conversationId, isLoading]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  const handleSend = () => {
    if (selectedFile) {
      // console.log("Sending file:", selectedFile);
      // Send file with optional caption
      onSendMediaFile?.(selectedFile, newMessage);
      clearFilePreview();
      setNewMessage("");
    } else if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelection = (file) => {
    if (!file) return;
    
    // Check file type
    const isImage = IMAGE_TYPES.includes(file.type);
    const isDoc = [...IMAGE_TYPES, ...DOC_TYPES].includes(file.type);
    
    if (!isImage && !isDoc) {
      toast.error("Unsupported file type");
      return;
    }
    
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;
    if (file.size > maxSize) {
      toast.error(`File must be under ${isImage ? "5MB" : "20MB"}`);
      return;
    }
    
    setSelectedFile(file);
    setFileType(isImage ? "image" : "document");
    
    // Create preview URL for images
    if (isImage) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    } else {
      setFilePreview(file.name);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    handleFileSelection(file);
    e.target.value = "";
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    handleFileSelection(file);
    e.target.value = "";
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col justify-between bg-background overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback>{getInitials(conversation.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">{conversation.name}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {conversation.online ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Available
                </>
              ) : conversation.type === "PUBLIC_GROUP" ? (
                `${conversation.memberCount || 0} members`
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {conversation.type !== "PUBLIC_GROUP" && (
              <>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/profile/${conversation.userId}`)}>
                  View profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {conversation.type === "PUBLIC_GROUP" && onOpenGroupSettings && (
              <DropdownMenuItem onClick={onOpenGroupSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Group Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete chat</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <ModernScrollArea className="flex-1 w-full">
        <div className="p-4 space-y-6 max-w-5xl">
          {(isLoading || !token) && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stp-blue-light" />
            </div>
          )}

          {!isLoading &&
            Array.from(messageGroups.entries()).map(([dateKey, dateMessages]) => (
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
                      senderAvatar={message.senderAvatar || conversation.avatar}
                      senderName={message.senderName || conversation.name}
                      onRetry={() => onRetryMessage(message.id)}
                      onDelete={() => onDeleteMessage(message.id)}
                    />
                  ))}
                </div>
              </div>
            ))}

          {!isLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ModernScrollArea>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageSelect}
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif"
        className="hidden"
      />

      {/* File Preview - WhatsApp Style */}
      {selectedFile && (
        <div className="px-4 pt-2">
          <div className="relative bg-muted rounded-2xl p-2 max-w-xs">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background shadow-md z-10"
              onClick={clearFilePreview}
            >
              <X className="h-3 w-3" />
            </Button>
            
            {fileType === "image" ? (
              <div className="relative rounded-lg overflow-hidden">
                <Image
                  src={filePreview}
                  alt="Preview"
                  width={200}
                  height={150}
                  className="object-cover rounded-lg max-h-32 w-auto"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-2">
                <FileText className="h-8 w-8 text-stp-blue-light" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{filePreview}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
            
            {newMessage && (
              <p className="text-xs text-muted-foreground mt-2 px-1 pb-1">
                {newMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        {/* only show typing indicator for the user who receives the message not the one doing the typing */}
        {hasTyping && (
          <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
            <div className="flex gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </div>
            <span>
              {Object.values(otherTypingUsers).map((t) => t.name).join(", ")} typing...
            </span>
          </div>
        )}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-muted/50 rounded-2xl px-4 py-2">
            <Textarea
              ref={textareaRef}
              placeholder={selectedFile ? "Add a caption..." : "Type your message..."}
              value={newMessage}
              onKeyDown={handleKeyDown}
              onChange={handleTyping}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-1 min-h-[24px] max-h-[120px] resize-none"
              rows={1}
            />
            <div className="flex items-center gap-1 flex-shrink-0 pb-1">
              {/* <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Smile className="h-5 w-5" />
              </Button> */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full transition-all",
                  (newMessage.trim() || selectedFile)
                    ? "bg-stp-blue-light hover:bg-stp-blue-light/90"
                    : "bg-stp-blue-light/50 cursor-not-allowed",
                )}
                onClick={handleSend}
                disabled={!newMessage.trim() && !selectedFile}
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