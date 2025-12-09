import { useInfiniteQuery } from '@tanstack/react-query';

export interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string;
  fileSize: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  _count: {
    comments: number;
  };
}

interface PhotosResponse {
  data: Photo[];
  pagination: {
    nextCursor: string | null;
    hasNextPage: boolean;
    limit: number;
  };
}

interface UsePhotosOptions {
  sortBy?: 'createdAt' | 'commentCount';
  order?: 'asc' | 'desc';
}

export function usePhotos(options: UsePhotosOptions = {}) {
  const { sortBy = 'createdAt', order = 'desc' } = options;

  return useInfiniteQuery<PhotosResponse>({
    queryKey: ['photos', sortBy, order],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        sortBy,
        order,
        limit: '12',
      });

      if (pageParam) {
        params.append('cursor', pageParam as string);
      }

      const res = await fetch(`/api/photos?${params}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch photos');
      }

      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
    initialPageParam: null,
  });
}