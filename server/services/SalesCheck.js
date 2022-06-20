const Purchase = require('./../models/purchases.model')

async function checkPurchaseIsPossible(salesData, callback) {

    checkIfStockIsAvailable(salesData, async function (stockIsAvailable) {

        if (stockIsAvailable) {
            const purchases = await getActivePurchases(salesData.commodity_group);
            var purchaseConstant = 0
            var purchaseSubCommodityConstant = 0
            var salesSubCommodityConstant = 0
            var amount = 0;
            for (purchaseConstant = 0; purchaseConstant < purchases.length; purchaseConstant++) {
                for (purchaseSubCommodityConstant = 0; purchaseSubCommodityConstant < purchases[purchaseConstant].sub_commodities.length; purchaseSubCommodityConstant++) {
                    for (salesSubCommodityConstant = 0; salesSubCommodityConstant < salesData.sub_commodities.length; salesSubCommodityConstant++) {

                        if (salesData.sub_commodities[salesSubCommodityConstant].sub_commodity_name === purchases[purchaseConstant].sub_commodities[purchaseSubCommodityConstant].sub_commodity_name) {
                            if (purchases[purchaseConstant].sub_commodities[purchaseSubCommodityConstant].stock >= salesData.sub_commodities[salesSubCommodityConstant].sub_commodity_transacted_quantity) {
                                purchases[purchaseConstant].sub_commodities[purchaseSubCommodityConstant].stock = purchases[purchaseConstant].sub_commodities[purchaseSubCommodityConstant].stock - salesData.sub_commodities[salesSubCommodityConstant].sub_commodity_transacted_quantity;
                                amount = amount + (salesData.sub_commodities[salesSubCommodityConstant].sub_commodity_transacted_quantity * salesData.sub_commodities[salesSubCommodityConstant].sub_commodity_price_per_unit);
                                salesData.sub_commodities[salesSubCommodityConstant].sub_commodity_transacted_quantity = 0;
                            }
                            else {
                                purchases[purchaseConstant].sub_commodities[purchaseSubCommodityConstant].stock = 0;
                                amount = amount + ((salesData.sub_commodities[salesSubCommodityConstant].sub_commodity_transacted_quantity - purchases[purchaseConstant].sub_commodities[purchaseSubCommodityConstant].stock) * salesData.sub_commodities[salesSubCommodityConstant].sub_commodity_price_per_unit);
                                salesData.sub_commodities[salesSubCommodityConstant].sub_commodity_transacted_quantity = salesData.sub_commodities[salesSubCommodityConstant].sub_commodity_transacted_quantity - purchases[purchaseConstant].sub_commodities[purchaseSubCommodityConstant].stock;
                            }

                            const a = await updatePurchase(purchases[purchaseConstant], amount);
                            const b = await checkIfSalesIsSatisfied(salesData);
                            console.log(b);
                            if (b) {
                                return callback(true);
                            }

                            amount = 0;


                        }

                    }
                }
            }
            return callback(true);


        }
        else {
            return callback(false);
        }
    })


}



async function checkIfSalesIsSatisfied(salesData) {
    for (var i = 0; i < salesData.sub_commodities.length; i++) {
        if (salesData.sub_commodities[i].sub_commodity_transacted_quantity != 0) {

            return false;
        }
    }
    return true;
}

async function updatePurchase(purchase, amount) {
    console.log("modified purchsae:::::", purchase)
    const result = Purchase.findById(purchase._id)
        .then(async result => {
            console.log("old purchase:::::::::", result)
            result.sub_commodities = purchase.sub_commodities;
            result.sales_price = result.sales_price + amount;

            empty = true;
            for (var i = 0; i < purchase.sub_commodities.length; i++) {
                if (purchase.sub_commodities[i].stock > 0) {
                    empty = false;
                    break;
                }
            }

            if (empty) {
                result.status = false;
            }

            await result.save()
            return true;
        })
    return result;
}


async function getActivePurchases(commodity_group) {
    const purchases = await Purchase.find({ status: true, commodity_group: commodity_group }).sort({ date_of_purchase: 1 })
        .then(async purchases => {
            return purchases
        })
    return purchases


}


checkIfStockIsAvailable = (salesData, callback) => {
    var value = true;
    Purchase.aggregate([{ $match: { status: true, commodity_group: salesData.commodity_group }, }, { $unwind: "$sub_commodities" }, { $group: { _id: "$sub_commodities.sub_commodity_name", Stock: { $sum: "$sub_commodities.stock" } } }]).then((stockResponse) => {
        if (stockResponse.length === 0) {
            return callback(false)
        }
        console.log("stock result:::::", stockResponse)
        salesData.sub_commodities.forEach(sales_sub_commodity => {

            stockResponse.forEach(stockresponse => {

                if (sales_sub_commodity.sub_commodity_name === stockresponse._id) {

                    if (sales_sub_commodity.sub_commodity_quantity > stockresponse.Stock) {
                        value = false;
                        console.log("===no stock====")
                    }
                }

            })
        })
    }).then(() => { return callback(value); })

}




module.exports.checkPurchaseIsPossible = checkPurchaseIsPossible
