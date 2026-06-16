const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:3001/api';

async function testEndpoints() {
  console.log('Testing Fine-Tuning Endpoints...');

  try {
    // 1. Test Upload
    console.log('\n1. Testing /finetuning/upload');
    const testFilePath = path.join(__dirname, 'test_data.jsonl');
    fs.writeFileSync(testFilePath, '{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "Hello!"}, {"role": "assistant", "content": "Hi there!"}]}');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));

    const uploadRes = await axios.post(`${API_URL}/finetuning/upload`, formData, {
      headers: formData.getHeaders()
    });
    console.log('Upload Response:', uploadRes.data);
    const fileId = uploadRes.data.id;

    // 2. Test List Jobs
    console.log('\n2. Testing /finetuning/jobs (GET)');
    const listJobsRes = await axios.get(`${API_URL}/finetuning/jobs`);
    console.log('List Jobs Response:', listJobsRes.data);

    // 3. Test Create Job
    console.log('\n3. Testing /finetuning/jobs (POST)');
    const createJobRes = await axios.post(`${API_URL}/finetuning/jobs`, {
      training_file: fileId
    });
    console.log('Create Job Response:', createJobRes.data);
    const jobId = createJobRes.data.id;

    // 4. Test Get Job Status
    console.log(`\n4. Testing /finetuning/jobs/${jobId}`);
    const getJobRes = await axios.get(`${API_URL}/finetuning/jobs/${jobId}`);
    console.log('Get Job Response:', getJobRes.data);

    // 5. Test List Models
    console.log('\n5. Testing /finetuning/models');
    const listModelsRes = await axios.get(`${API_URL}/finetuning/models`);
    console.log('List Models Response:', listModelsRes.data);

    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

testEndpoints();
