require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');

async function testApi() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'borrower@example.com' });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  try {
    const res = await fetch('http://127.0.0.1:5000/api/loans', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e.message);
  }
  await mongoose.disconnect();
}
testApi();
