import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { z } from 'zod';
import sharp from 'sharp';

const photosQuerySchema = z.object({
  cursor: z.string().nullable().optional(),
  limit: z.coerce.number().min(1).max(50).default(12),
  sortBy: z.enum(['createdAt', 'commentCount']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const validationResult = photosQuerySchema.safeParse({
      cursor: searchParams.get('cursor'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      order: searchParams.get('order'),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { cursor, limit, sortBy, order } = validationResult.data;

    const photos = await prisma.photo.findMany({
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      where: {
        deletedAt: null, 
      },
      include: {
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            content: true,
            authorName: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            comments: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: sortBy === 'commentCount' 
        ? { comments: { _count: order } }
        : { [sortBy]: order },
    });

    const hasNextPage = photos.length > limit;
    const data = hasNextPage ? photos.slice(0, -1) : photos;
    const nextCursor = hasNextPage ? data[data.length - 1].id : null;

    return NextResponse.json({
      data,
      pagination: {
        nextCursor,
        hasNextPage,
        limit,
      },
    });
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let processedBuffer: Buffer;
    let metadata: sharp.Metadata;

    try {
      const image = sharp(buffer);
      metadata = await image.metadata();

      processedBuffer = await image
        .resize(1920, 1920, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    } catch (error) {
      console.error('Image processing error:', error);
      return NextResponse.json(
        { error: 'Failed to process image' },
        { status: 500 }
      );
    }

    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(processedBuffer, 'photos');
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload image to cloud storage' },
        { status: 500 }
      );
    }

    const photo = await prisma.photo.create({
      data: {
        title: title || file.name.replace(/\.[^/.]+$/, ''),
        description,
        imageUrl: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        fileSize: file.size,
        mimeType: file.type,
        width: uploadResult.width,
        height: uploadResult.height,
      },
      include: {
        _count: {
          select: { comments: true },
        },
        comments: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}