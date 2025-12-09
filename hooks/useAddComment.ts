import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { Comment } from './usePhotos';

interface AddCommentData {
  photoId: string;
  content: string;
  authorName?: string;
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, content, authorName }: AddCommentData) => {
      const res = await fetch(`/api/photos/${photoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorName }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add comment');
      }

      return res.json();
    },
    onMutate: async ({ photoId, content, authorName }) => {
      await queryClient.cancelQueries({ queryKey: ['photos'] });

      const previousData = queryClient.getQueryData(['photos']);

      const optimisticComment: Comment = {
        id: 'temp-' + Date.now(),
        content,
        authorName: authorName || 'Anonymous',
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(['photos'], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((photo: any) =>
              photo.id === photoId
                ? {
                    ...photo,
                    comments: [optimisticComment, ...photo.comments].slice(0, 3),
                    _count: { comments: photo._count.comments + 1 },
                  }
                : photo
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['photos'], context.previousData);
      }
      message.error('Failed to add comment');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
}