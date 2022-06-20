const router = require('express').Router();
const Purchase = require('./../models/purchases.model')
const UsersService = require('../services/users');
const AccountTransactionService = require('../services/accountTransaction')
const Admin = require('../models/admins.model.js');



router.route('/:from_date/:to_date/:user_id').get((req, res) => {
    Purchase.aggregate([
        {
            $match: {
                // payment_for: req.params.user_id
                // { $and: [{ payment_for: req.params.user_id }, { date_of_payment: { $gte: req.params.from_date, $lte: req.params.to_date } }] }
            }
        },
        {
            $lookup: {
                from: "USERS",
                localField: "purchase_for",
                foreignField: "_id",
                as: "users"
            }
        }, {
            $project:
            {
                "date_of_purchase": 1,
                "purchase_for": 1,
                "sub_commodities": 1,
                "invoice_no": 1,
                "net_total": 1,
                "users.user_name": 1
            }
        },

    ])
        // Purchase.find({ $and: [{ purchase_for: req.params.user_id }, { date_of_purchase: { $gt: req.params.from_date } }, { date_of_purchase: { $lt: req.params.to_date } }] })
        .then(purchases => {
            res.json(purchases)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})


router.route('/:from_date/:to_date').get((req, res) => {
    Purchase.aggregate([
        {
            $match: {
                // payment_for: req.params.user_id
                // { $and: [{ payment_for: req.params.user_id }, { date_of_payment: { $gte: req.params.from_date, $lte: req.params.to_date } }] }
            }
        },
        {
            $lookup: {
                from: "USERS",
                localField: "purchase_for",
                foreignField: "_id",
                as: "users"
            }
        }, {
            $project:
            {
                "date_of_purchase": 1,
                "purchase_for": 1,
                "sub_commodities": 1,
                "invoice_no": 1,
                "net_total": 1,
                "users.user_name": 1
            }
        },

    ])
        // Purchase.find({ $and: [{ date_of_purchase: { $gt: req.params.from_date } }, { date_of_purchase: { $lt: req.params.to_date } }] })
        .then(purchases => {
            res.json(purchases)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})

router.route('/:id').get((req, res) => {
    Purchase.findById(req.params.id)
        .then(purchases => res.json(purchases))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

router.route('/').get((req, res) => {
    Purchase.find()
        .then(purchases => {
            res.json(purchases)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})

router.route('/add').post((req, res) => {

    const purchaseData = req.body;

    // for puchase

    purchaseData.status = true;
    purchaseData.sales_price = 0;
    purchaseData.sub_commodities.map(sub_commodity => {
        sub_commodity.stock = sub_commodity.sub_commodity_quantity;
    })


    // for debit and credit
    var opening_balance = 0;
    var transaction_id = 0;
    var date_of_transaction = purchaseData.date_of_purchase;
    var transaction_type = "PURCHASE";
    var user_id = purchaseData.purchase_for;
    var commodity_name = purchaseData.commodity_group;
    var particulars = purchaseData.sub_commodities;
    var debit = Number(purchaseData.net_total);
    var credit = 0;
    var closing_balance = 0;

    console.log(req.body)
    const newPurchase = new Purchase(purchaseData);
    newPurchase.save()
        .then((purchaseresult) => {

            transaction_id = purchaseresult._id;
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
                                // adminTransactionData.credit = adminTransactionData.debit;
                                // adminTransactionData.debit = 0;
                                // adminTransactionData.user_id = adminId;
                                // adminTransactionData.opening_balance = adminresult;
                                // adminTransactionData.closing_balance = adminTransactionData.opening_balance + adminTransactionData.credit - adminTransactionData.debit;


                                // AccountTransactionService.createAdminTransaction(adminTransactionData, function (result) {
                                // if (result) {
                                UsersService.updateUserBalance(user_id, function (result) {
                                    if (result) {
                                        res.json("success")
                                    }
                                    else {
                                        res.status(400).json({ message: "Error in updating user balance" })
                                    }
                                });
                                // }
                                // else {
                                //     res.status(400).json({ message: "Error in creating admin transaction" })
                                // }



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
        .catch(err => { console.log(err); res.status(400).json("Error: " + err) })
})

router.route('/update/:id').post((req, res) => {

    const purchaseData = req.body;

    var opening_balance = 0;
    var transaction_id = req.params.id;
    var date_of_transaction = purchaseData.date_of_purchase;
    var transaction_type = "PURCHASE";
    var user_id = purchaseData.purchase_for;
    var commodity_name = purchaseData.commodity_group;
    var particulars = purchaseData.sub_commodities;
    var debit = Number(purchaseData.net_total);;
    var credit = 0;
    var closing_balance = 0;

    Purchase.findById(req.params.id)
        .then(purchase => {

            purchase.purchase_for = req.body.purchase_for;
            purchase.commodity_group = req.body.commodity_group;
            purchase.invoice_no = req.body.invoice_no;
            purchase.date_of_purchase = req.body.date_of_purchase;
            purchase.metric_ton = req.body.metric_ton;
            purchase.total = req.body.total;
            purchase.discount = req.body.discount;
            purchase.net_total = req.body.net_total;
            purchase.sub_commodities = req.body.sub_commodities;
            purchase.purchase_description = req.body.purchase_description;

            purchase.save()
                .then(() => {

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
                            UsersService.updateUserBalance(req.body.purchase_for, function (result) {
                                if (result) {
                                    res.json("Purchase Updated")
                                }
                                else {
                                    res.status(400).json({ message: "Error in updating user balance" })
                                }
                            });
                        }
                        else {
                            res.status(400).json({ message: "Error in creating transaction" })
                        }
                    })
                })
                .catch(err => { res.status(400).json({ message: "" + err }) });

        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
});


module.exports = router;
