import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import postService from '../services/postService';
import usePostStore from '../store/usePostStore';
import { toast } from 'sonner';

/**
 * Normalize a post from the API shape to the shape our components expect.
 * API shapes vary between endpoints:
 *   GET /posts       → imagePaths is an array of full URLs
 *   GET /posts/mine  → imagePaths is a JSON *string* with relative paths
 */
function normalizePost(post) {
  if (post._normalized) return post;

  // ✅ Parse imageUrls/imagePaths — could be an array, a JSON string, or undefined
  let images = post.imageUrls ?? post.imagePaths ?? post.images ?? [];
  if (typeof images === 'string') {
    try { images = JSON.parse(images); } catch { images = []; }
  }
  if (!Array.isArray(images)) images = [];

  // Ensure each image path is a full URL (backend already returns full URLs)
  images = images
    .filter(Boolean)
    .map((img) => img.startsWith('http') ? img : `https://app.gfa-tech.com/stp/${img}`);

  // ✅ Build author object from backend fields
  const author = {
    id: post.authorId || post.user_id,
    name: `${post.firstName || ''} ${post.lastName || ''}`.trim() || post.authorName || 'Unknown',
    firstName: post.firstName,
    lastName: post.lastName,
    profileImagePath: post.profileImagePath,
    title: post.authorTitle || post.title,
    companyName: post.companyName,
  };

  return {
    ...post,
    _normalized: true,
    id: post.postId || post.id || post.post_id,
    images, // ✅ Now populated from imageUrls
    author, // ✅ Properly mapped author
    createdAt: post.createdAt || post.created_at,
    likes: {
      count: post.likeCount || parseInt(post.likes, 10) || 0,
      isLiked: post.hasUserLiked || !!post.hasLiked,
    },
    comments: {
      count: post.commentCount || parseInt(post.comments, 10) || 0,
    },
  };
}
/**
 * Hook to fetch all posts for the feed
 */
export const usePostsFeed = () => {
  const setPosts = usePostStore((state) => state.setPosts);

  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const data = await postService.getPosts();
      const raw = Array.isArray(data) ? data : data?.data || [];
      console.log(raw,"raw")
      const posts = raw.map(normalizePost);
      setPosts(posts);
      return posts;
    },
    staleTime: 30 * 1000, // 30 seconds
    onError: (error) => {
      toast.error('Failed to load posts');
      console.error('Error fetching posts:', error);
    },
  });
};

/**
 * Hook to fetch user's own posts
 */
export const useMyPosts = () => {
  const setMyPosts = usePostStore((state) => state.setMyPosts);

  return useQuery({
    queryKey: ['myPosts'],
    queryFn: async () => {
      const data = await postService.getMyPosts();
      const raw = Array.isArray(data) ? data : data?.data || [];
      const posts = raw.map(normalizePost);
      setMyPosts(posts);
      return posts;
    },
    staleTime: 30 * 1000,
    onError: (error) => {
      toast.error('Failed to load your posts');
      console.error('Error fetching my posts:', error);
    },
  });
};

/**
 * Hook to create a new post
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const addPost = usePostStore((state) => state.addPost);

  return useMutation({
    mutationFn: postService.createPost,
    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['posts']);

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update with temporary post
      const tempPost = {
        id: `temp-${Date.now()}`,
        _normalized: true,
        body: newPost.body,
        author: {
          name: 'You',
          // Will be replaced with actual user data
        },
        createdAt: new Date().toISOString(),
        likes: { count: 0, isLiked: false, users: [] },
        comments: { count: 0 },
        images: newPost.images?.map((img) => URL.createObjectURL(img)) || [],
        isOptimistic: true,
      };

      addPost(tempPost);

      return { previousPosts, tempPost };
    },
    onSuccess: (data, variables, context) => {
      toast.success('Post created successfully!');
      // Invalidate and refetch
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['myPosts']);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      toast.error('Failed to create post. Please try again.');
      console.error('Error creating post:', error);
    },
  });
};

/**
 * Hook to like/unlike a post
 */
export const useLikePost = (userId) => {
  const queryClient = useQueryClient();
  const toggleLike = usePostStore((state) => state.toggleLike);

  return useMutation({
    mutationFn: postService.likePost,
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['posts']);

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update
      // Note: We need userId from auth store
      toggleLike(postId, userId); // TODO: Get actual user ID

      return { previousPosts };
    },
    onError: (error, postId, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      toast.error('Failed to update like');
      console.error('Error liking post:', error);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries(['posts']);
    },
  });
};

/**
 * Hook to comment on a post
 */
export const useCommentPost = () => {
  const queryClient = useQueryClient();
  const addComment = usePostStore((state) => state.addComment);

  return useMutation({
    mutationFn: ({ postId, comment }) =>
      postService.commentOnPost(postId, comment),
    onMutate: async ({ postId, comment }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['posts']);

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update comment count
      addComment(postId, comment);

      return { previousPosts };
    },
    onSuccess: (data, variables) => {
      toast.success('Comment added!');
      // Invalidate comments for this post
      queryClient.invalidateQueries(['postComments', variables.postId]);
      queryClient.invalidateQueries(['posts']);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      toast.error('Failed to add comment');
      console.error('Error commenting on post:', error);
    },
  });
};

/**
 * Hook to fetch comments for a specific post
 */
export const usePostComments = (postId) => {
  return useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => postService.getPostComments(postId),
    enabled: !!postId, // Only run if postId is provided
    staleTime: 30 * 1000,
    onError: (error) => {
      toast.error('Failed to load comments');
      console.error('Error fetching comments:', error);
    },
  });
};
