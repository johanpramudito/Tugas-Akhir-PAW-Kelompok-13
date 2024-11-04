const express = require('express');
const router = express.Router();
const { getAccounts } = require('../controller/getController');
const { addAccount } = require('../controller/postController');
const { updateAccount } = require('../controller/putController');
const { deleteAccount } = require('../controller/deleteController');

// Route 
router.post('/addAccount', addAccount);
router.get('/detailAccounts', getAccounts);
router.put('/updateAccount/:id', updateAccount);
router.delete('/deleteAccount/:id', deleteAccount);

module.exports = router;
