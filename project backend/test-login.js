#!/usr/bin/env node

/**
 * Test script to verify the login endpoint returns the token correctly
 * Usage: node test-login.js <email> <password>
 */

const testLogin = async (email, password) => {
  try {
    console.log('\n🔍 Testing login endpoint...');
    console.log(`Email: ${email}`);
    
    const response = await fetch('http://localhost:9000/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    console.log('\n📊 Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(data, null, 2));
    
    if (data.token) {
      console.log('\n✅ SUCCESS: Token is present in response!');
      console.log('Token preview:', data.token.substring(0, 50) + '...');
      
      // Test the /me endpoint with the token
      console.log('\n🔍 Testing /me endpoint with token...');
      const meResponse = await fetch('http://localhost:9000/v1/me', {
        headers: {
          'Authorization': `Bearer ${data.token}`,
        },
      });
      
      const meData = await meResponse.json();
      console.log('📊 /me Response Status:', meResponse.status);
      console.log('📦 /me Response Data:', JSON.stringify(meData, null, 2));
      
      if (meResponse.ok) {
        console.log('\n✅ Token validation successful!');
      } else {
        console.log('\n❌ Token validation failed!');
      }
    } else {
      console.log('\n❌ ERROR: Token is NOT present in response!');
      console.log('🔧 You need to restart the backend server for the fix to take effect.');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 9000');
  }
};

// Get credentials from command line or use defaults
const email = process.argv[2] || 'admin@example.com';
const password = process.argv[3] || 'admin123';

testLogin(email, password);
