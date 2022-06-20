const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const sub_commodities_schema = new Schema({
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

const salesSchema = new Schema({
    sales_for: {
        type: mongoose.Schema.ObjectId,
        maxlength: 255
    },
    commodity_group: {
        type: String,
        required: true,
        maxlength: 255
    },
    invoice_no: {
        type: String,
        unique: true,
        maxlength: 255
    },
    date_of_sales: {
        type: Date
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    metric_ton: {
        type: Number,
        min: 0
    },
    discount_per_metric_ton: {
        type: Number,
        min: 0
    },
    discount: {
        type: Number,
        min: 0
    },
    net_total: {
        type: Number,
        required: true,
        min: 0
    },
    sub_commodities: [sub_commodities_schema],
    sales_description: {
        type: String,
        maxlength: 10000
    },
})

module.exports = mongoose.model('Sales', salesSchema, 'SALES')