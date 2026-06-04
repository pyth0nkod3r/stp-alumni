import { ModernScrollArea } from "@/components/shared/ScrollArea";
import {
  Loader,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { messages } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import networkService from "@/lib/services/networkService";
import { toast } from "sonner";
import { useMessaging } from "./messaging/useMessaging";
import { format } from "date-fns";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { useSendInvitation } from "@/lib/hooks/useMessagingQueries";

function SidebarWidgets({ t, height }) {
  const router = useRouter();
  // Fetch your network data
  const { data: networkData, isLoading: isLoadingNetwork } = useQuery({
    queryKey: ["network"],
    queryFn: () => networkService.getConnections(),
  });

  // Fetch invitations/connections data
  const { data: connectionsData, isLoading: isLoadingConnections } = useQuery({
    queryKey: ["connections"],
    queryFn: () => networkService.getIncomingRequests(),
  });

  const { conversations } = useMessaging();

  // Parse mapped network payload safely
  const networkContacts = networkData?.data || networkData || {};
  // console.log("networkContacts", networkContacts.filter((ele) => ele.connectionStatus === "ACCEPTED"));

  // Parse mapped invitations safely (assuming response is array or .data array)
  // Filtering loosely for "pending" status if available; else relying on API struct
  const rawConnections = Array.isArray(connectionsData?.data)
    ? connectionsData.data
    : Array.isArray(connectionsData)
      ? connectionsData
      : [];

  const invitations = rawConnections.slice(0, 5);
  const messages = conversations
    .filter((ele) => ele.type !== "PUBLIC_GROUP")
    .slice(0, 5);

  const navToInvitation = () =>
    router.push(`/dashboard/network?active=invitation`);

  // console.log(variables, "variables");
  return (
    <aside
      className="hidden lg:block sticky left-0  w-full overflow-y-auto"
      style={{
        top: `${height + 10}px`,
        height: `calc(100dvh - ${height}px)`,
      }}
    >
      <ModernScrollArea
        className={` w-full`}
        // style={{
        //   height: `calc(100vh - ${height}px - 1rem)`,
        // }}
      >
        <div className="space-y-6">
          {/* Your Network */}
          <div>
            <div className="bg-white rounded-lg p-4 lg:p-6">
              <h3 className="font-semibold text-[#233389] mb-4">
                {t("yourNetwork")}
              </h3>

              <div className="space-y-3">
                {/* <div className="bg-white rounded-lg p-4 lg:p-6"> */}
                {isLoadingNetwork ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#233389]"></div>
                  </div>
                ) : networkContacts.length > 0 ? (
                  networkContacts
                    // .filter((ele) => ele.connectionStatus === "ACCEPTED")
                    .slice(0, 5)
                    .map((contact, index) => (
                      <ConnectedUser contact={contact} index={index} />
                    ))
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4 bg-white rounded-lg">
                    Go connect to build your network!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invitations */}
          <div className="bg-white rounded-lg p-4 lg:p-6">
            <h3 className="font-semibold text-[#233389] mb-4">
              {t("invitations")}{" "}
              {invitations.length > 0 ? `(${invitations.length})` : ""}
            </h3>
            <div className="space-y-3">
              {isLoadingConnections ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#233389]"></div>
                </div>
              ) : invitations.length > 0 ? (
                invitations.map((invitation, index) => (
                  <InvitationItem
                    key={index + 1}
                    invitation={invitation}
                    index={index}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  No pending invitations.
                </p>
              )}
            </div>
            {invitations.length > 0 && (
              <button
                onClick={navToInvitation}
                className="w-full mt-4 text-center text-sm py-2 border border-[#233389] text-[#233389] hover:bg-[#233389] hover:text-white rounded-2xl transition-colors"
              >
                {t("seeMore")}
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="bg-white rounded-lg p-4 lg:p-6">
            <h3 className="font-semibold text-[#233389] mb-4">
              {t("messages")} ({messages.length})
            </h3>
            <div className="space-y-3">
              {messages?.map((message, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden shrink-0">
                    <Image
                      src={message.avatar || "/assets/Your Newtork Image.jpg"}
                      alt={message.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-sm text-[#233389]">
                        {message.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {format(message.lastMessageAt, "MMMM d")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {message?.lastMessage || ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-center text-sm py-2 border border-[#233389] text-[#233389] hover:bg-[#233389] hover:text-white rounded-2xl">
              <Link href="/dashboard/messaging">{t("seeMore")}</Link>
            </button>
          </div>
        </div>
      </ModernScrollArea>
    </aside>
  );
}

export default SidebarWidgets;

function InvitationItem({ invitation, index }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data) =>
      networkService.acceptConnection(invitation.connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["network"] });
      toast.success("Connection request accepted");
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
      key={invitation.id || index}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden shrink-0">
          <Image
            src={
              invitation?.profileImagePath || "/assets/Your Newtork Image.jpg"
            }
            alt={invitation?.firstName || "User"}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm text-[#233389] truncate">
            {`${invitation?.firstName} ${invitation?.lastName}` ||
              "Pending User"}
          </p>
          <p className="text-xs text-gray-600 truncate">
            Pending connection request
          </p>
        </div>
      </div>
      <button className="p-1 hover:bg-gray-100 rounded shrink-0"></button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isPending || isIgnoring ? (
              <Loader className="animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4 text-gray-600" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => ignore(invitation.connectionId)}
            disabled={isPending || isIgnoring}
          >
            Ignore
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => mutate(invitation.connectionId)}
            disabled={isPending || isIgnoring}
          >
            Accept
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ConnectedUser({ contact, index }) {
  const { mutate: sendInvitation, isPending: isSending } = useSendInvitation();

  const handleMessage = (userId) => {
    sendInvitation({
      recipientId: userId,
      shortMessage: "Hi, I'd like to connect with you!",
    });
  };
  return (
    <div key={contact.userId || index} className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden shrink-0">
            <Image
              src={contact.profileImagePath || "/assets/Your Newtork Image.jpg"}
              alt={contact.name || contact.firstName || "User"}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <Link
              href={`/dashboard/profile/${contact.userId}`}
              className="hover:underline"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <p className="font-medium text-xs text-[#233389] truncate">
                {contact.firstName || "Anonymous"} {contact.lastName}
              </p>
            </Link>
            <p className="text-xs text-gray-600 truncate">
              {contact.title || contact.email || "Member"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {contact.status === "ACCEPTED" && (
            <button
              className="p-1 hover:bg-gray-100 rounded"
              onClick={() => handleMessage(contact.userId)}
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin text-stp-blue-light" />
              ) : (
                <MessageCircle className="h-4 w-4 text-[#233389]" />
              )}
            </button>
          )}
          {contact.status === null && (
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreHorizontal className="h-4 w-4 text-[#233389]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
