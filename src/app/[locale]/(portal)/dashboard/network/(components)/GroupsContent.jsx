"use client";

import { useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { Link as NavLink } from "@/i18n/routing";
import { DoorOpen, EllipsisVertical, Link, LogOut,Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useGroupStore } from "@/lib/store/useGroupStore";
import groupService from "@/lib/services/groupService";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useUser";
import CreateGroupModal from "./CreateGroupModal";

// --- Component level handlers ---

const GroupCardWrapper = ({
  title,
  children,
  sortPlaceholder,
  selectWidth = "w-40",
  headerExtra
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-3">
      <CardTitle className="text-[#020618] font-semibold">{title}</CardTitle>
      <div className="flex items-center gap-3">
      {/* 
        <p className="text-sm text-[#020618]/50 font-light">Sort by:</p>
        <Select>
          <SelectTrigger className={`${selectWidth} text-[#020618]/50 text-sm`}>
            <SelectValue placeholder={sortPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort</SelectLabel>
              <SelectItem value="val">Apple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        */}
              {headerExtra}
        </div> 
    </CardHeader>
    <CardContent>
      <div className="flex flex-col gap-4">{children}</div>
    </CardContent>
  </Card>
);

const GroupItem = ({ group, variant, onToggleMembership }) => (
  <div className="rounded-lg overflow-hidden hover:shadow-card-hover transition- flex items-center justify-between">
    <div className="flex gap-2 items-center">
      <div className="relative h-15 w-15 rounded-lg bg-white/50 overflow-hidden shadow-sm flex items-center justify-center border bg-muted">
        {group.thumbnailUrl ? (
          <Image
            src={group.thumbnailUrl}
            alt="Group Cover"
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xl font-bold text-muted-foreground">
            {group.name?.charAt(0)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <NavLink
          href={`/dashboard/groups/${group.groupId}`}
          className="hover:underline"
        >
          <p className="text-sm font-medium truncate">{group.name}</p>
        </NavLink>
        <p className="text-xs text-muted-foreground truncate">
          {group.memberCount} members
        </p>
        {variant === "all-groups" && (
          <p className="text-xs text-muted-foreground truncate">
            {group.description}
          </p>
        )}
      </div>
    </div>

    {variant === "my-groups" ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link className="h-4 w-4 mr-2" />
            Copy link to group
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onToggleMembership(group.groupId, "LEAVE")}
            className="text-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Leave this group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <Button
        variant="outline"
        size="sm"
        className="border-stp-blue-light rounded-2xl text-stp-blue-light hover:bg-accent hover:text-accent-foreground"
        onClick={() => onToggleMembership(group.groupId, "JOIN")}
      >
        <DoorOpen />
        <span className="hidden sm:inline">Join</span>
      </Button>
    )}
  </div>
);

// --- Main Component ---

export function GroupsContent() {
  const queryClient = useQueryClient();
  const {
    groups,
    isLoading,
    error,
    toggleGroupMembershipLocally,
    addGroupLocally,
  } = useGroupStore();

  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data } = useAuth();

  // Compute derived state locally
  const myGroups = groups?.filter((g) => g.isMember) || [];
  const discoverGroups = groups?.filter((g) => !g.isMember) || [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGroups = discoverGroups.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(discoverGroups.length / itemsPerPage);

  const handleToggleMembership = async (groupId, action) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // Optimistically update the UI to avoid lag
      toggleGroupMembershipLocally(groupId, action === "JOIN");

      const response = await groupService.toggleMembership(
        groupId,
        action,
        data?.data?.userId,
      );
      if (response.status) {
        toast.success(response.message || "Membership updated.");
      } else {
        // Revert UI change if API fails
        toggleGroupMembershipLocally(groupId, action !== "JOIN");
        toast.error(response.message || "Failed to update membership.");
      }
    } catch (error) {
      // Revert UI change on network error
      toggleGroupMembershipLocally(groupId, action !== "JOIN");
      
      const serverMessage = error.response?.data?.message || error.response?.data?.error || "An unexpected error occurred.";
      toast.error(serverMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGroupCreated = (newGroup) => {
    // Optimistically add to store
    addGroupLocally(newGroup);
    // Reset pagination to show new group first
    setCurrentPage(1);
    // Trigger instant background refetch to sync with server
    queryClient.invalidateQueries({ queryKey: ['groups'] });
  };

  

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <GroupCardWrapper
          title={`My Groups (${myGroups.length})`}
          sortPlaceholder="Recently Added"
          selectWidth="w-40"
        >
          {myGroups.length > 0 ? (
            myGroups.map((group) => (
              <GroupItem
                key={group.groupId}
                group={group}
                variant="my-groups"
                onToggleMembership={handleToggleMembership}
              />
            ))
          ) : (
            <p className="text-sm text-center text-muted-foreground py-4">
              You have not joined any groups yet.
            </p>
          )}
        </GroupCardWrapper>

        <GroupCardWrapper
          title="Discover Groups"
          sortPlaceholder="All"
          selectWidth="w-25"
          headerExtra={
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#155DFC] hover:bg-[#155DFC]/90 text-white rounded-full px-4 h-9 text-sm font-medium gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Group</span>
            </Button>
          }
        >
        {currentGroups.length > 0 ? currentGroups.map((group) => (
            <GroupItem key={group.groupId} group={group} variant="all-groups" onToggleMembership={handleToggleMembership} />
          )) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">No groups available to join.</p>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create the first group
              </Button>
            </div>
          )}
        </GroupCardWrapper>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage((v) => v - 1);
                  }}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive={currentPage === 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(1);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>

              {currentPage > 3 && totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(page - currentPage) <= 1,
                )
                .map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {currentPage < totalPages - 2 && totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {totalPages > 1 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === totalPages}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(totalPages);
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage((v) => v + 1);
                  }}
                  className={
                    currentPage === totalPages || totalPages === 0
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
       <CreateGroupModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={handleGroupCreated}
      />
    </>
  );
}
