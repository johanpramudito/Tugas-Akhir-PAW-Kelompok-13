// deleteController.js
const Account = require('../models/account');
const Record = require('../models/record');
// Fungsi untuk menghapus akun berdasarkan ID
async function deleteAccount(req, res) {
  try {
    const { id } = req.params;

    const deletedAccount = await Account.findByIdAndDelete(id);

    if (!deletedAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

 

const deleteRecord = async (req, res) => {
  try {
    // Ambil recordId dari parameter request
    const { recordId } = req.params;

    // Cari record berdasarkan ID
    const record = await Record.findById(recordId);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Jika record ditemukan, simpan accountId dan amount
    const { account: accountId, amount, type, toAccount } = record;

    // Hapus record
    await Record.findByIdAndDelete(recordId);

    // Update saldo account setelah record dihapus
    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Tentukan perubahan saldo berdasarkan jenis record (Expense/Income/Transfer)
    if (type === 'Expense') {
      // Jika jenis record adalah Expense, kurangi saldo
      account.balance += amount;
    } else if (type === 'Income') {
      // Jika jenis record adalah Income, tambahkan saldo
      account.balance -= amount;
    } else if (type === 'Transfer') {
      // Jika jenis record adalah Transfer, perlu update saldo di dua akun
      const targetAccount = await Account.findById(toAccount);
      
      if (!targetAccount) {
        return res.status(404).json({ message: 'Target account not found' });
      }

      // Kurangi saldo dari account pengirim
      account.balance += amount;
      // Tambahkan saldo ke account penerima
      targetAccount.balance -= amount;

      // Simpan perubahan saldo pada kedua akun
      await targetAccount.save();
    }

    // Simpan perubahan saldo pada account pengirim
    await account.save();

    // Kirimkan response sukses
    res.status(200).json({
      message: 'Record successfully deleted',
      record,
      updatedAccount: account
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};




module.exports = { deleteAccount, deleteRecord };
