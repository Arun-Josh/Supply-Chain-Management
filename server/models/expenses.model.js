const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({

    expense_type: { type: String, maxlength: 255 }, // direct or indirect
    commodity_group: { type: mongoose.Schema.ObjectId, required: true, maxlength: 255 },
    expense_for: { type: String, maxlength: 255 }, // supplier or consumer
    expense_user: { type: mongoose.Schema.ObjectId, maxlength: 255 }, // supllier or consumer id
    invoice_no: { type: String, maxlength: 255 },
    amount: { type: Number, min: 0 },
    date_of_expense: { type: Date },
    expense_description: { type: String, maxlength: 255 },


});

const expense = mongoose.model('Expense', expenseSchema, 'EXPENSES');
module.exports = expense