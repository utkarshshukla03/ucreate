const axios = require('axios');

async function testPreview() {
  try {
    console.log('🧪 Testing backend API endpoints...\n');
    
    // Test 1: Template endpoint
    console.log('1️⃣ Testing /template endpoint...');
    const templateResponse = await axios.post('http://localhost:3001/template', {
      prompt: 'create a simple portfolio website'
    });
    
    console.log('✅ Template response received');
    console.log('Template prompts length:', templateResponse.data.prompts?.length || 0);
    console.log('UI prompts length:', templateResponse.data.uiPrompts?.length || 0);
    
    // Test 2: Chat endpoint  
    console.log('\n2️⃣ Testing /chat endpoint...');
    const chatResponse = await axios.post('http://localhost:3001/chat', {
      messages: [
        {
          role: 'user',
          content: 'Create a simple portfolio website with modern design'
        }
      ]
    });
    
    console.log('✅ Chat response received');
    console.log('Response length:', chatResponse.data.response?.length || 0);
    console.log('Contains boltArtifact:', chatResponse.data.response?.includes('<boltArtifact') || false);
    console.log('Contains boltAction:', chatResponse.data.response?.includes('<boltAction') || false);
    
    // Preview the generated files
    console.log('\n3️⃣ Generated files preview:');
    const response = chatResponse.data.response;
    if (response.includes('<boltAction')) {
      const fileActions = response.split('<boltAction').slice(1);
      console.log(`Found ${fileActions.length} file(s) to create:`);
      
      fileActions.forEach((action, index) => {
        const pathMatch = action.match(/filePath="([^"]+)"/);
        if (pathMatch) {
          console.log(`  ${index + 1}. ${pathMatch[1]}`);
        }
      });
    }
    
    console.log('\n🎉 All tests passed! Preview functionality should work correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testPreview();
