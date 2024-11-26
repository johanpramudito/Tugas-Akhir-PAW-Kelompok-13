const Account = require('../models/account');
const Record = require('../models/record')

const getAccounts = async (req, res) => {
  const { userId } = req.params;

  try {
    const accounts = await Account.find({ userId: userId });
    if (!accounts || accounts.length === 0) {
      console.warn(`No accounts found for userId: ${userId}`);
      return res.status(404).json({ message: 'No accounts found for this user' });
    }
    res.status(200).json(accounts);
  } catch (error) {
    console.error(`Error in getAccounts for userId: ${userId} - ${error.message}`);
    res.status(500).json({ message: 'Error fetching accounts', error: error.message });
  }
};

const getRecordsByAccount = async (req, res) => {
  const { accountId } = req.params;

  try {
    const records = await Record.find({ accountId: accountId });
    if (!records || records.length === 0) {
      console.warn(`No records found for accountId: ${accountId}`);
      return res.status(404).json({ message: 'No records found for this account' });
    }
    res.status(200).json(records);
  } catch (error) {
    console.error(`Error in getRecordsByAccountId for accountId: ${accountId} - ${error.message}`);
    res.status(500).json({ message: 'Error fetching records', error: error.message });
  }
};

const searchAccounts = async (req, res) => {
  const { query } = req.query;

  try {
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const accounts = await Account.find({
      name: { $regex: query, $options: 'i' }
    });
    res.status(200).json(accounts);
  } catch (error) {
    console.error(`Error in searchAccounts with query: ${query} - ${error.message}`);
    res.status(500).json({ message: 'Error searching accounts', error: error.message });
  }
};

const getSortedAccounts = async (req, res) => {
  try {
    const { sort } = req.params;

    let sortOption = {};
    if (sort === 'A-Z') sortOption = { name: 1 };
    else if (sort === 'Z-A') sortOption = { name: -1 };
    else if (sort === 'BalanceLowest') sortOption = { balance: 1 };
    else if (sort === 'BalanceHighest') sortOption = { balance: -1 };
    else {
      console.warn(`Invalid sort parameter: ${sort}`);
      return res.status(400).json({ message: 'Invalid sort option' });
    }

    const accounts = await Account.find({}).sort(sortOption);
    res.status(200).json(accounts);
  } catch (error) {
    console.error(`Error in getSortedAccounts - ${error.message}`);
    res.status(500).json({ message: 'Error fetching sorted accounts', error: error.message });
  }
};

const getSortedRecords = async (req, res) => {
  try {
    const { sort } = req.params;

    let sortOption = {};
    if (sort === 'TimeAscending') sortOption = { dateTime: 1 };
    else if (sort === 'TimeDescending') sortOption = { dateTime: -1 };
    else if (sort === 'AmountLowest') sortOption = { amount: 1 };
    else if (sort === 'AmountHighest') sortOption = { amount: -1 };
    else {
      console.warn(`Invalid sort parameter: ${sort}`);
      return res.status(400).json({ message: 'Invalid sort option' });
    }

    const records = await Record.find({}).sort(sortOption);
    res.status(200).json(records);
  } catch (error) {
    console.error(`Error in getSortedRecords - ${error.message}`);
    res.status(500).json({ message: 'Error fetching sorted records', error: error.message });
  }
};

