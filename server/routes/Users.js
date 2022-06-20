const router = require('express').Router();
let User = require('../models/users.model').Consumer;


router.route('/').get((req, res) => {
    User.find()
        .then(users => {
            res.json(users)
        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
})

router.route('/:id').get((req, res) => {
    Consumer.findById(req.params.id)
        .then(user => res.json(user))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});
module.exports = router;