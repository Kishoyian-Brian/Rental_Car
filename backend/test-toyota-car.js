const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const baseUrl = 'http://localhost:3000';

async function createToyotaCar() {
  try {
    // First, login as admin to get token
    console.log('Logging in as admin...');
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
      email: 'brianmwasbayo@gmail.com',
      password: 'brian123'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('Login successful!');

    // Create form data with car details and image
    const formData = new FormData();
    
    // Add car data
    formData.append('make', 'Toyota');
    formData.append('model', 'RAV4');
    formData.append('year', '2020');
    formData.append('licensePlate', 'RAV4-2020');
    formData.append('category', 'SUV');
    formData.append('transmission', 'AUTOMATIC');
    formData.append('fuelType', 'GASOLINE');
    formData.append('seats', '5');
    formData.append('doors', '5');
    formData.append('dailyRate', '85.00');
    formData.append('hourlyRate', '18.00');
    formData.append('features', JSON.stringify(['AWD', 'AC', 'Bluetooth', 'Backup Camera', 'Cruise Control', 'GPS Navigation', 'Roof Rails']));
    formData.append('locationId', '');

    // Add image file
    const imagePath = './assets/toyota-rav4-x-20-4wd-5.jpg';
    if (fs.existsSync(imagePath)) {
      formData.append('images', fs.createReadStream(imagePath));
      console.log('Image file added to form data');
    } else {
      console.log('Image file not found, creating car without image');
    }

    // Create Toyota RAV4 car
    console.log('Creating Toyota RAV4 car...');
    const carResponse = await axios.post(`${baseUrl}/cars`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    console.log('Toyota RAV4 car created successfully!');
    console.log('Car ID:', carResponse.data.data.id);
    console.log('Car Details:', JSON.stringify(carResponse.data.data, null, 2));

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

createToyotaCar(); 