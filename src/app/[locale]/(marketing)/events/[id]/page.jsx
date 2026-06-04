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
import { Link, redirect } from "@/i18n/routing";
import React, { useState } from "react";
import { CreateEventModal } from "../../../../../components/(market-events)/CreateEventModal";

// Combined mock data
const allEvents = [
  {
    id: 1,
    name: "Lead with a Grounded Confidence in a Changing World",
    date: "Fri, Dec 15, 2025",
    time: "7:00PM",
    organizer: "Leadership Academy",
    attendees: 45,
    cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    status: "upcoming",
  },
  {
    id: 2,
    name: "Lead with a Grounded Confidence in a Changing Environment",
    date: "Fri, Dec 15, 2025",
    time: "7:00PM",
    organizer: "Leadership Academy",
    attendees: 32,
    cover: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=400&fit=crop",
    status: "upcoming",
  },
  {
    id: 3,
    name: "Lead with a Grounded Confidence in Leadership",
    date: "Fri, Dec 15, 2025",
    time: "7:00PM",
    organizer: "Leadership Academy",
    attendees: 28,
    cover: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=400&fit=crop",
    status: "upcoming",
  },
  {
    id: 4,
    name: "JSworld Conference Africa - Diversity Focus",
    date: "Fri, Dec 15, 2025",
    time: "7:00PM",
    organizer: "Alphamarine Photography LTD",
    attendees: 1,
    cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    status: "upcoming",
  },
  {
    id: 5,
    name: "9th Global Summit on Precision Diagnosis and Treatment of Prostate Cancer",
    date: "Fri, Dec 15, 2025",
    time: "7:00PM",
    organizer: "Alphamarine Photography LTD",
    attendees: 1,
    cover: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop",
    status: "upcoming",
  },
  {
    id: 6,
    name: "2025 Drive for the Driven Golf Tournament",
    date: "Thu, Sep 18, 2025",
    time: "9:00AM - 10:00AM",
    organizer: "Alphamarine Photography LTD",
    attendees: 126,
    cover: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=400&fit=crop",
    status: "upcoming",
  },
];

const otherEvents = allEvents.filter((_, idx) => idx > 0).slice(0, 5);

export default function EventDetail({params}) {
 const { id } = React.use(params)
  
  const event = allEvents.find((e) => e.id === Number(id)) || allEvents[0];
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
              <div className="aspect-video overflow-hidden">
                <img
                  src={event.cover}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Event Details */}
              <div className="p-5 space-y-4">
                {/* Date/Time Badge */}
                <p className="text-sm text-stp-blue-light font-medium">
                  Today, {event.time.split(" - ")[0]}
                </p>

                {/* Title */}
                <h2 className="text-xl lg:text-2xl font-bold">{event.name}</h2>

                {/* Organizer */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Event by</span>
                  <span className="text-sm font-medium text-primary">{event.organizer}</span>
                </div>

                {/* Event Info */}
                <div className="space-y-3 py-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-stp-blue-light" />
                    <span>{event.date}, {event.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Video className="h-4 w-4 text-stp-blue-light" />
                    <span>Online</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <ExternalLink className="h-4 w-4 text-stp-blue-light" />
                    <span className="text-muted-foreground">Event link: </span>
                    <a href="#" className="text-primary hover:underline truncate max-w-[200px]">
                      https://meet.google.com/tgr-ghd-lkj
                    </a>
                  </div>
                </div>

                {/* Attendees */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">{event.attendees} attendees</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <Button className="bg-stp-blue-light text-primary-foreground hover:bg-primary/90 rounded-2xl">
                    Attend
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
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-sm">Other events for you</h3>
              
              <div className="space-y-3">
                {otherEvents.map((otherEvent) => (
                  <Link 
                    key={otherEvent.id} 
                    className="flex gap-3 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                    href={`/events/${otherEvent.id}`}
                  >
                    <img
                      src={otherEvent.cover}
                      alt={otherEvent.name}
                      className="w-16 h-12 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {otherEvent.date}, {otherEvent.time}
                      </p>
                      <p className="text-sm font-medium line-clamp-2">{otherEvent.name}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        redirect(`/events/${otherEvent.id}`);
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
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
