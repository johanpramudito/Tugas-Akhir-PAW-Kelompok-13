const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, enum: ['Expense', 'Income', 'Transfer'], required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ['Food & Beverages', 'Shopping', 'Housing', 'Transport', 'Entertainment', 'Recreation'],
    required: function() { return this.type === 'Expense'; } // Hanya wajib untuk Expense
  },
  toAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }, 
  date: { type: Date, default: Date.now },
  note: String,
  location: String
});

module.exports = mongoose.model('Record', recordSchema);
