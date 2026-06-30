
import React, { useState, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Image as ImageIcon,
  SendHorizontal,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCreateGroupPost,
} from "@/lib/hooks/useGroupQueries";

function CreatePostCard({ groupId, isMember }) {
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const { mutate: createPost, isPending } = useCreateGroupPost(groupId);

  // Constants for word limits
  const MAX_WORDS = 3000;
  const WARNING_THRESHOLD = 0.8;

  // Calculate word count
  const wordCount = useMemo(() => {
    if (!body.trim()) return 0;
    return body.trim().split(/\s+/).length;
  }, [body]);

  const isOverLimit = wordCount > MAX_WORDS;
  const showWarning = wordCount > MAX_WORDS * WARNING_THRESHOLD;
  const wordPercentage = Math.min((wordCount / MAX_WORDS) * 100, 100);

  const getWordCountColor = () => {
    if (isOverLimit) return "text-red-500";
    if (showWarning) return "text-amber-500";
    return "text-emerald-500";
  };

  const getProgressColor = () => {
    if (isOverLimit) return "bg-red-500";
    if (showWarning) return "bg-amber-500";
    return "bg-emerald-500";
  };

  if (!isMember) return null;

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files].slice(0, 4));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBodyChange = (e) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/);

    if (words.length > MAX_WORDS && words.length > wordCount) {
      const trimmedValue = value.split(/\s+/).slice(0, MAX_WORDS).join(" ");
      setBody(trimmedValue);
    } else {
      setBody(value);
    }
  };

  const handleSubmit = () => {
    const text = body.trim();
    if (!text || isPending || isOverLimit) return;

    createPost(
      { body: text, images },
      {
        onSuccess: () => {
          setBody("");
          setImages([]);
          textareaRef.current?.focus();
        },
      },
    );
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = body.trim() && !isOverLimit && !isPending;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-4 space-y-3">
        {/* Textarea with word limit */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="Share something with the group…"
            value={body}
            onChange={handleBodyChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            className={cn(
              "min-h-[72px] resize-none border-0 p-0 focus-visible:ring-0 text-sm transition-all duration-200",
              isFocused &&
                "ring-2 ring-stp-blue-light/10 rounded-lg px-3 py-2 bg-muted/30",
              isOverLimit && "text-red-500 placeholder:text-red-300",
            )}
          />

          {/* Word counter indicator */}
          {body.trim() && wordCount > 0 && (
            <div className="absolute -top-6 right-1 flex items-center gap-2">
              <span
                className={`text-[10px] font-medium ${getWordCountColor()}`}
              >
                {wordCount}/{MAX_WORDS}
              </span>
            </div>
          )}

          {/* Progress bar */}
          {body.trim() && wordCount > 0 && (
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${getProgressColor()}`}
                style={{ width: `${Math.min(wordPercentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {images.map((file, i) => (
              <div
                key={i}
                className="relative h-16 w-16 rounded-lg overflow-hidden ring-2 ring-white shadow-sm group"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-200"
                />
                <button
                  onClick={() =>
                    setImages((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute top-0.5 right-0.5 h-5 w-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-stp-blue-light/10 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 4}
            >
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Image counter */}
            {images.length > 0 && (
              <span className="text-[10px] text-muted-foreground ml-1">
                {images.length}/4
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Word count status */}
            {body.trim() && showWarning && (
              <span
                className={`text-[10px] font-medium ${getWordCountColor()}`}
              >
                {isOverLimit ? "⚠️ Limit" : `${MAX_WORDS - wordCount} left`}
              </span>
            )}

            <Button
              size="sm"
              className={cn(
                "rounded-full gap-1.5 transition-all duration-200",
                canSubmit
                  ? "bg-stp-blue-light hover:bg-stp-blue-light/90 text-white shadow-sm shadow-stp-blue-light/20"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <SendHorizontal className="h-3.5 w-3.5" />
              )}
              Post
            </Button>
          </div>
        </div>

        {/* Bottom info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground">
              ⌘ + Enter to post
            </span>
            {body.trim() && !isOverLimit && wordCount > 0 && (
              <>
                <span className="text-[10px] text-muted-foreground/30">•</span>
                <span className="text-[10px] text-muted-foreground">
                  {MAX_WORDS - wordCount} words remaining
                </span>
              </>
            )}
          </div>
          {body.trim() && wordCount > 0 && (
            <span className={`text-[10px] ${getWordCountColor()}`}>
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CreatePostCard