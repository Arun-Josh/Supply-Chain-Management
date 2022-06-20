const router = require('express').Router();
let AccountTransaction = require('../models/accountTransactions.model');
const Admin = require('../models/admins.model.js');

router.route('/:from_date/:to_date/:user_id').get((req, res) => {
    AccountTransaction.find({ $and: [{ user_id: req.params.user_id }, { date_of_transaction: { $gt: req.params.from_date } }, { date_of_transaction: { $lt: req.params.to_date } }] })
        .then(transactions => {
            res.json(transactions)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})

router.route('/:from_date/:to_date').get((req, res) => {
    AccountTransaction.find({ $and: [{ date_of_transaction: { $gt: req.params.from_date } }, { date_of_transaction: { $lt: req.params.to_date } }] })
        .then(transactions => {
            res.json(transactions)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})

router.route('/admin/true/:from_date/:to_date').get((req, res) => {
    Admin.find()
        .then(admins => {


            AccountTransaction.find({ $and: [{ user_id: admins[0]._id }, { date_of_transaction: { $gt: req.params.from_date } }, { date_of_transaction: { $lt: req.params.to_date } }] })
                .then(transactions => {
                    res.json(transactions)
                })
                .catch((err) => res.status(400).json('Error: ' + err));
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})



module.exports = router;