const getFilteredRecordsByTime = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;
    let start, end;

    // Get the current time zone offset (in minutes)
    const offset = new Date().getTimezoneOffset() * 60000; // Convert to milliseconds

    if (filter) {
      switch (filter) {
        case 'Today':
          start = new Date();
          start.setHours(0, 0, 0, 0);
          start = new Date(start.getTime() - offset);

          end = new Date();
          end.setHours(23, 59, 59, 999);
          end = new Date(end.getTime() - offset);
          break;
        case 'Last_7_days':
          start = new Date();
          start.setDate(start.getDate() - 7);
          start = new Date(start.getTime() - offset);

          end = new Date();
          end = new Date(end.getTime() - offset);
          break;
        case 'Last_30_days':
          start = new Date();
          start.setDate(start.getDate() - 30);
          start = new Date(start.getTime() - offset);

          end = new Date();
          end = new Date(end.getTime() - offset);
          break;
        case 'This_week':
          start = new Date();
          start.setDate(start.getDate() - start.getDay());
          start = new Date(start.getTime() - offset);

          end = new Date();
          end.setDate(end.getDate() - end.getDay() + 6);
          end = new Date(end.getTime() - offset);
          break;
        case 'This_month':
          start = new Date();
          start.setDate(1);
          start = new Date(start.getTime() - offset);

          end = new Date();
          end.setMonth(end.getMonth() + 1, 0);
          end = new Date(end.getTime() - offset);
          break;
        case 'Last_90_days':
          start = new Date();
          start.setDate(start.getDate() - 90);
          start = new Date(start.getTime() - offset);

          end = new Date();
          end = new Date(end.getTime() - offset);
          break;
        case 'This_year':
          start = new Date();
          start.setMonth(0, 1);
          start = new Date(start.getTime() - offset);

          end = new Date();
          end.setMonth(11, 31);
          end = new Date(end.getTime() - offset);
          break;
        case 'Last_12_months':
          start = new Date();
          start.setMonth(start.getMonth() - 12);
          start = new Date(start.getTime() - offset);

          end = new Date();
          end = new Date(end.getTime() - offset);
          break;
        default:
          console.warn(`Invalid filter value: ${filter}`);
          return res.status(400).json({ message: 'Invalid filter value' });
      }
    } else if (startDate && endDate) {
      start = new Date(startDate);
      start = new Date(start.getTime() - offset);

      end = new Date(endDate);
      end = new Date(end.getTime() - offset);
    } else {
      return res.status(400).json({ message: 'Invalid query parameters' });
    }

    const records = await Record.find({
      dateTime: { $gte: start, $lte: end }
    });

    res.status(200).json(records);
  } catch (error) {
    console.error(`Error in getFilteredRecordsByTime - ${error.message}`);
    res.status(500).json({ message: 'Error filtering records by time', error: error.message });
  }
};

const getFilteredRecordByCategory = async (req, res) => {
  try {
    const { filter } = req.query;

    if (!filter) {
      return res.status(400).json({ message: 'Category query parameter is required' });
    }

    const validCategories = [
      'Food&Beverages',
      'Shopping',
      'Housing',
      'Transport',
      'Entertainment',
      'Recreation',
      'Income',
      'Transfer'
    ];

    if (!validCategories.includes(filter)) {
      return res.status(400).json({ message: 'Invalid category value' });
    }

    const records = await Record.find({ category: filter });

    if (records.length === 0) {
      return res.status(404).json({ message: `No records found for category: ${filter}` });
    }

    res.status(200).json(records);
  } catch (error) {
    console.error(`Error in getFilteredRecordByCategory - ${error.message}`);
    res.status(500).json({ message: 'Error filtering records by category', error: error.message });
  }
};

const getRecordsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const accounts = await Account.find({ userId: userId });
    if (!accounts || accounts.length === 0) {
      console.warn(`No accounts found for userId: ${userId}`);
      return res.status(404).json({ message: 'No accounts found for this user' });
    }

    const records = await Record.find({
      accountId: { $in: accounts.map(account => account._id) }
    }).populate('accountId') // Populate the accountId field in the Record
    .populate('toAccountId');
    res.status(200).json(records);
  } catch (error) {
    console.error(`Error in getRecordsByUser for userId: ${userId} - ${error.message}`);
    res.status(500).json({ message: 'Error fetching records for this user', error: error.message });
  }
};

module.exports = {
  getAccounts,
  getRecordsByAccount,
  searchAccounts,
  getSortedAccounts,
  getSortedRecords,
  getFilteredRecordsByTime,
  getFilteredRecordByCategory,
  getRecordsByUser
};
