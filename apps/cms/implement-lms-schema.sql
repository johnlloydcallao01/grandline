-- =====================================================
-- ENTERPRISE-GRADE LMS DATABASE IMPLEMENTATION
-- =====================================================
-- Implementation Date: 2025-01-03
-- Architecture: Three-Layer Design Pattern
-- Compatibility: INTEGER user IDs for existing CMS integration
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PHASE 1: BASE TABLES (Universal Information)
-- =====================================================

-- Course Content Base Table - Single Source of Truth
-- Stores information common to ALL course-related content items
CREATE TABLE course_content_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('course', 'module', 'lesson', 'assignment', 'quiz', 'question')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
    visibility VARCHAR(50) DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'preview')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Course Content Metadata Table - Universal Attributes
-- Stores shared attributes that apply across multiple content types
CREATE TABLE course_content_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES course_content_base(id) ON DELETE CASCADE,
    estimated_duration INTEGER, -- in minutes
    language VARCHAR(10) DEFAULT 'en',
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    learning_objectives JSONB,
    prerequisites JSONB,
    tags JSONB,
    media_urls JSONB, -- flexible storage for images, videos, etc.
    resources JSONB, -- downloadable materials, links, etc.
    settings JSONB -- flexible settings storage
);

-- Course Categories Table - Hierarchical Classification System
CREATE TABLE course_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES course_categories(id),
    category_type VARCHAR(50) DEFAULT 'course' CHECK (category_type IN ('course', 'skill', 'topic', 'industry')),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB, -- icon_url, color_code, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PHASE 2: SPECIFIC TABLES (Type-Unique Information)
-- =====================================================

-- Courses Table - Course-Specific Data Only
CREATE TABLE courses (
    id UUID PRIMARY KEY REFERENCES course_content_base(id) ON DELETE CASCADE,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    category_id UUID REFERENCES course_categories(id),
    instructor_id INTEGER NOT NULL REFERENCES users(id),
    co_instructors JSONB, -- array of user IDs (integers)
    price DECIMAL(10,2) DEFAULT 0.00,
    is_free BOOLEAN GENERATED ALWAYS AS (price = 0) STORED,
    enrollment_start_date TIMESTAMP,
    enrollment_end_date TIMESTAMP,
    course_start_date TIMESTAMP,
    course_end_date TIMESTAMP,
    max_students INTEGER,
    certificate_template_id UUID, -- Will be created later if needed
    passing_grade DECIMAL(5,2) DEFAULT 70.00,
    enrollment_settings JSONB -- flexible enrollment rules
);

-- Course Modules Table - Module-Specific Data Only
CREATE TABLE course_modules (
    id UUID PRIMARY KEY REFERENCES course_content_base(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    unlock_date TIMESTAMP,
    completion_required BOOLEAN DEFAULT false,
    module_settings JSONB -- module-specific configurations
);

-- Course Lessons Table - Lesson-Specific Data Only
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY REFERENCES course_content_base(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    lesson_type VARCHAR(50) NOT NULL CHECK (lesson_type IN ('video', 'text', 'interactive', 'document', 'external_link')),
    content_data JSONB NOT NULL, -- flexible content storage
    video_duration INTEGER, -- in seconds, only for video content
    transcript TEXT, -- for video/audio content
    is_preview BOOLEAN DEFAULT false,
    lesson_settings JSONB -- lesson-specific configurations
);

-- Course Assignments Table - Assignment-Specific Data Only
CREATE TABLE course_assignments (
    id UUID PRIMARY KEY REFERENCES course_content_base(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id),
    parent_content_id UUID REFERENCES course_content_base(id), -- can be module or lesson
    assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN ('essay', 'file_upload', 'peer_review', 'project')),
    instructions TEXT NOT NULL,
    max_points DECIMAL(8,2) NOT NULL,
    due_date TIMESTAMP,
    late_submission_allowed BOOLEAN DEFAULT false,
    late_penalty_percentage DECIMAL(5,2) DEFAULT 0,
    submission_format JSONB, -- allowed file types, size limits
    rubric JSONB,
    is_group_assignment BOOLEAN DEFAULT false,
    max_group_size INTEGER DEFAULT 1,
    assignment_settings JSONB
);

