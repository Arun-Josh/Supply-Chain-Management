const router = require('express').Router();
const PurchaseReturns = require('./../models/purchase-returns.model')
const UsersService = require('../services/users');
const AccountTransactionService = require('../services/accountTransaction')
const Admin = require('../models/admins.model.js');

router.route('/:from_date/:to_date/:user_id').get((req, res) => {
    PurchaseReturns.aggregate([
        {
            $match: {
                // payment_for: req.params.user_id
                // { $and: [{ payment_for: req.params.user_id }, { date_of_payment: { $gte: req.params.from_date, $lte: req.params.to_date } }] }
            }
        },
        {
            $lookup: {
                from: "USERS",
                localField: "purchase_return_for",
                foreignField: "_id",
                as: "users"
            }
        }, {
            $project:
            {
                "date_of_purchase_return": 1,
                "purchase_return_for": 1,
                "sub_commodities": 1,
                "invoice_no": 1,
                "net_total": 1,
                "users.user_name": 1,

            }
        },

    ])
        // PurchaseReturns.find({ $and: [{ purchase_return_for: req.params.user_id }, { date_of_purchase_return: { $gt: req.params.from_date } }, { date_of_purchase_return: { $lt: req.params.to_date } }] })
        .then(purchase_return => {
            res.json(purchase_return)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})


router.route('/:from_date/:to_date').get((req, res) => {
    PurchaseReturns.aggregate([
        {
            $match: {
                // payment_for: req.params.user_id
                // { $and: [{ payment_for: req.params.user_id }, { date_of_payment: { $gte: req.params.from_date, $lte: req.params.to_date } }] }
            }
        },
        {
            $lookup: {
                from: "USERS",
                localField: "purchase_return_for",
                foreignField: "_id",
                as: "users"
            }
        }, {
            $project:
            {
                "date_of_purchase_return": 1,
                "purchase_return_for": 1,
                "sub_commodities": 1,
                "invoice_no": 1,
                "net_total": 1,
                "users.user_name": 1,

            }
        },

    ])
        // PurchaseReturns.find({ $and: [{ date_of_purchase_return: { $gt: req.params.from_date } }, { date_of_purchase_return: { $lt: req.params.to_date } }] })
        .then(purchase_return => {
            res.json(purchase_return)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})

router.route('/:id').get((req, res) => {
    PurchaseReturns.findById(req.params.id)
        .then(purchase_return => res.json(purchase_return))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

router.route('/').get((req, res) => {
    PurchaseReturns.find()
        .then(purchase_return => {
            res.json(purchase_return)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})



router.route('/add').post((req, res) => {

    const purchaseData = req.body;

    var opening_balance = 0;
    var transaction_id = 0;
    var date_of_transaction = purchaseData.date_of_purchase_return;
    var transaction_type = "PURCHASE_RETURN";
    var user_id = purchaseData.purchase_return_for;
    var commodity_name = purchaseData.commodity_group;
    var particulars = purchaseData.sub_commodities;
    var debit = 0;
    var credit = Number(purchaseData.net_total);
    var closing_balance = 0;

    PurchaseReturns.countDocuments()
        .then(count => {
            purchaseData.invoice_no = count + 1 + 10000;
            console.log(purchaseData)
            const newPurchaseReturns = new PurchaseReturns(purchaseData);
            newPurchaseReturns.save()
                .then((purchasereturnresult) => {
                    transaction_id = purchasereturnresult._id;
                    console.log("going to get balance", purchasereturnresult)
                    Admin.find()
                        .then(admins => {

                            const adminId = admins[0]._id;

                            // UsersService.getUserBalanceforDate(adminId, date_of_transaction, function (adminresult) {

                            UsersService.getUserBalanceforDate(user_id, date_of_transaction, function (result) {
                                opening_balance = result;
                                closing_balance = opening_balance + credit - debit;
                                console.log(opening_balance, closing_balance, transaction_id)
                                var accountTransactionData = {
                                    date_of_transaction,
                                    transaction_type,
                                    transaction_id,
                                    user_id,
                                    commodity_name,
                                    particulars,
                                    debit,
                                    credit,
                                    opening_balance,
                                    closing_balance

                                }

                                AccountTransactionService.createTransaction(accountTransactionData, function (result) {
                                    if (result) {
                                        // var adminTransactionData = accountTransactionData;
                                        // adminTransactionData.credit = accountTransactionData.credit;
                                        // adminTransactionData.debit = 0;
                                        // adminTransactionData.user_id = adminId;
                                        // adminTransactionData.opening_balance = adminresult;
                                        // adminTransactionData.closing_balance = adminTransactionData.opening_balance + adminTransactionData.credit - adminTransactionData.debit;

                                        // console.log("------------------", adminTransactionData)
                                        // AccountTransactionService.createAdminTransaction(adminTransactionData, function (result) {
                                        //     if (result) {
                                        UsersService.updateUserBalance(user_id, function (result) {
                                            if (result) {
                                                res.json(purchaseData.invoice_no)
                                            }
                                            else {
                                                res.status(400).json({ message: "Error in updating user balance" })
                                            }
                                        });
                                        //     }
                                        //     else {
                                        //         res.status(400).json({ message: "Error in creating admin transaction" })
                                        //     }



                                        // })
                                    }
                                    else {
                                        res.status(400).json({ message: "Error in creating transaction" })
                                    }
                                })
                            })
                            // })
                        })
                })
                .catch(err => res.status(400).json("Error: " + err))
        })
})

router.route('/update/:id').post((req, res) => {

    const purchase_returnData = req.body;

    var opening_balance = 0;
    var transaction_id = req.params.id;
    var date_of_transaction = purchase_returnData.date_of_purchase_return;
    var transaction_type = "PURCHASE_RETURN";
    var user_id = purchase_returnData.purchase_return_for;
    var commodity_name = purchase_returnData.commodity_group;
    var particulars = purchase_returnData.sub_commodities;
    var debit = 0;
    var credit = Number(purchase_returnData.net_total);
    var closing_balance = 0;

    PurchaseReturns.findById(req.params.id)
        .then(purchase_return => {

            purchase_return.purchase_return_for = req.body.purchase_return_for;
            purchase_return.commodity_group = req.body.commodity_group;
            purchase_return.invoice_no = purchase_return.invoice_no;
            purchase_return.purchase_invoice_no = req.body.purchase_invoice_no;
            purchase_return.date_of_purchase_return = req.body.date_of_purchase_return;
            purchase_return.metric_ton = req.body.metric_ton;
            purchase_return.net_total = req.body.net_total;
            purchase_return.sub_commodities = req.body.sub_commodities;
            purchase_return.purchase_return_description = req.body.purchase_return_description;

            purchase_return.save()
                .then(() => {
                    Admin.find()
                        .then(admins => {

                            const adminId = admins[0]._id;

                            const accountTransactionData = {
                                date_of_transaction,
                                transaction_type,
                                transaction_id,
                                user_id,
                                commodity_name,
                                particulars,
                                debit,
                                credit,
                                opening_balance,
                                closing_balance

                            }
                            AccountTransactionService.editTransaction(accountTransactionData, function (result) {
                                if (result) {
                                    var adminTransactionData = accountTransactionData;

                                    adminTransactionData.user_id = adminId;
                                    AccountTransactionService.editAdminTransaction(adminTransactionData, function (result) {
                                        if (result) {
                                            UsersService.updateUserBalance(req.body.purchase_return_for, function (result) {
                                                if (result) {
                                                    res.json("PurchaseReturn Updated")
                                                }
                                                else {
                                                    res.status(400).json({ message: "Error in updating user balance" })
                                                }
                                            });
                                        }
                                        else {
                                            res.status(400).json({ message: "Error in creating transaction" })
                                        }
                                    });
                                }
                                else {
                                    res.status(400).json({ message: "Error in creating transaction" })
                                }
                            })
                        })
                })
                .catch(err => { res.status(400).json({ message: "" + err }) });

        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

module.exports = router;
