#!/usr/bin/env node

/**
 * FEAR Store Project Download Script
 * This script helps set up the project after download
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 FEAR Store - Project Setup');
console.log('================================');

// Check if we're in the right directory
const requiredFiles = ['server.js', 'package.json', 'index.html'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
    console.log('❌ Missing required files:', missingFiles.join(', '));
    console.log('Make sure you\'re in the project root directory.');
    process.exit(1);
}

console.log('✅ All required files found!');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
    console.log('📦 Dependencies not installed yet.');
    console.log('Run: npm install');
} else {
    console.log('✅ Dependencies already installed.');
}

// Check if database exists
if (!fs.existsSync('fear_store.db')) {
    console.log('🗄️  Database will be created on first run.');
} else {
    console.log('✅ Database file found.');
}

console.log('\n🚀 To start the server:');
console.log('1. npm install (if not done already)');
console.log('2. npm start');
console.log('3. Open http://localhost:3000');

console.log('\n👨‍💼 Admin access:');
console.log('URL: http://localhost:3000/admin');
console.log('Username: admin');
console.log('Password: admin123');

console.log('\n📚 Check README.md for detailed documentation.');