-- Course Quizzes Table - Quiz-Specific Data Only
CREATE TABLE course_quizzes (
    id UUID PRIMARY KEY REFERENCES course_content_base(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id),
    parent_content_id UUID REFERENCES course_content_base(id), -- can be module or lesson
    quiz_type VARCHAR(50) NOT NULL CHECK (quiz_type IN ('practice', 'graded', 'final_exam', 'self_assessment')),
    instructions TEXT,
    time_limit INTEGER, -- in minutes, null for unlimited
    max_attempts INTEGER DEFAULT 1,
    passing_score DECIMAL(5,2),
    show_correct_answers BOOLEAN DEFAULT true,
    randomize_questions BOOLEAN DEFAULT false,
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    quiz_settings JSONB
);

-- Course Quiz Questions Table - Question-Specific Data Only
CREATE TABLE course_quiz_questions (
    id UUID PRIMARY KEY REFERENCES course_content_base(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES course_quizzes(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching')),
    points DECIMAL(6,2) NOT NULL,
    options JSONB, -- for multiple choice, matching, etc.
    correct_answer JSONB NOT NULL,
    explanation TEXT,
    question_settings JSONB
);

-- =====================================================
-- PHASE 3: ASSOCIATION TABLES (Relationships & Complex Data)
-- =====================================================

-- Course Content Hierarchy Table - Universal Relationship Management
CREATE TABLE course_content_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_content_id UUID NOT NULL REFERENCES course_content_base(id) ON DELETE CASCADE,
    child_content_id UUID NOT NULL REFERENCES course_content_base(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('contains', 'prerequisite', 'related', 'sequence')),
    order_index INTEGER DEFAULT 0,
    relationship_metadata JSONB, -- flexible relationship data
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(parent_content_id, child_content_id, relationship_type)
);

-- Course Progress Table - Universal Progress Tracking
CREATE TABLE course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES course_content_base(id) ON DELETE CASCADE,
    progress_status VARCHAR(50) DEFAULT 'not_started' CHECK (progress_status IN ('not_started', 'in_progress', 'completed', 'failed', 'skipped')),
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    time_spent INTEGER DEFAULT 0, -- in minutes
    first_accessed TIMESTAMP,
    last_accessed TIMESTAMP,
    completion_date TIMESTAMP,
    progress_data JSONB, -- flexible progress tracking (watch_percentage, attempts, etc.)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- Course Submissions Table - Universal Submission Management
CREATE TABLE course_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id),
    content_id UUID NOT NULL REFERENCES course_content_base(id), -- assignment, quiz, etc.
    submission_type VARCHAR(50) NOT NULL CHECK (submission_type IN ('assignment', 'quiz', 'peer_review', 'discussion')),
    attempt_number INTEGER DEFAULT 1,
    submission_data JSONB NOT NULL, -- flexible submission content
    submitted_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned', 'late')),
    score DECIMAL(8,2),
    max_score DECIMAL(8,2),
    feedback TEXT,
    graded_by INTEGER REFERENCES users(id),
    graded_at TIMESTAMP,
    submission_metadata JSONB -- flexible metadata storage
);

-- Course Content Categories Table - Flexible Categorization
CREATE TABLE course_content_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES course_content_base(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES course_categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(content_id, category_id)
);

-- Course Enrollments Table - Course Access Management
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    enrollment_type VARCHAR(50) DEFAULT 'free' CHECK (enrollment_type IN ('free', 'paid', 'scholarship', 'trial')),
    payment_status VARCHAR(50) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    access_expires_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'completed', 'dropped', 'expired')),
    enrollment_metadata JSONB, -- payment info, referral data, etc.
    UNIQUE(student_id, course_id)
);

-- Course Certificates Table - Achievement Recognition
CREATE TABLE course_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id),
    content_id UUID NOT NULL REFERENCES course_content_base(id), -- course, module, etc.
    certificate_type VARCHAR(50) DEFAULT 'completion' CHECK (certificate_type IN ('completion', 'achievement', 'skill', 'participation')),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    certificate_url TEXT,
    verification_code VARCHAR(100) UNIQUE,
    is_valid BOOLEAN DEFAULT true,
    certificate_data JSONB, -- template info, custom fields, etc.
    UNIQUE(user_id, content_id, certificate_type)
);

