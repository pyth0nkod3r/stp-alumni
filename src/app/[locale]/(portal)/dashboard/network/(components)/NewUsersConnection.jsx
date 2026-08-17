import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  EllipsisVertical,
  MessageCircle,
  UserMinus,
  UserPlus,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import networkService from "@/lib/services/networkService";
import { useSendInvitation } from "@/lib/hooks/useMessagingQueries";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";

// Helper function to get button configuration
const getButtonConfig = (status, isPending, isConnecting, isInviting) => {
  const configs = {
    NOT_CONNECTED: {
      text: isConnecting ? "Connecting..." : "Connect",
      icon: <UserPlus className="h-4 w-4 mr-1 sm:hidden block" />,
      disabled: isConnecting,
      action: "CONNECT",
    },
    PENDING: {
      text: "Pending",
      icon: <Clock className="h-4 w-4 mr-1 sm:hidden block" />,
      disabled: true,
      action: "PENDING",
    },
  };

  if (status === "PENDING") return configs.PENDING;
  return configs.NOT_CONNECTED;
};

function NewUsersConnection({ connection, index, connectionTotal }) {
  const queryClient = useQueryClient();

  // Extract and format connection data
  const {
    id,
    fullName,
    avatar,
    formattedRole,
    connectionStatus,
    isConnected,
    isPending,
    isNotConnected,
  } = useMemo(() => {
    const id = connection.connectionId || connection.userId;
    const fullName =
      connection.name ||
      `${connection.firstName || ""} ${connection.lastName || ""}`.trim();
    const avatar = connection.profileImageUrl || connection.avatar;
    const connectionStatus = connection.connectionStatus;

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
      connectionStatus,
      isPending: connectionStatus === "PENDING",
      isNotConnected: connectionStatus === null,
    };
  }, [connection]);

  // Mutations
  const { mutate: connectToUser, isPending: isConnecting } = useMutation({
    mutationFn: (data) => networkService.connectToUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
      toast.success("Connection request sent!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send connection request");
    },
  });

  const { mutate: disconnectUser, isPending: isDisconnecting } = useMutation({
    mutationFn: (connId) => networkService.disconnectUser(connId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Disconnected successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to disconnect");
    },
  });

  // Action handlers
  const handleConnect = () => {
    if (isNotConnected) {
      connectToUser({ userId: connection.userId });
    }
  };
  const handlePendingClick = () => {
    toast.info("Your connection request is pending approval.");
  };

  const handleRemoveConnection = () => {
    const connId = connection.connectionId || connection.id || connection.userId;
    if (connId) {
      disconnectUser(connId);
    }
  };

  // Get button configuration based on connection status
  const buttonConfig = getButtonConfig(
    connectionStatus,
    isPending,
    isConnecting,
  );

  // Button click handler mapper
  const getButtonClickHandler = () => {
    switch (buttonConfig.action) {
      case "CONNECT":
        return handleConnect;
      case "PENDING":
        return handlePendingClick;
      default:
        return () => {};
    }
  };

  const isAlreadyConnected = connectionStatus === "ACCEPTED" || isConnected;

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
            {connection.connectedSince ||
              (isAlreadyConnected ? "Connected" : "Available on STP")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {/* Main Action Button */}
        {!isAlreadyConnected ? (
          <Button
            variant={"default"}
            size="sm"
            disabled={buttonConfig.disabled}
            className={"rounded-2xl bg-[#233389] hover:bg-[#1a2866] text-white"}
            onClick={getButtonClickHandler()}
          >
            {buttonConfig.icon}
            <span className="hidden sm:inline">{buttonConfig.text}</span>
          </Button>
        ) : (
          <Link href={`/dashboard/messages?recipientId=${connection.userId}`}>
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl border-[#233389] text-[#233389] hover:bg-[#233389]/10"
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Message</span>
            </Button>
          </Link>
        )}

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <EllipsisVertical className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/profile/${connection.userId}`}
                className="cursor-pointer"
              >
                View Profile
              </Link>
            </DropdownMenuItem>
            {isAlreadyConnected && (
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                disabled={isDisconnecting}
                onClick={handleRemoveConnection}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Disconnect
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default React.memo(NewUsersConnection);
