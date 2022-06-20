const router = require('express').Router();
const Commodity = require('./../models/commodity-group.model')

router.route('/').get((req, res) => {
    Commodity.find()
        .then(commodities => {
            res.json(commodities)
        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
})

router.route('/add').post((req, res) => {

    const commodityData = req.body;

    Commodity.countDocuments({ commodity_group_name: commodityData.commodity_group_name })
        .then(commoditiesCount => {

            if (commoditiesCount !== 0) {

                res.status(200).json('duplicate')
            }
            else {
                const newCommodity = new Commodity(commodityData);
                newCommodity.save()
                    .then(() => {
                        res.json("success")
                    })
                    .catch(err => { res.status(400).json({ message: "" + err }) });
            }
        })
        .catch(err => { res.status(400).json({ message: "" + err }) });
})

router.route('/:id').get((req, res) => {
    Commodity.findById(req.params.id)
        .then(commodity => res.json(commodity))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

router.route('/:id').delete((req, res) => {
    Commodity.findByIdAndDelete(req.params.id)
        .then(() => res.json('Commodity deleted.'))
        .catch(err => { res.status(400).json({ message: "" + err }) });
});

router.route('/update/:id').post((req, res) => {

    Commodity.findById(req.params.id)
        .then(commodity => {
            const commodityData = req.body;
            Commodity.countDocuments({ commodity_group_name: commodityData.commodity_group_name })
                .then(commoditiesCount => {

                    if (commoditiesCount > 2) {

                        res.status(200).json('duplicate')
                    }
                    else {
                        commodity.commodity_group_name = commodityData.commodity_group_name;
                        commodity.sub_commodities = commodityData.sub_commodities;

                        commodity.save().then(() => { res.json("success") }).catch(err => { res.status(400).json({ message: "" + err }) });
                    }

                })
                .catch(err => { res.status(400).json({ message: "" + err }) });
        });
});

module.exports = router;