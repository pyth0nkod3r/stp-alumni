"use client";
import { useMemo } from "react";
import Image from "next/image";
import { MapPin, Briefcase, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import networkService from "@/lib/services/networkService";
import { useAuth } from "@/lib/hooks/useUser";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";

export default function SuggestedConnections() {
  const queryClient = useQueryClient();
  const { data: profileData, isProfileLoading } = useAuth();
  
  // Extract user profile gracefully
  const currentUser = profileData?.data || profileData || {};
  const currentUserId = currentUser.userId || currentUser.id;
  const userLocation = currentUser.location;
  // Match the user's title, role, or sector for "Suggested by Role"
  const userRole = currentUser.title || currentUser.role || currentUser.sector;

  const { data: networkData, isLoading: isLoadingNetwork } = useQuery({
    queryKey: ["network", "suggestions"],
    queryFn: () => networkService.getNetwork(),
  });

  const { mutate: connectUser, isPending } = useMutation({
    mutationFn: (data) => networkService.connectToUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
      toast.success("Connection request sent!");
    },
    onError: () => {
      toast.error("Failed to send connection request");
    },
  });

  const { locationSuggestions, roleSuggestions } = useMemo(() => {
    if (!networkData) return { locationSuggestions: [], roleSuggestions: [] };
    
    const users = Array.isArray(networkData?.data) 
      ? networkData.data 
      : Array.isArray(networkData) 
        ? networkData 
        : [];

    const isConnectedOrSelf = (u) => {
      return (
        u.userId === currentUserId || 
        u.connectionStatus === 'ACCEPTED' || 
        u.connectionStatus === 'PENDING'
      );
    };

    // Filter out already connected, self, and pending
    const availableUsers = users.filter((u) => !isConnectedOrSelf(u));

    const byLocation = availableUsers.filter((u) => 
      userLocation && u.location && u.location.toLowerCase() === userLocation.toLowerCase()
    ).slice(0, 3);

    // Filter by role/title/sector
    const byRole = availableUsers.filter((u) => {
      if (!userRole) return false;
      const uRole = u.title || u.role || u.sector || "";
      
      // Parse sector if it's stored as JSON string
      let parsedURole = uRole;
      if (typeof uRole === 'string' && uRole.startsWith('[')) {
        try {
          const sectors = JSON.parse(uRole);
          parsedURole = sectors.join(', ');
        } catch (e) {
          // ignore
        }
      }
      
      let parsedUserRole = userRole;
      if (typeof userRole === 'string' && userRole.startsWith('[')) {
        try {
          const sectors = JSON.parse(userRole);
          parsedUserRole = sectors.join(', ');
        } catch (e) {
          // ignore
        }
      }

      // Check if they share any keyword or exact match
      return parsedURole && parsedUserRole && parsedURole.toLowerCase() === parsedUserRole.toLowerCase();
    }).slice(0, 3);

    // If exact match yields nothing, we could do a looser match, but exact is fine for now
    
    return {
      locationSuggestions: byLocation,
      roleSuggestions: byRole,
    };
  }, [networkData, currentUserId, userLocation, userRole]);

  if (isProfileLoading || isLoadingNetwork) {
    return (
      <div className="bg-white rounded-lg p-4 lg:p-6 mb-6">
        <h3 className="font-semibold text-[#233389] mb-4">Suggested Connections</h3>
        <div className="flex justify-center p-4">
          <Loader2 className="animate-spin h-6 w-6 text-[#233389]" />
        </div>
      </div>
    );
  }

  if (locationSuggestions.length === 0 && roleSuggestions.length === 0) {
    return null; // Don't show if no suggestions
  }

  const renderUser = (user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous";
    
    let formattedRole = user.title || user.role || user.sector || "Professional";
    if (typeof formattedRole === 'string' && formattedRole.startsWith('[')) {
      try {
        const sectors = JSON.parse(formattedRole);
        formattedRole = sectors.length > 0 ? sectors.join(', ') : "Professional";
      } catch (e) {
        // keep as is
      }
    }

    return (
      <div key={user.userId} className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
            {user.profileImagePath || user.profileImageUrl ? (
              <Image
                src={user.profileImagePath || user.profileImageUrl}
                alt={fullName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-gray-500 font-medium text-sm">{fullName.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0 pr-2">
            <Link
              href={`/dashboard/profile/${user.userId}`}
              className="hover:underline"
            >
              <p className="font-medium text-xs text-[#233389] truncate">
                {fullName}
              </p>
            </Link>
            <p className="text-xs text-gray-600 truncate">{formattedRole}</p>
            {user.location && (
              <p className="text-[10px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" /> {user.location}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 rounded-full shrink-0 border-[#233389] text-[#233389] hover:bg-[#233389] hover:text-white"
          onClick={() => connectUser({ userId: user.userId })}
          disabled={isPending}
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 lg:p-6 space-y-6">
      {locationSuggestions.length > 0 && (
        <div>
          <h3 className="font-semibold text-[#233389] mb-4">Suggested by Location</h3>
          <div className="space-y-1">
            {locationSuggestions.map(renderUser)}
          </div>
        </div>
      )}

      {roleSuggestions.length > 0 && (
        <div>
          <h3 className="font-semibold text-[#233389] mb-4">Suggested by Role</h3>
          <div className="space-y-1">
            {roleSuggestions.map(renderUser)}
          </div>
        </div>
      )}
    </div>
  );
}
