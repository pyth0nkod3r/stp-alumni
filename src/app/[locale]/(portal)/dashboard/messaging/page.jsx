"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChatView } from "./ChatView";
import { ConversationList } from "./ConversationList";
import { GroupDiscovery } from "./GroupDiscovery";
import { GroupSettingsDialog } from "./GroupSettings";
import { NewMessageDialog } from "./NewMessageDialog";
import { useMessaging } from "./useMessaging";
import { useSearchParams } from "next/navigation";
import { useNavbar } from "@/contexts/NavbarContext";
import { Helmet } from "react-helmet-async";

const Messaging = () => {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");

  const {
    userSize: { height },
    mobileSize: { height: mobileHeight },
  } = useNavbar();
  const {
    conversations,
    selectedConversation,
    currentMessages,
    searchQuery,
    sortBy,
    isLoading,
    isMessagesLoading,
    invitations,
    setSearchQuery,
    setSortBy,
    selectConversation,
    sendMessage,
    sendMediaFile,
    retryMessage,
    deleteMessage,
    acceptInvitation,
    declineInvitation,
    sendTyping, // ← ADD THIS
    typingUsers, // ← ADD THIS
    isConnected, // ← ADD THIS (optional, for debugging)
  } = useMessaging();
  useEffect(() => {
    if (conversationId) selectConversation(conversationId);
  }, [conversationId]);
  // console.log(currentMessages,"currentMessages")
  const [showGroupDiscovery, setShowGroupDiscovery] = useState(false);
  const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  const handleBack = () => {
    selectConversation(null);
  };

  const handleGroupJoined = (conversationId) => {
    setShowGroupDiscovery(false);
    if (conversationId) {
      selectConversation(conversationId);
    }
  };

  const handleFilterConversations = (conversations) => {
    if (!searchQuery) return conversations;

    return conversations.filter((conv) => {
      const nameMatch = conv.name
        ? conv.name.toLowerCase().includes(searchQuery.toLowerCase())
        : false;
      // const memberMatch = conv.members.some((member) =>
      //   member.name.toLowerCase().includes(searchQuery.toLowerCase())
      // );
      return nameMatch;
    });
  };

  return (
    <>
      <Helmet>
        <title>Messaging | Blazing Torrent</title>
        <meta
          name="description"
          content="Communicate with your contacts and groups in real-time."
        />
      </Helmet>
      <div
        className=" flex bg-background"
        style={{
          // top: `${height + 10}px`,
          height: `calc(100dvh - ${height + mobileHeight + 30}px)`,
        }}
      >
        {/* <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-2rem)] flex bg-background"> */}
        {/* Conversation List - hidden on mobile when chat is open */}
        <div
          className={cn(
            "w-full lg:w-100 border-r border-border shrink-0",
            selectedConversation || showGroupDiscovery
              ? "hidden lg:flex"
              : "flex",
          )}
        >
          <ConversationList
            conversations={handleFilterConversations(conversations)} // Apply filtering here
            selectedId={selectedConversation?.conversationId}
            searchQuery={searchQuery}
            sortBy={sortBy}
            isLoading={isLoading}
            onSearchChange={setSearchQuery}
            onSortChange={setSortBy}
            onSelect={(conv) => {
              setShowGroupDiscovery(false);
              selectConversation(conv.conversationId);
              // console.log("lol",conv)
            }}
            invitations={invitations}
            onAcceptInvitation={acceptInvitation}
            onDeclineInvitation={declineInvitation}
            onBrowseGroups={() => {
              null;
              setShowGroupDiscovery(true);
            }}
            onNewMessage={() => setNewMessageOpen(true)}
          />
        </div>

        {/* New Message Dialog */}
        <NewMessageDialog
          open={newMessageOpen}
          onOpenChange={setNewMessageOpen}
          conversations={conversations}
        />

        {/* Main content area */}
        <div
          className={cn(
            "flex-1 flex flex-col",
            !selectedConversation && !showGroupDiscovery
              ? "hidden lg:flex"
              : "flex",
          )}
        >
          {showGroupDiscovery ? (
            <GroupDiscovery
              onClose={() => setShowGroupDiscovery(false)}
              onGroupJoined={handleGroupJoined}
            />
          ) : selectedConversation ? (
            <>
              <ChatView
                conversation={selectedConversation}
                messages={currentMessages}
                isLoading={isMessagesLoading}
                onBack={handleBack}
                onSendMessage={sendMessage}
                onSendMediaFile={sendMediaFile}
                onRetryMessage={retryMessage}
                onDeleteMessage={deleteMessage}
                onTyping={sendTyping} // Add this
                typingUsers={typingUsers} // Add this
                onOpenGroupSettings={
                  selectedConversation.type === "PUBLIC_GROUP"
                    ? () => setGroupSettingsOpen(true)
                    : undefined
                }
              />
              <GroupSettingsDialog
                open={groupSettingsOpen}
                onOpenChange={setGroupSettingsOpen}
                conversation={selectedConversation}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="font-medium">Select a conversation</p>
                <p className="text-sm mt-1">
                  Choose from your existing conversations
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Messaging;
