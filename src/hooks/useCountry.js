import { useQuery } from "@tanstack/react-query";


const FALLBACK_COUNTRIES = [
  { name: "Algeria", flag: "🇩🇿", emoji: "🇩🇿" },
  { name: "Angola", flag: "🇦🇴", emoji: "🇦🇴" },
  { name: "Benin", flag: "🇧🇯", emoji: "🇧🇯" },
  { name: "Botswana", flag: "🇧🇼", emoji: "🇧🇼" },
  { name: "Burkina Faso", flag: "🇧🇫", emoji: "🇧🇫" },
  { name: "Burundi", flag: "🇧🇮", emoji: "🇧🇮" },
  { name: "Cabo Verde", flag: "🇨🇻", emoji: "🇨🇻" },
  { name: "Cameroon", flag: "🇨🇲", emoji: "🇨🇲" },
  { name: "Central African Republic", flag: "🇨🇫", emoji: "🇨🇫" },
  { name: "Chad", flag: "🇹🇩", emoji: "🇹🇩" },
  { name: "Comoros", flag: "🇰🇲", emoji: "🇰🇲" },
  { name: "Congo (Brazzaville)", flag: "🇨🇬", emoji: "🇨🇬" },
  { name: "Congo (Kinshasa)", flag: "🇨🇩", emoji: "🇨🇩" },
  { name: "Côte d'Ivoire", flag: "🇨🇮", emoji: "🇨🇮" },
  { name: "Djibouti", flag: "🇩🇯", emoji: "🇩🇯" },
  { name: "Egypt", flag: "🇪🇬", emoji: "🇪🇬" },
  { name: "Equatorial Guinea", flag: "🇬🇶", emoji: "🇬🇶" },
  { name: "Eritrea", flag: "🇪🇷", emoji: "🇪🇷" },
  { name: "Eswatini", flag: "🇸🇿", emoji: "🇸🇿" },
  { name: "Ethiopia", flag: "🇪🇹", emoji: "🇪🇹" },
  { name: "Gabon", flag: "🇬🇦", emoji: "🇬🇦" },
  { name: "Gambia", flag: "🇬🇲", emoji: "🇬🇲" },
  { name: "Ghana", flag: "🇬🇭", emoji: "🇬🇭" },
  { name: "Guinea", flag: "🇬🇳", emoji: "🇬🇳" },
  { name: "Guinea-Bissau", flag: "🇬🇼", emoji: "🇬🇼" },
  { name: "Kenya", flag: "🇰🇪", emoji: "🇰🇪" },
  { name: "Lesotho", flag: "🇱🇸", emoji: "🇱🇸" },
  { name: "Liberia", flag: "🇱🇷", emoji: "🇱🇷" },
  { name: "Libya", flag: "🇱🇾", emoji: "🇱🇾" },
  { name: "Madagascar", flag: "🇲🇬", emoji: "🇲🇬" },
  { name: "Malawi", flag: "🇲🇼", emoji: "🇲🇼" },
  { name: "Mali", flag: "🇲🇱", emoji: "🇲🇱" },
  { name: "Mauritania", flag: "🇲🇷", emoji: "🇲🇷" },
  { name: "Mauritius", flag: "🇲🇺", emoji: "🇲🇺" },
  { name: "Morocco", flag: "🇲🇦", emoji: "🇲🇦" },
  { name: "Mozambique", flag: "🇲🇿", emoji: "🇲🇿" },
  { name: "Namibia", flag: "🇳🇦", emoji: "🇳🇦" },
  { name: "Niger", flag: "🇳🇪", emoji: "🇳🇪" },
  { name: "Nigeria", flag: "🇳🇬", emoji: "🇳🇬" },
  { name: "Rwanda", flag: "🇷🇼", emoji: "🇷🇼" },
  { name: "São Tomé and Príncipe", flag: "🇸🇹", emoji: "🇸🇹" },
  { name: "Senegal", flag: "🇸🇳", emoji: "🇸🇳" },
  { name: "Seychelles", flag: "🇸🇨", emoji: "🇸🇨" },
  { name: "Sierra Leone", flag: "🇸🇱", emoji: "🇸🇱" },
  { name: "Somalia", flag: "🇸🇴", emoji: "🇸🇴" },
  { name: "South Africa", flag: "🇿🇦", emoji: "🇿🇦" },
  { name: "South Sudan", flag: "🇸🇸", emoji: "🇸🇸" },
  { name: "Sudan", flag: "🇸🇩", emoji: "🇸🇩" },
  { name: "Tanzania", flag: "🇹🇿", emoji: "🇹🇿" },
  { name: "Togo", flag: "🇹🇬", emoji: "🇹🇬" },
  { name: "Tunisia", flag: "🇹🇳", emoji: "🇹🇳" },
  { name: "Uganda", flag: "🇺🇬", emoji: "🇺🇬" },
  { name: "Zambia", flag: "🇿🇲", emoji: "🇿🇲" },
  { name: "Zimbabwe", flag: "🇿🇼", emoji: "🇿🇼" },
];


// Fetch function with your API key
const fetchCountries = async () => {

  if (!process.env.NEXT_PUBLIC_COUNTRY_API) {
    console.log("API key not available");
    throw new Error("Missing API key");
  }
  try {
    const response = await fetch(
      'https://api.restcountries.com/countries/v5?region=Africa&limit=100',
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_COUNTRY_API}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );

    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if we got valid data
    if (!data || data.length === 0) {
      throw new Error("No data received from API");
    }

    return data?.data?.objects;
  } catch (error) {
    console.error("API fetch error:", error);
    throw error; // Let React Query handle the error
  }
};

const normalizeCountries = (data) => {
  if (!data || !Array.isArray(data)) {
    return FALLBACK_COUNTRIES;
  }

  return data.map((country) => ({
    name: country?.names?.common || country?.name || 'Unknown',
    flag: country?.flag?.emoji || country?.flag || '🏳️',
    emoji: country?.flag?.emoji || country?.emoji || '🏳️',
    // Optional: also get the flag URL if you need it
    flagUrl: country?.flag?.url_svg || country?.flag?.url_png || null,
  }));
};

// Custom hook
export const useCountries = () => {
  const query = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // If error, return fallback data
  return {
    ...query,
    data: query.isError ? FALLBACK_COUNTRIES : normalizeCountries(query.data),
    isFallback: query.isError,
  };
};
