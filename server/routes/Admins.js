const router = require('express').Router();
const Admin = require('../models/admins.model.js');
const Purchase = require('./../models/purchases.model')
router.route('/').get((req, res) => {
    Admin.find()
        .then(admins => {
            res.json(admins)
        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
})

//This path should not be accessible by the user --> Kryptonite acts like a password for now
router.route('/kryptonite/add').post((req, res) => {
    adminData = req.body;
    const newAdmin = new Admin(adminData);

    newAdmin.save()
        .then(() => res.json('Admin added!'))
        .catch(err => { res.status(400).json({ message: "" + err }) });
})

router.route('/update/:id').post((req, res) => {
    Admin.findById(req.params.id)
        .then(admin => {

            admin.user_name = req.body.user_name;
            admin.address = req.body.address;
            admin.district = req.body.district;
            admin.state = req.body.state;
            admin.pincode = req.body.pincode;
            admin.phone = req.body.phone;
            // admin.email_id = req.body.email_id; should not be editable
            admin.bank_accounts = req.body.bank_accounts;

            admin.save()
                .then(() => res.json('Admin updated!'))
                .catch(err => { res.status(400).json({ message: "" + err }) });
        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

router.route('/stock/:id').get((req, res) => {

    Purchase.aggregate([{ $match: { status: true, commodity_group: req.params.id }, }, { $unwind: "$sub_commodities" }, { $group: { _id: "$sub_commodities.sub_commodity_name", Stock: { $sum: "$sub_commodities.stock" } } }])
        .then((stockResponse) => {
            res.json(stockResponse)
        }).catch(err => { res.status(400).json({ message: "" + err }) });

});

module.exports = router;