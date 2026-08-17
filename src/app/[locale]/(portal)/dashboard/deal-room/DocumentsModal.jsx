

import React from 'react';
import { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Download,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import dealroomService from "@/lib/services/dealroomService";

function DocumentsModal({ open, onOpenChange, room, onUploadFile }) {
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const roomId = room?.roomId || room?.id;

  const { data: filesData, isLoading: isLoadingFiles, refetch } = useQuery({
    queryKey: ["dealroom-files", roomId],
    queryFn: () => dealroomService.getFiles(roomId),
    enabled: !!roomId && open,
  });

  const rawDocs = Array.isArray(filesData?.data)
    ? filesData.data
    : Array.isArray(filesData)
    ? filesData
    : room?.documents || [];

  const documents = rawDocs;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(0);
    await onUploadFile?.(file, (pct) => setUploadProgress(pct));
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </DialogTitle>
          <DialogDescription>
            Only NDA-signed members can view and upload documents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Upload area */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 rounded-xl border-2 border-dashed border-border px-4 py-3 hover:border-stp-blue-light/50 hover:bg-muted/30 transition-all group"
            disabled={uploadProgress !== null}
          >
            <div className="h-9 w-9 rounded-full bg-muted group-hover:bg-stp-blue-light/10 transition-colors flex items-center justify-center shrink-0">
              <Upload className="h-4 w-4 text-muted-foreground group-hover:text-stp-blue-light transition-colors" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Upload a document</p>
              <p className="text-xs text-muted-foreground">
                Any file up to 50MB
              </p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Progress */}
          {uploadProgress !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-stp-blue-light transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Document list */}
          {isLoadingFiles ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#233389]" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-sm text-muted-foreground">No documents yet.</p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {documents.map((doc) => {
                const fileUrl = doc.url || doc.fileUrl || doc.filePath || doc.streamUrl;
                const fileName = doc.name || doc.fileName || doc.title || "Document";

                return (
                  <li
                    key={doc.id || doc.fileId || fileName}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 bg-gray-50/50"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-[#233389]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fileName}
                        </p>
                        {doc.createdAt && (
                          <p className="text-[10px] text-gray-400">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {fileUrl && (
                      <a
                        href={
                          fileUrl.startsWith("http")
                            ? fileUrl
                            : `${process.env.NEXT_PUBLIC_API_URL}/${fileUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="p-1.5 rounded-lg text-[#233389] hover:bg-[#233389]/10 transition-colors"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentsModal