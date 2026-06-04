"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Users,
  Building2,
  TrendingUp,
} from "lucide-react";
import { Link } from "@/i18n/routing";

export const formatMySQLDate = (dateStr, formatStr = "MMM d, yyyy") => {
  if (!dateStr) return "";
  try {
    const parsed = new Date(dateStr.replace(" ", "T"));
    if (isNaN(parsed.getTime())) return "";
    return format(parsed, formatStr);
  } catch {
    return "";
  }
};

// 👤 People Card
export function PeopleResultCard({ person }) {
  return (
    <Link href={`/dashboard/profile/${person.user_id}`}>
      <div className="group flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-[#155DFC]/30 hover:shadow-md transition-all bg-white">
        <Avatar className="h-14 w-14 shrink-0">
          <AvatarImage
            src={person.profile_image_path}
            alt={`${person.first_name} ${person.last_name}`}
          />
          <AvatarFallback className="bg-[#155DFC]/10 text-[#155DFC] font-semibold">
            {person.first_name}
            {person.last_name}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 group-hover:text-[#155DFC] transition-colors">
            {person.first_name} {person.last_name}
          </h3>

          <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
            {person.title && (
              <>
                <Briefcase className="h-3.5 w-3.5" />
                <span className="truncate">{person.title}</span>
                {person.company && (
                  <>
                    <span>•</span>
                    <span className="truncate">{person.company}</span>
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
            {person.graduationYear && (
              <div className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Class of {person.graduationYear}</span>
              </div>
            )}
            {person.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{person.location}</span>
              </div>
            )}
          </div>

          {person.mutualConnections > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              {person.mutualConnections} mutual connection
              {person.mutualConnections !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <Button variant="outline" size="sm" className="shrink-0">
          Connect
        </Button>
      </div>
    </Link>
  );
}

// 📝 Post Card
export function PostResultCard({ post }) {
  return (
    <>
      <div className="group p-4 rounded-xl border border-slate-200 hover:border-[#155DFC]/30 hover:shadow-md transition-all bg-white">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={post.author?.profileImage}
              alt={post.author?.name}
            />
            <AvatarFallback className="bg-[#155DFC]/10 text-[#155DFC] text-sm">
              {post.author?.name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900 group-hover:text-[#155DFC] transition-colors">
              {post.author?.name}
            </p>
            <p className="text-xs text-slate-500">
              {/* {format(parseISO(post.createdAt), "MMM d, yyyy")} */}
              {formatMySQLDate(post.createdAt, "MMM d, yyyy")}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-700 line-clamp-3 mb-3">{post.body}</p>

        {post.image_urls && (
          <img
            src={post.image_urls[0]}
            alt="Post content"
            className="w-full h-48 object-cover rounded-lg mb-3"
          />
        )}

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            <span>{post.likes || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{post.comments || 0}</span>
          </div>
          <button className="flex items-center gap-1 hover:text-[#155DFC] transition-colors">
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </>
  );
}

// 📰 Newsfeed Card
export function NewsResultCard({ news }) {
  return (
    <Link href={`/dashboard/newsfeed/${news.postId}`}>
      <div className="group p-4 rounded-xl border border-slate-200 hover:border-[#155DFC]/30 hover:shadow-md transition-all bg-white">
        {news.coverImage && (
          <img
            src={news.coverImage}
            alt={news.title}
            className="w-full h-40 object-cover rounded-lg mb-3"
          />
        )}

        <Badge className="mb-2 bg-[#155DFC]/10 text-[#155DFC] hover:bg-[#155DFC]/20 border-0 text-xs">
          {news.category}
        </Badge>

        <h3 className="font-semibold text-slate-900 group-hover:text-[#155DFC] transition-colors line-clamp-2 mb-2">
          {news.title}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {news.excerpt || news.body}
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatMySQLDate(news.createdAt, "MMM d, yyyy")}</span>
        </div>
      </div>
    </Link>
  );
}

// 🎓 Event Card
export function EventResultCard({ event }) {
  return (
    <Link href={`/dashboard/events/${event.eventId}`}>
      <div className="group p-4 rounded-xl border border-slate-200 hover:border-[#155DFC]/30 hover:shadow-md transition-all bg-white">
        {event.cover_image_path && (
          <img
            src={event.cover_image_path}
            alt={event.name}
            className="w-full h-40 object-cover rounded-lg mb-3"
          />
        )}

        <h3 className="font-semibold text-slate-900 group-hover:text-[#155DFC] transition-colors line-clamp-2 mb-2">
          {event.name}
        </h3>

        <div className="space-y-1.5 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#155DFC]" />
            <span>
              {formatMySQLDate(event.start_time, "EEEE, MMM d, yyyy • h:mm a")}
            </span>
          </div>

          {event.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#155DFC]" />
              <span className="truncate">{event.address}</span>
            </div>
          )}

          {event.attendees > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#155DFC]" />
              <span>{event.attendees} attending</span>
            </div>
          )}
        </div>

        <Button variant="outline" size="sm" className="w-full mt-3">
          View Event
        </Button>
      </div>
    </Link>
  );
}

// 👥 Group Card
export function GroupResultCard({ group }) {
  return (
    <Link href={`/dashboard/groups/${group.group_id}`}>
      <div className="group p-4 rounded-xl border border-slate-200 hover:border-[#155DFC]/30 hover:shadow-md transition-all bg-white">
        {group.image && (
          <img
            src={group.image}
            alt={group.name}
            className="w-full h-32 object-cover rounded-lg mb-3"
          />
        )}

        <h3 className="font-semibold text-slate-900 group-hover:text-[#155DFC] transition-colors line-clamp-2 mb-2">
          {group.name}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {group.description}
        </p>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{group.member_count} members</span>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full mt-3">
          Join Group
        </Button>
      </div>
    </Link>
  );
}
