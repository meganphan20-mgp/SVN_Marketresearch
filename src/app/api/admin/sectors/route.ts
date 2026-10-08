import { NextRequest, NextResponse } from 'next/server';
import { getSectors, addSector, deleteSector } from '@/lib/data/intelligence-store';

export async function GET() {
  try {
    const sectors = await getSectors();
    return NextResponse.json({ success: true, data: sectors });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Sector name is required' }, { status: 400 });
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newSector = await addSector({
      name: body.name.trim(),
      slug,
      priority: body.priority || 'PRIORITY_1',
      description: body.description || 'Dynamic sector registered via Admin Console',
      isActive: body.isActive !== undefined ? body.isActive : true,
      displayOrder: body.displayOrder || 99,
    });

    return NextResponse.json({ success: true, data: newSector }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Sector ID is required' }, { status: 400 });
    }

    await deleteSector(id);
    return NextResponse.json({ success: true, message: `Sector ${id} removed` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
