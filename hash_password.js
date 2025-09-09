// Simple script to hash passwords for testing
import bcrypt from 'bcryptjs';

async function hashPassword(password) {
    const hash = await bcrypt.hash(password, 12);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    return hash;
}

console.log('Generating password hashes...\n');
await hashPassword('password123');