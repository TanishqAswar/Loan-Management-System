const mongoose = require('mongoose');

const schema = new mongoose.Schema({ name: String });
schema.pre('save', async function(next) {
  try {
    console.log(typeof next);
    next();
  } catch (e) {
    console.error(e);
  }
});

const M = mongoose.model('Test', schema);
const m = new M({ name: 'test' });
m.save().catch(e => console.log('Err:', e.message));
