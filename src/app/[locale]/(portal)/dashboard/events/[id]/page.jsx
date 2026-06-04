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
} from "lucide-react";
import { Link, redirect } from "@/i18n/routing";
import React, { useState } from "react";
import { CreateEventModal } from "@/components/(market-events)/CreateEventModal";
import eventService from "@/lib/services/eventService";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

// ... (keep your allEvents and otherEvents mock data here)
//  const otherEvents = [

//   {

//     id: 1,

//     name: "Lead with a Grounded Confidence in a Changing World",

//     date: "Fri, Dec 15, 2025",

//     time: "7:00PM",

//     organizer: "Leadership Academy",

//     attendees: 45,

//     cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",

//     status: "upcoming",

//   }, ]

export default function EventDetail({ params }) {
  const { id } = React.use(params);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["events", id],
    queryFn: () => eventService.getEventById(id),
  });

  const { data: eventsResponse, isLoading: isPending } = useQuery({
    queryKey: ["events"],
    queryFn:eventService.getEvents,
  });

  const otherEvents = eventsResponse?.data?.filter((ele) => ele.eventId !== id);

  const event = data?.data;

  console.log(otherEvents, "otherEvents");

  const formatEventDateTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check if same day
    const isSameDay = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");

    if (isSameDay) {
      // Same day: "Apr 1, 2023, 12:00 AM - 11:59 PM"
      return `${format(start, "MMM d, yyyy, h:mm a")} - ${format(end, "h:mm a")}`;
    } else {
      // Different days: "Apr 1, 2023, 12:00 AM - Apr 30, 2023, 11:59 PM"
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
                  {format(
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
                    {event?.createdBy}
                  </span>
                </div>

                <div className="space-y-3 py-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-stp-blue-light" />
                    <span>
                      {formatEventDateTime(event?.startTime, event?.endTime)}
                    </span>
                  </div>
                 {(event.address || event.venue) && <div className="flex items-center gap-3 text-sm">
                    <MapPinHouse className="h-4 w-4 text-stp-blue-light" />
                    <span>
                      {event?.address}, {event?.venue}
                    </span>
                  </div>}

                  <div className="flex items-center gap-3 text-sm capitalize">
                    <Video className="h-4 w-4 text-stp-blue-light" />
                    <span>{event.type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <ExternalLink className="h-4 w-4 text-stp-blue-light" />
                    <span className="text-muted-foreground">Event link: </span>
                    <a
                      href={event.externalLink}
                      className="text-primary hover:underline truncate max-w-[200px]"
                    >
                      {event?.externalLink ||
                        "https://meet.google.com/tgr-ghd-lkj"}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {event?.attendees || 0} attendees
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button className="bg-stp-blue-light text-primary-foreground hover:bg-primary/90 rounded-2xl">
                    Attend
                  </Button>
                  {/* <Button variant="outline" size="icon" className="rounded-full">
                    <Share2 className="h-4 w-4" />
                  </Button> */}
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
              onClick={() => setIsCreateModalOpen(true)}
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
                      key={otherEvent.id}
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
      />
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
