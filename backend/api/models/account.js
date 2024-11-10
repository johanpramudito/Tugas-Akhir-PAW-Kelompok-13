const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Bank', 'Cash'], required: true },
  initialAmount: { type: Number, required: true },
  balance: { type: Number, required: true },
  records: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record' }]
});

accountSchema.pre('save', function (next) {
  if (!this.balance) {
    this.balance = this.initialAmount;
  }
  next();
});

module.exports = mongoose.model('Account', accountSchema);
