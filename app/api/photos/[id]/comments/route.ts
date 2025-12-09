import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1).max(1000, 'Comment too long (max 1000 characters)'),
  authorName: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const validationResult = commentSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { content, authorName } = validationResult.data;

    const photo = await prisma.photo.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorName: authorName || 'Anonymous',
        photoId: id,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Failed to add comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

const commentsQuerySchema = z.object({
  cursor: z.string().nullable().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    const validationResult = commentsQuerySchema.safeParse({
      cursor: searchParams.get('cursor') || undefined,
      limit: searchParams.get('limit'),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { cursor, limit } = validationResult.data;

    const photo = await prisma.photo.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    const comments = await prisma.comment.findMany({
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      where: {
        photoId: id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasNextPage = comments.length > limit;
    const data = hasNextPage ? comments.slice(0, -1) : comments;
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
    console.error('Failed to fetch comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
