import { useQuery } from "@tanstack/react-query";


const FALLBACK_COUNTRIES = [
  { name: "Benin", flag: "🇧🇯", emoji: "🇧🇯" },
  { name: "Cameroon", flag: "🇨🇲", emoji: "🇨🇲" },
  { name: "Canada", flag: "🇨🇦", emoji: "🇨🇦" },
  { name: "Côte d'Ivoire", flag: "🇨🇮", emoji: "🇨🇮" },
  { name: "France", flag: "🇫🇷", emoji: "🇫🇷" },
  { name: "Gabon", flag: "🇬🇦", emoji: "🇬🇦" },
  { name: "Germany", flag: "🇩🇪", emoji: "🇩🇪" },
  { name: "Ghana", flag: "🇬🇭", emoji: "🇬🇭" },
  { name: "Kenya", flag: "🇰🇪", emoji: "🇰🇪" },
  { name: "Nigeria", flag: "🇳🇬", emoji: "🇳🇬" },
  { name: "Rwanda", flag: "🇷🇼", emoji: "🇷🇼" },
  { name: "Senegal", flag: "🇸🇳", emoji: "🇸🇳" },
  { name: "South Africa", flag: "🇿🇦", emoji: "🇿🇦" },
  { name: "Togo", flag: "🇹🇬", emoji: "🇹🇬" },
  { name: "United Kingdom", flag: "🇬🇧", emoji: "🇬🇧" },
  { name: "United States", flag: "🇺🇸", emoji: "🇺🇸" },
];


// Fetch function with your API key
const fetchCountries = async () => {
  try {
    const response = await fetch(
      'https://api.restcountries.com/countries/v5?region=Africa&limit=100',
      {
        headers: {
          Authorization: `Bearer ${process.env.COUNTRY_API}`,
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
