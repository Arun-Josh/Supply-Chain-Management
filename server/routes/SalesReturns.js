const router = require('express').Router();
const SalesReturns = require('./../models/sales-returns.model')
const UsersService = require('../services/users');
const AccountTransactionService = require('../services/accountTransaction')
const Admin = require('../models/admins.model.js');



router.route('/:from_date/:to_date/:user_id').get((req, res) => {
    SalesReturns.aggregate([
        {
            $match: {
                // payment_for: req.params.user_id
                // { $and: [{ payment_for: req.params.user_id }, { date_of_payment: { $gte: req.params.from_date, $lte: req.params.to_date } }] }
            }
        },
        {
            $lookup: {
                from: "USERS",
                localField: "sales_return_for",
                foreignField: "_id",
                as: "users"
            }
        }, {
            $lookup: {
                from: "COMMODITIES_GROUP",
                localField: "commodity_group",
                foreignField: "_id",
                as: "commodity_groups"
            }
        }, {
            $project:
            {
                "date_of_sales_return": 1,
                "sales_return_for": 1,
                "sub_commodities": 1,
                "invoice_no": 1,
                "net_total": 1,
                "users.user_name": 1
            }
        },

    ])
        // SalesReturns.find({ $and: [{ sales_return_for: req.params.user_id }, { date_of_sales_return: { $gt: req.params.from_date } }, { date_of_sales_return: { $lt: req.params.to_date } }] })
        .then(sales_return => {
            res.json(sales_return)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})


router.route('/:from_date/:to_date').get((req, res) => {
    SalesReturns.aggregate([
        {
            $match: {
                // payment_for: req.params.user_id
                // { $and: [{ payment_for: req.params.user_id }, { date_of_payment: { $gte: req.params.from_date, $lte: req.params.to_date } }] }
            }
        },
        {
            $lookup: {
                from: "USERS",
                localField: "sales_return_for",
                foreignField: "_id",
                as: "users"
            }
        }, {
            $lookup: {
                from: "COMMODITIES_GROUP",
                localField: "commodity_group",
                foreignField: "_id",
                as: "commodity_groups"
            }
        }, {
            $project:
            {
                "date_of_sales_return": 1,
                "sales_return_for": 1,
                "sub_commodities": 1,
                "invoice_no": 1,
                "net_total": 1,
                "users.user_name": 1
            }
        },

    ])
        // SalesReturns.find({ $and: [{ date_of_sales_return: { $gt: req.params.from_date } }, { date_of_sales_return: { $lt: req.params.to_date } }] })
        .then(sales_return => {
            res.json(sales_return)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})

router.route('/:id').get((req, res) => {
    SalesReturns.findById(req.params.id)
        .then(sales_return => res.json(sales_return))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

router.route('/').get((req, res) => {
    SalesReturns.find()
        .then(sales_return => {
            res.json(sales_return)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})

router.route('/add').post((req, res) => {

    const salesData = req.body;

    var opening_balance = 0;
    var transaction_id = 0;
    var date_of_transaction = salesData.date_of_sales_return;
    var transaction_type = "SALES_RETURN";
    var user_id = salesData.sales_return_for;
    var commodity_name = salesData.commodity_group;
    var particulars = salesData.sub_commodities;
    var debit = 0;
    var credit = Number(salesData.net_total);
    var closing_balance = 0;

    SalesReturns.countDocuments()
        .then(count => {
            salesData.invoice_no = count + 1 + 10000;

            const newSalesReturns = new SalesReturns(salesData);
            newSalesReturns.save()
                .then((salesreturnresult) => {
                    transaction_id = salesreturnresult._id;
                    Admin.find()
                        .then(admins => {

                            const adminId = admins[0]._id;

                            // UsersService.getUserBalanceforDate(adminId, date_of_transaction, function (adminresult) {


                            UsersService.getUserBalanceforDate(user_id, date_of_transaction, function (result) {
                                opening_balance = result;
                                closing_balance = opening_balance + credit - debit;

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
                                        // adminTransactionData.debit = adminTransactionData.credit;
                                        // adminTransactionData.credit = 0;
                                        // adminTransactionData.user_id = adminId;
                                        // adminTransactionData.opening_balance = adminresult;
                                        // adminTransactionData.closing_balance = adminTransactionData.opening_balance + adminTransactionData.credit - adminTransactionData.debit;

                                        // AccountTransactionService.createAdminTransaction(adminTransactionData, function (result) {
                                        //     if (result) {
                                        UsersService.updateUserBalance(user_id, function (result) {
                                            if (result) {
                                                res.json(salesData.invoice_no)
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
                                });
                            })

                            // })
                        })
                })
                .catch(err => res.status(400).json("Error: " + err))
        })
})

router.route('/update/:id').post((req, res) => {

    const sales_returnData = req.body;

    var opening_balance = 0;
    var transaction_id = req.params.id;
    var date_of_transaction = sales_returnData.date_of_sales_return;
    var transaction_type = "SALES_RETURN";
    var user_id = sales_returnData.sales_return_for;
    var commodity_name = sales_returnData.commodity_group;
    var particulars = sales_returnData.sub_commodities;
    var debit = 0;
    var credit = Number(sales_returnData.net_total);
    var closing_balance = 0;

    SalesReturns.findById(req.params.id)
        .then(sales_return => {

            sales_return.sales_return_for = req.body.sales_return_for;
            sales_return.commodity_group = req.body.commodity_group;
            sales_return.sales_invoice_no = req.body.sales_invoice_no;
            sales_return.date_of_sales_return = req.body.date_of_sales_return;
            sales_return.metric_ton = req.body.metric_ton;
            sales_return.net_total = req.body.net_total;
            sales_return.invoice_no = sales_return.invoice_no;
            sales_return.sub_commodities = req.body.sub_commodities;
            sales_return.sales_return_description = req.body.sales_return_description;

            sales_return.save()
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
                                    adminTransactionData.debit = accountTransactionData.credit;
                                    adminTransactionData.credit = 0;
                                    adminTransactionData.user_id = adminId;
                                    AccountTransactionService.editAdminTransaction(adminTransactionData, function (result) {
                                        if (result) {
                                            UsersService.updateUserBalance(req.body.sales_return_for, function (result) {
                                                if (result) {
                                                    res.json("SalesReturn Updated")
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
