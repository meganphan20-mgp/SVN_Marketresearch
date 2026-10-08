import { NextRequest, NextResponse } from 'next/server';
import { getSources, addSource, deleteSource } from '@/lib/data/intelligence-store';

export async function GET() {
  try {
    const sources = await getSources();
    return NextResponse.json({ success: true, data: sources });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.domain) {
      return NextResponse.json({ success: false, error: 'Source name and domain are required' }, { status: 400 });
    }

    const newSource = await addSource({
      name: body.name.trim(),
      domain: body.domain.trim(),
      tier: body.tier || 'TIER_2',
      trustWeight: body.trustWeight !== undefined ? body.trustWeight : 0.70,
      description: body.description || 'Dynamic source added via Admin Console',
      isActive: body.isActive !== undefined ? body.isActive : true,
      rssUrl: body.rssUrl || undefined,
      isOfficialIr: Boolean(body.isOfficialIr ?? (body.tier === 'TIER_1')),
    });

    return NextResponse.json({ success: true, data: newSource }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Source ID is required' }, { status: 400 });
    }

    await deleteSource(id);
    return NextResponse.json({ success: true, message: `Source ${id} removed` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
