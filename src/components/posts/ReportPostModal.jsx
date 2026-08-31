'use client';
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useReportPost } from '@/lib/hooks/useReportQueries';

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam or misleading' },
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate content' },
  { value: 'OTHER', label: 'Other' }
];

export default function ReportPostModal({ open, onClose, postId }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  
  const { mutate: reportPost, isPending } = useReportPost();

  const handleClose = () => {
    setReason('');
    setDescription('');
    onClose();
  };

  const handleSubmit = () => {
    if (!reason) return;
    
    reportPost(
      { postId, reason, description },
      {
        onSuccess: () => {
          handleClose();
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
          <DialogDescription>
            Why are you reporting this post? Your report is anonymous.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-3">
            {REPORT_REASONS.map((opt) => (
              <label key={opt.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="report-reason"
                  value={opt.value}
                  checked={reason === opt.value}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4 text-[#233389] border-gray-300 focus:ring-[#233389]"
                />
                <span className="text-sm font-medium text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="pt-2">
            <Textarea
              placeholder="Provide additional details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason || isPending}
            className="bg-[#233389] hover:bg-[#1a2566] text-white"
          >
            {isPending ? 'Reporting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
