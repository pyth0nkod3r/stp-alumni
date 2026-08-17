"use client";

import React, { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import eventService from "@/lib/services/eventService";
import { useEventStore } from "@/lib/store/useEventStore";
import { EventsContent } from '../(components)/EventsContent';

function Page() {
  const { setEvents, setLoading, setError } = useEventStore();

  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['my-events'],
    queryFn: eventService.getMyEvents,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setLoading(isLoading);
    if (error) {
      setError(error.message);
    }
    if (eventsData?.data) {
      setEvents(eventsData.data);
    }
  }, [eventsData, isLoading, error, setEvents, setLoading, setError]);

  return (
    <>
      <EventsContent />
    </>
  );
}

export default Page;