const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const sub_commodity = new Schema({
    sub_commodity_name : {
        type : String,
        maxlength : 255
    },
    sub_commodity_quantity : {
        type : Number
    },
    sub_commodity_unit : {
        type : String,
        maxlength : 255
    }
})

const commodityGroupSchema = new Schema({
    commodity_group_name : {
        type : String,
        maxlength : 255,
        unique : true
    },
    sub_commodities : [sub_commodity]
})

module.exports = mongoose.model('Commodity-group', commodityGroupSchema, "COMMODITIES_GROUP")