-- =====================================================
-- PHASE 4: PERFORMANCE OPTIMIZATION (Indexes)
-- =====================================================

-- Course content base indexes
CREATE INDEX idx_course_content_base_type_status ON course_content_base(content_type, status);
CREATE INDEX idx_course_content_base_created_by ON course_content_base(created_by);
CREATE INDEX idx_course_content_base_updated_at ON course_content_base(updated_at);

-- Content hierarchy indexes
CREATE INDEX idx_course_content_hierarchy_parent ON course_content_hierarchy(parent_content_id, relationship_type);
CREATE INDEX idx_course_content_hierarchy_child ON course_content_hierarchy(child_content_id);
CREATE INDEX idx_course_content_hierarchy_order ON course_content_hierarchy(parent_content_id, order_index);

-- Progress tracking indexes
CREATE INDEX idx_course_progress_user_status ON course_progress(user_id, progress_status);
CREATE INDEX idx_course_progress_content ON course_progress(content_id, progress_status);
CREATE INDEX idx_course_progress_updated ON course_progress(updated_at);

-- Submission indexes
CREATE INDEX idx_course_submissions_user_content ON course_submissions(user_id, content_id);
CREATE INDEX idx_course_submissions_status ON course_submissions(status, submitted_at);
CREATE INDEX idx_course_submissions_grading ON course_submissions(graded_by, graded_at) WHERE graded_by IS NOT NULL;

-- Enrollment indexes
CREATE INDEX idx_course_enrollments_student_status ON course_enrollments(student_id, status);
CREATE INDEX idx_course_enrollments_course_active ON course_enrollments(course_id, status) WHERE status = 'active';

-- Category indexes
CREATE INDEX idx_course_categories_parent ON course_categories(parent_id);
CREATE INDEX idx_course_categories_slug ON course_categories(slug);
CREATE INDEX idx_course_categories_active ON course_categories(is_active) WHERE is_active = true;

-- Course specific indexes
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_courses_code ON courses(course_code);

-- =====================================================
-- PHASE 5: BUSINESS LOGIC FUNCTIONS
-- =====================================================

-- Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_course_content_base_updated_at
    BEFORE UPDATE ON course_content_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_progress_updated_at
    BEFORE UPDATE ON course_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_categories_updated_at
    BEFORE UPDATE ON course_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Course creation function with automatic base content
CREATE OR REPLACE FUNCTION create_course(
    p_title VARCHAR(255),
    p_description TEXT,
    p_course_code VARCHAR(50),
    p_instructor_id INTEGER,
    p_created_by INTEGER
) RETURNS UUID AS $$
DECLARE
    v_content_id UUID;
BEGIN
    -- Create base content
    INSERT INTO course_content_base (content_type, title, description, created_by)
    VALUES ('course', p_title, p_description, p_created_by)
    RETURNING id INTO v_content_id;

    -- Create specific course record
    INSERT INTO courses (id, course_code, instructor_id)
    VALUES (v_content_id, p_course_code, p_instructor_id);

    RETURN v_content_id;
END;
$$ LANGUAGE plpgsql;

