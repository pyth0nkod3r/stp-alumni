import { useState } from "react";
import {
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  RotateCcw,
  Trash2,
  FileText,
  Download,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/helper";
import Image from "next/image";

function MessageStatus({ status }) {
  switch (status) {
    case "sending":
      return <Clock className="h-3 w-3 text-muted-foreground" />;
    case "sent":
      return <Check className="h-3 w-3 text-muted-foreground" />;
    case "delivered":
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    case "read":
      return <CheckCheck className="h-3 w-3 text-primary" />;
    case "failed":
      return <AlertCircle className="h-3 w-3 text-destructive" />;
    default:
      return null;
  }
}

function MediaContent({ message }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // console.log(message,"isImage")
  if (!message.mediaUrl) return null;

  const isImage =
    message.mediaType === "image" ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(message.mediaUrl);


  if (isImage) {
    return (
      // No margin, fills bubble edge to edge
      <div className="relative w-[240px] h-[180px]">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-black/10 animate-pulse flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          </div>
        )}
        <Image
          src={message.mediaUrl}
          alt="Shared image"
          fill
          className={cn(
            "object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0",
          )}
          unoptimized={message.mediaUrl.startsWith("blob:")}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
    );
  }

  // Document — keep padding here since it's inside the padded bubble
  const fileName = message.mediaUrl.split("/").pop() || "Document";
  return (
    <a
      href={message.mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg transition-colors",
        message.isOwn
          ? "bg-white/10 hover:bg-white/20"
          : "bg-muted hover:bg-muted/80",
      )}
    >
      <FileText className="h-5 w-5 shrink-0" />
      <span className="text-xs truncate flex-1">{fileName}</span>
      <Download className="h-4 w-4 shrink-0 opacity-60" />
    </a>
  );
}

export function MessageBubble({
  message,
  senderAvatar,
  senderName,
  onRetry,
  onDelete,
  isDeletePending
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isFailed = message.status === "failed";
  const createdAt =
    message.createdAt instanceof Date
      ? message.createdAt
      : new Date(message.createdAt);

      console.log(message,"message in bubble")

  return (
    <>
      <div
        className={cn(
          "flex gap-3 group",
          message.isOwn ? "flex-row-reverse" : "flex-row",
        )}
      >
        {!message.isOwn && (
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={senderAvatar} alt={senderName} />
            <AvatarFallback>
              {(senderName || "?")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            "flex flex-col max-w-[70%]",
            message.isOwn ? "items-end" : "items-start",
          )}
        >
          {!message.isOwn && (
            <span className="text-xs font-medium text-foreground mb-1">
              {senderName}
            </span>
          )}

          <div className="flex items-end gap-2">
            {message.isOwn && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isFailed && onRetry && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onRetry}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Retry</TooltipContent>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}

            <div
              className={cn(
                "rounded-2xl text-sm overflow-hidden",
                message.isOwn
                  ? "bg-stp-blue-light text-white rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md",
                // Only add padding if it's a text-only message
                !message.mediaUrl && "px-4 py-2.5",
                isFailed && "opacity-60",
              )}
            >
              <MediaContent message={message} />
              {message.content && (
                <span
                  className={cn(
                    "whitespace-pre-wrap",
                    // If there's media + caption, add padding just to the text
                    message.mediaUrl && "block px-3 py-2 text-xs",
                  )}
                >
                  {message.content}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatMessageTime(createdAt)}
            </span>
            {message.isOwn && <MessageStatus status={message.status} />}
          </div>

          {isFailed && (
            <span className="text-xs text-destructive mt-0.5">
              Failed to send. Tap to retry.
            </span>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This message will be permanently deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-stp-blue-light hover:bg-destructive/90 text-white"
              onClick={() => {
                onDelete(() => {
                  setShowDeleteDialog(false);
                });
              }}
            >
              {isDeletePending ? (
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
