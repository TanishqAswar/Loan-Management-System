const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  utrNumber: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const loanSchema = new mongoose.Schema({
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Step 1: Personal Details
  personalDetails: {
    fullName: { type: String, required: true },
    pan: { type: String, required: true, uppercase: true },
    dateOfBirth: { type: Date, required: true },
    monthlySalary: { type: Number, required: true },
    employmentMode: {
      type: String,
      enum: ['salaried', 'self_employed', 'unemployed'],
      required: true
    }
  },

  // Step 2: Document Upload
  documentUrl: { type: String, default: null },

  // Step 3: Loan Configuration
  loanDetails: {
    amount: { type: Number, min: 50000, max: 500000 },
    tenure: { type: Number, min: 30, max: 365 }, // days
    interestRate: { type: Number, default: 12 },
    interest: { type: Number },
    totalRepayable: { type: Number }
  },

  // Lifecycle Status
  status: {
    type: String,
    enum: ['APPLIED', 'APPROVED', 'REJECTED', 'SANCTIONED', 'DISBURSED', 'CLOSED'],
    default: 'APPLIED'
  },

  // BRE flags
  breRejected: { type: Boolean, default: false },
  breReason: { type: String, default: null },

  // Sales module
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  rejectionReason: { type: String },

  // Sanction module
  sanctionedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sanctionedAt: { type: Date },
  agreementUrl: { type: String },

  // Disbursement module
  disbursedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  disbursedAt: { type: Date },

  // Collection module
  payments: [paymentSchema],
  outstandingBalance: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

loanSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Loan', loanSchema);
