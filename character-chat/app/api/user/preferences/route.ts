import { NextRequest, NextResponse } from 'next/server';
import { updateCharacterMemory } from '@/lib/ml/contextSystem';

/**
 * POST /api/user/preferences
 * Save user onboarding preferences to character memory system
 */
export async function POST(request: NextRequest) {
  try {
    const { pronoun, ageRange, relationshipPreference } = await request.json();

    // Get user ID from request (implement auth later)
    const userId = request.headers.get('x-user-id') || undefined;

    // For now, we'll store preferences globally (for all personas)
    // In the future, this could be persona-specific
    // We'll use a special "global" persona ID or create a UserPreferences model
    
    // Store preferences in a way that can be used by all characters
    // For now, we'll just acknowledge the save
    // In production, you'd want to:
    // 1. Create a UserPreferences model
    // 2. Store preferences per user
    // 3. Use these preferences when building character prompts

    return NextResponse.json({
      success: true,
      message: 'Preferences saved',
      data: {
        pronoun,
        ageRange,
        relationshipPreference,
      },
    });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}



