# PayloadCMS Database Schema Modifications Guide

## Overview
This guide explains how to safely modify database schema in PayloadCMS without losing data. It covers the proper way to add, remove, or modify collection fields while preserving existing records.

## ⚠️ CRITICAL WARNING

**NEVER use `pnpm payload migrate:fresh`** - This command drops the entire database and destroys ALL data across ALL tables!

## Safe Schema Modification Process

### 1. Modify Collection Definition

First, update your collection TypeScript file (e.g., `src/collections/YourCollection.ts`):

```typescript
// Example: Removing fields from a collection
export const YourCollection: CollectionConfig = {
  slug: 'your-collection',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'isActive'], // Update defaultColumns too
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    // Remove unwanted fields from here
  ],
}
```

### 2. Generate Migration

Create a new migration to handle the schema changes:

```bash
cd apps/cms
pnpm payload migrate:create
```

This will:
- Analyze the differences between your current collection definitions and database schema
- Generate a migration file with the necessary SQL commands
- Create both `up()` and `down()` functions for the migration

### 3. Review Generated Migration

Check the generated migration file in `src/migrations/` to ensure it only modifies what you intended:

```typescript
// Example generated migration
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "your_table" DROP COLUMN "unwanted_column1";
    ALTER TABLE "your_table" DROP COLUMN "unwanted_column2";
    DROP TYPE "public"."enum_your_table_some_enum";
  `)
}
```

### 4. Run Migration

Apply the migration to your database:

```bash
cd apps/cms
pnpm payload migrate
```

This will:
- Execute only the specific changes in the migration
- Preserve all existing data in other tables
- Update only the targeted columns/tables

## Common Schema Modifications

### Removing Fields

1. Remove field definitions from collection file
2. Update `defaultColumns` in admin config
3. Generate and run migration

### Adding Fields

1. Add field definitions to collection file
2. Update `defaultColumns` if needed
3. Generate and run migration
4. New columns will be added with default values

### Modifying Field Types

1. Update field type in collection file
2. Generate migration
3. Review migration for data type conversion
4. Run migration

## Best Practices

### ✅ DO:
- Always review generated migrations before running them
- Test schema changes on development database first
- Keep migration files in version control
- Use descriptive migration names
- Back up your database before major changes

### ❌ DON'T:
- Use `migrate:fresh` in production or with existing data
- Manually edit migration files unless necessary
- Skip reviewing generated SQL commands
- Delete migration files after they've been run
- Make schema changes directly in database

## Migration Commands Reference

```bash
# Create new migration
pnpm payload migrate:create

# Run pending migrations
pnpm payload migrate

# Check migration status
pnpm payload migrate:status

# Rollback last migration (use with caution)
pnpm payload migrate:down

# DANGEROUS: Reset database (destroys all data)
# pnpm payload migrate:fresh  # ⚠️ NEVER USE WITH EXISTING DATA
```

## Troubleshooting

### Migration Fails
- Check database connection
- Verify migration SQL syntax
- Ensure no conflicting constraints
- Check for data that prevents column removal

### Schema Out of Sync
- Run `pnpm payload migrate:status` to check
- Generate new migration if needed
- Never manually alter database schema

### Development vs Production
- Always test migrations in development first
- Use same migration process in both environments
- Keep migration files synchronized across environments

## Example: Complete Field Removal Process

### Step 1: Update Collection
```typescript
// Before: Collection with many fields
fields: [
  { name: 'user', type: 'relationship', relationTo: 'users' },
  { name: 'department', type: 'text' },      // Remove this
  { name: 'hireDate', type: 'date' },        // Remove this
  { name: 'isActive', type: 'checkbox' },
]

// After: Simplified collection
fields: [
  { name: 'user', type: 'relationship', relationTo: 'users' },
  { name: 'isActive', type: 'checkbox' },
]
```

### Step 2: Generate Migration
```bash
pnpm payload migrate:create
```

### Step 3: Review Generated SQL
```sql
ALTER TABLE "your_table" DROP COLUMN "department";
ALTER TABLE "your_table" DROP COLUMN "hire_date";
```

### Step 4: Apply Migration
```bash
pnpm payload migrate
```

## Result
- Only specified columns removed
- All other data preserved
- Schema matches collection definition
- Safe and reversible changes

---

**Remember: Always prioritize data safety over convenience. Take time to review migrations before applying them.**
