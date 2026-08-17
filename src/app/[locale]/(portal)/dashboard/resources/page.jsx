"use client";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Upload,
  Filter,
  Download,
  X,
  FileText,
  SlidersHorizontal,
  Loader2,
  Trash2,
  Play,
  Film,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import resourceService from "@/lib/services/resourceService";
import { useAuth } from "@/lib/hooks/useUser";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

/**
 * Resources page - Educational and professional resources
 * @returns {JSX.Element}
 */
export default function ResourcesPage() {
  const t = useTranslations("Resources");
  const { data: authData } = useAuth();
  const currentUser = authData?.data;
  const currentUserId = currentUser?.id || currentUser?.userId;
  const isAdmin = currentUser?.role === "ADMIN";

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [deleteResourceId, setDeleteResourceId] = useState(null);

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "",
    file: null,
  });
  const [filters, setFilters] = useState({
    fileTypes: [],
    sortBy: "newest",
  });

  const queryClient = useQueryClient();

  const categories = [
    { id: "all", label: t("all") },
    { id: "guides", label: t("guides") },
    { id: "trainingMaterials", label: t("trainingMaterials") },
    { id: "templates", label: t("templates") },
    { id: "policies", label: t("policies") },
    { id: "sharedDocs", label: t("sharedDocs") },
    { id: "videos", label: t("videos") },
  ];

  // Fetch resources using react-query
  const { data: resourcesData, isLoading } = useQuery({
    queryKey: [
      "resources",
      {
        selectedCategory,
        searchQuery,
        fileTypes: filters.fileTypes,
        sortBy: filters.sortBy,
      },
    ],
    queryFn: () => {
      const params = {};

      if (selectedCategory && selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (filters.fileTypes.length > 0) {
        params.fileType = filters.fileTypes.join(",");
      }

      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
      }

      return resourceService.getResources(params);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (resourceId) => resourceService.deleteResource(resourceId),
    onSuccess: () => {
      toast.success("Resource deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setDeleteResourceId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete resource");
    },
  });

  // Safely extract the data array
  let resources = [];
  if (Array.isArray(resourcesData?.data)) {
    resources = resourcesData.data;
  } else if (Array.isArray(resourcesData)) {
    resources = resourcesData;
  }

  const getFileTypeDisplay = (fileUrl) => {
    if (!fileUrl) return "DOC";
    const parts = fileUrl.split(".");
    return parts.length > 1 ? parts.pop().toUpperCase().slice(0, 4) : "DOC";
  };

  const isVideoFile = (resource) => {
    if (resource.isVideo || resource.category === "videos" || resource.category === "video") return true;
    const url = resource.resourceFileUrl || "";
    return /\.(mp4|webm|mov|avi|mkv)$/i.test(url);
  };

  const getCategoryLabel = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.label : categoryId;
  };

  const filteredResources = useMemo(() => {
    if (!Array.isArray(resources)) return [];
    return resources;
  }, [resources]);

  const uploadMutation = useMutation({
    mutationFn: resourceService.uploadResource,
    onSuccess: () => {
      toast.success(t("uploadSuccess"));
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setUploadForm({ title: "", description: "", category: "", file: null });
      setIsUploadOpen(false);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message ||
          t("uploadError"),
      );
    },
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      toast.error(t("selectFileError"));
      return;
    }

    const formData = new FormData();
    formData.append("title", uploadForm.title);
    formData.append("description", uploadForm.description);
    formData.append("category", uploadForm.category);
    formData.append("resourceFile", uploadForm.file);

    uploadMutation.mutate(formData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const toggleFileType = (fileType) => {
    setFilters((prev) => ({
      ...prev,
      fileTypes: prev.fileTypes.includes(fileType)
        ? prev.fileTypes.filter((type) => type !== fileType)
        : [...prev.fileTypes, fileType],
    }));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setFilters({
      fileTypes: [],
      sortBy: "newest",
    });
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "all" ||
    filters.fileTypes.length > 0 ||
    filters.sortBy !== "newest";

  const fileTypes = ["PDF", "DOC", "XLS", "PPT"];

  return (
    <div className="p-3 sm:p-0">
      {/* Title */}
      <h1 className="text-2xl lg:text-3xl font-bold text-stp-blue-light mb-6">
        {t("title")}
      </h1>

      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10 h-12 w-full bg-transparent border border-[#233389] focus:border-[#233389] focus:ring-0 focus-visible:ring-0 rounded-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute end-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-stp-blue-light hover:bg-stp-blue-light/90 text-white h-12 px-6">
                <Upload className="h-5 w-5 mr-2" />
                {t("uploadResources")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{t("uploadTitle")}</DialogTitle>
                <DialogDescription>
                  {t("uploadDesc")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t("formTitle")}</Label>
                  <Input
                    id="title"
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, title: e.target.value })
                    }
                    placeholder={t("formTitlePlaceholder")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("formDesc")}</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        description: e.target.value,
                      })
                    }
                    placeholder={t("formDescPlaceholder")}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">{t("formCategory")}</Label>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(value) =>
                      setUploadForm({ ...uploadForm, category: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("formCategoryPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guides">{t("guides")}</SelectItem>
                      <SelectItem value="trainingMaterials">
                        {t("trainingMaterials")}
                      </SelectItem>
                      <SelectItem value="templates">{t("templates")}</SelectItem>
                      <SelectItem value="policies">{t("policies")}</SelectItem>
                      <SelectItem value="sharedDocs">{t("sharedDocs")}</SelectItem>
                      <SelectItem value="videos">{t("videos")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">{t("formFile")}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      required
                      className="cursor-pointer"
                    />
                    {uploadForm.file && (
                      <span className="text-sm text-gray-600">
                        {uploadForm.file.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUploadOpen(false)}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-stp-blue-light hover:bg-stp-blue-light/90"
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("uploadButton")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 border-gray-300 relative ${
                  hasActiveFilters ? "border-stp-blue-light" : ""
                }`}
                title="Advanced filters"
              >
                <Filter
                  className={`h-5 w-5 ${hasActiveFilters ? "text-stp-blue-light" : "text-gray-600"}`}
                />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-stp-blue-light rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t("advancedFilters")}
                  </h4>
                </div>

                <Separator />

                {/* File Type Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t("fileType")}</Label>
                  <div className="space-y-2">
                    {fileTypes.map((fileType) => (
                      <div
                        key={fileType}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`file-${fileType}`}
                          checked={filters.fileTypes.includes(fileType)}
                          onCheckedChange={() => toggleFileType(fileType)}
                        />
                        <label
                          htmlFor={`file-${fileType}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {t("filesLabel", { type: fileType })}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Sort By */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t("sortBy")}</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, sortBy: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{t("sortNewest")}</SelectItem>
                      <SelectItem value="oldest">{t("sortOldest")}</SelectItem>
                      <SelectItem value="title">{t("sortAlphabetical")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Actions */}
                {/* <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="flex-1"
                  >
                    {t("clearAll")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 bg-stp-blue-light hover:bg-stp-blue-light/90"
                  >
                    {t("apply")}
                  </Button>
                </div> */}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`h-11 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-[#233389] ${
              selectedCategory === category.id
                ? "bg-[#233389] text-white"
                : "bg-transparent text-gray-700 hover:bg-gray-50"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#233389]"></div>
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const resId = resource.resourceId || resource.id;
            const isVideo = isVideoFile(resource);
            const isAuthor =
              currentUserId &&
              (resource.authorId === currentUserId ||
                resource.userId === currentUserId ||
                resource.createdById === currentUserId);
            const canDelete = isAuthor || isAdmin;

            return (
              <Card
                key={resId}
                className="p-6 hover:shadow-md transition-shadow bg-white flex flex-col h-full rounded-2xl border border-gray-100"
              >
                <div className="flex flex-col h-full flex-grow">
                  {/* File Type Icon and Title */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`${
                        isVideo
                          ? "bg-purple-600"
                          : resource.iconColor || "bg-blue-500"
                      } w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {isVideo ? (
                        <Film className="h-6 w-6 text-white" />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {getFileTypeDisplay(
                            resource.resourceFileUrl || resource.fileType,
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base leading-tight">
                        {resource.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1 leading-relaxed">
                    {resource.description}
                  </p>

                  {/* Category Badge & Video tag */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2.5 py-0.5 rounded-full"
                    >
                      {getCategoryLabel(resource.category)}
                    </Badge>
                    {isVideo && (
                      <Badge
                        variant="secondary"
                        className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2.5 py-0.5 rounded-full"
                      >
                        Video
                      </Badge>
                    )}
                  </div>

                  {/* Author, Date, and Action Buttons */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={resource.author || "User"} />
                        <AvatarFallback className="bg-blue-50 text-[#233389] text-xs">
                          {(
                            `${resource.authorFirstName || ""} ${resource.authorLastName || ""}`.trim() || "U"
                          ).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium text-gray-900 truncate max-w-[100px]">
                          {`${resource.authorFirstName || ""} ${resource.authorLastName || ""}`.trim() ||
                            "User"}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {resource.createdAt
                            ? new Date(resource.createdAt).toLocaleDateString()
                            : resource.date || "Recently"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isVideo && (
                        <button
                          onClick={() =>
                            setPreviewVideo({
                              title: resource.title,
                              url:
                                resourceService.getStreamUrl(resId) ||
                                resource.resourceFileUrl,
                            })
                          }
                          className="inline-flex items-center justify-center gap-1 px-2.5 h-8 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                          title="Watch video"
                        >
                          <Play className="h-3.5 w-3.5 fill-purple-700" />
                          Watch
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (resource.resourceFileUrl) {
                            const link = document.createElement("a");
                            link.href = resource.resourceFileUrl;
                            link.download = resource.title || "download";
                            link.target = "_blank";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            toast.success(t("downloadStarted"));
                          } else {
                            toast.error(t("downloadError"));
                          }
                        }}
                        className="inline-flex items-center justify-center gap-1 px-2.5 h-8 rounded-lg text-xs font-medium border border-[#233389] bg-white text-[#233389] hover:bg-[#233389] hover:text-white transition-colors"
                        title="Download"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{t("download")}</span>
                      </button>

                      {canDelete && (
                        <button
                          onClick={() => setDeleteResourceId(resId)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete resource"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("noResourcesFound")}
          </h3>
          <p className="text-sm text-gray-500 max-w-md">
            {searchQuery
              ? t("adjustSearch")
              : t("noResourcesCategory")}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={clearAllFilters}
            >
              {t("clearAllFilters")}
            </Button>
          )}
        </div>
      )}

      {/* ── Video Stream Modal ── */}
      <Dialog
        open={!!previewVideo}
        onOpenChange={(open) => !open && setPreviewVideo(null)}
      >
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-black rounded-2xl border-0">
          <DialogHeader className="p-4 bg-gray-900 text-white flex flex-row items-center justify-between">
            <DialogTitle className="text-white text-base font-medium truncate pr-4">
              {previewVideo?.title || "Video Resource"}
            </DialogTitle>
          </DialogHeader>
          {previewVideo?.url && (
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={previewVideo.url}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Resource Confirmation Modal ── */}
      <Dialog
        open={!!deleteResourceId}
        onOpenChange={(open) => !open && setDeleteResourceId(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Resource
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this resource? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteResourceId(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteResourceId)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
