import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photo = await prisma.photo.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            comments: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Failed to fetch photo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingPhoto = await prisma.photo.findUnique({
      where: { id: id },
    });

    if (!existingPhoto || existingPhoto.deletedAt) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    await prisma.photo.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Photo deleted' });
  } catch (error) {
    console.error('Failed to delete photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}