const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  toAccountId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Account', 
    required: function() { return this.type === 'Transfer'; } 
  }, 
  type: { type: String, enum: ['Expense', 'Income', 'Transfer'], required: true },
  amount: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: 'Amount cannot be negative.'
    }
  },
  category: {
    type: String,
    enum: ['Food & Beverages', 'Shopping', 'Housing', 'Transport', 'Entertainment', 'Recreation', 'Income', 'Transfer'],
    required: function() { return this.type === 'Expense'; } // Hanya wajib untuk Expense
  },
  dateTime: { type: Date, default: Date.now },
  note: String,
  location: String
});

module.exports = mongoose.model('Record', recordSchema);
