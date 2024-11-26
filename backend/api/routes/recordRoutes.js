const express = require('express');
const RecordRouter = express.Router();
const { deleteRecord } = require('../controller/deleteController');
const { updateRecord } = require('../controller/putController');
const { getRecordsByAccount, getSortedRecords, getFilteredRecordsByTime, getFilteredRecordByCategory, getRecordsByUser } = require('../controller/getController');
const { addRecord, addTransfer } = require('../controller/postController');

// //route detail satu record
// router.get('/records/:id', getController.getRecordById);

// route melihat semua record yg dimiliki satu account
RecordRouter.get('/getRecord/:accountId', getRecordsByAccount);

RecordRouter.get('/getRecordByUser/:userId', getRecordsByUser);

// Route untuk menambahkan record
RecordRouter.post('/addRecord', addRecord);

// Route untuk transfer antar akun
RecordRouter.post('/addTransfer', addTransfer);

// // Route untuk menedit record tapi record sebelumnya masih ada di cloud
// router.post('/updateRecord', postController.addOrUpdateRecord);

// Route untuk mengupdate record dari id record
RecordRouter.put('/updateRecord/:id', updateRecord);

// Route untuk menghapus record berdasarkan ID record
RecordRouter.delete('/deleteRecord/:id', deleteRecord);

//sorting record (time dan jumlah)
RecordRouter.get('/sortingRecord/:sort', getSortedRecords);

//filter record by date
RecordRouter.get('/filterRecordByTime', getFilteredRecordsByTime);

//filter record by category
RecordRouter.get('/filterRecordByCategory', getFilteredRecordByCategory);

module.exports = RecordRouter;
