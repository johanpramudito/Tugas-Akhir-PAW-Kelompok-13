const express = require('express');
const router = express.Router();
const postController = require('../controller/postController'); // Pastikan path postController benar
const { deleteRecord } = require('../controller/deleteController');
const { EditRecord } = require('../controller/putController');
const getController = require('../controller/getController');

//route detail satu record
router.get('/records/:id', getController.getRecordById);

// route melihat semua record yg dimiliki satu account
router.get('/records/account/:accountId', getController.getRecordsByAccountId);

// Route untuk menambahkan record
router.post('/addRecord', postController.addRecord);

// Route untuk transfer antar akun
router.post('/addTransfer', postController.addTransfer);

// Route untuk menedit record tapi record sebelumnya masih ada di cloud
router.post('/updateRecord', postController.addOrUpdateRecord);

// Route untuk mengupdate record dari id record
router.put('/EditRecord/:recordId', EditRecord);

// Route untuk menghapus record berdasarkan ID record
router.delete('/deleteRecord/:recordId', deleteRecord);

//sorting record (time dan jumlah)
router.get('/sortingRecord/:sort', getController.getSortedRecords);

//filter record by date
router.get('/filterRecord', getController.getFilteredRecords);

module.exports = router;
