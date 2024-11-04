// putController.js
const Account = require('../models/account');

// Fungsi untuk mengupdate akun berdasarkan ID
async function updateAccount(req, res) {
  try {
    const { id } = req.params;
    const { name, type, initialAmount } = req.body;

    // Update akun dengan data baru
    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      { name, type, initialAmount },
      { new: true, runValidators: true }
    );

    if (!updatedAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.status(200).json(updatedAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = { updateAccount };
