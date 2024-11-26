const Account = require('../models/account');
const Record = require('../models/record');
const mongoose = require('mongoose');

async function addAccount(req, res) {
  try {
    const { userId } = req.params; // Get user_id from the URL parameter
    const { name, type, initialAmount } = req.body;

    // Manually check if the user exists in the 'User' collection
    const userExists = await mongoose.connection.db.collection('User').findOne({ _id: new mongoose.Types.ObjectId(userId) });

    if (!userExists) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    // Create the new Account and link it to the user
    const newAccount = new Account({
      userId: userId, // Link the account to the user
      name,
      type,
      initialAmount,
      balance: initialAmount, // Default balance is the initial amount
    });

    const savedAccount = await newAccount.save();

    // Send success response
    res.status(201).json({ message: 'Account created successfully', account: savedAccount });
  } catch (error) {
    console.error(`Error creating account for userId ${req.params.userId}: ${error.message}`);
    res.status(400).json({ message: 'Error creating account', error: error.message });
  }
};

// Fungsi untuk menambah record baru
async function addRecord(req, res) {
  try {
    const { accountId, type, amount, category, note, dateTime, location } = req.body;

    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: 'Account not found' });

    // Automatically set category to 'Income' if type is 'Income'
    const adjustedCategory = type === 'Income' ? 'Income' : category;

    const record = new Record({
      accountId: accountId,
      type,
      amount,
      category: adjustedCategory,
      note,
      location,
      dateTime
    });

    // Update account balance
    account.balance += (type === 'Income' ? amount : -amount);

    await record.save();
    await account.save();

    res.status(201).json({ message: 'Record added successfully', record });
  } catch (error) {
    console.error(`Error adding record for accountId ${req.params.accountId}: ${error.message}`);
    res.status(500).json({ message: 'Error adding record', error: error.message });
  }
};

// Fungsi untuk transfer antar akun
async function addTransfer(req, res) {
  try {
    const { accountId, toAccountId, amount, note, location } = req.body;

    console.log("Transfer request:", { accountId, toAccountId, amount });

    const fromAccount = await Account.findById(accountId);
    const toAccount = await Account.findById(toAccountId);

    if (!fromAccount) {
      console.error(`From account not found: ${accountId}`);
      return res.status(404).json({ message: 'Source account not found' });
    }

    if (!toAccount) {
      console.error(`To account not found: ${toAccountId}`);
      return res.status(404).json({ message: 'Destination account not found' });
    }

    if (fromAccount.balance < amount) {
      console.error(`Insufficient balance in source account: ${accountId}`);
      return res.status(400).json({ message: 'Insufficient balance in the source account' });
    }

    // Proceed with transfer
    const transferRecord = new Record({
      accountId: accountId,
      type: 'Transfer',
      amount,
      toAccountId: toAccountId,
      category: 'Transfer',
      note,
      location
    });

    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await transferRecord.save();
    await fromAccount.save();
    await toAccount.save();

    res.status(201).json({ message: 'Transfer completed successfully', transferRecord });
  } catch (error) {
    console.error(`Error in transfer from accountId ${req.body.accountId} to ${req.body.toAccountId}: ${error.message}`);
    res.status(500).json({ message: 'Error completing transfer', error: error.message });
  }
};

module.exports = { addRecord, addTransfer, addAccount };