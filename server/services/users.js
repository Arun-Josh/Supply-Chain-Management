const Users = require('../models/users.model').Supplier;
const AccountTransaction = require('../models/accountTransactions.model');
const AccountTransactionService = require('../services/accountTransaction')

getUserBalance = (Id, callback) => {
    Users.findById(Id)
        .then(res => {
            return callback(Number(res.balance));
        }
        ).catch((err) => { return false });
}


getUserBalanceforDate = (Id, date_of_transaction, callback) => {
    // console.log("inside getUserBalanceforDate")
    AccountTransaction.find({ $and: [{ user_id: Id }, { date_of_transaction: { $lte: date_of_transaction } }] }).sort({ date_of_transaction: -1 }).limit(1)
        .then(res => {
            // console.log(res)
            if (res.length === 0) {
                return callback(Number(0))
            }
            return callback(Number(res[0].closing_balance));
        }
        ).catch((err) => { console.log(err); return false });
}

updateUserBalance = (Id, callback) => {
    // console.log("inside update balance")
    AccountTransactionService.getLatestClosingBalance(Id, function (result) {
        // console.log(result)
        Users.updateOne(
            { _id: Id },
            {
                $set:
                {
                    balance: result
                }
            }
        ).then((res) => { return callback(true) }).catch((err) => { console.log(err); return callback(false) });
    })

}

module.exports.getUserBalance = getUserBalance
module.exports.getUserBalanceforDate = getUserBalanceforDate
module.exports.updateUserBalance = updateUserBalance