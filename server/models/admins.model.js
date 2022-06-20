const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bankAccount = new Schema({
    account_no: { type: String , maxlength: 255},
    account_holder_name: { type: String, maxlength: 255},
    ifsc: { type: String , maxlength: 255},
    bank: { type: String , maxlength: 255}
})

const adminSchema = new Schema({
    user_name: { type: String, maxlength: 255, required: true},
    address: { type: String, maxlength: 512},
    district: { type: String, maxlength: 255},
    state: { type: String, maxlength: 255 },
    pincode: { type: String, maxlength: 255 },
    phone: { type: String, maxlength: 255},
    email_id: { type: String, required:true, maxlength: 255 },
    bank_accounts: [bankAccount]
})

module.exports = mongoose.model('Admin', adminSchema, 'ADMINS')