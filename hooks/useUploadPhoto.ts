import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

interface UploadPhotoData {
  file: File;
  title?: string;
  description?: string;
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadPhotoData) => {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);

      const res = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to upload photo');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      message.success('Photo uploaded successfully!');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to upload photo');
    },
  });
}