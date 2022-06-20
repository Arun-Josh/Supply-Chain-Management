const router = require('express').Router();
const Expense = require('./../models/expenses.model');
const Admin = require('../models/admins.model.js');
const UsersService = require('../services/users');
const AccountTransactionService = require('../services/accountTransaction')




router.route('/:from_date/:to_date/:user_id').get((req, res) => {
    Expense.aggregate([
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
                "expense_type": 1,
                "date_of_expense": 1,
                "commodity_group": 1,
                "invoice_no": 1,
                "amount": 1,
                "commodity_groups.commodity_group_name": 1
            }
        },

    ])
        // Expense.find({ $and: [{ expense_user: req.params.user_id }, { date_of_expense: { $gt: req.params.from_date } }, { date_of_expense: { $lt: req.params.to_date } }] })
        .then(expenses => {
            res.json(expenses)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})


router.route('/:from_date/:to_date').get((req, res) => {
    Expense.aggregate([
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
                "expense_type": 1,
                "date_of_expense": 1,
                "commodity_group": 1,
                "invoice_no": 1,
                "amount": 1,
                "commodity_groups.commodity_group_name": 1
            }
        },

    ])
        // Expense.find({ $and: [{ date_of_expense: { $gt: req.params.from_date } }, { date_of_expense: { $lt: req.params.to_date } }] })
        .then(expenses => {
            res.json(expenses)
        })
        .catch((err) => res.status(400).json('Error: ' + err));
})


router.route('/').get((req, res) => {
    Expense.find()
        .then(expenses => {
            res.json(expenses)
        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
})








router.route('/').get((req, res) => {
    Expense.find()
        .then(expenses => {
            res.json(expenses)
        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
})

router.route('/add').post((req, res) => {
    const newExpense = new Expense(req.body);
    var opening_balance = 0;
    var transaction_id = 0;
    var date_of_transaction = req.body.date_of_expense;
    var transaction_type = "EXPENSE";
    var user_id = req.body.expense_user;
    var commodity_name = req.body.commodity_group;
    var particulars = [];
    var debit = Number(req.body.amount);
    var credit = 0;
    var closing_balance = 0;
    newExpense.save()
        .then((expenseresult) => {

            transaction_id = expenseresult._id;

            Admin.find()
                .then(admins => {
                    user_id = admins[0]._id;
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
    Expense.findById(req.params.id)
        .then(expense => res.json(expense))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

// router.route('/:id').delete((req, res) => {
//     Expense.findByIdAndDelete(req.params.id)
//         .then(() => res.json('Expense deleted.'))
//         .catch(err => { res.status(400).json({ message: "" + err }) });
// });

router.route('/update/:id').post((req, res) => {
    var opening_balance = 0;
    var transaction_id = req.params.id;
    var date_of_transaction = req.body.date_of_expense;
    var transaction_type = "EXPENSE";
    var user_id = req.body.expense_user;

    var commodity_name = req.body.commodity_group;
    var particulars = [];
    var debit = Number(req.body.amount);
    var credit = 0;
    var closing_balance = 0;

    Expense.findById(req.params.id)
        .then(expense => {

            expense.expense_type = req.body.expense_type;
            expense.commodity_group = req.body.commodity_group;
            expense.expense_for = req.body.expense_for;
            expense.expense_user = req.body.expense_user;
            expense.invoice_no = req.body.invoice_no;
            expense.amount = req.body.amount;
            expense.date_of_expense = req.body.date_of_expense;
            expense.expense_description = req.body.expense_description;
            expense.save().then(() => {

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

                                res.json("Expense Updated")

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


module.exports = router;