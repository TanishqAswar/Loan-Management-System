const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Only allow admin to create non-borrower roles
    const allowedRole = role || 'borrower';
    const user = await User.create({ name, email, password, role: allowedRole });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('[register] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('[login] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc   Get leads (users who haven't applied for a loan)
// @route  GET /api/auth/leads
// @access Sales Executive
exports.getLeads = async (req, res) => {
  try {
    const Loan = require('../models/Loan');
    // All borrowers
    const borrowers = await User.find({ role: 'borrower' }).select('-password');
    // Loans that exist
    const loans = await Loan.find({ borrower: { $in: borrowers.map(b => b._id) } }).select('borrower');
    const borrowersWithLoans = loans.map(l => l.borrower.toString());
    
    // Filter
    const leads = borrowers.filter(b => !borrowersWithLoans.includes(b._id.toString()));
    
    res.json({ success: true, count: leads.length, leads });
  } catch (err) {
    console.error('[getLeads] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

