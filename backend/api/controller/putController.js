// putController.js
const Account = require('../models/account');
const Record = require('../models/record');

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
    const balance = hasTransactions ? account.balance : 0;

    // Update akun dengan data baru, termasuk saldo
    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      { name, type, initialAmount, balance },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}


// Function to update record based on accountId
async function updateRecordByAccount(req, res) {
  try {
    const { accountId, type, amount, category, note, location, toAccountId } = req.body;

    // Validate type and amount
    if (!['Expense', 'Income', 'Transfer'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type value' });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    // Find the account based on accountId
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Handle Transfer separately
    if (type === 'Transfer') {
      if (!toAccountId) {
        return res.status(400).json({ message: 'toAccountId is required for transfer' });
      }

      const toAccount = await Account.findById(toAccountId);
      if (!toAccount) {
        return res.status(404).json({ message: 'Destination account not found' });
      }
      if (account.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance in the source account' });
      }

      // Create the transfer record
      const transferRecord = new Record({
        account: accountId,
        type: 'Transfer',
        amount,
        toAccount: toAccountId,
        note,
        location
      });
      
      // Update balances
      account.balance -= amount;
      toAccount.balance += amount;

      // Save changes
      await transferRecord.save();
      account.records.push(transferRecord._id);
      toAccount.records.push(transferRecord._id);

      await account.save();
      await toAccount.save();

      return res.status(201).json({ message: 'Transfer completed successfully', transferRecord });
    }

    // Find the latest record for the given accountId (if not a transfer)
    const record = await Record.findOne({ account: accountId }).sort({ date: -1 });
    if (!record) {
      return res.status(404).json({ message: 'Record not found for this account' });
    }

    // Adjust balance based on type
    if (type === 'Income') {
      account.balance += amount;
    } else if (type === 'Expense') {
      if (account.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance for this expense' });
      }
      account.balance -= amount;
    }

    // Update the record fields
    record.type = type;
    record.amount = amount;
    record.category = category || record.category;
    record.note = note || record.note;
    record.location = location || record.location;
    await record.save();

    // Save the account with the updated balance
    await account.save();

    res.status(200).json({ message: 'Record updated successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Error updating record', error: error.message });
  }
}

module.exports = { updateAccount, updateRecordByAccount };
