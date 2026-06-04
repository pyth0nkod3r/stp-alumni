import EventUi from "@/components/(market-events)/EventUi";
import React from "react";
import { Helmet } from "react-helmet-async";

function Page() {
  return (
    <>
      <Helmet>
        <title>Events | Blazing Torrent</title>
        <meta
          name="description"
          content="Discover and join events in your community."
        />
      </Helmet>
      <EventUi />
    </>
  );
}

export default Page;
