// deleteController.js
const Account = require('../models/account');

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

module.exports = { deleteAccount };
