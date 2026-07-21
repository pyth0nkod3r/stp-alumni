import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EllipsisVertical, MessageCircle, UserMinus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import networkService from "@/lib/services/networkService";
import { useSendInvitation } from "@/lib/hooks/useMessagingQueries";
import { Link, useRouter } from "@/i18n/routing";
import { toast } from "sonner";

function ConnectedUser({ connection, index, connectionTotal }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Extract and format connection data
  const { id, fullName, avatar, formattedRole } = useMemo(() => {
    const id = connection.connectionId || connection.userId;
    const fullName =
      connection.name ||
      `${connection.firstName || ""} ${connection.lastName || ""}`.trim();
    const avatar = connection.profileImagePath || connection.profileImageUrl || connection.avatar;

    // Format role/sector
    let formattedRole = "Professional";
    try {
      const sectors = Array.isArray(connection.sector)
        ? connection.sector
        : JSON.parse(connection.sector || "[]");
      formattedRole = sectors.length > 0 ? sectors.join(", ") : "Professional";
    } catch (e) {
      formattedRole = connection.sector || connection.role || "Professional";
    }

    return {
      id,
      fullName,
      avatar,
      formattedRole,
    };
  }, [connection]);

  // Remove connection mutation
  const { mutate: removeConnection, isPending: isRemoving } = useMutation({
    mutationFn: (data) => networkService.removeConnection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
      toast.success("Connection removed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove connection");
    },
  });

  const { mutate: sendInvitation, isPending: isSending } = useSendInvitation();

  const handleMessage = () => {
    sendInvitation({
      recipientId: connection.userId,
      shortMessage: "Hi, I'd like to connect with you!",
    });
  };

  const handleRemove = () => {
    if (confirm("Are you sure you want to remove this connection?")) {
      removeConnection({ connectionId: id });
    }
  };

  const handleViewProfile = () => {
    router.push(`/dashboard/profile/${connection.userId}`);
  };

  return (
    <div
      className={`flex items-center justify-between py-4 ${
        index !== connectionTotal - 1 ? "border-b border-border" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage src={avatar} alt={fullName} />
          <AvatarFallback className="bg-muted">
            {fullName.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <Link
            href={`/dashboard/profile/${connection.userId}`}
            className="hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-[#233389] font-semibold truncate">
              {fullName}
            </p>
          </Link>
          <p className="text-xs text-muted-foreground truncate">
            {formattedRole}
          </p>
          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
            Connected • {connection.connectedSince || "Available on STP"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {/* Message Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleMessage}
          disabled={isSending}
          className="rounded-2xl border-stp-blue-light text-stp-blue-light hover:bg-stp-blue-light hover:text-white"
        >
          <MessageCircle className="h-4 w-4 mr-1 sm:hidden block" />
          <span className="hidden sm:inline">
            {isSending ? "Opening..." : "Message"}
          </span>
        </Button>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleViewProfile}>
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              <UserMinus className="h-4 w-4 mr-2" />
              {isRemoving ? "Removing..." : "Remove Connection"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default React.memo(ConnectedUser);
