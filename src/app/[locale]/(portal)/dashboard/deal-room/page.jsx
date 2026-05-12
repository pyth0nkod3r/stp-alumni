"use client"
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DealRoomView } from "./DealRoomView";
import { DealRoomList } from "./DealRoomList";
import { useDealRoom } from "./useDealRoom";
import { CreateDealRoomModal } from "./CreateDealRoomModal";

const DealRoom = () => {
  const {
    rooms,
    selectedRoom,
    currentMessages,
    searchQuery,
    sortBy,
    isLoading,
    setSearchQuery,
    setSortBy,
    selectRoom,
    sendMessage,
    retryMessage,
    deleteMessage,
    updateRoomName,
    deleteRoom,
    addMember,
    removeMember,
    createRoom,
  } = useDealRoom();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleBack = () => {
    selectRoom(null);
  };

  const handleCreateRoomClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateRoom = async (payload) => {
    const newRoom = await createRoom(payload);
    if (newRoom) {
      selectRoom(newRoom.id);
    }
    setIsCreateModalOpen(false);
  };

  // console.log(rooms[0],"rooms")

  return (
    <>
      <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-2rem)] flex bg-background">
        {/* Room List - hidden on mobile when chat is open */}
        <div
          className={cn(
            "w-full lg:w-100 border-r border-border shrink-0",
            selectedRoom ? "hidden lg:flex" : "flex"
          )}
        >
          <DealRoomList
            rooms={rooms}
            selectedId={selectedRoom?.id}
            searchQuery={searchQuery}
            sortBy={sortBy}
            isLoading={isLoading}
            onSearchChange={setSearchQuery}
            onSortChange={setSortBy}
            onSelect={(room) => selectRoom(room.id)}
            onCreateRoom={handleCreateRoomClick}
          />
        </div>

        {/* Room View - full width on mobile */}
        <div
          className={cn(
            "flex-1 flex flex-col",
            !selectedRoom ? "hidden lg:flex" : "flex"
          )}
        >
          {selectedRoom ? (
            <DealRoomView
              room={selectedRoom}
              messages={currentMessages}
              onBack={handleBack}
              onSendMessage={sendMessage}
              onRetryMessage={retryMessage}
              onDeleteMessage={deleteMessage}
              onUpdateRoomName={updateRoomName}
              onDeleteRoom={deleteRoom}
              onAddMember={addMember}
              onRemoveMember={removeMember}
            />
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
                <p className="font-medium">Select a room</p>
                <p className="text-sm mt-1">Choose from your existing deal rooms</p>
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
