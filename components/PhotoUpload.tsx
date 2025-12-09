'use client';

import { useState } from 'react';
import { Upload, Input, Button, Card, Space, message } from 'antd';
import { InboxOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useUploadPhoto } from '@/hooks/useUploadPhoto';

const { TextArea } = Input;

export default function PhotoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const uploadMutation = useUploadPhoto();

  const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('Image must be smaller than 10MB!');
      return Upload.LIST_IGNORE;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    return false;
  };

  const handleUpload = () => {
    if (!file) {
      message.error('Please select a file');
      return;
    }

    uploadMutation.mutate(
      { file, title, description },
      {
        onSuccess: () => {
          setFile(null);
          setTitle('');
          setDescription('');
          setPreviewUrl(null);
        },
      }
    );
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <Card 
      title="📸 Upload Photo" 
      className="mb-6"
    >
      <Space direction="vertical" size="large" className="w-full">
        {!previewUrl ? (
          <Upload.Dragger
            beforeUpload={handleBeforeUpload}
            onRemove={handleRemove}
            maxCount={1}
            accept="image/*"
            showUploadList={false}
            disabled={uploadMutation.isPending}
          >
            <p className="ant-upload-drag-icon">
              {uploadMutation.isPending ? (
                <LoadingOutlined style={{ fontSize: 48 }} />
              ) : (
                <InboxOutlined style={{ fontSize: 48 }} />
              )}
            </p>
            <p className="ant-upload-text">
              Click or drag image to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for JPG, PNG, WebP, GIF. Maximum file size: 10MB
            </p>
          </Upload.Dragger>
        ) : (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              danger
              onClick={handleRemove}
              className="absolute top-2 right-2"
              disabled={uploadMutation.isPending}
            >
              Remove
            </Button>
          </div>
        )}

        {previewUrl && (
          <>
            <Input
              placeholder="Photo title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploadMutation.isPending}
              size="large"
            />
            <TextArea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={uploadMutation.isPending}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleUpload}
              loading={uploadMutation.isPending}
              block
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </>
        )}
      </Space>
    </Card>
  );
}