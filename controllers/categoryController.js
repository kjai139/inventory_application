const Category = require('../models/category')
const Item = require('../models/item')
const { body, validationResult} = require('express-validator')
const asyncHandler = require('express-async-handler')
const debug = require('debug')('inventory_application:categoryController')


exports.create_category = asyncHandler(async (req, res, next) => {
    res.render('category_form', {title: 'Create Category'})
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

exports.category_detail = asyncHandler(async(req, res, next) => {
    const allCategories = await Category.find()

    res.render('categories_detail', {
        categories: allCategories
    })
})

exports.category_edit_get = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id)

    res.render('category_form', {
        category: category,
        title: `Editing Category: ${category.name}`
    })
})

exports.category_edit_post = asyncHandler(async ( req, res, next) => {
    const category = await Category.findById(req.params.id)

    const editedCategory = new Category({
        name: req.body.categoryName,
        description: req.body.categoryDesc,
        _id: req.params.id
    })

    const response = await Category.findByIdAndUpdate(req.params.id, editedCategory)
    res.redirect('/shop/categories')
})

exports.category_delete_get = asyncHandler(async(req, res, next) => {
    const theCategory = await Category.findById(req.params.id)
    
    
    res.render('category_delete_form', {
        category: theCategory,
        title: `Are you sure you want to delete the category: ${theCategory.name}?`
    })
})

exports.category_delete_post = asyncHandler(async (req, res, next) => {
    const theCategory = await Category.findById(req.params.id)

    const response = await Category.findByIdAndRemove(req.params.id)
    res.redirect('/shop/categories')
})
