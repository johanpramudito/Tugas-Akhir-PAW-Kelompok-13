const express = require('express');
const AccountRouter = express.Router();
const { addAccount } = require('../controller/postController');
const { updateAccount } = require('../controller/putController');
const { deleteAccount } = require('../controller/deleteController');
const { searchAccounts, getAccounts, getSortedAccounts } = require('../controller/getController');

// Route 
AccountRouter.post('/addAccount/:userId', addAccount);
AccountRouter.put('/updateAccount/:id', updateAccount);
AccountRouter.delete('/deleteAccount/:id', deleteAccount);
AccountRouter.get('/search', searchAccounts);
AccountRouter.get('/getAccount/:userId', getAccounts);
AccountRouter.get('/sortingAccount/:sort', getSortedAccounts);

module.exports = AccountRouter;
