'use client';

import { useState } from 'react';
import { Input, Button, Space, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { Photo } from '@/hooks/usePhotos';
import { useAddComment } from '@/hooks/useAddComment';

const { TextArea } = Input;
const { Text } = Typography;

interface CommentSectionProps {
  photo: Photo;
}

export default function CommentSection({ photo }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const addCommentMutation = useAddComment();

  const handleSubmit = () => {
    if (!commentText.trim()) return;

    addCommentMutation.mutate(
      {
        photoId: photo.id,
        content: commentText.trim(),
        authorName: authorName.trim() || undefined,
      },
      {
        onSuccess: () => {
          setCommentText('');
        },
      }
    );
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return commentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      {photo.comments.length > 0 && (
        <div className="mb-4">
          <Text type="secondary" className="text-xs mb-2 block">
            Recent Comments:
          </Text>
          {photo.comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 mb-3">
              <Avatar size="small" icon={<UserOutlined />} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Text strong className="text-sm">
                    {comment.authorName}
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {formatTimeAgo(comment.createdAt)}
                  </Text>
                </div>
                <Text className="text-sm break-words">{comment.content}</Text>
              </div>
            </div>
          ))}
          {photo._count.comments > 3 && (
            <Text type="secondary" className="text-xs">
              + {photo._count.comments - 3} more comments
            </Text>
          )}
        </div>
      )}

      <Space direction="vertical" size="small" className="w-full">
        <Input
          placeholder="Your name (optional)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          disabled={addCommentMutation.isPending}
          size="small"
        />
        <TextArea
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onPressEnter={(e) => {
            if (e.shiftKey) return;
            e.preventDefault();
            handleSubmit();
          }}
          disabled={addCommentMutation.isPending}
          rows={2}
          maxLength={1000}
          showCount
        />
        <Button
          type="primary"
          size="small"
          onClick={handleSubmit}
          loading={addCommentMutation.isPending}
          disabled={!commentText.trim()}
          block
        >
          Comment
        </Button>
      </Space>
    </div>
  );
}