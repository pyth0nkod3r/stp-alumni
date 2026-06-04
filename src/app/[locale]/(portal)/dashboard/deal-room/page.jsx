"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DealRoomView } from "./DealRoomView";
import { DealRoomList } from "./DealRoomList";
import { useDealRoom } from "./useDealRoom";
import { CreateDealRoomModal } from "./CreateDealRoomModal";
import { useNavbar } from "@/contexts/NavbarContext";
import { Helmet } from "react-helmet-async";

const DealRoom = () => {
  const {
    rooms,
    selectedRoom,
    currentMessages,
    searchQuery,
    sortBy,
    roomsLoading,
    isRoomDetailLoading,
    currentUserId,
    typingUsers,
    isDeletePending,
    setSearchQuery,
    setSortBy,
    selectRoom,
    sendMessage,
    sendTyping,
    deleteMessage,
    addMember,
    removeMember,
    uploadFile,
    createRoom,
    retryMessage
  } = useDealRoom();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateRoom = async (payload) => {
    const newRoom = await createRoom(payload);
    if (newRoom) selectRoom(newRoom.id);
    setIsCreateModalOpen(false);
  };

    const {
      userSize: { height },
      mobileSize: { height: mobileHeight },
    } = useNavbar();

  return (
    <>
    
          <Helmet>
            <title>Deal Rooms | Blazing Torrent</title>
            <meta
              name="description"
              content={"Collaborate securely with your contacts in dedicated deal rooms. Share files, exchange messages, and manage your deals all in one place."}
            />
          </Helmet>
      <div
        className=" flex bg-background"
        style={{
          // top: `${height + 10}px`,
          height: `calc(100dvh - ${height + mobileHeight + 30}px)`,
        }}
      >
        {/* Room list */}
        <div
          className={cn(
            "w-full lg:w-96 border-r border-border shrink-0",
            selectedRoom ? "hidden lg:flex" : "flex",
          )}
        >
          <DealRoomList
            rooms={rooms}
            selectedId={selectedRoom?.id}
            searchQuery={searchQuery}
            sortBy={sortBy}
            isLoading={roomsLoading}
            onSearchChange={setSearchQuery}
            onSortChange={setSortBy}
            onSelect={(room) => selectRoom(room.roomId || room.id)}
            onCreateRoom={() => setIsCreateModalOpen(true)}
          />
        </div>

        {/* Room view */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0",
            !selectedRoom ? "hidden lg:flex" : "flex",
          )}
        >
          {selectedRoom ? (
            <DealRoomView
              room={selectedRoom}
              messages={currentMessages}
              currentUserId={currentUserId}
              roomsLoading={roomsLoading}
              isRoomDetailLoading={isRoomDetailLoading}
              isDeletePending={isDeletePending}
              typingUsers={typingUsers}
              onBack={() => selectRoom(null)}
              onSendMessage={sendMessage}
              onSendTyping={sendTyping}
              onDeleteMessage={deleteMessage}
              onAddMember={addMember}
              onRemoveMember={removeMember}
              onUploadFile={uploadFile}
              retryMessage={retryMessage}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-7 w-7 text-muted-foreground opacity-50"
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
                <p className="font-medium text-sm">Select a deal room</p>
                <p className="text-xs mt-1 opacity-60">
                  Choose from your existing rooms
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateDealRoomModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreate={handleCreateRoom}
      />
    </>
  );
};

export default DealRoom;
