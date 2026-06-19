"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import networkService from "@/lib/services/networkService";
import useNetworkStore from "@/lib/store/useNetworkStore";
import { InvitationsList } from "./(components)/InvitationsList";
import { ConnectionsContent } from "./(components)/ConnectionsContent";
import { NetworkSearch } from "./(components)/NetworkSearch";
import ConnectedUser from "./(components)/ConnectedUser";
import ConnectionSkeleton from "./(components)/ConnectionSkeleton";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const { setNetworkData, setLoading, setError } = useNetworkStore();
  const searchParams = useSearchParams();
  const active = searchParams.get("active");

  const [search, setSearch] = useState("");
  const [activeSector, setActiveSector] = useState("all");
  const [activeTab, setActiveTab] = useState(active || "mine");

  const {
    data: networkPayload,
    isLoading: isNetworkLoading,
    error: networkError,
  } = useQuery({
    queryKey: ["network", "list"],
    queryFn: () => networkService.getNetwork(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: invitationsData, isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: networkService.getIncomingRequests,
  });

  useEffect(() => {
    setLoading(isNetworkLoading);
    if (networkError) setError(networkError);
    if (networkPayload?.data) setNetworkData(networkPayload.data);
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

  // 1. Core dataset divisions based on API status values
  const connections = useMemo(() => {
    return (
      network?.filter((user) => user.connectionStatus === "ACCEPTED") || []
    );
  }, [network]);

  const suggestions = useMemo(() => {
    return (
      network?.filter(
        (user) =>
          user.connectionStatus === null || user.connectionStatus === "PENDING",
      ) || []
    );
  }, [network]);

  // 2. Select the base array depending on which tab is active, then apply global filter matching
  const filteredData = useMemo(() => {
    let baseData = [];
    if (activeTab === "mine") baseData = connections;
    else if (activeTab === "explore") baseData = suggestions;
    else if (activeTab === "invitation") baseData = invitations || [];

    if (activeTab === "explore") {
      return baseData.filter((user) => {
        const matchesSearch =
          !search.trim() ||
          user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(search.toLowerCase());

        const matchesSector =
          activeSector === "all" ||
          (user.sector && user.sector.includes(activeSector));

        return matchesSearch && matchesSector;
      });
    }
    return baseData.filter((user) => {
      const matchesSearch =
        !search.trim() ||
        user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(search.toLowerCase());

      return matchesSearch;
    });
  }, [connections, suggestions, invitations, search, activeTab, activeSector]);

  const uniqueSectors = useMemo(() => {
    return [...new Set(network?.flatMap((item) => item.sector || []) || [])];
  }, [network]);

  return (
    <>
      <NetworkSearch search={search} setSearch={setSearch} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList variant="line">
          <TabsTrigger value="mine">My Networks</TabsTrigger>
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="invitation">Invitation</TabsTrigger>
        </TabsList>

        {/* Explore Tab content using filtered result */}
        <TabsContent value="explore">
          <ConnectionsContent
            displayList={filteredData}
            activeSector={activeSector}
            uniqueSectors={uniqueSectors}
            setActiveSector={setActiveSector}
            isNetworkLoading={isNetworkLoading}
          />
        </TabsContent>

        {/* My Network Tab content using filtered result */}
        <TabsContent value="mine">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">
                My Network ({filteredData.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {isNetworkLoading ? (
                <>
                  <ConnectionSkeleton />
                  <ConnectionSkeleton />
                  <ConnectionSkeleton />
                </>
              ) : filteredData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {search
                    ? "No matching connections found"
                    : "No accepted connection"}
                </p>
              ) : (
                filteredData.map((connection, index) => (
                  <ConnectedUser
                    key={connection.userId}
                    connection={connection}
                    index={index}
                    connectionTotal={filteredData.length}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invitation Tab content using filtered result */}
        <TabsContent value="invitation">
          <InvitationsList invitations={filteredData} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Page;
