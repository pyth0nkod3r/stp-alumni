import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import networkService from "@/lib/services/networkService";

export function InvitationsList({ invitations=[], isLoading }) {
  const [showAll, setShowAll] = useState(false);

  // const invitations = data?.data || [];
  const displayedInvitations = showAll ? invitations : invitations?.slice(0, 5);
  const hasMoreInvitations = invitations.length > 5;

  console.log("Invitations data:", invitations);

  const handleShowAll = () => {
    setShowAll(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Invitations</CardTitle>
          <Button
            variant="link"
            className="text-[#020618BF] p-0 h-auto"
            disabled
          >
            Show all
          </Button>
        </CardHeader>
        <CardContent className="space-y-0">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div
              key={index}
              className={`flex items-center justify-between py-3 ${
                index !== 4 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            Invitations (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No pending invitations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">
          Invitations ({invitations.length})
        </CardTitle>
        {hasMoreInvitations && !showAll && (
          <Button
            variant="link"
            className="text-[#020618BF] p-0 h-auto"
            onClick={handleShowAll}
          >
            Show all
          </Button>
        )}
        {showAll && (
          <Button
            variant="link"
            className="text-[#020618BF] p-0 h-auto"
            onClick={() => setShowAll(false)}
          >
            Show less
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-0">
        {displayedInvitations.map((invitation, index) => (
          <InvitationItem
            key={invitation.connectionId || invitation.id || index}
            invitation={invitation}
            index={index}
            len={displayedInvitations.length}
          />
        ))}

        {/* Optional: Show remaining count if not showing all */}
        {hasMoreInvitations && !showAll && (
          <div className="py-3 text-center border-t border-border mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowAll}
              className="text-muted-foreground text-xs"
            >
              +{invitations.length - 5} more invitation
              {invitations.length - 5 !== 1 ? "s" : ""}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function InvitationItem({ invitation, index, len }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data) =>
      networkService.acceptConnection(invitation.connectionId),
    onSuccess: () => {
      toast.success("Connection request accepted");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["network"] });
    },
  });

  const { mutate: ignore, isPending: isIgnoring } = useMutation({
    mutationFn: (data) =>
      networkService.ignoreConnection(invitation.connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.info("Connection request ignored!");
    },
  });

  return (
    <div
      key={invitation.id}
      className={`flex items-center justify-between py-3 ${
        index !== len - 1 ? "border-b border-border" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={invitation.avatar} />
          <AvatarFallback className="bg-muted">
            {`${invitation.firstName} ${invitation.lastName}`?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {invitation.firstName} {invitation.lastName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {invitation?.title || ""} . {invitation?.companyName || ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending || isIgnoring}
          onClick={() => ignore(invitation.connectionId)}
          className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
        >
          Ignore
        </Button>
        <Button
          variant="outline"
          disabled={isPending || isIgnoring}
          onClick={() => mutate(invitation.connectionId)}
          size="sm"
          className="border-stp-blue-light rounded-2xl text-stp-blue-light hover:bg-accent hover:text-accent-foreground"
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
