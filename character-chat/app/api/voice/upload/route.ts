import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { analyzeNoiseLevel, shouldAutoApprove, AUDIO_CONSTRAINTS } from '@/lib/voice/audioValidator';
import { createHash } from 'crypto';

/**
 * POST /api/voice/upload
 * 
 * Upload a voice contribution. Handles:
 * 1. File validation
 * 2. Storage (Supabase/S3)
 * 3. Quality/noise analysis
 * 4. Auto-approval or queue for review
 * 5. Create VoiceContribution record
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File | null;
        const consentAccepted = formData.get('consent') === 'true';
        // ... (rest of form data extraction) ...
        const displayName = formData.get('displayName') as string | null;
        const description = formData.get('description') as string | null;
        const gender = formData.get('gender') as string | null;
        const age = formData.get('age') as string | null;
        const accent = formData.get('accent') as string | null;

        // 1. Auth check
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // 2. Consent check
        if (!consentAccepted) {
            return NextResponse.json({ error: 'Consent is required to upload a voice' }, { status: 400 });
        }

        // 3. File check
        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // 4. Validate file constraints
        if (audioFile.size > AUDIO_CONSTRAINTS.MAX_FILE_SIZE_BYTES) {
            return NextResponse.json({
                error: `File too large. Maximum: ${AUDIO_CONSTRAINTS.MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`
            }, { status: 400 });
        }

        // 5. Upload to storage (Real implementation)
        const fileHash = createHash('sha256').update(audioFile.name + Date.now().toString()).digest('hex').slice(0, 16);
        const fileExt = audioFile.name.split('.').pop() || 'wav';
        const storagePath = `contributions/${userId}/${fileHash}.${fileExt}`;

        if (!supabaseAdmin) {
            throw new Error("Server storage configuration missing");
        }

        const arrayBuffer = await audioFile.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('voices')
            .upload(storagePath, fileBuffer, {
                contentType: audioFile.type,
                upsert: false
            });

        if (uploadError) {
            console.error('[VoiceUpload] Storage error:', uploadError);
            throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        console.log(`[VoiceUpload] Uploaded to: ${storagePath}`);

        // 6. Quality analysis (mock for now)
        const qualityScore = Math.floor(Math.random() * 30) + 70; // 70-100
        const noiseScore = await analyzeNoiseLevel(storagePath);

        // 7. Determine approval status
        const autoApprove = shouldAutoApprove(qualityScore, noiseScore);
        const status = autoApprove ? 'approved' : 'pending_review';

        // 8. Get audio duration (would be extracted from actual file)
        const audioDurationSeconds = 15 + Math.random() * 30; // Mock: 15-45s

        // 9. Create VoiceContribution record
        const contribution = await db.voiceContribution.create({
            data: {
                contributorId: userId,
                audioFilePath: storagePath,
                audioDurationSeconds,
                audioFormat: audioFile.type.split('/')[1] || 'wav',
                qualityScore,
                noiseScore,
                status,
                consentTimestamp: new Date(),
                displayName: displayName || `Voice by ${userId.slice(0, 8)}`,
                description,
                gender,
                age,
                accent,
                approvedAt: autoApprove ? new Date() : null,
            },
        });

        console.log(`[VoiceUpload] Created contribution ${contribution.id} with status: ${status}`);

        return NextResponse.json({
            success: true,
            contribution: {
                id: contribution.id,
                status: contribution.status,
                qualityScore: contribution.qualityScore,
                displayName: contribution.displayName,
            },
            message: autoApprove
                ? 'Your voice has been approved! Redirecting to your dashboard...'
                : 'Your voice is under review. We\'ll notify you once approved.',
            redirectUrl: autoApprove ? `/dashboard/voice/${contribution.id}` : null,
        });

    } catch (error: any) {
        console.error('[VoiceUpload] Error:', error);
        return NextResponse.json({ error: 'Failed to upload voice', details: error.message }, { status: 500 });
    }
}
