const router = require('express').Router();
let Supplier = require('../models/users.model').Supplier;


router.route('/').get((req, res) => {
    Supplier.find({ "userType": "Supplier" })
        .then(suppliers => res.json(suppliers))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});


router.route('/add').post((req, res) => {


    supplierData = req.body;
    supplierData.balance = 0
    const newSupplier = new Supplier(supplierData);

    newSupplier.save()
        .then(() => res.json('Supplier added!'))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});


router.route('/:id').get((req, res) => {
    Supplier.findById(req.params.id)
        .then(supplier => res.json(supplier))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

router.route('/:id').delete((req, res) => {
    Supplier.findByIdAndDelete(req.params.id)
        .then(() => res.json('Supplier deleted.'))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

router.route('/update/:id').post((req, res) => {
    Supplier.findById(req.params.id)
        .then(supplier => {


            supplier.user_name = req.body.user_name;
            supplier.address = req.body.address;
            supplier.district = req.body.district;
            supplier.state = req.body.state;
            supplier.pincode = req.body.pincode;
            supplier.phone = req.body.phone;
            supplier.email_id = req.body.email_id;
            supplier.account_no = req.body.account_no;
            supplier.account_holder_name = req.body.account_holder_name;
            supplier.ifsc = req.body.ifsc;
            supplier.bank = req.body.bank;
            supplier.balance = req.body.balance;

            supplier.save()
                .then(() => res.json('Supplier updated!'))
                .catch(err => { res.status(400).json({ message: "" + err }) });
        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
});



module.exports = router;