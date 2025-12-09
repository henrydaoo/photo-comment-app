'use client';

import { Typography, Layout, Space } from 'antd';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoGallery from '@/components/PhotoGallery';

const { Title, Text } = Typography;
const { Header, Content } = Layout;

export default function Home() {
  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <Title level={2} className="!mb-0 !text-gray-800">
            📸 Photo Comment App
          </Title>
        </div>
      </Header>

      <Content className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Space direction="vertical" size="large" className="w-full">
            <div>
              <Title level={4}>Upload & Share Photos</Title>
              <Text type="secondary">
                Upload your photos and let others comment on them
              </Text>
            </div>

            <PhotoUpload />

            <div>
              <Title level={4}>Photo Gallery</Title>
              <PhotoGallery />
            </div>
          </Space>
        </div>
      </Content>
    </Layout>
  );
}