import { db } from '../app/db/client';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    // Add role column if not exists
    await db.execute(sql`
      ALTER TABLE group_invitations 
      ADD COLUMN IF NOT EXISTS role group_role NOT NULL DEFAULT 'participant'
    `);
    console.log('Added role column to group_invitations');
    
    // Add message column if not exists
    await db.execute(sql`
      ALTER TABLE group_invitations 
      ADD COLUMN IF NOT EXISTS message TEXT
    `);
    console.log('Added message column to group_invitations');
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
