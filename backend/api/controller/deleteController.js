const Account = require('../models/account');
const Record = require('../models/record');
const mongoose = require('mongoose');

// Fungsi untuk menghapus akun berdasarkan ID
async function deleteAccount(req, res) {
  try {
    const { id } = req.params;

    // Validate account ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid account ID: ${id}`);
      return res.status(400).json({ message: 'Invalid account ID' });
    }

    // Find and delete the account
    const deletedAccount = await Account.findByIdAndDelete(id);

    if (!deletedAccount) {
      console.error(`Account not found for ID: ${id}`);
      return res.status(404).json({ message: 'Account not found' });
    }

    // Delete related records
    const result = await Record.deleteMany({ accountId: id });
    console.log(`Deleted ${result.deletedCount} records related to accountId: ${id}`);

    res.status(200).json({ message: 'Account and related records deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAccount:', error.message); // Log error message
    res.status(500).json({ message: 'Server error while deleting account' });
  }
};

const deleteRecord = async (req, res) => {
  try {
    // Ambil recordId dari parameter request
    const { id } = req.params;

    // Cari record berdasarkan ID
    const record = await Record.findById(id);

    if (!record) {
      console.error(`Record not found for ID: ${id}`);
      return res.status(404).json({ message: 'Record not found' });
    }

    // Log the entire record to debug accountId
    console.log('Record found:', record);

    // Get accountId from record
    const { accountId, amount, type, toAccountId } = record;

    // Handle case where accountId is undefined
    if (!accountId) {
      console.error(`Missing accountId in record for ID: ${id}`);
      return res.status(400).json({ message: 'Account ID is missing in the record' });
    }

    // Proceed with deletion and balance update...
    await Record.findByIdAndDelete(id);

    // Update saldo account setelah record dihapus
    const account = await Account.findById(accountId);

    if (!account) {
      console.error(`Account not found for ID: ${accountId}`);
      return res.status(404).json({ message: 'Account not found' });
    }

    // Tentukan perubahan saldo berdasarkan jenis record (Expense/Income/Transfer)
    if (type === 'Expense') {
      account.balance += amount;  // Subtract the amount for expenses
    } else if (type === 'Income') {
      account.balance -= amount;  // Add the amount for income
    } else if (type === 'Transfer') {
      // Handle transfer between accounts
      const targetAccount = await Account.findById(toAccountId);

      if (!targetAccount) {
        console.error(`Target account not found for transfer toAccountId: ${toAccountId}`);
        return res.status(404).json({ message: 'Target account not found' });
      }

      // Update balances for both sender and receiver
      account.balance += amount;
      targetAccount.balance -= amount;

      await targetAccount.save();
    }

    await account.save();

    res.status(200).json({
      message: 'Record successfully deleted',
      record,
      updatedAccount: account
    });
  } catch (error) {
    console.error('Error in deleteRecord:', error.message); // Log error message
    res.status(500).json({ message: 'Server error while deleting record' });
  }
};

module.exports = { deleteAccount, deleteRecord };