const express = require('express')
const router = express.Router()
const shopController = require('../controllers/shopController')


router.get('/', shopController.index)

router.get('/item/create', shopController.create_item_get)

router.get('/item/:id', shopController.itemDetails )

module.exports = router