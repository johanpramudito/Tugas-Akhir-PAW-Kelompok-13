const Account = require('../models/account'); // Pastikan path ini benar

async function addAccount(req, res) {
  try {
    const { name, type, initialAmount } = req.body;

    // Buat instance baru dari model Account
    const newAccount = new Account({
      name,
      type,
      initialAmount,
      balance: initialAmount, // Default balance adalah initialAmount
      records: [] // Kosongkan saat pertama kali dibuat
    });

    // Simpan akun ke database
    const savedAccount = await newAccount.save();

    // Kirim respons berhasil
    res.status(201).json({ message: 'Account created successfully', account: savedAccount });
  } catch (error) {
    res.status(400).json({ message: 'Error creating account', error: error.message });
  }
}

module.exports = { addAccount };
