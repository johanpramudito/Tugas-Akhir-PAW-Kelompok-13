const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Bank', 'Cash'], required: true },
  initialAmount: Number,
  balance: Number,
  records: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record' }]
});

module.exports = mongoose.model('Account', accountSchema);
