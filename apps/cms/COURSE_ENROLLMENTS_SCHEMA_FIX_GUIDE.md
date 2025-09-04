# 🛡️ Safe Course Enrollments Schema Fix Guide

## Problem
PayloadCMS detected a schema conflict in your course_enrollments table:
- `amount_paid` is being created as a new column
- `enrollment_metadata`'s `amount_paid` is being renamed

This conflict occurs because the CourseEnrollments collection has both:
- An `amountPaid` field (camelCase in the collection definition)
- A `metadata` JSON field that may contain an `amount_paid` property (snake_case)

## ✅ Safe Solution (Following Your Database Guide)

### Step 1: Apply the Safe Migration
```bash
cd apps/cms
pnpm payload migrate
```

**What this does:**
- ✅ Creates backup of existing course_enrollments data
- ✅ Safely resolves the column conflict
- ✅ Preserves all payment data by migrating values
- ✅ Prepares table for PayloadCMS schema

### Step 2: Let PayloadCMS Create Proper Schema
After the migration runs successfully, PayloadCMS will automatically use the correct schema with:
- `amount_paid` as a dedicated column (from the `amountPaid` field in CourseEnrollments.ts)
- `metadata` JSON field without the duplicate `amount_paid` property

### Step 3: Verify Everything Works
```bash
pnpm dev
```

Visit `http://localhost:3001/admin` and check:
- ✅ Course enrollments collection appears in admin
- ✅ You can view and edit enrollment payment amounts
- ✅ All payment data is preserved

## 🔍 What the Safe Migration Does

1. **Checks if course_enrollments table exists**
2. **Creates backup** (`course_enrollments_backup_[timestamp]`) of all data
3. **Analyzes the schema conflict** and determines the best solution:
   - If only metadata exists: Creates amount_paid column and migrates values
   - If both exist: Ensures data consistency and removes duplication
   - If only amount_paid exists: Confirms schema is already correct
   - If neither exists: Creates the proper amount_paid column

## 📊 Data Preservation Strategy

The migration prioritizes data preservation by:
1. **Creating a complete backup** before any changes
2. **Migrating values** from metadata.amount_paid to the amount_paid column
3. **Removing duplicates** to prevent confusion
4. **Logging all actions** for transparency

## 🚨 Safety Features

- **No data loss**: Everything backed up before changes
- **Reversible**: Backup tables remain for recovery
- **Transparent**: Detailed logging of all actions
- **Conservative**: Only modifies what's necessary

## 🆘 If Something Goes Wrong

1. **Check the backup tables** in your database
2. **Look for** `course_enrollments_backup_[timestamp]` tables
3. **Contact team** for help with data recovery
4. **Never panic** - your data is safely backed up

## 🎯 Expected Result

After running this fix:
- ✅ No more schema conflict errors
- ✅ Course enrollments work properly in PayloadCMS admin
- ✅ Payment data is accessible via the amountPaid field
- ✅ All other collections remain unaffected
- ✅ Your existing data is safely preserved

---

**Remember: This follows your team's database safety rules - data first, changes second!**