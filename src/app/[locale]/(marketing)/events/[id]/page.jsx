'use client'
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  Share2,
  Users,
  MoreVertical
} from "lucide-react";
import { Link, redirect, useRouter } from "@/i18n/routing";
import React, { useState } from "react";
import { CreateEventModal } from "../../../../../components/(market-events)/CreateEventModal";
import eventService from "@/lib/services/eventService";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventDetail({ params }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch live event data
  const { data: eventResponse, isLoading: isEventLoading } = useQuery({
    queryKey: ["public-event", id],
    queryFn: () => eventService.getEventById(id),
  });

  // Fetch other events
  const { data: otherEventsResponse } = useQuery({
    queryKey: ["public-events-list"],
    queryFn: () => eventService.getEvents({ limit: 6 }),
  });

  const liveEvent = eventResponse?.data || eventResponse;
  const otherEvents = (otherEventsResponse?.data || otherEventsResponse || [])
    .filter((e) => (e.id || e.eventId) !== id)
    .slice(0, 5);

  const event = liveEvent || {
    name: "Event Details",
    description: "",
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    format: "Online",
    venue: "Online",
    externalLink: "#",
    creator: { firstName: "Event", lastName: "Organizer" },
    attendeesCount: 0,
    coverImage: "/assets/stp-16.jpg",
  };

  const formattedDate = event.startTime
    ? format(new Date(event.startTime), "EEE, MMM dd, yyyy")
    : "TBD";
  const formattedTime = event.startTime
    ? `${format(new Date(event.startTime), "h:mma")} - ${event.endTime ? format(new Date(event.endTime), "h:mma") : ""}`
    : "TBD";

  return (
    <>
      <div className="space-y-6">
        {/* Back Button - Mobile */}
        <button
          onClick={() => redirect("/events")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Events</span>
        </button>

        {/* Page Header */}
        <h1 className="text-2xl lg:text-3xl font-bold text-stp-blue-light">Events</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Event Card */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Cover Image */}
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={event.coverImage || event.cover || "/assets/stp-16.jpg"}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Event Details */}
              <div className="p-5 space-y-4">
                {/* Date/Time Badge */}
                <p className="text-sm text-stp-blue-light font-medium">
                  {formattedDate} • {formattedTime}
                </p>

                {/* Title */}
                <h2 className="text-xl lg:text-2xl font-bold">{event.name}</h2>

                {/* Organizer */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Event by</span>
                  <span className="text-sm font-medium text-primary">
                    {(event.creator ? `${event.creator.firstName || ''} ${event.creator.lastName || ''}`.trim() : null) || event.organizer || "Blazing Connect Organizer"}
                  </span>
                </div>

                {/* Event Info */}
                <div className="space-y-3 py-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-stp-blue-light" />
                    <span>{formattedDate}, {formattedTime}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Video className="h-4 w-4 text-stp-blue-light" />
                    <span>{event.format || "Online"}</span>
                  </div>

                  {event.externalLink && event.externalLink !== "#" && (
                    <div className="flex items-center gap-3 text-sm">
                      <ExternalLink className="h-4 w-4 text-stp-blue-light" />
                      <span className="text-muted-foreground">Event link: </span>
                      <a href={event.externalLink} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate max-w-[200px]">
                        {event.externalLink}
                      </a>
                    </div>
                  )}
                </div>

                {/* Attendees */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">{event.attendeesCount ?? event.attendees ?? 0} attendees</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <Button asChild className="bg-stp-blue-light text-primary-foreground hover:bg-primary/90 rounded-2xl">
                    <Link href="/dashboard/events">Attend via Portal</Link>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Host Event Card */}
            <div className="bg-card rounded-xl border border-border p-5 text-center space-y-4">
              <p className="text-sm font-medium">
                Host an event on Blazing Torrent<br />and invite your network
              </p>
              <Button variant="outline" className="w-full" onClick={() => setIsCreateModalOpen(true)}>
                Create event
              </Button>
            </div>

            {/* Other Events */}
            {otherEvents.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h3 className="font-semibold text-sm">Other events for you</h3>

                <div className="space-y-3">
                  {otherEvents.map((otherEvent) => {
                    const eventId = otherEvent.id || otherEvent.eventId;
                    const otherDate = otherEvent.startTime
                      ? format(new Date(otherEvent.startTime), "EEE, MMM dd")
                      : otherEvent.date || "Upcoming";
                    const otherTime = otherEvent.startTime
                      ? format(new Date(otherEvent.startTime), "h:mma")
                      : otherEvent.time || "";

                    return (
                      <Link
                        key={eventId}
                        className="flex gap-3 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                        href={`/events/${eventId}`}
                      >
                        <img
                          src={otherEvent.coverImage || otherEvent.cover || "/assets/stp-16.jpg"}
                          alt={otherEvent.name}
                          className="w-16 h-12 object-cover rounded-lg shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            {otherDate}{otherTime ? `, ${otherTime}` : ""}
                          </p>
                          <p className="text-sm font-medium line-clamp-2">{otherEvent.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/events/${eventId}`);
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

       {/* Create Event Modal */}
            <CreateEventModal
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            />
    </>
  );
}
