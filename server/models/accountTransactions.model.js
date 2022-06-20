const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const sub_commodity = new Schema({
    sub_commodity_name: {
        type: String,
        required: true,
        maxlength: 255,
    },
    sub_commodity_transacted_quantity: {
        type: Number,
        required: true,
        min: 0
    },
    sub_commodity_quantity: {
        type: Number,
        required: true,
        min: 0
    },
    sub_commodity_price_per_unit: {
        type: Number,
        required: true,
        min: 0
    },
    sub_commodity_price: {
        type: Number,
        required: true,
        min: 0
    }
})

const accountTransactionSchema = new Schema({
    date_of_transaction: { type: Date },
    transaction_type: { type: String, maxlength: 255 },
    transaction_id: { type: mongoose.Schema.ObjectId, required: true },
    user_id: { type: mongoose.Schema.ObjectId, required: true },
    commodity_name: { type: mongoose.Schema.ObjectId, required: true },
    particulars: [sub_commodity],
    debit: { type: Number, min: 0 },
    credit: { type: Number, min: 0 },
    opening_balance: { type: Number },
    closing_balance: { type: Number }
})

const accountTransaction = mongoose.model('AccountTransaction', accountTransactionSchema, 'ACCOUNT_TRANSACTIONS');
module.exports = accountTransaction