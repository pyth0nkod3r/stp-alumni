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
  ZoomIn,
  Play,
  Maximize2,
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
import ImageLightbox from "./ImageLightbox";

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

function normalizeMediaUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
    : "https://api.blazingtorrent.org";
  return `${baseUrl}/${cleanPath}`;
}

function MediaContent({ message }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!message.mediaUrl) return null;
  const mediaUrl = normalizeMediaUrl(message.mediaUrl);

  const isImage =
    message.mediaType === "image" ||
    message.type === "image" ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl) ||
    (!message.mediaType && !/\.(mp4|webm|ogg|mov|pdf|doc|docx|xls|xlsx)$/i.test(mediaUrl));

  const isVideo =
    message.mediaType === "video" ||
    message.type === "video" ||
    /\.(mp4|webm|ogg|mov)$/i.test(mediaUrl);

  if (isImage) {
    return (
      <>
        <div 
          className="relative w-[240px] max-w-full h-[180px] cursor-pointer group rounded-lg overflow-hidden bg-black/5"
          onClick={() => setLightboxOpen(true)}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 bg-black/10 animate-pulse flex items-center justify-center z-0">
              <div className="h-7 w-7 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            </div>
          )}
          <img
            src={mediaUrl}
            alt={message.content || "Shared image"}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200 relative z-10",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {/* Zoom icon overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center z-20">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
              <ZoomIn className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        
        {/* Lightbox */}
        <ImageLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          src={mediaUrl}
          alt={message.content || "Image"}
          type={message.mediaType || message.type || "image"}
        />
      </>
    );
  }

  if (isVideo) {
    return (
      <>
        <div className="relative w-[320px] max-w-full h-[180px] rounded-lg overflow-hidden bg-black flex items-center justify-center group">
          {isPlaying ? (
            <video
              src={message.mediaUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                src={message.mediaUrl}
                preload="metadata"
                className="w-full h-full object-cover opacity-80"
              />
              {/* Play icon overlay */}
              <div 
                className="absolute inset-0 bg-black/25 flex items-center justify-center cursor-pointer transition-colors group-hover:bg-black/35"
                onClick={() => setIsPlaying(true)}
              >
                <div className="w-12 h-12 rounded-full bg-white/90 text-stp-blue-light hover:scale-105 hover:bg-white transition-all flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </div>
              </div>
              {/* Zoom icon overlay */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(true);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Lightbox */}
        <ImageLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          src={message.mediaUrl}
          alt={message.content || "Video"}
          type={message.mediaType || message.type || "video"}
        />
      </>
    );
  }

  // Document section
  const fileName = message.mediaUrl.split("/").pop() || "Document";
  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer w-[280px] max-w-full",
          message.isOwn
            ? "bg-white/10 hover:bg-white/15 border-white/20 text-white"
            : "bg-muted hover:bg-muted/80 border-border text-foreground"
        )}
        onClick={() => setLightboxOpen(true)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            message.isOwn ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
          )}>
            <FileText className="h-5 w-5 shrink-0" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium truncate">{fileName}</span>
            <span className="text-[10px] opacity-70">Click to preview</span>
          </div>
        </div>
        <a
          href={message.mediaUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "p-1.5 rounded-full hover:bg-black/10 transition-colors shrink-0",
            message.isOwn ? "hover:bg-white/10" : "hover:bg-black/5"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="h-4 w-4 opacity-60" />
        </a>
      </div>

      {/* Lightbox for document preview */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        src={message.mediaUrl}
        alt={message.content || fileName}
        type={message.mediaType || message.type || "document"}
      />
    </>
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

      console.log(message,"message in bubble", typeof message.mediaUrl)

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
