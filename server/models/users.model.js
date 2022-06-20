const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const supplierSchema = new Schema({
    userType: { type: String, default: "Supplier" },
    user_name: { type: String, required: true, unique: true },
    address: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: String },
    phone: { type: String, required: true },
    email_id: { type: String },
    account_no: { type: String },
    account_holder_name: { type: String },
    ifsc: { type: String },
    bank: { type: String },
    balance: { type: Number, required: true }
}
);

const consumerSchema = new Schema({

    userType: { type: String, default: "Consumer" },
    user_name: { type: String, required: true, unique: true },
    address: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: String },
    phone: { type: String, required: true },
    email_id: { type: String },
    account_no: { type: String },
    account_holder_name: { type: String },
    ifsc: { type: String },
    bank: { type: String },
    balance: { type: Number, required: true }
}
);

const Consumer = mongoose.model('Consumer', consumerSchema, 'USERS');
const Supplier = mongoose.model('Supplier', supplierSchema, 'USERS');
module.exports = { Consumer: Consumer, Supplier: Supplier };