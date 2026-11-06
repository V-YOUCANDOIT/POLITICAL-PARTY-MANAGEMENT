import { initDatabase } from './db.ts';
import { seedDatabase } from './seed.ts';
import fs from 'fs';
import path from 'path';

console.log('--- POLITIX DATABASE INITIALIZATION ---');

// Ensure upload and export directories exist locally
const dirs = [
  path.resolve(process.cwd(), 'uploads'),
  path.resolve(process.cwd(), 'uploads', 'receipts'),
  path.resolve(process.cwd(), 'uploads', 'documents'),
  path.resolve(process.cwd(), 'exports')
];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created local directory: ${dir}`);
  }
}

initDatabase();
seedDatabase();

console.log('--- POLITIX INITIALIZATION COMPLETE ---');
