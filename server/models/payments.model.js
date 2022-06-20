const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    payment_type: {
        type: String,
        maxlength: 255,
        // required : true
    },           // consumer / supplier
    payment_for: {
        type: mongoose.Schema.ObjectId,
        maxlength: 255
    },            // consumer id / supplier id
    commodity_group: {
        type: mongoose.Schema.ObjectId,
        maxlength: 255,
    },        // id
    invoice_no: {
        type: String,
        maxlength: 255,
    },
    amount: {
        type: Number
    },
    date_of_payment: {
        type: Date
    },
    mode_of_payment: {
        type: String,
        maxlength: 255,
    },
    bank: {
        type: String,
        maxlength: 255,
    },
    account_holder_name: {
        type: String,
        maxlength: 255,
    },
    account_number: {
        type: String,
        maxlength: 255,
    },
    ifsc: {
        type: String,
        maxlength: 255,
    },
    dd_no: {
        type: String,
        maxlength: 255,
    },
    cheque_no: {
        type: String,
        maxlength: 255,
    },
    my_account_number: {
        type: String,
        maxlength: 255,
    },
    my_bank: {
        type: String,
        maxlength: 255,
    },
    payment_description: {
        type: String,
        maxlength: 1000,
    }
})

module.exports = mongoose.model('Payment', paymentSchema, 'PAYMENTS')