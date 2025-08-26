# Schema Migration Plan: CTI Optimization

## 🎯 **Migration Objective**

Transform our current CTI implementation from **field-duplicated** to **semantically-optimized** architecture.

## 📊 **Current vs Target Schema**

### **Current Issues**
```sql
-- ❌ CURRENT: Field duplication
CREATE TABLE users (id, email, first_name, last_name, role, is_active, ...);
CREATE TABLE admins (user_id, is_active, ...);      -- DUPLICATE is_active
CREATE TABLE instructors (user_id, bio, is_active, ...); -- DUPLICATE is_active  
CREATE TABLE trainees (user_id, is_active, ...);    -- DUPLICATE is_active
```

### **Target Architecture**
```sql
-- ✅ TARGET: Optimized field placement
CREATE TABLE users (
    id, email, first_name, last_name, role,
    -- SHARED FIELDS (moved from role tables)
    is_active,           -- Same behavior for all roles
    bio,                 -- Profiles for all user types  
    phone,               -- Contact info for all roles
    profile_image_url,   -- Avatar for all users
    ...
);

CREATE TABLE admins (user_id, admin_level, system_permissions, ...);
CREATE TABLE instructors (user_id, specialization, teaching_permissions, ...);
CREATE TABLE trainees (user_id, enrollment_date, current_level, ...);
```

## 🔄 **Migration Steps**

### **Phase 1: Schema Changes**

#### **Step 1.1: Add shared fields to users table**
```sql
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN profile_image_url TEXT;
-- Note: is_active already exists in users table
```

#### **Step 1.2: Migrate data from role tables to users**
```sql
-- Migrate bio from instructors to users
UPDATE users 
SET bio = i.bio 
FROM instructors i 
WHERE users.id = i.user_id AND i.bio IS NOT NULL;

-- Migrate any role-specific is_active overrides
UPDATE users 
SET is_active = false 
WHERE id IN (
    SELECT user_id FROM admins WHERE is_active = false
    UNION
    SELECT user_id FROM instructors WHERE is_active = false  
    UNION
    SELECT user_id FROM trainees WHERE is_active = false
);
```

#### **Step 1.3: Remove duplicated fields from role tables**
```sql
ALTER TABLE admins DROP COLUMN is_active;
ALTER TABLE instructors DROP COLUMN is_active;
ALTER TABLE instructors DROP COLUMN bio;
ALTER TABLE trainees DROP COLUMN is_active;
```

### **Phase 2: Application Updates**

#### **Step 2.1: Update PayloadCMS Collections**
- Move `bio` from Instructors to Users collection
- Remove `isActive` from all role collections
- Add `phone` and `profileImageUrl` to Users collection

#### **Step 2.2: Update Database Triggers**
- Modify triggers to not set `is_active` in role tables
- Update cleanup logic

#### **Step 2.3: Update Queries**
```sql
-- OLD: Required JOIN for basic user info
SELECT u.*, a.is_active as admin_active
FROM users u JOIN admins a ON u.id = a.user_id;

-- NEW: Single table query
SELECT * FROM users WHERE role = 'admin';
```

### **Phase 3: Testing & Validation**

#### **Step 3.1: Data Integrity Checks**
```sql
-- Verify no data loss
SELECT COUNT(*) FROM users WHERE bio IS NOT NULL;
SELECT COUNT(*) FROM users WHERE is_active = false;

-- Verify role relationships intact
SELECT role, COUNT(*) FROM users GROUP BY role;
```

#### **Step 3.2: Performance Testing**
- Benchmark query performance before/after
- Test user creation/update operations
- Validate trigger functionality

## 📋 **Migration Checklist**

### **Pre-Migration**
- [ ] Backup production database
- [ ] Test migration on staging environment
- [ ] Update application code
- [ ] Prepare rollback plan

### **During Migration**
- [ ] Execute schema changes
- [ ] Migrate existing data
- [ ] Update database triggers
- [ ] Deploy application updates

### **Post-Migration**
- [ ] Verify data integrity
- [ ] Test all user operations
- [ ] Monitor performance metrics
- [ ] Update documentation

## ⚠️ **Risk Assessment**

### **Low Risk**
- Adding new columns to users table
- Data migration (reversible)

### **Medium Risk**  
- Dropping columns from role tables
- Updating application queries

### **Mitigation Strategies**
- Comprehensive testing on staging
- Gradual rollout with feature flags
- Database backup before each step
- Rollback procedures documented

## 🎯 **Success Criteria**

### **Performance**
- [ ] User profile queries 50% faster (no JOINs needed)
- [ ] User creation operations maintain <100ms response time

### **Data Integrity**
- [ ] Zero data loss during migration
- [ ] All user-role relationships preserved
- [ ] Triggers function correctly

### **Maintainability**
- [ ] Single source of truth for shared fields
- [ ] No field duplication across tables
- [ ] Clear semantic separation maintained

## 📅 **Timeline**

- **Week 1**: Schema design finalization & staging setup
- **Week 2**: Application code updates & testing
- **Week 3**: Migration execution & validation
- **Week 4**: Performance monitoring & optimization

**Total Duration**: 4 weeks
**Effort**: 2-3 developers, part-time
