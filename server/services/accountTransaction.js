const AccountTransaction = require('../models/accountTransactions.model');

checkForYoungerTransaction = (user_id, date_of_transaction, callback) => {
    // console.log(user_id, date_of_transaction)

    AccountTransaction.countDocuments({ $and: [{ user_id: user_id }, { date_of_transaction: { $gt: date_of_transaction } }] })
        .then(count => {
            if (count > 0) {
                return callback(true);
            }
            else {
                return callback(false);
            }
        })
        .catch((err) => {
            console.log(err)
            throw new err;
        })
}


changeYoungerTransactionBalance = (amount, date_of_transaction, callback) => {
    // db.a.findAndModify({query:{a:{$gt:1}},update:{$inc:{b:2}},upsert:true})
    // console.log("inside changebalance")
    AccountTransaction.updateMany({ date_of_transaction: { $gt: date_of_transaction } }, { $inc: { opening_balance: amount, closing_balance: amount } })
        .then(() => { return callback(true) })
        .catch((err) => { throw new err })
}


createTransaction = (accountTransactionData, callback) => {
    const newAccountTransaction = new AccountTransaction(accountTransactionData);

    // console.log("inside create transaction")


    checkForYoungerTransaction(accountTransactionData.user_id, accountTransactionData.date_of_transaction, function (result) {

        if (result) {
            // console.log("YoungerTransaction Exists!", accountTransactionData.debit, accountTransactionData.credit)
            var amount = 0;
            if (accountTransactionData.debit != 0) {
                console.log("inside debit")
                amount = -accountTransactionData.debit;
                console.log(amount)
            }
            else if (accountTransactionData.credit != 0) {
                console.log("inside credit");
                amount = accountTransactionData.credit;
                console.log(amount)

            }
            changeYoungerTransactionBalance(amount, accountTransactionData.date_of_transaction, function (result) {
                newAccountTransaction.save().then((res) => {
                    console.log("response", res)
                    return callback(true)
                }).catch((err) => { console.log(err) })
            });
        }

        else {
            // console.log("going to save transaction", newAccountTransaction)
            newAccountTransaction.save().then((res) => {
                return callback(true)
            }).catch((err) => { console.log(err) })
        }
    });

}

editTransaction = (newAccountTransactionData, callback) => {

    // console.log("edit")

    AccountTransaction.find({ $and: [{ user_id: newAccountTransactionData.user_id }, { transaction_id: newAccountTransactionData.transaction_id }] })
        .then(oldAccountTransactionData => {

            // console.log("old", oldAccountTransactionData[0])
            // console.log("new", newAccountTransactionData)
            checkForYoungerTransaction(newAccountTransactionData.user_id, newAccountTransactionData.date_of_transaction, function (result) {

                if (result) {
                    // console.log("YoungerTransaction Exists!", newAccountTransactionData.debit, newAccountTransactionData.credit)
                    var amount = 0;
                    if (oldAccountTransactionData[0].debit > newAccountTransactionData.debit) {
                        console.log("inside debit")
                        amount = (oldAccountTransactionData[0].debit - newAccountTransactionData.debit);
                        console.log(amount)
                    }
                    else if (oldAccountTransactionData[0].debit < newAccountTransactionData.debit) {
                        console.log("inside debit")
                        amount = -(newAccountTransactionData.debit - oldAccountTransactionData[0].debit);
                        console.log(amount)
                    }
                    else if (oldAccountTransactionData[0].credit > newAccountTransactionData.credit) {
                        console.log("inside credit")
                        amount = -(oldAccountTransactionData[0].credit - newAccountTransactionData.credit);
                        console.log(amount)
                    }
                    else if (oldAccountTransactionData[0].credit < newAccountTransactionData.credit) {
                        console.log("inside credit");
                        amount = (newAccountTransactionData.credit - oldAccountTransactionData[0].credit);
                        console.log(amount)

                    }
                    // console.log("amount--------------", amount)
                    changeYoungerTransactionBalance(amount, newAccountTransactionData.date_of_transaction, function (result) {

                        AccountTransaction.updateOne(
                            { _id: oldAccountTransactionData[0]._id },
                            {
                                $set:
                                {
                                    debit: newAccountTransactionData.debit,
                                    credit: newAccountTransactionData.credit,
                                    closing_balance: oldAccountTransactionData[0].opening_balance + newAccountTransactionData.credit - newAccountTransactionData.debit
                                }
                            }
                        ).then((res) => {
                            // console.log("response", res)
                            return callback(true)
                        }).catch((err) => { console.log(err) })
                    });
                }

                else {
                    // console.log("inside else")
                    AccountTransaction.updateOne(
                        { _id: oldAccountTransactionData[0]._id },
                        {
                            $set:
                            {
                                debit: newAccountTransactionData.debit,
                                credit: newAccountTransactionData.credit,
                                closing_balance: oldAccountTransactionData[0].opening_balance + newAccountTransactionData.credit - newAccountTransactionData.debit
                            }
                        }
                    ).then((res) => {
                        // console.log(res)
                        return callback(true)
                    }).catch((err) => { throw new err })
                }
            });

        });

}




createAdminTransaction = (accountTransactionData, callback) => {
    createTransaction(accountTransactionData, callback);
}


editAdminTransaction = (accountTransactionData, callback) => {

    editTransaction(accountTransactionData, callback);
}


getLatestClosingBalance = (Id, callback) => {

    AccountTransaction.find({ user_id: Id }).sort({ date_of_transaction: -1 }).limit(1)
        .then((res) => {

            return callback(Number(res[0].closing_balance));
        }).catch((err) => { throw new err })

}


module.exports.createTransaction = createTransaction;
module.exports.editTransaction = editTransaction;
module.exports.getLatestClosingBalance = getLatestClosingBalance;
module.exports.createAdminTransaction = createAdminTransaction
module.exports.editAdminTransaction = editAdminTransaction

