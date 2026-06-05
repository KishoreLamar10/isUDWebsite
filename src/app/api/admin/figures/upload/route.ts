import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function safeFileName(name: string) {
  return name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'figure';
}

function extensionFor(type: string, originalName: string) {
  const existing = originalName.match(/\.(png|jpe?g|webp|gif)$/i)?.[0]?.toLowerCase();
  if (existing) return existing === '.jpeg' ? '.jpg' : existing;
  if (type === 'image/jpeg') return '.jpg';
  if (type === 'image/webp') return '.webp';
  if (type === 'image/gif') return '.gif';
  return '.png';
}

export async function POST(req: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const solutionId = String(formData.get('solutionId') || '');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    if (!solutionId) {
      return NextResponse.json({ error: 'Solution ID is required' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only PNG, JPEG, WebP, and GIF images are allowed' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image must be 4 MB or smaller' }, { status: 413 });
    }

    const solution = await prisma.solution.findUnique({
      where: { id: solutionId },
      select: { id: true },
    });

    if (!solution) {
      return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
    }

    const baseName = safeFileName(file.name);
    const blob = await put(
      `figures/${Date.now()}-${baseName}${extensionFor(file.type, file.name)}`,
      file,
      {
        access: 'public',
        contentType: file.type,
      }
    );

    const caption = file.name.replace(/\.[^.]+$/, '');
    const figure = await prisma.figure.create({
      data: {
        solutionId,
        label: 'Fig',
        number: file.name.slice(0, 180),
        caption: caption.slice(0, 1000),
        altTag: caption.slice(0, 1000),
        url: blob.url,
      },
    });

    return NextResponse.json(figure, { status: 201 });
  } catch (uploadError: any) {
    console.error('[ADMIN_FIGURE_UPLOAD_ERROR]', uploadError);
    return NextResponse.json({ error: uploadError?.message || 'Unable to upload figure' }, { status: 500 });
  }
}
