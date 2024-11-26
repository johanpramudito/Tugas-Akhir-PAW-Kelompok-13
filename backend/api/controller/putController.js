const Account = require('../models/account');
const Record = require('../models/record');
const mongoose = require('mongoose');

// Fungsi untuk mengupdate akun berdasarkan ID
async function updateAccount(req, res) {
  try {
    const { id } = req.params;
    const { name, type, initialAmount } = req.body;

    // Cari akun berdasarkan ID
    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Cek apakah akun sudah memiliki transaksi sebelumnya
    const hasTransactions = await Record.exists({ account: id });

    // Jika belum ada transaksi, set balance ke 0, jika ada transaksi maka biarkan saldo tidak berubah
    const balance = hasTransactions ? account.balance : initialAmount;

    // Update akun dengan data baru, termasuk saldo
    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      { name, type, initialAmount, balance },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedAccount);
  } catch (error) {
    console.error('Error updating account:', error); // Log the error for debugging
    res.status(400).json({ message: 'Error updating account', error: error.message });
  }
};

// Fungsi untuk mengupdate record berdasarkan ID
const updateRecord = async (req, res) => {
  const { id } = req.params;
  const { type, amount, category, note, location, toAccountId, accountId, dateTime } = req.body;

  const numericAmount = parseInt(amount, 10); // Pastikan amount adalah angka

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const record = await Record.findById(id).session(session);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const originalAccount = await Account.findById(record.accountId).session(session);
    if (!originalAccount) {
      return res.status(404).json({ message: 'Original account not found' });
    }

    // Kembalikan transaksi sebelumnya
    if (record.type === 'Expense') {
      originalAccount.balance += record.amount;
    } else if (record.type === 'Income') {
      originalAccount.balance -= record.amount;
    } else if (record.type === 'Transfer') {
      originalAccount.balance += record.amount;

      const originalToAccount = await Account.findById(record.toAccountId).session(session);
      if (!originalToAccount) {
        return res.status(404).json({ message: 'Original destination account not found' });
      }

      originalToAccount.balance -= record.amount;
      await originalToAccount.save({ session });
    }

    await originalAccount.save({ session });

    let targetAccount = originalAccount;
    if (accountId && accountId !== record.accountId) {
      targetAccount = await Account.findById(accountId).session(session);
      if (!targetAccount) {
        return res.status(404).json({ message: 'Target account not found' });
      }
    }

    // Perbarui field record
    if (type) record.type = type;
    if (amount !== undefined) record.amount = numericAmount; // Perbarui dengan angka
    if (category) record.category = category;
    if (note) record.note = note;
    if (location) record.location = location;
    if (accountId) record.accountId = accountId;
    if (toAccountId) record.toAccountId = toAccountId;

    // Perbarui `dateTime` atau gunakan waktu saat ini jika tidak disediakan
    record.dateTime = dateTime ? new Date(dateTime) : new Date();

    // Hapus field berdasarkan jenis transaksi
    if (type === 'Expense') {
      record.toAccountId = null;
    } else if (type === 'Income') {
      record.category = "Income";
      record.toAccountId = null;
    } else if (type === 'Transfer') {
      record.category = "Transfer";
    }

    // Terapkan transaksi baru
    if (type === 'Expense' || (!type && record.type === 'Expense')) {
      targetAccount.balance -= numericAmount;
    } else if (type === 'Income' || (!type && record.type === 'Income')) {
      targetAccount.balance += numericAmount;
    } else if (type === 'Transfer' || (!type && record.type === 'Transfer')) {
      targetAccount.balance -= numericAmount;

      const targetToAccount = await Account.findById(toAccountId || record.toAccountId).session(session);
      if (!targetToAccount) {
        return res.status(404).json({ message: 'Target destination account not found' });
      }

      targetToAccount.balance += numericAmount;
      await targetToAccount.save({ session });
    }

    await record.save({ session });
    await targetAccount.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      message: 'Record updated successfully',
      record,
      account: targetAccount
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating record:', error); // Log error untuk debugging
    res.status(500).json({
      message: 'Error updating record',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};


module.exports = { updateAccount, updateRecord };