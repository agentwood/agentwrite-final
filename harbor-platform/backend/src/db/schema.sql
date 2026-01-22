-- HARBOR Platform Database Schema
-- PostgreSQL 16+

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- USERS & AUTH
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'contributor', -- contributor, client, admin
    status VARCHAR(50) DEFAULT 'pending', -- pending, active, suspended
    phone VARCHAR(50),
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL, -- For display: "hbr_xxxx..."
    name VARCHAR(100),
    scopes TEXT[] DEFAULT '{}',
    rate_limit INTEGER DEFAULT 1000,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    type VARCHAR(50) DEFAULT 'enterprise', -- enterprise, agency, indie
    billing_email VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (organization_id, user_id)
);

-- ============================================
-- DATASETS & MEDIA
-- ============================================

CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- video, audio, image, mixed
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, archived
    visibility VARCHAR(50) DEFAULT 'private', -- private, public, client
    item_count INTEGER DEFAULT 0,
    annotation_count BIGINT DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    total_duration_seconds INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    annotations_included TEXT[] DEFAULT '{}',
    license_terms JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE media_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    contributor_id UUID REFERENCES users(id),
    
    -- File info
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    storage_path TEXT,
    storage_bucket VARCHAR(100) DEFAULT 'harbor-media',
    
    -- Media properties
    width INTEGER,
    height INTEGER,
    duration_seconds DECIMAL(10,2),
    fps DECIMAL(5,2),
    bitrate INTEGER,
    codec VARCHAR(50),
    
    -- Processing status
    bin VARCHAR(50) DEFAULT 'pending', -- pending, processing, approved, rejected
    rejection_reason VARCHAR(100),
    quality_score DECIMAL(3,2),
    
    -- Thumbnails
    thumbnail_url TEXT,
    preview_url TEXT,
    
    -- Rights
    consent_verified BOOLEAN DEFAULT FALSE,
    rights_cleared BOOLEAN DEFAULT FALSE,
    
    metadata JSONB DEFAULT '{}',
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ
);

CREATE TABLE media_annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
    
    -- Annotation type
    type VARCHAR(50) NOT NULL, -- detection, segment, transcript, scene_label, embedding
    
    -- Temporal location
    frame_index INTEGER, -- For video frames
    timestamp_ms INTEGER, -- For audio/video timing
    
    -- Spatial location (for detection/segmentation)
    bbox JSONB, -- {x, y, width, height}
    mask_rle TEXT, -- Run-length encoded mask
    polygon JSONB, -- [[x,y], ...] points
    
    -- Label info
    label VARCHAR(100),
    confidence DECIMAL(4,3),
    
    -- Text content (for transcripts)
    text_content TEXT,
    language VARCHAR(10),
    
    -- Embedding vector
    embedding VECTOR(1536), -- For CLIP embeddings (requires pgvector)
    
    -- Source
    model_used VARCHAR(100),
    is_human_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LICENSING
-- ============================================

CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id),
    organization_id UUID REFERENCES organizations(id),
    
    -- Terms
    usage_type VARCHAR(50), -- training, evaluation, commercial
    exclusivity VARCHAR(50) DEFAULT 'non-exclusive',
    geography VARCHAR(100) DEFAULT 'worldwide',
    duration_type VARCHAR(50) DEFAULT 'perpetual', -- perpetual, term
    expires_at TIMESTAMPTZ,
    
    -- Pricing
    pricing_model VARCHAR(50), -- fixed, per_item, per_gb, subscription
    price_cents BIGINT,
    currency VARCHAR(3) DEFAULT 'USD',
    
    status VARCHAR(50) DEFAULT 'pending', -- pending, active, expired, revoked
    
    contract_url TEXT,
    metadata JSONB DEFAULT '{}',
    
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id)
);

CREATE TABLE license_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id),
    organization_id UUID REFERENCES organizations(id),
    requested_by UUID REFERENCES users(id),
    
    use_case TEXT,
    estimated_usage VARCHAR(50),
    notes TEXT,
    
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    response_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- ============================================
-- CONTRIBUTOR PAYMENTS
-- ============================================

CREATE TABLE contributor_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contributor_id UUID REFERENCES users(id),
    media_id UUID REFERENCES media_items(id),
    
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    earning_type VARCHAR(50), -- upload, annotation, labeling, bonus
    description TEXT,
    
    status VARCHAR(50) DEFAULT 'pending', -- pending, available, paid
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    available_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ
);

CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contributor_id UUID REFERENCES users(id),
    
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    method VARCHAR(50), -- paypal, bank_transfer, stripe
    destination TEXT, -- Email or account reference
    
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    external_id VARCHAR(255), -- Payment processor reference
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID,
    actor_type VARCHAR(50), -- user, system, api_key
    
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- API Keys
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- Datasets
CREATE INDEX idx_datasets_status ON datasets(status);
CREATE INDEX idx_datasets_type ON datasets(type);
CREATE INDEX idx_datasets_visibility ON datasets(visibility);
CREATE INDEX idx_datasets_tags ON datasets USING GIN(tags);

-- Media Items
CREATE INDEX idx_media_dataset ON media_items(dataset_id);
CREATE INDEX idx_media_bin ON media_items(bin);
CREATE INDEX idx_media_contributor ON media_items(contributor_id);
CREATE INDEX idx_media_uploaded ON media_items(uploaded_at);

-- Annotations
CREATE INDEX idx_annotations_media ON media_annotations(media_id);
CREATE INDEX idx_annotations_type ON media_annotations(type);
CREATE INDEX idx_annotations_label ON media_annotations(label);
CREATE INDEX idx_annotations_frame ON media_annotations(media_id, frame_index);

-- Licenses
CREATE INDEX idx_licenses_dataset ON licenses(dataset_id);
CREATE INDEX idx_licenses_org ON licenses(organization_id);
CREATE INDEX idx_licenses_status ON licenses(status);

-- Audit
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER datasets_updated_at
    BEFORE UPDATE ON datasets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- DATASET STATS TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_dataset_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE datasets SET
        item_count = (SELECT COUNT(*) FROM media_items WHERE dataset_id = COALESCE(NEW.dataset_id, OLD.dataset_id) AND bin = 'approved'),
        total_size_bytes = (SELECT COALESCE(SUM(size_bytes), 0) FROM media_items WHERE dataset_id = COALESCE(NEW.dataset_id, OLD.dataset_id) AND bin = 'approved'),
        total_duration_seconds = (SELECT COALESCE(SUM(duration_seconds), 0) FROM media_items WHERE dataset_id = COALESCE(NEW.dataset_id, OLD.dataset_id) AND bin = 'approved')
    WHERE id = COALESCE(NEW.dataset_id, OLD.dataset_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER media_dataset_stats
    AFTER INSERT OR UPDATE OR DELETE ON media_items
    FOR EACH ROW EXECUTE FUNCTION update_dataset_stats();
