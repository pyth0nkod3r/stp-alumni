"use client";

import { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import groupService from "@/lib/services/groupService";
import { useAuth } from "@/lib/hooks/useUser";

export default function CreateGroupModal({ isOpen, onClose, onCreateSuccess }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { data: authData } = useAuth();
  const nameInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setThumbnailFile(null);
      setPreviewUrl("");
      setErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Focus name input after animation
      setTimeout(() => nameInputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Group name is required";
    if (name.trim().length < 3) newErrors.name = "Name must be at least 3 characters";
    if (!description.trim()) newErrors.description = "Description is required";
    if (description.trim().length < 10) newErrors.description = "Description must be at least 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("privacyMode", "PUBLIC");
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      const response = await groupService.createGroup(formData);

      if (response?.status || response?.success) {
        toast.success(response.message || "Group created successfully!");
        
        // Construct a robust group object combining response data and local form state
        const groupData = response.data || response.group || {};
        const groupPayload = {
          groupId: groupData.groupId || groupData.id || response.id || `temp_${Date.now()}`,
          name: groupData.name || response.name || name.trim(),
          description: groupData.description || response.description || description.trim(),
          thumbnailUrl: groupData.thumbnailUrl || groupData.thumbnail || response.thumbnailUrl || previewUrl || null,
        };
        
        onCreateSuccess?.(groupPayload);
        onClose();
      } else {
        toast.error(response?.message || "Failed to create group");
      }
    } catch (error) {
      console.error("Create group error:", error);
      toast.error(error.response?.data?.message || "An error occurred while creating the group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setThumbnailFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-[#020618]">
              Create New Group
            </DialogTitle>
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-8 w-8 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
          <DialogDescription className="text-slate-500">
            Create a public group for alumni to connect and collaborate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName" className="text-sm font-medium text-[#020618]">
              Group Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="groupName"
              ref={nameInputRef}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: null }));
              }}
              placeholder="e.g., Class of 2020, Fintech Founders"
              className={`h-11 ${errors.name ? "border-red-300 focus:border-red-500" : ""}`}
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
            <p className="text-xs text-slate-400">
              {name.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="groupDescription" className="text-sm font-medium text-[#020618]">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="groupDescription"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: null }));
              }}
              placeholder="What is this group about? Who should join?"
              className={`min-h-[100px] resize-none ${errors.description ? "border-red-300 focus:border-red-500" : ""}`}
              disabled={isSubmitting}
              maxLength={500}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-slate-400 text-right">
              {description.length}/500 characters
            </p>
          </div>

          {/* Cover Image Upload (Optional) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#020618]">
              Cover Image <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
            {previewUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={previewUrl}
                  className="w-full h-32 object-cover"
                  alt="Preview"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors shadow-md"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#155DFC]/50 hover:bg-slate-50/50 transition-all duration-200"
              >
                <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-600">Upload a cover image</p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG, or GIF up to 5MB
                </p>
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="p-3 bg-[#155DFC]/5 rounded-lg border border-[#155DFC]/10">
            <p className="text-xs text-[#155DFC]">
              🔓 All groups are public and visible to all alumni. Members can post, comment, and invite others.
            </p>
          </div>
        </form>

        <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || !description.trim()}
            className="flex-1 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Group"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}