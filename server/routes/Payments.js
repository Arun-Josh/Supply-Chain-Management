const router = require('express').Router();
const Payment = require('./../models/payments.model');
const UsersService = require('../services/users');
const AccountTransactionService = require('../services/accountTransaction')
const Admin = require('../models/admins.model.js');


router.route('/:from_date/:to_date/:user_id').get((req, res) => {

    Payment.aggregate([
        {
            $match: {
                // payment_for: req.params.user_id
                // { $and: [{ payment_for: req.params.user_id }, { date_of_payment: { $gte: req.params.from_date, $lte: req.params.to_date } }] }
            }
        },
        {
            $lookup: {
                from: "USERS",
                localField: "payment_for",
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
                "payment_for": 1,
                "commodity_group": 1,
                "date_of_payment": 1,
                "invoice_no": 1,
                "amount": 1,
                "users.user_name": 1,
                "commodity_groups.commodity_group_name": 1
            }
        },

    ])

        .then(payments => {
            res.json(payments)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})


router.route('/:from_date/:to_date').get((req, res) => {

    Payment.aggregate([
        {
            $match: {
                // date_of_payment: { $gte: req.params.from_date, $lte: req.params.to_date }
            }
        },
        {
            $lookup: {
                from: "USERS",
                localField: "payment_for",
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
                "payment_for": 1,
                "commodity_group": 1,
                "date_of_payment": 1,
                "invoice_no": 1,
                "amount": 1,
                "users.user_name": 1,
                "commodity_groups.commodity_group_name": 1
            }
        },

    ])

        .then(payments => {
            res.json(payments)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})


router.route('/').get((req, res) => {
    Payment.find()
        .then(payments => {
            res.json(payments)
        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
})

router.route('/add').post((req, res) => {
    const paymentData = req.body


    var opening_balance = 0;
    var transaction_id = 0;
    var date_of_transaction = paymentData.date_of_payment;
    var transaction_type = "PAYMENT";
    var user_id = paymentData.payment_for;
    var commodity_name = paymentData.commodity_group;
    var particulars = [];
    var debit = 0;
    var credit = Number(paymentData.amount);
    var closing_balance = 0;



    const newPayment = new Payment(paymentData);

    newPayment.save().then((paymentresult) => {
        transaction_id = paymentresult._id;
        if (paymentData.payment_type === "consumer") {
            transaction_type = "RECEIPT";
        }

        Admin.find()
            .then(admins => {

                const adminId = admins[0]._id;

                UsersService.getUserBalanceforDate(adminId, date_of_transaction, function (adminresult) {

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

                                var adminTransactionData = accountTransactionData;
                                if (paymentData.payment_type === "supplier") {

                                    adminTransactionData.debit = accountTransactionData.credit;
                                    adminTransactionData.credit = 0;
                                }
                                else {
                                    adminTransactionData.credit = accountTransactionData.credit;
                                    adminTransactionData.debit = 0;
                                }
                                adminTransactionData.user_id = adminId;
                                adminTransactionData.opening_balance = adminresult;
                                adminTransactionData.closing_balance = adminTransactionData.opening_balance + adminTransactionData.credit - adminTransactionData.debit;


                                AccountTransactionService.createAdminTransaction(adminTransactionData, function (result) {
                                    if (result) {
                                        UsersService.updateUserBalance(user_id, function (result) {
                                            if (result) {
                                                res.json("Payment Successfull")
                                            }
                                            else {
                                                res.status(400).json({ message: "Error in updating user balance" })
                                            }
                                        });

                                    }
                                    else {
                                        res.status(400).json({ message: "Error in creating admin transaction" })
                                    }



                                })
                            }
                            else {
                                res.status(400).json({ message: "Error in creating transaction" })
                            }
                        })
                    })
                })
            })
    }).catch(err => { res.status(400).json({ message: "" + err }) })
});

router.route('/:id').get((req, res) => {
    Payment.findById(req.params.id)
        .then(payment => res.json(payment))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

// router.route('/:id').delete((req, res) => {
//     Payment.findByIdAndDelete(req.params.id)
//         .then(() => res.json('Payment deleted.'))
//         .catch(err => { res.status(400).json({ message: "" + err }) });
// });

router.route('/update/:id').post((req, res) => {

    const paymentData = req.body;

    var opening_balance = 0;
    var transaction_id = req.params.id;
    var date_of_transaction = paymentData.date_of_payment;
    var transaction_type = "PAYMENT";
    var user_id = paymentData.payment_for;

    var commodity_name = paymentData.commodity_group;
    var particulars = [];
    var debit = 0;
    var credit = Number(paymentData.amount);
    var closing_balance = 0;
    Payment.findById(req.params.id)
        .then(payment => {

            payment.payment_for = req.body.payment_for;
            payment.payment_type = req.body.payment_type;
            payment.commodity_group = req.body.commodity_group;
            payment.invoice_no = req.body.invoice_no;
            payment.amount = req.body.amount;
            payment.date_of_payment = req.body.date_of_payment;
            payment.mode_of_payment = req.body.mode_of_payment;
            payment.bank = req.body.bank;
            payment.account_holder_name = req.body.account_holder_name;
            payment.account_number = req.body.account_number;
            payment.ifsc = req.body.ifsc;
            payment.dd_no = req.body.dd_no;
            payment.cheque_no = req.body.cheque_no;
            payment.my_account_number = req.body.my_account_number;
            payment.my_bank = req.body.my_bank;
            payment.payment_description = req.body.payment_description;
            payment.save()
                .then(() => {
                    Admin.find()
                        .then(admins => {

                            const adminId = admins[0]._id;


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


                            AccountTransactionService.editTransaction(accountTransactionData, function (result) {
                                if (result) {

                                    var adminTransactionData = accountTransactionData;
                                    if (paymentData.payment_type === "supplier") {
                                        console.log("if")
                                        adminTransactionData.debit = accountTransactionData.credit;
                                        adminTransactionData.credit = 0;
                                    }
                                    else {
                                        adminTransactionData.credit = accountTransactionData.credit;
                                        adminTransactionData.debit = 0;
                                    }


                                    adminTransactionData.user_id = adminId;


                                    AccountTransactionService.editAdminTransaction(adminTransactionData, function (result) {
                                        if (result) {
                                            UsersService.updateUserBalance(req.body.payment_for, function (result) {
                                                if (result) {
                                                    res.json("Payment Updated")
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
                                }
                                else {
                                    res.status(400).json({ message: "Error in creating admin transaction" })
                                }
                            });
                        });
                })
                .catch(err => { res.status(400).json({ message: "" + err }) });

        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
});


module.exports = router;