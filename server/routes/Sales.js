const router = require('express').Router();
const Sales = require('./../models/sales.model')
const UsersService = require('../services/users');
const AccountTransactionService = require('../services/accountTransaction')
const SalesCheck = require('../services/SalesCheck')
const Admin = require('../models/admins.model.js');
router.route('/:from_date/:to_date/:user_id').get((req, res) => {
    Sales.aggregate([
        {
            $match: {
                // payment_for: req.params.user_id
                // { $and: [{ payment_for: req.params.user_id }, { date_of_payment: { $gte: req.params.from_date, $lte: req.params.to_date } }] }
            }
        },
        {
            $lookup: {
                from: "USERS",
                localField: "sales_for",
                foreignField: "_id",
                as: "users"
            }
        }, {
            $project:
            {
                "date_of_sales": 1,
                "sales_for": 1,
                "sub_commodities": 1,
                "invoice_no": 1,
                "net_total": 1,
                "users.user_name": 1

            }
        },

    ])
        // Sales.find({ $and: [{ sales_for: req.params.user_id }, { date_of_sales: { $gte: req.params.from_date } }, { date_of_sales: { $lte: req.params.to_date } }] })
        .then(sales => {
            res.json(sales)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})


router.route('/:from_date/:to_date').get((req, res) => {
    Sales.aggregate([
        {
            $match: {
                // payment_for: req.params.user_id
                // { $and: [{ payment_for: req.params.user_id }, { date_of_payment: { $gte: req.params.from_date, $lte: req.params.to_date } }] }
            }
        },
        {
            $lookup: {
                from: "USERS",
                localField: "sales_for",
                foreignField: "_id",
                as: "users"
            }
        }, {
            $project:
            {
                "date_of_sales": 1,
                "sales_for": 1,
                "sub_commodities": 1,
                "invoice_no": 1,
                "net_total": 1,
                "users.user_name": 1

            }
        },

    ])
        // Sales.find({ $and: [{ date_of_sales: { $gt: req.params.from_date } }, { date_of_sales: { $lt: req.params.to_date } }] })
        .then(sales => {
            res.json(sales)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})

router.route('/:id').get((req, res) => {
    Sales.findById(req.params.id)
        .then(sales => res.json(sales))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

router.route('/add').post((req, res) => {

    const salesData = req.body;

    var opening_balance = 0;
    var transaction_id = 0;
    var date_of_transaction = salesData.date_of_sales;
    var transaction_type = "SALES";
    var user_id = salesData.sales_for;
    var commodity_name = salesData.commodity_group;
    var particulars = salesData.sub_commodities;
    var debit = Number(salesData.net_total);
    var credit = 0;
    var closing_balance = 0;

    SalesCheck.checkPurchaseIsPossible(salesData, function (proceed) {
        if (proceed) {


            Sales.countDocuments()
                .then(count => {
                    salesData.invoice_no = count + 1 + 10000;
                    // console.log(salesData)
                    const newSales = new Sales(salesData);
                    newSales.save()
                        .then((salesresult) => {
                            transaction_id = salesresult._id;
                            Admin.find()
                                .then(admins => {

                                    const adminId = admins[0]._id;

                                    // UsersService.getUserBalanceforDate(adminId, date_of_transaction, function (adminresult) {

                                    UsersService.getUserBalanceforDate(user_id, date_of_transaction, function (result) {
                                        opening_balance = result;
                                        closing_balance = opening_balance + credit - debit;
                                        // console.log(opening_balance, closing_balance, transaction_id)
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
                                                // adminTransactionData.credit = 0;
                                                // adminTransactionData.debit = accountTransactionData.debit;
                                                // adminTransactionData.user_id = adminId;
                                                // adminTransactionData.opening_balance = adminresult;
                                                // adminTransactionData.closing_balance = adminTransactionData.opening_balance + adminTransactionData.credit - adminTransactionData.debit;

                                                // // console.log("------------------", adminTransactionData)
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
                                        })
                                    })
                                    // })
                                })
                        })
                        .catch(err => { console.log(err); res.status(400).json("Error: " + err) })
                })
        }
        else {
            res.status(400).json({ message: "NO STOCK" })
        }
    })


})


router.route('/update/:id').post((req, res) => {

    const salesData = req.body;

    var opening_balance = 0;
    var transaction_id = req.params.id;
    var date_of_transaction = salesData.date_of_sales;
    var transaction_type = "SALES";
    var user_id = salesData.sales_for;
    var commodity_name = salesData.commodity_group;
    var particulars = salesData.sub_commodities;
    var debit = Number(salesData.net_total);
    var credit = 0;
    var closing_balance = 0;

    Sales.findById(req.params.id)
        .then(sales => {

            sales.sales_for = req.body.sales_for;
            sales.commodity_group = req.body.commodity_group;
            sales.date_of_sales = req.body.date_of_sales;
            sales.amount = req.body.amount;
            sales.total = req.body.total;
            sales.metric_ton = req.body.metric_ton;
            sales.discount_per_metric_ton = req.body.discount_per_metric_ton;
            sales.discount = req.body.discount;
            sales.net_total = req.body.net_total;
            sales.sub_commodities = req.body.sub_commodities;
            sales.sales_description = req.body.sales_description;
            sales.save()
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
                            UsersService.updateUserBalance(req.body.sales_for, function (result) {
                                if (result) {
                                    res.json("Sales Updated")
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
