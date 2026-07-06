


import PostCard from '@/components/posts/PostCard';
import PostSkeleton from '@/components/posts/PostSkeleton';
import { Button } from '@/components/ui/button';
import { useLikePost, useMyPosts } from '@/lib/hooks/usePosts';
import { FileText } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';

export default function MyPostsTab({ t }) {
  const { data: myPosts, isLoading, error, refetch } = useMyPosts();
  const { mutate: likePost } = useLikePost();

  const handleLike = (postId) => likePost(postId);
  const handleCopyLink = () => toast.success("Link copied!");

  console.log(myPosts,"myPosts");
  

  if (isLoading) return <div className="space-y-6"><PostSkeleton /><PostSkeleton /></div>;

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 text-center">
        <p className="text-red-600 mb-4">{t("myPostsError")}</p>
        <Button onClick={() => refetch()} className="bg-[#233389] hover:bg-[#1d2a6e] text-white">{t("tryAgain")}</Button>
      </div>
    );
  }

  if (!myPosts || myPosts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">{t("noMyPosts")}</p>
        <p className="text-sm text-gray-400">{t("noMyPostsHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">{t("myPostsCount", { count: myPosts.length })}</p>
      {myPosts.map((post, index) => (
        <PostCard key={post.id || index} post={post} onLike={handleLike} onCopyLink={handleCopyLink} />
      ))}
    </div>
  );
}