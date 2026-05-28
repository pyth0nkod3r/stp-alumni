// import { redirect } from "next/navigation";
// import { getLocale } from "next-intl/server";

// export default async function NetworkEntryPage() {
//   const locale = await getLocale();

//   // Hard-coding the redirect path with the locale
//   // prevents the "undefined" error caused by the library's internal resolver
//   redirect(`/${locale}/dashboard/network/connections`);
// }

"use client";
// remeber to lazy load renderContent componets
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import networkService from "@/lib/services/networkService";
import useNetworkStore from "@/lib/store/useNetworkStore";
import { InvitationsList } from "./(components)/InvitationsList";
import { ConnectionsContent } from "./(components)/ConnectionsContent";
import { NetworkSearch } from "./(components)/NetworkSearch";
import { PeopleConnection } from "./(components)/PeopleConnection";
import ConnectedUser from "./(components)/ConnectedUser";
import ConnectionSkeleton from "./(components)/ConnectionSkeleton";
import { useSearchParams } from "next/navigation";
// import { PeopleSuggestions } from "./(components)/PeopleSuggestions";
// import { PeopleConnection } from "./(components)/PeopleConnection";

const Page = () => {
  const { setNetworkData, setLoading, setError } = useNetworkStore();
   const searchParams = useSearchParams();
    const active = searchParams.get("active");

  const [search, setSearch] = useState("");
  const [activeSector, setActiveSector] = useState("all");
  const [activeTab, setActiveTab] = useState(active || "mine");

  // Fetch all custom lists (networkUsers, sameSkillUsers, sameSectorUsers, connections)
  const {
    data: networkPayload,
    isLoading: isNetworkLoading,
    error: networkError,
  } = useQuery({
    queryKey: ["network"],
    queryFn: () => networkService.getNetwork(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: invitationsData, isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: networkService.getIncomingRequests,
  });

  // Sync React Query state to Zustand
  useEffect(() => {
    setLoading(isNetworkLoading);
    if (networkError) setError(networkError);

    if (networkPayload?.data) {
      setNetworkData(networkPayload?.data);
    }
  }, [
    networkPayload,
    isNetworkLoading,
    networkError,
    setNetworkData,
    setLoading,
    setError,
  ]);

  const network = networkPayload?.data;
  const invitations = invitationsData?.data;

  const connections = useMemo(() => {
    return network?.filter((user) => user.connectionStatus === "ACCEPTED");
  }, [network]);

  const suggestions =
    useMemo(() => {
      return network?.filter(
        (user) =>
          user.connectionStatus === null || user.connectionStatus === "PENDING",
      );
    }, [network]) || [];

  const fillteredData = useMemo(() => {
    const data = activeTab === "network" ? network : invitations;

    return data?.filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase());

      const matchesSector =
        activeSector === "all" || user.sector.includes(activeSector);

      return matchesSearch && matchesSector;
    });
  }, [network, invitations, search, activeTab, activeSector]);

  const uniqueSectors = [
    ...new Set(network?.flatMap((item) => item.sector || [])),
  ];

  console.log("network payload:", network);
  console.log("connections:", connections);

  return (
    <>
      <NetworkSearch search={search} setSearch={setSearch} />

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList variant="line" className="">
          <TabsTrigger value="mine" onClick={() => setActiveTab("mine")}>
            My Networks
          </TabsTrigger>
          <TabsTrigger value="explore" onClick={() => setActiveTab("explore")}>
            Explore
          </TabsTrigger>
          <TabsTrigger
            value="invitation"
            onClick={() => setActiveTab("invitation")}
          >
            Invitation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explore">
          <>
            <ConnectionsContent
              displayList={suggestions}
              activeSector={activeSector}
              uniqueSectors={uniqueSectors}
              setActiveSector={setActiveSector}
              isNetworkLoading={isNetworkLoading}
            />
          </>
        </TabsContent>

        <TabsContent value="mine">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">
                My Nework ({connections?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {isNetworkLoading ? (
                <>
                <ConnectionSkeleton />
                <ConnectionSkeleton />
                <ConnectionSkeleton />
                </>
              ) : connections?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No accepted connection
                </p>
              ) : (
                connections?.map((connection, index) => (
                  <ConnectedUser
                    key={connection.userId}
                    connection={connection}
                    index={index}
                    connectionTotal={connections.length}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invitation">
          <InvitationsList invitations={invitations} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
      {/* <PeopleSuggestions />
      <PeopleConnection /> */}
    </>
  );
};

export default Page;
