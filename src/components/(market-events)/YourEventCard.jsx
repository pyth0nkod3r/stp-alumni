

"use client";
import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import dayjs from "dayjs";
import { Calendar } from "lucide-react";

export function YourEventCard({ event }) {
  const eventId = event.eventId || event.id;
  const coverSrc = event.coverImageUrl || event.coverImage || event.cover || "/assets/stp-16.jpg";
  
  const dateFormatted = event.date || (event.startTime ? dayjs(event.startTime).format("ddd, MMM D, YYYY") : "Upcoming");
  const timeFormatted = event.time || (event.startTime ? dayjs(event.startTime).format("h:mm A") : "");

  return (
    <Link href={`/dashboard/events/${eventId}`} className="block">
      <div className="flex items-start gap-3 w-full cursor-pointer group p-2 rounded-lg hover:bg-muted/40 transition-colors">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={event.name || "Event"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Calendar className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
            {dateFormatted}{timeFormatted ? ` • ${timeFormatted}` : ""}
          </p>
          <h4 className="text-sm font-medium line-clamp-2 mt-1 group-hover:text-stp-blue-light transition-colors">
            {event.name}
          </h4>
        </div>
      </div>
    </Link>
  );
}