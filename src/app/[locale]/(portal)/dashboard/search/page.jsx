"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Newspaper,
  Calendar,
  Hash,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  PeopleResultCard,
  PostResultCard,
  NewsResultCard,
  EventResultCard,
  GroupResultCard,
} from "./ResultCards";
import { useInfiniteSearch, useRecentSearches } from "./useSearch";
import { useSearchParams } from "next/navigation";
import { useNavbar } from "@/contexts/NavbarContext";

const searchTypes = [
  { key: "all", label: "All", icon: Search },
  { key: "people", label: "People", icon: Users },
  { key: "posts", label: "Posts", icon: FileText },
  { key: "newsfeed", label: "News", icon: Newspaper },
  { key: "events", label: "Events", icon: Calendar },
  { key: "groups", label: "Groups", icon: Hash },
];

export default function SearchPage() {
  const t = useTranslations("Search");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState("all");
  //   const [recentSearches, setRecentSearches] = useState([]);

  const { recent, addSearch, removeSearch, clearSearches } =
    useRecentSearches(5);
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    resetSearch,
  } = useInfiniteSearch(query, activeTab, 20);

  console.log(data,"data")

  const {
    userSize: { height },
  } = useNavbar();

  const observerRef = useRef();
  const lastResultRef = useRef();
  const searchInputRef = useRef(null);

  // Load recent searches on mount
  //   useEffect(() => {
  //     setRecentSearches(recent);
  //   }, [recent]);

  useEffect(() => {
    // Check if we came from Cmd+K shortcut
    if (sessionStorage.getItem("focusSearch") === "true") {
      sessionStorage.removeItem("focusSearch");
      // Small delay to ensure input is rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, []);

  // Update URL when query changes
  //   useEffect(() => {
  //     const params = new URLSearchParams(searchParams);
  //     if (query) {
  //       params.set("q", query);
  //     } else {
  //       params.delete("q");
  //     }
  //     router.push(`/dashboard/search?${params.toString()}`, { scroll: false });
  //   }, [query, searchParams, router]);
  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    if (currentQ === query) return; // already in sync, bail

    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    router.push(`/dashboard/search?${params.toString()}`, { scroll: false });
  }, [query, searchParams, router]);

  // Add to recent searches when query has results
  //   useEffect(() => {
  //     if (query && data && !isLoading && data.counts && Object.values(data.counts).some(c => c > 0)) {
  //       addSearch(query);
  //     }
  //   }, [query, data, isLoading, addSearch]);
  const lastAddedRef = useRef(null);

  useEffect(() => {
    if (
      query &&
      data &&
      !isLoading &&
      data.counts &&
      Object.values(data.counts).some((c) => c > 0) &&
      lastAddedRef.current !== query // ← guard
    ) {
      lastAddedRef.current = query;
      addSearch(query);
    }
  }, [query, data, isLoading, addSearch]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    if (lastResultRef.current) {
      observerRef.current.observe(lastResultRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    resetSearch();
  };

  const clearSearch = () => {
    setQuery("");
    resetSearch();
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    resetSearch();
  };

  // const getCount = (type) => {
  //   if (!data?.counts) return 0;
  //   if (type === "all") {
  //     return Object.values(data.counts).reduce((sum, count) => sum + count, 0);
  //   }
  //   return data.counts[type] || 0;
  // };
  const getCount = (type) => {
  if (!data?.data) return 0;
  
  // ✅ If backend provides counts, use them
  if (data?.counts) {
    if (type === "all") {
      return Object.values(data.counts).reduce((sum, count) => sum + count, 0);
    }
    return data.counts[type] || 0;
  }
  
  // ✅ Fallback: calculate from actual data arrays
  if (type === "all") {
    return Object.values(data.data).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  }
  return data.data[type]?.length || 0;
};

  const renderResults = () => {
    if (!data?.data) return null;

    if (activeTab === "all") {
      const sections = [];

      // People
      if (data.data.people?.length > 0) {
        sections.push(
          <div key="people" className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#155DFC]" />
                {t("people")} ({data.counts?.people || data.data.people.length })
              </h2>
            </div>
            <div className="space-y-3">
              {data.data.people.map((person, idx) => (
                <div
                  key={person.userId || idx}
                  ref={
                    idx === data.data.people.length - 1 ? lastResultRef : null
                  }
                >
                  <PeopleResultCard person={person} />
                </div>
              ))}
            </div>
          </div>,
        );
      }

      // Posts
      if (data.data.posts?.length > 0) {
        sections.push(
          <div key="posts" className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#155DFC]" />
                {t("posts")} ({data.counts?.posts || data.data.posts.length })
              </h2>
            </div>
            <div className="space-y-3">
              {data.data.posts.map((post, idx) => (
                <div
                  key={post.postId || idx}
                  ref={
                    idx === data.data.posts.length - 1 ? lastResultRef : null
                  }
                >
                  <PostResultCard post={post} />
                </div>
              ))}
            </div>
          </div>,
        );
      }

      // News
      if (data.data.newsfeed?.length > 0) {
        sections.push(
          <div key="newsfeed" className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-[#155DFC]" />
                {t("news")} ({data.counts?.newsfeed || data.data.newsfeed.length })
              </h2>
            </div>
            <div className="space-y-3">
              {data.data.newsfeed.map((news, idx) => (
                <div
                  key={news.postId || idx}
                  ref={
                    idx === data.data.newsfeed.length - 1 ? lastResultRef : null
                  }
                >
                  <NewsResultCard news={news} />
                </div>
              ))}
            </div>
          </div>,
        );
      }

      // Events
      if (data.data.events?.length > 0) {
        sections.push(
          <div key="events" className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#155DFC]" />
                {t("events")} ({data.counts?.events || data.data.events.length })
              </h2>
            </div>
            <div className="space-y-3">
              {data.data.events.map((event, idx) => (
                <div
                  key={event.eventId || idx}
                  ref={
                    idx === data.data.events.length - 1 ? lastResultRef : null
                  }
                >
                  <EventResultCard event={event} />
                </div>
              ))}
            </div>
          </div>,
        );
      }

      // Groups
      if (data.data.groups?.length > 0) {
        sections.push(
          <div key="groups" className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Hash className="h-5 w-5 text-[#155DFC]" />
                {t("groups")} ({data.counts?.groups || data.data.groups.length })
              </h2>
            </div>
            <div className="space-y-3">
              {data.data.groups.map((group, idx) => (
                <div
                  key={group.groupId || idx}
                  ref={
                    idx === data.data.groups.length - 1 ? lastResultRef : null
                  }
                >
                  <GroupResultCard group={group} />
                </div>
              ))}
            </div>
          </div>,
        );
      }

      return sections.length > 0 ? sections : null;
    }

    // Single type view
    const items = data.data[activeTab] || [];
    const renderCard = (item, idx) => {
      const props = {
        key: item[Object.keys(item)[0]] || idx,
        ref: idx === items.length - 1 ? lastResultRef : null,
      };

      switch (activeTab) {
        case "people":
          return <PeopleResultCard person={item} {...props} />;
        case "posts":
          return <PostResultCard post={item} {...props} />;
        case "newsfeed":
          return <NewsResultCard news={item} {...props} />;
        case "events":
          return <EventResultCard event={item} {...props} />;
        case "groups":
          return <GroupResultCard group={item} {...props} />;
        default:
          return null;
      }
    };

    return <div className="space-y-3">{items.map(renderCard)}</div>;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Search Header */}
      <div
        className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm"
        style={{ top: height }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("placeholder")}
              className="w-full pl-12 pr-12 h-12 text-base bg-slate-50 border-slate-200 focus:bg-white rounded-xl"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </form>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {searchTypes.map((type) => {
              const Icon = type.icon;
              const count = getCount(type.key);
              return (
                <button
                  key={type.key}
                  onClick={() => handleTabChange(type.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === type.key
                      ? "bg-[#155DFC] text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t(type.key)}
                  {count > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-white/20 text-inherit"
                    >
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* No query state */}
        {!query && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <Search className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {t("startSearching")}
            </h2>
            <p className="text-slate-600 mb-8">{t("searchHint")}</p>

            {/* Recent Searches */}
            {recent.length > 0 && (
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t("recentSearches")}
                  </h3>
                  <button
                    onClick={() => {
                      //   localStorage.removeItem("recentSearches");
                      //   setRecentSearches([]);
                      clearSearches();
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    {t("clearHistory")}
                  </button>
                </div>
                <div className="space-y-2">
                  {recent.map((search, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-[#155DFC]/30 transition-colors group"
                    >
                      <button
                        onClick={() => setQuery(search)}
                        className="flex items-center gap-3 text-left flex-1"
                      >
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">{search}</span>
                      </button>
                      <button
                        onClick={() => removeSearch(search)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition-all"
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200 bg-white animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {t("searchError")}
            </h3>
            <p className="text-slate-600 mb-4">{error.message}</p>
            <Button onClick={() => resetSearch()} variant="outline">
              {t("tryAgain")}
            </Button>
          </div>
        )}

        {/* Results */}
        {!isLoading && query && data && (
          <>
            {getCount(activeTab) === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {t("noResults")}
                </h3>
                <p className="text-slate-600">
                  {t("noResultsHint", { query, type: t(activeTab) })}
                </p>
              </div>
            ) : (
              <>
                {renderResults()}

                {/* Infinite Scroll Loader */}
                {isFetchingNextPage && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#155DFC]" />
                  </div>
                )}

                {/* Sentinel for infinite scroll */}
                <div ref={lastResultRef} className="h-10" />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
