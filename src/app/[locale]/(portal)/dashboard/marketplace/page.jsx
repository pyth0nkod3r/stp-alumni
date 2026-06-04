import MarketplaceUi from "@/components/(market-events)/MarketUi";
import React from "react";
import { Helmet } from "react-helmet-async";

function Page() {
  return (
    <>
      <Helmet>
        <title>Marketplace | Blazing Torrent</title>
        <meta
          name="description"
          content="Explore the marketplace to discover and acquire valuable resources, services, and opportunities offered by your alumni network."
        />
      </Helmet>
      <MarketplaceUi />
    </>
  );
}

export default Page;
