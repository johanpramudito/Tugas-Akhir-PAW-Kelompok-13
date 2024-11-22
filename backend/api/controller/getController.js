const Account = require('../models/account');
const Record = require('../models/record')

const getAccounts = async (req, res) => {
  try {
    // Ambil semua data dari schema Account
    const accounts = await Account.find({});
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getRecordById = async (req, res) => {
  const { id } = req.params;

  try {
    const record = await Record.findById(id).populate('account').populate('toAccount');
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecordsByAccountId = async (req, res) => {
  const { accountId } = req.params;

  try {
    const records = await Record.find({ account: accountId }).populate('account').populate('toAccount');
    if (!records || records.length === 0) {
      return res.status(404).json({ message: 'No records found for this account' });
    }
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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

//sorting account (a-z, balance)
const getSortedAccounts = async (req, res) => {
  try {
    const { sort } = req.params;

    let sortOption = {};
    if (sort === 'A-Z') sortOption = { name: 1 };
    else if (sort === 'Z-A') sortOption = { name: -1 };
    else if (sort === 'BalanceLowest') sortOption = { "balance": 1 };
    else if (sort === 'BalanceHighest') sortOption = { balance: -1 };

    const accounts = await Account.find({}).sort(sortOption);
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//sorting records 
const getSortedRecords = async (req, res) => {
  try {
    const { sort } = req.params;

    let sortOption = {};
    if (sort === 'timeasc') sortOption = { date: 1 };
    else if (sort === 'TimeDescending') sortOption = { date: -1 };
    else if (sort === 'AmountLowest') sortOption = { amount: 1 };
    else if (sort === 'AmountHighest') sortOption = { amount: -1 };

    const records = await Record.find({}).sort(sortOption).populate('account toAccount');
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//filter by Date (Month and Year)
const getFilteredRecords = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required for filtering' });
    }

    const startDate = new Date(year, month - 1, 1); // Awal bulan
    const endDate = new Date(year, month, 0); // Akhir bulan

    const records = await Record.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('account toAccount');

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




module.exports = { getAccounts, searchAccounts, getRecordsByAccountId, getRecordById, getSortedAccounts, getSortedRecords, getFilteredRecords };
