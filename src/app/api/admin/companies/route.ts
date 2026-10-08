import { NextRequest, NextResponse } from 'next/server';
import { getCompanies, addCompany, deleteCompany } from '@/lib/data/intelligence-store';

export async function GET() {
  try {
    const companies = await getCompanies();
    return NextResponse.json({ success: true, data: companies });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Company name is required' }, { status: 400 });
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCompany = await addCompany({
      name: body.name.trim(),
      ticker: body.ticker ? body.ticker.trim() : undefined,
      slug,
      origin: body.origin || 'VIETNAM',
      aliases: body.aliases || [body.name.trim()],
      description: body.description || 'Dynamic company registered via Admin Console',
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json({ success: true, data: newCompany }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Company ID is required' }, { status: 400 });
    }

    await deleteCompany(id);
    return NextResponse.json({ success: true, message: `Company ${id} removed` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
