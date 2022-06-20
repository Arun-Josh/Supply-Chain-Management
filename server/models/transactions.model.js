const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const sub_commodities_schema = new Schema({
    sub_commodity_name:{
        type: String,
        required:true,
        maxlength:255,
    },
    sub_commodity_transacted_quantity:{
        type: Number,
        required:true,
        min:0
    },
    sub_commodity_quantity:{
        type: Number,
        required:true,
        min:0
    },
    sub_commodity_price_per_unit:{
        type: Number,
        required:true,
        min:0
    },
    sub_commodity_price:{
        type: Number,
        required:true,
        min:0
    }
})

const transactionSchema = new Schema({
    transaction_type : {
        type: String,
        required: true,
        maxlength: 255,
    },
    transaction_for : {
        type: String, 
        maxlength: 255
    },
    commodity_group:{
        type: String,
        required: true,
        maxlength: 255
    },
    invoice_no:{
        type: String,
        unique:true,
        maxlength: 255
    },
    date_of_transaction : {
        type:Date
    },
    total: {
        type: Number,
        required:true,
        min:0
    },
    discount: {
        type:Number,
        min:0
    },
    net_total:{
        type: Number,
        required:true,
        min:0
    },               
    sub_commodities :[sub_commodities_schema],
    transaction_description: {
        type:String,
        maxlength:10000
    },
})

module.exports = mongoose.model('Transaction', transactionSchema, 'TRANSACTIONS')