#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up URL Shortener...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# MongoDB Atlas connection (shared database)
MONGODB_URI=mongodb+srv://snfelexstudents2025_db_user:9vvR5qZVJGqWJ0Vt@urlshortener.nay4npn.mongodb.net/?retryWrites=true&w=majority&appName=urlshortener

PORT=5001
NODE_ENV=development
# BASE_URL will be auto-detected

# Note: This project uses a shared MongoDB Atlas database
# No need to set up your own database - just run the application!`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('✅ .env file already exists!');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run dev (in one terminal)');
console.log('3. Run: npm run client (in another terminal)');
console.log('4. Open: http://localhost:3000');
console.log('\n💡 No MongoDB setup required - using shared cloud database!');
