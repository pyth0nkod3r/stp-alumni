"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus, Link as LinkIcon } from "lucide-react";
import groupService from "@/lib/services/groupService";

export default function JoinGroupModal({
  open,
  onOpenChange,
  initialToken = "",
}) {
  const [token, setToken] = useState(initialToken);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
    }
  }, [initialToken]);

  const { mutate: joinGroup, isPending } = useMutation({
    mutationFn: (inviteToken) => groupService.joinViaLink(inviteToken),
    onSuccess: (res) => {
      toast.success(res?.message || "Successfully joined the group!");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      onOpenChange(false);
      const groupId = res?.data?.groupId || res?.groupId;
      if (groupId) {
        router.push(`/dashboard/groups/${groupId}`);
      }
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to join group with this link.",
      );
    },
  });

  const handleJoin = (e) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("Please enter a valid invite token or link");
      return;
    }
    // Extract token if user pasted full URL
    let parsedToken = token.trim();
    if (parsedToken.includes("invite=")) {
      parsedToken = parsedToken.split("invite=")[1]?.split("&")[0] || parsedToken;
    } else if (parsedToken.includes("/join/")) {
      parsedToken = parsedToken.split("/join/")[1]?.split("?")[0] || parsedToken;
    }
    joinGroup(parsedToken);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-blue-50 text-stp-blue-light rounded-full flex items-center justify-center mb-2">
            <UserPlus className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-lg font-bold text-foreground">
            Join Group via Invite
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Enter the invite token or link provided by the group admin to join.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleJoin} className="space-y-4 pt-2">
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste invite token or URL..."
              className="pl-9 rounded-xl text-sm"
              disabled={isPending}
            />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !token.trim()}
              className="bg-stp-blue-light hover:bg-stp-blue-light/90 text-white rounded-xl gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Join Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
