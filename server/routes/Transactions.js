const router = require('express').Router();
const Transaction = require('./../models/transactions.model')

router.route('/').get((req, res) => {
    Transaction.find()
        .then(transactions => {
            res.json(transactions)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})

router.route('/add').post((req, res) => {
    
    const transactionData = req.body;
    console.log(req.body)
    const newTransaction = new Transaction(transactionData);
    newTransaction.save()
        .then(() => {
            res.json("success")
        })
        .catch(err => res.status(400).json("Error: " + err))
})

module.exports = router;
