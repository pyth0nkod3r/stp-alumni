"use client";
import { useState, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Image as ImageIcon, Video, Send, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreatePost } from "@/lib/hooks/usePosts";
import {
  validateImages,
  createPreviews,
  revokePreviews,
} from "@/lib/utils/imageUpload";
import { toast } from "sonner";
import Image from "next/image";

// Constants for word limits
const MAX_WORDS = 3000;
const WARNING_THRESHOLD = 0.8;

/**
 * CreatePost component - Post creation widget
 */
export default function CreatePost({ onPostCreated }) {
  const t = useTranslations("Dashboard");
  const [postContent, setPostContent] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const { mutate: createPost, isLoading } = useCreatePost();

  // Calculate word count
  const wordCount = useMemo(() => {
    if (!postContent.trim()) return 0;
    return postContent.trim().split(/\s+/).length;
  }, [postContent]);

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

  const handleContentChange = (e) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/);
    
    if (words.length > MAX_WORDS && words.length > wordCount) {
      const trimmedValue = value.split(/\s+/).slice(0, MAX_WORDS).join(" ");
      setPostContent(trimmedValue);
      toast.warning(`Maximum ${MAX_WORDS} words allowed`);
    } else {
      setPostContent(value);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    
    const validation = validateImages([...images, ...files]);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const newPreviews = createPreviews(files);
    setImages([...images, ...files]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    revokePreviews([imagePreviews[index]]);
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 50MB
    const maxVideoSize = 50 * 1024 * 1024;
    if (file.size > maxVideoSize) {
      toast.error("Video size must be 50MB or less");
      return;
    }

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideo(null);
    setVideoPreview(null);
  };

  const handleSubmit = () => {
    if (!postContent.trim() && images.length === 0 && !video) {
      toast.error("Please add some content, images, or video");
      return;
    }

    if (isOverLimit) {
      toast.error(`Please reduce your post to ${MAX_WORDS} words or less`);
      return;
    }

    createPost(
      {
        body: postContent,
        images: images,
        video: video,
      },
      {
        onSuccess: () => {
          setPostContent("");
          setImages([]);
          revokePreviews(imagePreviews);
          setImagePreviews([]);
          handleRemoveVideo();
          onPostCreated?.();
          toast.success("Post created successfully!");
        },
      }
    );
  };

  const canSubmit = (postContent.trim() || images.length > 0 || video) && !isOverLimit && !isLoading;

  return (
    <div className="rounded-2xl bg-linear-to-br from-white via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50 p-5 shadow-sm border border-gray-200/60 dark:border-gray-700/60 transition-all hover:shadow-md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <div className="p-1.5 rounded-lg bg-[#233389]/10 dark:bg-[#233389]/20">
              <Sparkles className="h-4 w-4 text-[#233389]" />
            </div> */}
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Create Post
            </h3>
          </div>
          {postContent.trim() && (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${getWordCountColor()}`}>
                {wordCount}/{MAX_WORDS}
              </span>
            </div>
          )}
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            placeholder={t("startPost")}
            value={postContent}
            onChange={handleContentChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border-2 resize-none focus:outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-800 dark:text-gray-200 ${
              isFocused
                ? "border-[#233389] ring-4 ring-[#233389]/10 dark:ring-[#233389]/20"
                : isOverLimit
                ? "border-red-400 dark:border-red-500"
                : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
            }`}
            rows={3}
            disabled={isLoading}
            style={{ minHeight: "100px" }}
          />

          {/* Character counter - optional subtle indicator */}
          {postContent.trim() && wordCount > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <div className="h-1 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${getProgressColor()}`}
                  style={{ width: `${Math.min(wordPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Word counter bar - more visible when approaching limit */}
        {postContent.trim() && showWarning && (
          <div className="flex items-center justify-between px-1">
            <span className={`text-xs ${getWordCountColor()}`}>
              {isOverLimit ? "⚠️ Exceeded word limit" : "⚠️ Approaching word limit"}
            </span>
            <span className={`text-xs font-medium ${getWordCountColor()}`}>
              {wordCount}/{MAX_WORDS}
            </span>
          </div>
        )}

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {imagePreviews.map((preview, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm"
              >
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105 duration-200"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full text-white transition-all hover:scale-110"
                  disabled={isLoading}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            ))}
          </div>
        )}

        {/* Video Preview */}
        {videoPreview && (
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-64 flex items-center justify-center shadow-sm">
            <video
              src={videoPreview}
              controls
              className="w-full h-full object-contain max-h-64"
            />
            <button
              onClick={handleRemoveVideo}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full text-white transition-all hover:scale-110 z-10"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              multiple
              className="hidden"
              disabled={isLoading || !!video}
            />
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoSelect}
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              className="hidden"
              disabled={isLoading || images.length > 0}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50 text-gray-600 dark:text-gray-400"
              disabled={isLoading || images.length >= 4 || !!video}
            >
              <div className="p-1 rounded-lg bg-[#233389]/5 group-hover:bg-[#233389]/10 transition-colors">
                <ImageIcon className="h-4 w-4 text-[#233389]" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {images.length > 0 ? `${images.length}/4` : "Add Image"}
              </span>
            </button>
            <button
              onClick={() => videoInputRef.current?.click()}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50 ${
                video ? "text-[#233389] font-medium" : "text-gray-600 dark:text-gray-400"
              }`}
              disabled={isLoading || images.length > 0 || !!video}
            >
              <div className="p-1 rounded-lg bg-[#233389]/5 group-hover:bg-[#233389]/10 transition-colors">
                <Video className="h-4 w-4 text-[#233389]" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {video ? "Video added" : "Add Video"}
              </span>
            </button>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              relative overflow-hidden rounded-xl px-6 py-2.5 font-medium transition-all duration-200
              ${canSubmit 
                ? "bg-[#233389] hover:bg-[#1a2866] text-white shadow-lg shadow-[#233389]/20 hover:shadow-[#233389]/30" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }
            `}
          >
            <span className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t("submitPost")}
                </>
              )}
            </span>
          </Button>
        </div>

        {/* Bottom info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {images.length}/4 images
            </span>
            <span>•</span>
            <span>Max {MAX_WORDS} words</span>
          </div>
          {postContent.trim() && !isOverLimit && wordCount > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {MAX_WORDS - wordCount} words remaining
            </span>
          )}
        </div>
      </div>
    </div>
  );
}