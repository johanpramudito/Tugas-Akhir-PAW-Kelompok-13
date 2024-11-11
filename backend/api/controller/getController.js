const Account = require('../models/account');

const getAccounts = async (req, res) => {
    // Logika untuk mengambil semua akun
};

const searchAccounts = async (req, res) => {
    const { query } = req.query;
    try {
        // Hanya mencari berdasarkan nama
        const accounts = await Account.find({
            name: { $regex: query, $options: 'i' }  // 'i' untuk case-insensitive
        });
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Error in searching accounts', error });
    }
};

module.exports = { getAccounts, searchAccounts };
