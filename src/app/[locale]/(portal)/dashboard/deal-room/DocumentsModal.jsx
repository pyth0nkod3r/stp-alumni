

import React from 'react'

import { useState, useRef } from "react";
import {

  FileText,
 
  Upload,

} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function DocumentsModal({ open, onOpenChange, room, onUploadFile }) {
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const documents = room?.documents || [];

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
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-sm text-muted-foreground">No documents yet.</p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {documents.map((doc) => (
                <li
                  key={doc.id || doc.fileId || doc.name}
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5"
                >
                  <div className="h-8 w-8 rounded-lg bg-stp-blue-light/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-stp-blue-light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {doc.name || doc.fileName}
                    </p>
                    {doc.streamUrl && (
                      <a
                        href={doc.streamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-stp-blue-light hover:underline"
                      >
                        View / Stream
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentsModal