const Loan = require('../models/Loan');

// BRE: Business Rule Engine
const runBRE = (loan) => {
  const { monthlySalary, pan, employmentMode } = loan.personalDetails;
  const { amount, tenure } = loan.loanDetails;

  if (!pan || pan.length !== 10) {
    return { passed: false, reason: 'Invalid PAN number' };
  }
  if (monthlySalary < 15000) {
    return { passed: false, reason: 'Monthly salary below minimum threshold of ₹15,000' };
  }
  if (amount > monthlySalary * 10) {
    return { passed: false, reason: 'Loan amount exceeds 10x monthly salary' };
  }
  if (employmentMode === 'unemployed') {
    return { passed: false, reason: 'Unemployed applicants are not eligible' };
  }
  if (!loan.documentUrl) {
    return { passed: false, reason: 'Supporting document is required' };
  }

  return { passed: true };
};

// Calculate interest
const calculateLoanDetails = (amount, tenure, rate = 12) => {
  const interest = (amount * rate * tenure) / (365 * 100);
  const totalRepayable = amount + interest;
  return {
    interestRate: rate,
    interest: Math.round(interest * 100) / 100,
    totalRepayable: Math.round(totalRepayable * 100) / 100
  };
};

// @desc  Step 1: Submit personal details
// @route POST /api/loans/step1
// @access Borrower
exports.submitPersonalDetails = async (req, res) => {
  try {
    const { fullName, pan, dateOfBirth, monthlySalary, employmentMode } = req.body;
    const loan = await Loan.create({
      borrower: req.user._id,
      personalDetails: { fullName, pan, dateOfBirth, monthlySalary, employmentMode },
      status: 'APPLIED'
    });

    res.status(201).json({ success: true, loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Step 2: Upload document
// @route POST /api/loans/:id/upload
// @access Borrower
exports.uploadDocument = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, borrower: req.user._id });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    loan.documentUrl = `/uploads/${req.file.filename}`;
    await loan.save();

    res.json({ success: true, message: 'Document uploaded', documentUrl: loan.documentUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Step 3: Configure loan and run BRE
// @route POST /api/loans/:id/configure
// @access Borrower
exports.configureLoan = async (req, res) => {
  try {
    const { amount, tenure } = req.body;
    const loan = await Loan.findOne({ _id: req.params.id, borrower: req.user._id });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    if (amount < 50000 || amount > 500000) {
      return res.status(400).json({ success: false, message: 'Loan amount must be between ₹50,000 and ₹5,00,000' });
    }
    if (tenure < 30 || tenure > 365) {
      return res.status(400).json({ success: false, message: 'Tenure must be between 30 and 365 days' });
    }

    const calcs = calculateLoanDetails(amount, tenure);
    loan.loanDetails = { amount, tenure, ...calcs };

    const bre = runBRE(loan);
    if (!bre.passed) {
      loan.breRejected = true;
      loan.breReason = bre.reason;
      loan.status = 'REJECTED';
      await loan.save();
      return res.status(422).json({
        success: false,
        message: 'Loan rejected by Business Rule Engine',
        reason: bre.reason,
        loan
      });
    }

    loan.breRejected = false;
    loan.breReason = null;
    loan.status = 'APPLIED';
    await loan.save();

    res.json({ success: true, message: 'Loan configured and BRE passed', loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all loans (borrower: own loans; others: role-based)
// @route GET /api/loans
// @access Private
exports.getLoans = async (req, res) => {
  try {
    let query = {};
    const { role, _id } = req.user;

    if (role === 'borrower') {
      query.borrower = _id;
    } else if (role === 'sales_executive') {
      // Sales sees leads in a different endpoint, not loans
      query._id = null; // Return empty
    } else if (role === 'sanction_officer') {
      query.status = { $in: ['APPLIED', 'APPROVED', 'SANCTIONED'] };
    } else if (role === 'disbursement_executive') {
      query.status = { $in: ['SANCTIONED', 'DISBURSED'] };
    } else if (role === 'collection_officer') {
      query.status = { $in: ['DISBURSED', 'CLOSED'] };
    }
    // admin sees all

    const loans = await Loan.find(query)
      .populate('borrower', 'name email')
      .populate('reviewedBy', 'name')
      .populate('sanctionedBy', 'name')
      .populate('disbursedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: loans.length, loans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single loan
// @route GET /api/loans/:id
// @access Private
exports.getLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('borrower', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('sanctionedBy', 'name email')
      .populate('disbursedBy', 'name email')
      .populate('payments.recordedBy', 'name');

    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    if (req.user.role === 'borrower' && loan.borrower._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Sales: Approve or Reject loan
// @route PATCH /api/loans/:id/review
// @access Sales Executive
exports.reviewLoan = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    if (loan.status !== 'APPLIED') {
      return res.status(400).json({ success: false, message: 'Only APPLIED loans can be reviewed' });
    }

    if (action === 'approve') {
      loan.status = 'APPROVED';
    } else if (action === 'reject') {
      loan.status = 'REJECTED';
      loan.rejectionReason = rejectionReason || 'Rejected by sales executive';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Use approve or reject' });
    }

    loan.reviewedBy = req.user._id;
    loan.reviewedAt = new Date();
    await loan.save();

    res.json({ success: true, message: `Loan ${action}d`, loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Sanction: Send agreement & sanction loan
// @route PATCH /api/loans/:id/sanction
// @access Sanction Officer
exports.sanctionLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    if (loan.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Only APPROVED loans can be sanctioned' });
    }

    // Generate a mock agreement URL (in real app, generate PDF)
    loan.agreementUrl = `/agreements/agreement-${loan._id}.pdf`;
    loan.status = 'SANCTIONED';
    loan.sanctionedBy = req.user._id;
    loan.sanctionedAt = new Date();
    await loan.save();

    res.json({ success: true, message: 'Loan sanctioned and agreement generated', loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Disbursement: Disburse loan
// @route PATCH /api/loans/:id/disburse
// @access Disbursement Executive
exports.disburseLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    if (loan.status !== 'SANCTIONED') {
      return res.status(400).json({ success: false, message: 'Only SANCTIONED loans can be disbursed' });
    }

    loan.status = 'DISBURSED';
    loan.disbursedBy = req.user._id;
    loan.disbursedAt = new Date();
    loan.outstandingBalance = loan.loanDetails.totalRepayable;
    await loan.save();

    res.json({ success: true, message: 'Loan disbursed', loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Collection: Record payment
// @route POST /api/loans/:id/payment
// @access Collection Officer
exports.recordPayment = async (req, res) => {
  try {
    const { utrNumber, amount, date } = req.body;
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    if (loan.status !== 'DISBURSED') {
      return res.status(400).json({ success: false, message: 'Only DISBURSED loans can receive payments' });
    }

    // Check for duplicate UTR
    const duplicate = loan.payments.find(p => p.utrNumber === utrNumber);
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Duplicate UTR number' });
    }

    if (amount > loan.outstandingBalance) {
      return res.status(400).json({ success: false, message: 'Payment exceeds outstanding balance' });
    }

    loan.payments.push({ utrNumber, amount, date, recordedBy: req.user._id });
    loan.outstandingBalance = Math.round((loan.outstandingBalance - amount) * 100) / 100;

    if (loan.outstandingBalance <= 0) {
      loan.status = 'CLOSED';
      loan.outstandingBalance = 0;
    }

    await loan.save();
    res.json({ success: true, message: 'Payment recorded', loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Admin: Get all users
// @route GET /api/loans/admin/stats
// @access Admin
exports.getAdminStats = async (req, res) => {
  try {
    const stats = await Loan.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$loanDetails.amount' }
        }
      }
    ]);
    const totalLoans = await Loan.countDocuments();
    res.json({ success: true, totalLoans, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
