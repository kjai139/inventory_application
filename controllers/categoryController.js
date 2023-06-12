const Category = require('../models/category')
const Item = require('../models/item')
const { body, validationResult} = require('express-validator')
const asyncHandler = require('express-async-handler')
const debug = require('debug')('inventory_application:categoryController')


exports.create_category = asyncHandler(async (req, res, next) => {
    res.render('category_create', {title: 'Create Category'})
})

exports.create_category_post = [


    body('categoryName', 'Name must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
    body('categoryDesc', 'Must have a description')
    .trim()
    .isLength({min: 1})
    .escape(),

    asyncHandler(async (req, res, next) => {
        const newCat = new Category({
            name: req.body.categoryName,
            description: req.body.categoryDesc
        })
    
        await newCat.save()
        res.redirect('/shop')
    })
]

exports.delete_category = asyncHandler(async(req, res, next) => {
    const allCategories = await Category.find()
    
    
    res.render('category_delete_form', {
        categories: allCategories
    })
})