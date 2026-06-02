"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ArrowLeft,
  Copy,
  LogOut,
  Image as ImageIcon,
  Video,
  BarChart3,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Bookmark,
  Link2,
  Users,
  Sparkles,
  UserPlus,
  Info,
  Bell,
  Link,
  FlagIcon,
  SendHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCard } from "@/components/user-card";
import { useQuery } from "@tanstack/react-query";
import groupService from "@/lib/services/groupService";

const posts = [
  {
    id: 1,
    author: {
      name: "Adebisi Adeyemi",
      title: "Web Developer | Innovator | Brand Strategist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      time: "Today, 7:45PM",
    },
    content: `Billionaire investor Leon Cooperman warned on Monday market returns could be lackluster because this year's incredible comeback will likely rob returns from the future.

"The overall market, we've been pulling a lot of demand forward. I would expect that future returns will be ...more`,
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=300&fit=crop",
    likes: 57,
    comments: 12,
    likedBy: ["Tunde Onakoya", "57 others"],
  },
];

const suggestedGroups = [
  {
    id: 1,
    name: "Artificial Intelligence, Machine Learning, Data Science & Robotics",
    members: 4150,
    icon: "🤖",
  },
  {
    id: 2,
    name: "Artificial Intelligence, Machine Learning, Data Science & Robotics",
    members: 1061,
    icon: "🧠",
  },
  {
    id: 3,
    name: "Artificial Intelligence, Machine Learning, Data Science & Robotics",
    members: 1101,
    icon: "📊",
  },
  {
    id: 4,
    name: "Artificial Intelligence, Machine Learning, Data Science & Robotics",
    members: 1095,
    icon: "🔬",
  },
];

const admin = {
  name: "Bayu Salto",
  title:
    "Senior Data President at RismaAI Research Institute | Leadership, Management, Finance",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
};

export default function GroupDetailView({ params }) {
  const [postContent, setPostContent] = useState("");

  const { id } = React.use(params);
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["groups", id],
    queryFn: () => groupService.getGroupById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
  
  console.log("Group ID from params:", data);
  const group = {
    id: 1,
    name: "STP Alumni Network",
    members: 1250,
    isPublic: true,
    description: "Official community for STP program alumni worldwide",
    cover:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop",
  };

  const onBack = () => {
    // Implement navigation back to groups list
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {/* <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Groups
      </Button> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden relative w-full pt-0">
            {/* Cover Image - Full height and width */}
            <div className="relative  h-32 sm:h-40 w-full">
              <img
                src={group.cover}
                alt={group.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Gradient overlay at bottom for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Group Icon - Positioned between image and text region */}
              <div className="absolute -bottom-8 left-4 sm:left-6">
                <div className="relative">
                  {/* White background/border */}
                  <div className="w-12 h-12 sm:w-20 sm:h-20 bg-white rounded-xl p-1 shadow-xl">
                    {/* Group icon with gradient */}
                    <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="pt-2">
              {/* Action Icons */}
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="default"
                  size="icon"
                  className=" bg-transparent hover:bg-white backdrop-blur-sm"
                >
                  <HoverCard>
                    <HoverCardTrigger>
                      <Info className="h-5 w-5 text-stp-blue-light" />
                    </HoverCardTrigger>
                    <HoverCardContent>
                      Some information about this group goes here.
                    </HoverCardContent>
                  </HoverCard>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-5 w-5 text-stp-blue-light" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link className="h-4 w-4 mr-2" />
                      Copy link to group
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave this group
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FlagIcon className="h-4 w-4 mr-2" />
                      Report this group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-foreground">
                    {group.name}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {group.description}
                  </p>
                </div>

                {/* <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Copy className="h-3 w-3" />
                    Copy link
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                    <LogOut className="h-3 w-3" />
                    Leave this group
                  </Button>
                </div> */}
              </div>
            </CardContent>
          </Card>

          {/* Create Post Card */}
          <Card>
            <CardContent className="pt-4">
              <Textarea
                placeholder="Start a post in this group"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-15 resize-none border-0 p-0 focus-visible:ring-0 text-sm"
              />
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="bg-stp-blue-light hover:bg-primary/90 flex items-center"
                  disabled={!postContent.trim()}
                >
                  Submit Post
                  <SendHorizontal />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <Badge
              variant="default"
              className="bg-primary text-primary-foreground"
            >
              All
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Recommended
            </Badge>
          </div>

          {/* Posts can only made by members, it shouldnt even display if not a member */}
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-4">
                {/* Post Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={post.author.avatar}
                        alt={post.author.name}
                      />
                      <AvatarFallback>
                        {post.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-semibold">
                        {post.author.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {post.author.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.author.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      + Follow
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Bookmark className="h-4 w-4 mr-2" />
                          Save
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link2 className="h-4 w-4 mr-2" />
                          Copy link to post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-sm text-foreground mt-4 whitespace-pre-line">
                  {post.content}
                </p>

                {/* Post Image */}
                {post.image && (
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <img
                      src={post.image}
                      alt="Post attachment"
                      className="w-full h-48 sm:h-64 object-cover"
                    />
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                      {post.likedBy[0]} and {post.likedBy[1]}
                    </span>
                  </div>
                  <span>{post.comments} Comments</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                  >
                    <Heart className="h-4 w-4" />
                    Like
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Members Card */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-2xl font-bold text-foreground">
                {group.members.toLocaleString()} members
              </h3>
              <p className="text-lg text-muted-foreground mt-1">
                Including Goutam Dey and 24 others connections
              </p>
              <Button className="w-full mt-4 bg-stp-blue-light rounded-full hover:bg-primary/90">
                Show all
              </Button>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card>
            <CardContent className="pt-4">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                Admin
              </h4>

              <UserCard
                user={admin}
                avatarSize="sm"
                showTitle={true}
                className="items-center gap-2"
              />
            </CardContent>
          </Card>

          {/* Suggested Groups Card */}
          <Card>
            <CardContent className="pt-4">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                Groups you might be interested in
              </h4>
              <div className="space-y-3">
                {suggestedGroups.map((suggestedGroup) => (
                  <div
                    key={suggestedGroup.id}
                    className="flex items-start gap-3"
                  >
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                      {suggestedGroup.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-medium line-clamp-2">
                        {suggestedGroup.name}
                      </h5>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {suggestedGroup.members.toLocaleString()} members
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs mt-2 text-destructive border-destructive hover:bg-destructive/10"
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-primary hover:bg-primary/90">
                Show all
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
