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

//edit record (bisa salah satu column aja atau bisa edit semua pake recordID)
async function EditRecord(req, res) {
  try {
    const { recordId } = req.params; // Get record ID from params
    const { type, amount, category, note, location } = req.body; // Get data from request body

    // Find the record by ID
    const record = await Record.findById(recordId).populate('account');
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Find the account associated with the record
    const account = record.account;
    if (!account) {
      return res.status(404).json({ message: 'Account not found for this record' });
    }

    // Revert the previous balance change only if amount exists
    if (amount !== undefined) {
      if (record.type === 'Income') {
        account.balance -= record.amount; // Subtract old amount
      } else if (record.type === 'Expense') {
        account.balance += record.amount; // Add old amount back
      }
    }

    // Update the record fields if provided in the request body
    if (type) record.type = type;
    if (amount !== undefined) record.amount = amount;
    if (category) record.category = category;
    if (note) record.note = note;
    if (location) record.location = location;
    record.date = new Date(); // Update the date to current date
    await record.save(); // Save the updated record

    // Apply the new balance change if amount exists
    if (amount !== undefined) {
      if (type === 'Income') {
        account.balance += amount;
      } else if (type === 'Expense') {
        account.balance -= amount;
      }
    }

    await account.save(); // Save the updated account balance

    // Return the success response
    res.status(200).json({
      message: 'Record updated successfully',
      record,
      account,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating record', error: error.message });
  }
}




module.exports = { updateAccount, EditRecord };
