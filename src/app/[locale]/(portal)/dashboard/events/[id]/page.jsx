"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  Share2,
  Users,
  MoreVertical,
  MapPinHouse,
  Loader2,
  UserCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, redirect } from "@/i18n/routing";
import React, { useState } from "react";
import { CreateEventModal } from "@/components/(market-events)/CreateEventModal";
import eventService from "@/lib/services/eventService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useUser";
import { useDeleteEvent } from "@/lib/hooks/useEventQueries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "@/i18n/routing";

export default function EventDetail({ params }) {
  const { id } = React.use(params);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isRegistrantsModalOpen, setIsRegistrantsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: currentUser } = useAuth();
  
  const deleteEventMutation = useDeleteEvent();

  const handleDelete = () => {
    deleteEventMutation.mutate(id, {
      onSuccess: () => {
        router.push('/dashboard/events');
      }
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["events", id],
    queryFn: () => eventService.getEventById(id),
  });

  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationKey: ["register-event", id],
    mutationFn: () => eventService.registerEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["events", id]);
      toast.success("Successfully registered for event!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to register for event");
    },
  });

  const { mutate: cancelRegistration, isPending: isCancelling } = useMutation({
    mutationKey: ["cancel-registration", id],
    mutationFn: () => eventService.cancelRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["events", id]);
      toast.success("Registration cancelled successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to cancel registration");
    },
  });

  const { data: registrantsData, isLoading: isLoadingRegistrants } = useQuery({
    queryKey: ["event-registrants", id],
    queryFn: () => eventService.getEventRegistrants(id),
    enabled: isRegistrantsModalOpen,
  });

  const { data: eventsResponse, isLoading: isPending } = useQuery({
    queryKey: ["events"],
    queryFn: eventService.getEvents,
  });

  const otherEvents = eventsResponse?.data
    ?.filter((ele) => ele.event_id !== id)
    ?.slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  const event = data?.data;
  const registrants = Array.isArray(registrantsData?.data)
    ? registrantsData.data
    : Array.isArray(registrantsData)
    ? registrantsData
    : [];

  const isCreator = currentUser?.userId === event?.createdBy || currentUser?.id === event?.createdBy;

  const formatEventDateTime = (startTime, endTime) => {
    if (!startTime) return "";
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;

    if (!end) return format(start, "MMM d, yyyy, h:mm a");

    // Check if same day
    const isSameDay = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");

    if (isSameDay) {
      return `${format(start, "MMM d, yyyy, h:mm a")} - ${format(end, "h:mm a")}`;
    } else {
      return `${format(start, "MMM d, yyyy, h:mm a")} - ${format(end, "MMM d, yyyy, h:mm a")}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <h1 className="text-2xl lg:text-3xl font-bold text-stp-blue-light">
        Events
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {isLoading ? (
            <EventDetailSkeleton />
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img
                  src={event?.coverImageUrl}
                  alt={event?.name}
                  className="w-full h-full object-cover backdrop-blur-lg"
                />
              </div>

              <div className="p-5 space-y-4">
                <p className="text-sm text-stp-blue-light font-medium">
                  {event?.createdAt &&
                    format(
                      new Date(event.createdAt),
                      "EEE, MMM d, yyyy, h:mmaa",
                    )}
                </p>

                <h2 className="text-xl lg:text-2xl font-bold">{event?.name}</h2>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Event by
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {event?.createdByName || "Organizer"}
                  </span>
                </div>

                <div className="space-y-3 py-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-stp-blue-light" />
                    <span>
                      {formatEventDateTime(event?.startTime, event?.endTime)}
                    </span>
                  </div>
                  {(event?.address || event?.venue) && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPinHouse className="h-4 w-4 text-stp-blue-light" />
                      <span>
                        {event?.address}, {event?.venue}
                      </span>
                    </div>
                  )}

                  {event?.type && (
                    <div className="flex items-center gap-3 text-sm capitalize">
                      <Video className="h-4 w-4 text-stp-blue-light" />
                      <span>{event.type}</span>
                    </div>
                  )}

                  {event?.externalLink && (
                    <div className="flex items-center gap-3 text-sm">
                      <ExternalLink className="h-4 w-4 text-stp-blue-light" />
                      <span className="text-muted-foreground">Event link: </span>
                      <a
                        href={event.externalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline truncate max-w-[250px]"
                      >
                        {event.externalLink}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {event?.attendeeCount || 0} attendees
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {!event?.isRegistered ? (
                    <Button
                      className="bg-stp-blue-light text-primary-foreground hover:bg-primary/90 rounded-2xl"
                      disabled={isRegistering}
                      onClick={() => register()}
                    >
                      {isRegistering ? "Registering..." : "Attend Event"}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        disabled
                        className="rounded-2xl bg-emerald-50 text-emerald-700 font-medium"
                      >
                        ✓ Registered
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-2xl text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        disabled={isCancelling}
                        onClick={() => cancelRegistration()}
                      >
                        {isCancelling ? "Cancelling..." : "Cancel Registration"}
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="rounded-2xl text-[#233389] border-[#233389]/30 hover:bg-[#233389]/10"
                    onClick={() => setIsRegistrantsModalOpen(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Registrants ({event?.attendeeCount || 0})
                  </Button>

                  {isCreator && (
                    <>
                      <Button
                        variant="outline"
                        className="rounded-2xl border-primary text-primary hover:bg-primary/10"
                        onClick={() => {
                          setIsCreateModalOpen(true);
                          setIsEditMode(true);
                        }}
                      >
                        Edit Event
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="rounded-2xl border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the event
                              and remove it from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="bg-red-600 hover:bg-red-700 text-white"
                              disabled={deleteEventMutation.isPending}
                            >
                              {deleteEventMutation.isPending ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 space-y-6">
          <div className="bg-card rounded-xl border border-border p-5 text-center space-y-4">
            <p className="text-sm font-medium">
              Host an event on Blazing Torrent
              <br />
              and invite your network
            </p>
            <Button
              variant="outline"
              className="w-full bg-transparent! text-stp-blue-light border-stp-blue-light! rounded-2xl"
              onClick={() => {
                setIsCreateModalOpen(true);
                setIsEditMode(false);
              }}
            >
              Create event
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <h3 className="font-semibold text-sm">Other events for you</h3>
            <div className="space-y-3">
              {isPending
                ? Array(3)
                    .fill(0)
                    .map((_, i) => <SidebarSkeleton key={i} />)
                : otherEvents.map((otherEvent) => (
                    <Link
                      key={otherEvent.eventId}
                      className="flex gap-3 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                      href={`/dashboard/events/${otherEvent.eventId}`}
                    >
                      <img
                        src={otherEvent.coverImageUrl}
                        alt={otherEvent.name}
                        className="w-16 h-12 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {format(
                            new Date(otherEvent.createdAt),
                            "EEE, MMM d, yyyy, h:mmaa",
                          )}
                        </p>
                        <p className="text-sm font-medium line-clamp-2">
                          {otherEvent.name}
                        </p>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </div>
      </div>

      <CreateEventModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        editMode={isEditMode}
        initialData={isEditMode ? event : null}
        onEditSuccess={() => queryClient.invalidateQueries(["events", id])}
      />

      {/* ── View Registrants Modal ── */}
      <Dialog open={isRegistrantsModalOpen} onOpenChange={setIsRegistrantsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[#233389] flex items-center gap-2">
              <Users className="h-5 w-5" />
              Event Registrants ({registrants.length})
            </DialogTitle>
            <DialogDescription>
              Attendees who registered for this event.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            {isLoadingRegistrants ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#233389]" />
              </div>
            ) : registrants.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <UserCheck className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                No registrants yet.
              </div>
            ) : (
              registrants.map((reg, idx) => {
                const name = reg.name || `${reg.firstName || ""} ${reg.lastName || ""}`.trim() || reg.user?.name || "Attendee";
                const email = reg.email || reg.user?.email || "";
                const avatarUrl = reg.profileImagePath || reg.avatar || reg.user?.profileImagePath;
                const regDate = reg.registeredAt || reg.createdAt;
                const location = reg.location || reg.user?.location || "";

                return (
                  <div
                    key={reg.id || reg.userId || idx}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-gray-100"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl} alt={name} />
                      <AvatarFallback className="bg-blue-50 text-[#233389] font-medium text-xs">
                        {name.charAt(0) || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {name}
                      </p>
                      {email && (
                        <p className="text-xs text-gray-500 truncate">
                          {email}
                        </p>
                      )}
                      {location && (
                        <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {location}
                        </p>
                      )}
                    </div>
                    {regDate && (
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {format(new Date(regDate), "MMM d")}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Loading Skeletons
 */
function EventDetailSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-5 space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-40" />
        <div className="space-y-3 py-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-28 rounded-2xl" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex gap-3 p-2">
      <Skeleton className="w-16 h-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
