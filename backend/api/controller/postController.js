const Account = require('../models/account');
const Record = require('../models/record');
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

async function addOrUpdateRecord(req, res) {
  try {
    const { accountId, type, amount, category, note, location } = req.body;

    // Cari akun berdasarkan ID
    const account = await Account.findById(accountId).populate('record');
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    let record;
    if (account.record) {
      // Update record yang ada
      record = await Record.findByIdAndUpdate(account.record._id, {
        type,
        amount,
        category,
        note,
        location,
        date: new Date()
      }, { new: true });
    } else {
      // Buat record baru
      record = new Record({
        account: accountId,
        type,
        amount,
        category,
        note,
        location
      });
      await record.save();
      account.record = record._id; // Set record baru pada akun
    }

    // Hitung balance dan simpan akun
    account.balance += (type === 'Income' ? amount : -amount);
    await account.save();

    res.status(200).json({ message: 'Record added/updated successfully', account });
  } catch (error) {
    res.status(500).json({ message: 'Error adding/updating record', error: error.message });
  }
}

// Fungsi untuk menambah record baru
async function addRecord(req, res) {
  try {
    const { accountId, type, amount, category, note, location } = req.body;

    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const record = new Record({
      account: accountId,
      type,
      amount,
      category,
      note,
      location
    });

    account.balance += (type === 'Income' ? amount : -amount);

    await record.save();
    account.records.push(record._id);
    await account.save();

    res.status(201).json({ message: 'Record added successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Error adding record', error: error.message });
  }
}

// Fungsi untuk transfer antar akun
//ini kalo kalian make ini di bagian testing gaperlu pake type
async function addTransfer(req, res) {
  try {
    const { fromAccountId, toAccountId, amount, note, location } = req.body;

    console.log("Transfer request:", { fromAccountId, toAccountId, amount });

    const fromAccount = await Account.findById(fromAccountId);
    const toAccount = await Account.findById(toAccountId);

    if (!fromAccount) {
      console.log("From account not found:", fromAccountId);
    }
    if (!toAccount) {
      console.log("To account not found:", toAccountId);
    }

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ message: 'One or both accounts not found' });
    }

    if (fromAccount.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance in the source account' });
    }

    // Proceed with transfer
    const transferRecord = new Record({
      account: fromAccountId,
      type: 'Transfer', // gaperlu di declare lagi
      amount,
      toAccount: toAccountId,
      note,
      location
    });

    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await transferRecord.save();
    fromAccount.records.push(transferRecord._id);
    toAccount.records.push(transferRecord._id);

    await fromAccount.save();
    await toAccount.save();

    res.status(201).json({ message: 'Transfer completed successfully', transferRecord });
  } catch (error) {
    console.error("Error in transfer:", error);
    res.status(500).json({ message: 'Error completing transfer', error: error.message });
  }
}


module.exports = { addOrUpdateRecord, addRecord, addTransfer, addAccount };

