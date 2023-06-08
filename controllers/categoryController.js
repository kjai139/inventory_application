const Category = require('../models/category')
const Item = require('../models/item')
const { body, validationResult} = require('express-validator')
const asyncHandler = require('express-async-handler')
const debug = require('debug')('inventory_application:categoryController')


exports.create_category = asyncHandler(async (req, res, next) => {
    res.render('category_create', {title: 'Create Category'})
})