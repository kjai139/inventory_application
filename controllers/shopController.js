const Category = require('../models/category')
const Item = require('../models/item')
const { body, validationResult} = require('express-validator')
const asyncHandler = require('express-async-handler')
const debug = require('debug')('inventory_application:shopController')


exports.index = asyncHandler(async (req, res, next) => {
    const allItems = await Item.find().exec()

    debug('allItems', allItems)
    res.render('shop', {
        title: 'Shop',
        items: allItems
    })
})