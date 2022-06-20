const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incomeSchema = new Schema({

    income_type: { type: String, maxlength: 255 }, // direct or indirect
    commodity_group: { type: mongoose.Schema.ObjectId, required: true, maxlength: 255 },
    income_for: { type: String, required: true, maxlength: 255 }, // supplier or consumer
    income_user: { type: mongoose.Schema.ObjectId, maxlength: 255 }, // supllier or consumer id
    invoice_no: { type: String, maxlength: 255 },
    amount: { type: Number, min: 0 },
    date_of_income: { type: Date },
    income_description: { type: String, maxlength: 255 },


});

const income = mongoose.model('Income', incomeSchema, 'INCOMES');
module.exports = income