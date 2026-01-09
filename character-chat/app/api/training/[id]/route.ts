import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch training configuration for a character
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const persona = await db.personaTemplate.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                archetype: true,
                avatarUrl: true,
                behaviorEmpathy: true,
                behaviorAgreeable: true,
                behaviorChaos: true,
                behaviorPessimism: true,
                styleVerbosity: true,
                styleFormality: true,
                trainingConstraints: true,
                personalityTags: true,
                trainingStatus: true,
                knowledgeBaseUrl: true,
            },
        });

        if (!persona) {
            return NextResponse.json({ success: false, error: 'Character not found' }, { status: 404 });
        }

        // Parse constraints and tags from JSON string
        let constraints: string[] = [];
        let tags: string[] = [];

        if (persona.trainingConstraints) {
            try {
                constraints = JSON.parse(persona.trainingConstraints);
            } catch {
                constraints = [];
            }
        }

        if (persona.personalityTags) {
            try {
                tags = JSON.parse(persona.personalityTags);
            } catch {
                tags = [];
            }
        }

        return NextResponse.json({
            success: true,
            config: {
                ...persona,
                trainingConstraints: constraints,
                personalityTags: tags,
            },
        });
    } catch (error) {
        console.error('Error fetching training config:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch training config' }, { status: 500 });
    }
}

// PUT - Update training configuration
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData: any = {};

        if (body.behaviorEmpathy !== undefined) updateData.behaviorEmpathy = body.behaviorEmpathy;
        if (body.behaviorAgreeable !== undefined) updateData.behaviorAgreeable = body.behaviorAgreeable;
        if (body.behaviorChaos !== undefined) updateData.behaviorChaos = body.behaviorChaos;
        if (body.behaviorPessimism !== undefined) updateData.behaviorPessimism = body.behaviorPessimism;
        if (body.styleVerbosity !== undefined) updateData.styleVerbosity = body.styleVerbosity;
        if (body.styleFormality !== undefined) updateData.styleFormality = body.styleFormality;
        if (body.trainingStatus !== undefined) updateData.trainingStatus = body.trainingStatus;
        if (body.knowledgeBaseUrl !== undefined) updateData.knowledgeBaseUrl = body.knowledgeBaseUrl;

        // Serialize constraints and tags to JSON
        if (body.trainingConstraints !== undefined) {
            updateData.trainingConstraints = JSON.stringify(body.trainingConstraints);
        }
        if (body.personalityTags !== undefined) {
            updateData.personalityTags = JSON.stringify(body.personalityTags);
        }

        const updated = await db.personaTemplate.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, persona: updated });
    } catch (error) {
        console.error('Error updating training config:', error);
        return NextResponse.json({ success: false, error: 'Failed to update training config' }, { status: 500 });
    }
}
