const axios = require('axios');

async function quickTest() {
  try {
    console.log('🧪 Quick preview test...');
    
    const response = await axios.post('http://localhost:3001/template', {
      prompt: 'simple website'
    });
    
    console.log('✅ Backend responding correctly');
    console.log('Response has prompts:', !!response.data.prompts);
    console.log('Response has uiPrompts:', !!response.data.uiPrompts);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

quickTest();
