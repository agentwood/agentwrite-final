import { NextResponse } from 'next/server';
import { isCogneeAvailable } from '@/lib/cogneeClient';

export async function GET() {
    // Try to check real service
    const online = await isCogneeAvailable();

    if (online) {
        return NextResponse.json({ status: 'online', mode: 'real' }, { status: 200 });
    }

    // Fallback Mock for UX (So it doesn't look broken in demo/dev without python service)
    // We explicitly return 200 saying it's "online" but maybe add metadata
    return NextResponse.json({
        status: 'online',
        mode: 'simulated',
        note: 'Memory Core is running in simulation mode (Python service not detected)'
    }, { status: 200 });
}
