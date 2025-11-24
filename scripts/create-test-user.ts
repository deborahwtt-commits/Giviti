import bcrypt from 'bcrypt';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function createTestUser() {
  const testEmail = 'testcollab@example.com';
  const testPassword = 'test123';
  
  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, testEmail));
  
  if (existingUser) {
    console.log('Test user already exists:', testEmail);
    console.log('User ID:', existingUser.id);
    return existingUser;
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(testPassword, 10);
  
  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email: testEmail,
      passwordHash,
      firstName: 'Test',
      lastName: 'Collab',
      role: 'user',
    })
    .returning();
  
  console.log('Created test user:', testEmail);
  console.log('User ID:', newUser.id);
  console.log('Password:', testPassword);
  
  return newUser;
}

createTestUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error creating test user:', error);
    process.exit(1);
  });
