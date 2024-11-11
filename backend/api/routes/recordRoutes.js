const express = require('express');
const router = express.Router();
const postController = require('../controller/postController'); // Pastikan path postController benar
const { deleteRecord } = require('../controller/deleteController');
const { updateRecordByAccount } = require('../controller/putController');

// Route untuk menambahkan record
router.post('/addRecord', postController.addRecord);

// Route untuk transfer antar akun
router.post('/addTransfer', postController.addTransfer);

// Route untuk menambah atau mengupdate record
router.post('/updateRecord', postController.addOrUpdateRecord);

// Route untuk mengupdate amount berdasarkan akun
router.put('/updateRecordByAccount', updateRecordByAccount);

// Route untuk menghapus record berdasarkan ID record
router.delete('/deleteRecord/:recordId', deleteRecord);

module.exports = router;
