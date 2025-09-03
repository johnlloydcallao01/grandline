-- =====================================================
-- MEDIA INTEGRATION FOR COURSES
-- =====================================================
-- Implementation Date: 2025-01-03
-- Purpose: Connect courses with existing Cloudinary-integrated media table
-- Approach: Add thumbnail support using original image sizes
-- =====================================================

-- Add thumbnail support to courses table
ALTER TABLE courses ADD COLUMN thumbnail_id INTEGER REFERENCES media(id);
ALTER TABLE courses ADD COLUMN banner_image_id INTEGER REFERENCES media(id);

-- Add thumbnail support to course_content_base for all content types
ALTER TABLE course_content_base ADD COLUMN thumbnail_id INTEGER REFERENCES media(id);

-- Create indexes for performance
CREATE INDEX idx_courses_thumbnail ON courses(thumbnail_id);
CREATE INDEX idx_courses_banner ON courses(banner_image_id);
CREATE INDEX idx_course_content_base_thumbnail ON course_content_base(thumbnail_id);

-- Add comments for documentation
COMMENT ON COLUMN courses.thumbnail_id IS 'Reference to media table for course thumbnail image (original size)';
COMMENT ON COLUMN courses.banner_image_id IS 'Reference to media table for course banner image (original size)';
COMMENT ON COLUMN course_content_base.thumbnail_id IS 'Reference to media table for content thumbnail image (original size)';

-- Create helper function to get course with media
CREATE OR REPLACE FUNCTION get_course_with_media(p_course_id UUID)
RETURNS TABLE (
    course_id UUID,
    course_code VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    instructor_id INTEGER,
    price NUMERIC,
    thumbnail_url VARCHAR,
    thumbnail_alt VARCHAR,
    thumbnail_width NUMERIC,
    thumbnail_height NUMERIC,
    banner_url VARCHAR,
    banner_alt VARCHAR,
    cloudinary_thumbnail_url VARCHAR,
    cloudinary_banner_url VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as course_id,
        c.course_code,
        ccb.title,
        ccb.description,
        ccb.status,
        c.instructor_id,
        c.price,
        tm.url as thumbnail_url,
        tm.alt as thumbnail_alt,
        tm.width as thumbnail_width,
        tm.height as thumbnail_height,
        bm.url as banner_url,
        bm.alt as banner_alt,
        tm.cloudinary_u_r_l as cloudinary_thumbnail_url,
        bm.cloudinary_u_r_l as cloudinary_banner_url
    FROM courses c
    JOIN course_content_base ccb ON c.id = ccb.id
    LEFT JOIN media tm ON c.thumbnail_id = tm.id
    LEFT JOIN media bm ON c.banner_image_id = bm.id
    WHERE c.id = p_course_id;
END;
$$ LANGUAGE plpgsql;

-- Create helper function to get all courses with media
CREATE OR REPLACE FUNCTION get_all_courses_with_media()
RETURNS TABLE (
    course_id UUID,
    course_code VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    instructor_id INTEGER,
    price NUMERIC,
    thumbnail_url VARCHAR,
    thumbnail_alt VARCHAR,
    cloudinary_thumbnail_url VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as course_id,
        c.course_code,
        ccb.title,
        ccb.description,
        ccb.status,
        c.instructor_id,
        c.price,
        tm.url as thumbnail_url,
        tm.alt as thumbnail_alt,
        tm.cloudinary_u_r_l as cloudinary_thumbnail_url
    FROM courses c
    JOIN course_content_base ccb ON c.id = ccb.id
    LEFT JOIN media tm ON c.thumbnail_id = tm.id
    WHERE ccb.status = 'published'
    ORDER BY ccb.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Update the existing create_course function to support thumbnails
CREATE OR REPLACE FUNCTION create_course(
    p_title VARCHAR(255),
    p_description TEXT,
    p_course_code VARCHAR(50),
    p_instructor_id INTEGER,
    p_created_by INTEGER,
    p_thumbnail_id INTEGER DEFAULT NULL,
    p_banner_id INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_content_id UUID;
BEGIN
    -- Create base content
    INSERT INTO course_content_base (content_type, title, description, created_by, thumbnail_id)
    VALUES ('course', p_title, p_description, p_created_by, p_thumbnail_id)
    RETURNING id INTO v_content_id;
    
    -- Create specific course record
    INSERT INTO courses (id, course_code, instructor_id, thumbnail_id, banner_image_id)
    VALUES (v_content_id, p_course_code, p_instructor_id, p_thumbnail_id, p_banner_id);
    
    RETURN v_content_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update course media
CREATE OR REPLACE FUNCTION update_course_media(
    p_course_id UUID,
    p_thumbnail_id INTEGER DEFAULT NULL,
    p_banner_id INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Update courses table
    UPDATE courses 
    SET 
        thumbnail_id = COALESCE(p_thumbnail_id, thumbnail_id),
        banner_image_id = COALESCE(p_banner_id, banner_image_id)
    WHERE id = p_course_id;
    
    -- Update course_content_base table
    UPDATE course_content_base 
    SET 
        thumbnail_id = COALESCE(p_thumbnail_id, thumbnail_id),
        updated_at = NOW()
    WHERE id = p_course_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Query to verify media integration
/*
-- Test the integration:
SELECT 
    c.course_code,
    ccb.title,
    c.thumbnail_id,
    c.banner_image_id,
    tm.filename as thumbnail_file,
    tm.cloudinary_u_r_l as thumbnail_cloudinary_url,
    bm.filename as banner_file,
    bm.cloudinary_u_r_l as banner_cloudinary_url
FROM courses c
JOIN course_content_base ccb ON c.id = ccb.id
LEFT JOIN media tm ON c.thumbnail_id = tm.id
LEFT JOIN media bm ON c.banner_image_id = bm.id;
*/

-- =====================================================
-- IMPLEMENTATION NOTES
-- =====================================================
-- 1. Added thumbnail_id and banner_image_id to courses table
-- 2. Added thumbnail_id to course_content_base for all content types
-- 3. Created indexes for performance optimization
-- 4. Created helper functions for easy media retrieval
-- 5. Updated create_course function to support media
-- 6. Created update_course_media function for media management
-- 7. Uses original image sizes (no transformations)
-- 8. Leverages existing Cloudinary integration
-- 9. Maintains consistency with posts.featured_image_id pattern
-- 10. Provides both direct URL and Cloudinary URL access
-- =====================================================
