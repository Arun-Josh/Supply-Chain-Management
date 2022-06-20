const router = require('express').Router();
let Consumer = require('../models/users.model').Consumer;


router.route('/').get((req, res) => {
    Consumer.find({ "userType": "Consumer" })
        .then(consumers => res.json(consumers))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});


router.route('/add').post((req, res) => {

    var consumerData = req.body;
    consumerData.balance = 0;
    const newConsumer = new Consumer(consumerData);


    newConsumer.save()
        .then(() => res.json('Consumer added!'))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});


router.route('/:id').get((req, res) => {
    Consumer.findById(req.params.id)
        .then(consumer => res.json(consumer))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

router.route('/:id').delete((req, res) => {
    Consumer.findByIdAndDelete(req.params.id)
        .then(() => res.json('Consumer deleted.'))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

router.route('/update/:id').post((req, res) => {
    Consumer.findById(req.params.id)
        .then(consumer => {


            consumer.user_name = req.body.user_name;
            consumer.address = req.body.address;
            consumer.district = req.body.district;
            consumer.state = req.body.state;
            consumer.pincode = req.body.pincode;
            consumer.phone = req.body.phone;
            consumer.email_id = req.body.email_id;
            consumer.account_no = req.body.account_no;
            consumer.account_holder_name = req.body.account_holder_name;
            consumer.ifsc = req.body.ifsc;
            consumer.bank = req.body.bank;
            consumer.balance = req.body.balance;

            consumer.save()
                .then(() => res.json('Consumer updated!'))
                .catch(err => { res.status(400).json({ message: "" + err }) });
        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
});



module.exports = router;