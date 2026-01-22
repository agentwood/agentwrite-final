-- HARBOR Platform Seed Data
-- Initial data for development

-- ============================================
-- ADMIN USER
-- ============================================

INSERT INTO users (id, email, password_hash, full_name, role, status) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@harbor.ai', '$2b$10$placeholder', 'Harbor Admin', 'admin', 'active'),
    ('00000000-0000-0000-0000-000000000002', 'demo@anthropic.com', '$2b$10$placeholder', 'Demo User', 'client', 'active'),
    ('00000000-0000-0000-0000-000000000003', 'contributor@example.com', '$2b$10$placeholder', 'Test Contributor', 'contributor', 'active');

-- ============================================
-- SAMPLE ORGANIZATION
-- ============================================

INSERT INTO organizations (id, name, slug, type) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Anthropic', 'anthropic', 'enterprise'),
    ('10000000-0000-0000-0000-000000000002', 'OpenAI', 'openai', 'enterprise');

INSERT INTO organization_members (organization_id, user_id, role) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'admin');

-- ============================================
-- SAMPLE DATASETS
-- ============================================

INSERT INTO datasets (id, name, slug, description, type, status, visibility, item_count, annotation_count, tags, annotations_included, created_by) VALUES
    (
        '20000000-0000-0000-0000-000000000001',
        'Urban Street Scenes 4K',
        'urban-street-scenes-4k',
        'High-resolution footage of city streets, pedestrians, and vehicles from 50+ cities worldwide.',
        'video',
        'active',
        'client',
        124500,
        2300000,
        ARRAY['urban', 'street', '4k', 'pedestrian', 'vehicle'],
        ARRAY['detection', 'segmentation', 'scene_labels', 'tracking'],
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        'Conversational Speech',
        'conversational-speech',
        'Natural conversations in 12 languages with word-level transcriptions and speaker diarization.',
        'audio',
        'active',
        'client',
        89000,
        1100000,
        ARRAY['speech', 'conversation', 'multilingual', 'transcription'],
        ARRAY['transcription', 'speaker_diarization', 'language_detection'],
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '20000000-0000-0000-0000-000000000003',
        'Indoor Activities',
        'indoor-activities',
        'People performing everyday activities in home and office environments.',
        'video',
        'active',
        'client',
        67200,
        890000,
        ARRAY['indoor', 'activities', 'home', 'office'],
        ARRAY['detection', 'activity_labels', 'pose_estimation'],
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '20000000-0000-0000-0000-000000000004',
        'Nature & Wildlife',
        'nature-wildlife',
        'Landscapes, animals, and natural phenomena captured in various environments.',
        'video',
        'active',
        'client',
        45800,
        560000,
        ARRAY['nature', 'wildlife', 'landscape', 'animals'],
        ARRAY['detection', 'scene_labels', 'species_classification'],
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '20000000-0000-0000-0000-000000000005',
        'Facial Expressions',
        'facial-expressions',
        'Diverse faces expressing emotions with consent forms and demographic metadata.',
        'video',
        'active',
        'client',
        234000,
        4200000,
        ARRAY['face', 'expression', 'emotion', 'diverse'],
        ARRAY['detection', 'segmentation', 'emotion_classification', 'landmarks'],
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '20000000-0000-0000-0000-000000000006',
        'Driving Scenarios',
        'driving-scenarios',
        'Dashcam footage with road conditions, traffic signs, and vehicle tracking.',
        'video',
        'active',
        'client',
        178000,
        3400000,
        ARRAY['driving', 'dashcam', 'traffic', 'autonomous'],
        ARRAY['detection', 'tracking', 'lane_detection', 'sign_recognition'],
        '00000000-0000-0000-0000-000000000001'
    );

-- ============================================
-- SAMPLE LICENSE
-- ============================================

INSERT INTO licenses (id, dataset_id, organization_id, usage_type, status, approved_at) VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'training',
        'active',
        NOW()
    );
