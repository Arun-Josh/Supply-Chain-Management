const router = require('express').Router();
const Income = require('./../models/incomes.model');
const Admin = require('../models/admins.model.js');
const UsersService = require('../services/users');
const AccountTransactionService = require('../services/accountTransaction')

router.route('/:from_date/:to_date/:user_id').get((req, res) => {
    Income.aggregate([
        {
            $match: {
                // payment_for: req.params.user_id
                // { $and: [{ payment_for: req.params.user_id }, { date_of_payment: { $gte: req.params.from_date, $lte: req.params.to_date } }] }
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
                "income_type": 1,
                "date_of_income": 1,
                "commodity_group": 1,
                "invoice_no": 1,
                "amount": 1,
                "commodity_groups.commodity_group_name": 1
            }
        },

    ])
        // Income.find({ $and: [{ income_user: req.params.user_id }, { date_of_income: { $gt: req.params.from_date } }, { date_of_income: { $lt: req.params.to_date } }] })
        .then(incomes => {
            res.json(incomes)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})


router.route('/:from_date/:to_date').get((req, res) => {
    Income.aggregate([
        {
            $match: {
                // payment_for: req.params.user_id
                // { $and: [{ payment_for: req.params.user_id }, { date_of_payment: { $gte: req.params.from_date, $lte: req.params.to_date } }] }
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
                "income_type": 1,
                "date_of_income": 1,
                "commodity_group": 1,
                "invoice_no": 1,
                "amount": 1,
                "commodity_groups.commodity_group_name": 1
            }
        },

    ])
        // Income.find({ $and: [{ date_of_income: { $gt: req.params.from_date } }, { date_of_income: { $lt: req.params.to_date } }] })
        .then(incomes => {
            res.json(incomes)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})


router.route('/').get((req, res) => {
    Income.find()
        .then(incomes => {
            res.json(incomes)
        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
})


router.route('/').get((req, res) => {
    Income.find()
        .then(incomes => {
            res.json(incomes)
        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
})

router.route('/add').post((req, res) => {
    const newIncome = new Income(req.body);
    var opening_balance = 0;
    var transaction_id = 0;
    var date_of_transaction = req.body.date_of_income;
    var transaction_type = "INCOME";
    var user_id = req.body.income_user;
    var commodity_name = req.body.commodity_group;
    var particulars = [];
    var debit = 0;
    var credit = Number(req.body.amount);
    var closing_balance = 0;
    newIncome.save()
        .then((incomeresult) => {
            transaction_id = incomeresult._id;

            Admin.find()
                .then(admins => {
                    user_id = admins[0]._id;
                    if (req.body.income_type === "discount") {
                        user_id = req.body.income_user
                    }
                    UsersService.getUserBalanceforDate(user_id, date_of_transaction, function (result) {
                        opening_balance = result;
                        closing_balance = opening_balance + credit - debit;
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
                        AccountTransactionService.createTransaction(accountTransactionData, function (result) {
                            if (result) {

                                res.json('success')
                            }
                            else {
                                res.status(400).json({ message: "Error in updating user balance" })
                            }
                        })
                    });

                })



        }
        )
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

router.route('/:id').get((req, res) => {
    Income.findById(req.params.id)
        .then(income => res.json(income))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

// router.route('/:id').delete((req, res) => {
//     Income.findByIdAndDelete(req.params.id)
//         .then(() => res.json('Income deleted.'))
//         .catch(err => { res.status(400).json({ message: "" + err }) });
// });

router.route('/update/:id').post((req, res) => {
    var opening_balance = 0;
    var transaction_id = req.params.id;
    var date_of_transaction = req.body.date_of_expense;
    var transaction_type = "INCOME";
    var user_id = req.body.expense_user;

    var commodity_name = req.body.commodity_group;
    var particulars = [];
    var debit = 0;
    var credit = Number(req.body.amount);
    var closing_balance = 0;
    Income.findById(req.params.id)
        .then(income => {

            income.income_type = req.body.income_type;
            income.commodity_group = req.body.commodity_group;
            income.income_for = req.body.income_for;
            income.income_user = req.body.income_user;
            income.invoice_no = req.body.invoice_no;
            income.amount = req.body.amount;
            income.date_of_income = req.body.date_of_income;
            income.income_description = req.body.income_description;
            income.save().then(() => {

                Admin.find()
                    .then(admins => {
                        user_id = admins[0]._id;
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

                                res.json("Income Updated")

                            }
                            else {
                                res.status(400).json({ message: "Error in creating transaction" })
                            }
                        })
                    })


            }

            ).catch(err => { res.status(400).json({ message: "" + err }) });
        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
});


module.exports = router