#!/usr/bin/env node

/**
 * Demo script showing how the Fragment microservice works
 * This demonstrates the complete flow from data storage to API endpoints
 */

const Fragment = require('./src/model/fragment');
const { hash } = require('./src/hash');

async function demonstrateImplementation() {
  console.log('🚀 Fragments Microservice Implementation Demo\n');

  // 1. Demonstrate email hashing for privacy
  console.log('1. 🔐 Email Privacy Protection:');
  const email = 'student@example.com';
  const hashedEmail = hash(email);
  console.log(`   Original email: ${email}`);
  console.log(`   Hashed email: ${hashedEmail}`);
  console.log(`   Same email always produces same hash: ${hash(email) === hashedEmail}`);
  console.log();

  // 2. Demonstrate Fragment creation and storage
  console.log('2. 💾 Fragment Data Model:');
  const fragment = new Fragment({
    ownerId: hashedEmail,
    type: 'text/plain',
  });
  console.log(`   Fragment ID: ${fragment.id}`);
  console.log(`   Owner ID (hashed): ${fragment.ownerId}`);
  console.log(`   Content Type: ${fragment.type}`);
  console.log(`   Size: ${fragment.size} bytes`);
  console.log(`   Created: ${fragment.created}`);
  console.log();

  // 3. Demonstrate data storage
  console.log('3. 🗄️  Database Operations:');
  const testData = Buffer.from('Hello, this is my fragment content!');

  console.log(`   Storing fragment data (${testData.length} bytes)...`);
  await fragment.setData(testData);
  console.log(`   Updated size: ${fragment.size} bytes`);
  console.log(`   Updated timestamp: ${fragment.updated}`);
  console.log();

  // 4. Demonstrate data retrieval
  console.log('4. 📖 Data Retrieval:');
  const retrievedData = await fragment.getData();
  console.log(`   Retrieved data: "${retrievedData.toString()}"`);
  console.log(`   Data matches: ${retrievedData.equals(testData)}`);
  console.log();

  // 5. Demonstrate user fragment listing
  console.log('5. 👤 User Fragment Management:');
  const userFragments = await Fragment.byUser(hashedEmail);
  console.log(`   User has ${userFragments.length} fragment(s)`);
  console.log(`   Fragment ID: ${userFragments[0].id}`);
  console.log();

  // 6. Demonstrate fragment lookup by ID
  console.log('6. 🔍 Fragment Lookup:');
  const foundFragment = await Fragment.byId(fragment.id);
  console.log(`   Found fragment: ${foundFragment ? '✅ Yes' : '❌ No'}`);
  console.log(`   Fragment type: ${foundFragment.type}`);
  console.log(`   Fragment size: ${foundFragment.size}`);
  console.log();

  // 7. Demonstrate fragment deletion
  console.log('7. 🗑️  Fragment Deletion:');
  const deleteResult = await fragment.delete();
  console.log(`   Delete successful: ${deleteResult ? '✅ Yes' : '❌ No'}`);

  // Verify deletion
  const deletedFragment = await Fragment.byId(fragment.id);
  console.log(`   Fragment still exists: ${deletedFragment ? '❌ Yes' : '✅ No'}`);
  console.log();

  console.log('✅ Demo completed successfully!');
  console.log('🎯 All core functionality is working correctly.');
  console.log('🚀 Ready for Assignment 1 submission!');
}

// Run the demo
if (require.main === module) {
  demonstrateImplementation().catch(console.error);
}

module.exports = { demonstrateImplementation };
