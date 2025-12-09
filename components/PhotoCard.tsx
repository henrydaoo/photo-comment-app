'use client';

import { Card, Avatar, Typography, Space, Divider } from 'antd';
import { MessageOutlined, UserOutlined } from '@ant-design/icons';
import Image from 'next/image';
import type { Photo } from '@/hooks/usePhotos';
import CommentSection from './CommentSection';
import { useState } from 'react';

const { Text, Paragraph } = Typography;

interface PhotoCardProps {
  photo: Photo;
}

export default function PhotoCard({ photo }: PhotoCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card
      hoverable
      className="h-full overflow-hidden"
      styles={{
        body: { padding: 0 },
      }}
      cover={
        <div className="relative w-full h-64 bg-gray-100">
          {!imageError ? (
            <Image
              src={photo.thumbnailUrl}
              alt={photo.title || 'Photo'}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Failed to load image
            </div>
          )}
        </div>
      }
    >
      <div className="p-4">
        <Space direction="vertical" size="small" className="w-full mb-3">
          {photo.title && (
            <Text strong className="text-lg">
              {photo.title}
            </Text>
          )}
          {photo.description && (
            <Paragraph
              ellipsis={{ rows: 2, expandable: true }}
              className="text-gray-600 mb-0"
            >
              {photo.description}
            </Paragraph>
          )}
        </Space>

        <Space split={<Divider type="vertical" />} size="small" className="mb-3 text-xs text-gray-500">
          <span>{formatDate(photo.createdAt)}</span>
          <span>{formatFileSize(photo.fileSize)}</span>
          {photo.width && photo.height && (
            <span>
              {photo.width} × {photo.height}
            </span>
          )}
        </Space>

        <div className="flex items-center gap-1 mb-3 text-gray-600">
          <MessageOutlined />
          <Text type="secondary">
            {photo._count.comments} {photo._count.comments === 1 ? 'comment' : 'comments'}
          </Text>
        </div>

        <Divider className="my-3" />

        <CommentSection photo={photo} />
      </div>
    </Card>
  );
}