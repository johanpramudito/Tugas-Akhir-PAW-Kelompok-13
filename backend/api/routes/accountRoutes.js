const express = require('express');
const router = express.Router();
const { addAccount } = require('../controller/postController');
const { updateAccount } = require('../controller/putController');
const { deleteAccount } = require('../controller/deleteController');
const getController = require('../controller/getController');

// Route 
router.post('/addAccount', addAccount);
router.put('/updateAccount/:id', updateAccount);
router.delete('/deleteAccount/:id', deleteAccount);
router.get('/search', getController.searchAccounts);
router.get('/getAccount', getController.getAccounts);
router.get('/sortingAccount/:sort', getController.getSortedAccounts);
module.exports = router;
