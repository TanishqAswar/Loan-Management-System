require('dotenv').config();
const mongoose = require('mongoose');
const Loan = require('./src/models/Loan');
const User = require('./src/models/User');

async function checkLoans() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const loans = await Loan.find().populate('borrower');
    console.log(`Found ${loans.length} total loans.`);
    for (const l of loans) {
      console.log(`Loan ${l._id}: status=${l.status}, hasAmount=${!!l.loanDetails?.amount}, borrower=${l.borrower?.name} (${l.borrower?.email})`);
    }
  } catch(e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}
checkLoans();
