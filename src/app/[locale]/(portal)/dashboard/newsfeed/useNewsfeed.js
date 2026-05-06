
import api from "@/lib/api/axios";
// import { useQuery } from "@tanstack/react-query";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


const postService = {

    getPostById: async (postId) => {
        const response = await api.get(`/newsfeed/${postId}`);
        return response.data;
    },

    getPostComments: async (postId, page = 1) => {
        const response = await api.get(`/newsfeed/${postId}/comments?page=${page}`);

        return response.data;
    },

    // 👇 USER ACTIONS

    toggleLike: async (postId) => {
        const response = await api.post(`/newsfeed/${postId}/like`);
        return response.data;
    },

    addComment: async (postId, body) => {
        const response = await api.post(`/newsfeed/${postId}/comment`, { comment:body });
        return response.data;
    },

    toggleSave: async (postId) => {
        const response = await api.post(`/newsfeed/${postId}/save`);
        return response.data;
    },
};


export const usePost = (id) =>
    useQuery({
        queryKey: ["newsfeed", id],
        queryFn: () => postService.getPostById(id),
        enabled: !!id,
    });

export const usePostComments = (postId, page = 1) =>
    useQuery({
        queryKey: ["newsfeed-comment", postId, page],
        queryFn: () => postService.getPostComments(postId, page),
        enabled: !!postId,
    });



export const useToggleLike = (postId) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => postService.toggleLike(postId),
        onMutate: async () => {
            await qc.cancelQueries({ queryKey: ["newsfeed", postId] });
            const prev = qc.getQueryData(["newsfeed", postId]);
            qc.setQueryData(["newsfeed", postId], (old) => ({
                ...old,
                data: {
                    ...old?.data,
                    likeCount: (old?.data?.likeCount || 0) + (old?.data?.hasUserLiked ? -1 : 1),
                    hasUserLiked: !old?.data?.hasUserLiked,
                },
            }));
            return { prev };
        },
        onError: (_, __, ctx) => {
            if (ctx?.prev) qc.setQueryData(["newsfeed", postId], ctx.prev);
        },
    });
};

export const useAddComment = (postId) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body) => postService.addComment(postId, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["newsfeed-comment", postId] });
            qc.invalidateQueries({ queryKey: ["newsfeed", postId] });
        },
    });
};

export const useToggleSave = (postId) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => postService.toggleSave(postId),
        onMutate: async () => {
            await qc.cancelQueries({ queryKey: ["newsfeed", postId] });
            const prev = qc.getQueryData(["newsfeed", postId]);
            qc.setQueryData(["newsfeed", postId], (old) => ({
                ...old,
                data: { ...old?.data, isSaved: !old?.data?.isSaved },
            }));
            return { prev };
        },
        onError: (_, __, ctx) => {
            if (ctx?.prev) qc.setQueryData(["newsfeed", postId], ctx.prev);
        },
    });
};