-- Content relationship management function
CREATE OR REPLACE FUNCTION add_course_content_relationship(
    p_parent_id UUID,
    p_child_id UUID,
    p_relationship_type VARCHAR(50),
    p_order_index INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_relationship_id UUID;
    v_next_order INTEGER;
BEGIN
    -- Auto-calculate order if not provided
    IF p_order_index IS NULL THEN
        SELECT COALESCE(MAX(order_index), 0) + 1
        INTO v_next_order
        FROM course_content_hierarchy
        WHERE parent_content_id = p_parent_id
        AND relationship_type = p_relationship_type;

        p_order_index := v_next_order;
    END IF;

    INSERT INTO course_content_hierarchy (parent_content_id, child_content_id, relationship_type, order_index)
    VALUES (p_parent_id, p_child_id, p_relationship_type, p_order_index)
    RETURNING id INTO v_relationship_id;

    RETURN v_relationship_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PHASE 6: MATERIALIZED VIEWS FOR PERFORMANCE
-- =====================================================

-- Course statistics view
CREATE MATERIALIZED VIEW course_statistics AS
SELECT
    c.id as course_id,
    ccb.title,
    ccb.status,
    COUNT(DISTINCT ce.student_id) as total_enrollments,
    COUNT(DISTINCT CASE WHEN ce.status = 'active' THEN ce.student_id END) as active_enrollments,
    COUNT(DISTINCT CASE WHEN ce.status = 'completed' THEN ce.student_id END) as completions,
    AVG(CASE WHEN cp.progress_status = 'completed' THEN cp.completion_percentage END) as avg_completion_rate,
    ccb.created_at,
    ccb.updated_at
FROM courses c
JOIN course_content_base ccb ON c.id = ccb.id
LEFT JOIN course_enrollments ce ON c.id = ce.course_id
LEFT JOIN course_progress cp ON c.id = cp.content_id AND cp.user_id = ce.student_id
GROUP BY c.id, ccb.title, ccb.status, ccb.created_at, ccb.updated_at;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_course_statistics_course_id ON course_statistics(course_id);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_course_statistics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY course_statistics;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PHASE 7: DATA VALIDATION AND INTEGRITY CHECKS
-- =====================================================

-- Function to validate course content hierarchy (prevent circular references)
CREATE OR REPLACE FUNCTION validate_content_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent self-reference
    IF NEW.parent_content_id = NEW.child_content_id THEN
        RAISE EXCEPTION 'Content cannot be its own parent';
    END IF;

    -- Prevent circular references (simplified check)
    IF EXISTS (
        SELECT 1 FROM course_content_hierarchy
        WHERE parent_content_id = NEW.child_content_id
        AND child_content_id = NEW.parent_content_id
    ) THEN
        RAISE EXCEPTION 'Circular reference detected in content hierarchy';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply hierarchy validation trigger
CREATE TRIGGER validate_course_content_hierarchy_trigger
    BEFORE INSERT OR UPDATE ON course_content_hierarchy
    FOR EACH ROW EXECUTE FUNCTION validate_content_hierarchy();

-- =====================================================
-- IMPLEMENTATION COMPLETE - VERIFICATION QUERIES
-- =====================================================

-- Query to verify all tables were created successfully
-- Run this after implementation to confirm success:

/*
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
    'course_content_base', 'course_content_metadata', 'courses', 'course_modules', 'course_lessons',
    'course_assignments', 'course_quizzes', 'course_quiz_questions', 'course_content_hierarchy',
    'course_progress', 'course_submissions', 'course_categories', 'course_content_categories',
    'course_enrollments', 'course_certificates'
)
ORDER BY table_name;
*/

-- Query to verify all indexes were created:
/*
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_course_%'
ORDER BY tablename, indexname;
*/

-- Query to verify all functions were created:
/*
SELECT proname as function_name, pronargs as arg_count
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('create_course', 'add_course_content_relationship', 'refresh_course_statistics', 'update_updated_at_column', 'validate_content_hierarchy')
ORDER BY proname;
*/

-- =====================================================
-- IMPLEMENTATION NOTES
-- =====================================================
-- 1. All tables use UUID primary keys except user references (INTEGER)
-- 2. Comprehensive foreign key constraints ensure data integrity
-- 3. Check constraints validate enum-like values
-- 4. JSONB fields provide flexibility for evolving requirements
-- 5. Indexes optimized for common query patterns
-- 6. Triggers automate timestamp updates and validation
-- 7. Materialized views provide performance for complex analytics
-- 8. Functions encapsulate business logic for consistency
--
-- Total Objects Created:
-- - 15 Tables (enterprise-grade LMS schema)
-- - 14 Indexes (query performance optimization)
-- - 5 Functions (business logic and utilities)
-- - 4 Triggers (automation and validation)
-- - 1 Materialized View (analytics performance)
--
-- TOTAL: 39 database objects
-- =====================================================
