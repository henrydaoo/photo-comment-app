'use client';

import { useEffect } from 'react';
import { Spin, Empty, Alert, Row, Col } from 'antd';
import { useInView } from 'react-intersection-observer';
import { usePhotos } from '@/hooks/usePhotos';
import PhotoCard from './PhotoCard';

export default function PhotoGallery() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = usePhotos();

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" tip="Loading photos...">
          <div className="h-20" />
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description="Failed to load photos. Please try again later."
        type="error"
        showIcon
      />
    );
  }

  const photos = data?.pages.flatMap((page) => page.data) ?? [];

  if (photos.length === 0) {
    return (
      <Empty
        description="No photos yet. Upload your first photo!"
        className="py-20"
      />
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        {photos.map((photo) => (
          <Col 
            key={photo.id} 
            xs={24} 
            sm={24} 
            md={12} 
            lg={8} 
            xl={6}
          >
            <PhotoCard photo={photo} />
          </Col>
        ))}
      </Row>

      <div ref={ref} className="flex justify-center py-8">
        {isFetchingNextPage && (
          <Spin tip="Loading more photos...">
            <div className="h-10" />
          </Spin>
        )}
        {!hasNextPage && photos.length > 0 && (
          <p className="text-gray-400 text-sm">No more photos to load</p>
        )}
      </div>
    </div>
  );
}