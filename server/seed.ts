require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const colors = require('colors');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/loan_management';

const roles = [
  'borrower',
  'sales_executive',
  'sanction_officer',
  'disbursement_executive',
  'collection_officer',
  'admin'
];

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected'.green);

    for (const role of roles) {
      const email = `${role}@example.com`;
      const password = 'password123';
      const name = role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        // Create user
        await User.create({
          name: name,
          email: email,
          password: password,
          role: role
        });
        console.log(`Created: ${email} | Password: ${password}`.blue);
      } else {
        console.log(`Already exists: ${email}`.yellow);
      }
    }

    console.log('🎉 Database seeding completed!'.green.bold);
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

seedUsers();
