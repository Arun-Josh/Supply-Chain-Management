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
    stock: {
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

const purchaseSchema = new Schema({
    status: {
        type: Boolean,
        required: true
    },
    purchase_for: {
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
        // unique: true,
        maxlength: 255
    },
    date_of_purchase: {
        type: Date
    },
    metric_ton: {
        type: Number,
        min: 0
    },
    total: {
        type: Number,
        required: true,
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
    sales_price: {
        type: Number,
        required: true,
        min: 0
    },
    sub_commodities: [sub_commodities_schema],
    purchase_description: {
        type: String,
        maxlength: 10000
    },
    // sales_net_total{

    // }
})

module.exports = mongoose.model('Purchase', purchaseSchema, 'PURCHASES')