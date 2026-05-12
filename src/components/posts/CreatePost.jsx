"use client";
import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Image as ImageIcon, Video, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreatePost } from "@/lib/hooks/usePosts";
import {
  validateImages,
  createPreviews,
  revokePreviews,
} from "@/lib/utils/imageUpload";
import { toast } from "sonner";
import Image from "next/image";

/**
 * CreatePost component - Post creation widget
 */
export default function CreatePost({ onPostCreated }) {
  const t = useTranslations("Dashboard");
  const [postContent, setPostContent] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const { mutate: createPost, isLoading } = useCreatePost();

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Validate images
    const validation = validateImages([...images, ...files]);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Create previews
    const newPreviews = createPreviews(files);
    setImages([...images, ...files]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    // Revoke the preview URL
    revokePreviews([imagePreviews[index]]);
    
    // Remove from state
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!postContent.trim() && images.length === 0) {
      toast.error("Please add some content or images");
      return;
    }
console.log("Submitting post with content:", postContent, "and images:", images);
    createPost(
      {
        body: postContent,
        images: images,
      },
      {
        onSuccess: () => {
          // Clear form
          setPostContent("");
          setImages([]);
          revokePreviews(imagePreviews);
          setImagePreviews([]);
          onPostCreated?.();
        },
      }
    );
  };

  return (
    <div className="rounded-lg p-3 lg:p-4 border border-[#233389]">
      <div>
        <textarea
          placeholder={t("startPost")}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className="w-full p-3 border-0 rounded-lg resize-none focus:outline-none focus:border focus:border-[#233389] bg-transparent"
          rows={3}
          disabled={isLoading}
        />

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(0,0,0,0.3)]">
          <div className="flex gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              multiple
              className="hidden"
              disabled={isLoading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              disabled={isLoading || images.length >= 4}
            >
              <ImageIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg opacity-50 cursor-not-allowed"
              disabled
            >
              <Video className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (!postContent.trim() && images.length === 0)}
            className={`text-white rounded-lg px-6 flex items-center gap-2 ${
              postContent.trim() || images.length > 0
                ? "bg-[#233389] hover:bg-[#1d2a6e]"
                : "bg-[#23338966] hover:bg-[#23338980]"
            }`}
          >
            {isLoading ? "Posting..." : t("submitPost")}
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

