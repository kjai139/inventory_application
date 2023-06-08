const Category = require('../models/category')
const Item = require('../models/item')
const { body, validationResult} = require('express-validator')
const asyncHandler = require('express-async-handler')
const debug = require('debug')('inventory_application:shopController')
require('dotenv').config()
const crypto = require('crypto')
const fs = require('fs')

const {PutObjectCommand, S3Client} = require('@aws-sdk/client-s3')




const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_KEY_ID,
      secretAccessKey: process.env.AWS_SA_KEY
      
    }
})

const generateRandomStr = (len) => {
    return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len)
}

const generateTimeStamp = () => {
    return Date.now()
}

exports.index = asyncHandler(async (req, res, next) => {
    const allItems = await Item.find().exec()

    debug('allItems', allItems)
    res.render('shop', {
        title: 'Shop',
        items: allItems
    })
})

exports.create_item_get = asyncHandler(async (req, res, next) => {
    const allCategory = await Category.find()

    res.render('item_form', {
        title: 'Create Item',
        categories: allCategory
        
    })
})

exports.create_item_post = [

    body('itemName', 'Name must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
    body('itemDescription', 'Must have a description')
    .trim()
    .isLength({min: 1})
    .escape(),

    asyncHandler(async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()){
        const allCategory = await Category.find()

        res.render('item_form', {
            title:'Create Item',
            categories: allCategory
        })
    } else {

        const bucketName = 'invenappbucket'
    
        const imageFile = req.params.file
        const keyName = `${generateRandomStr(5)}_${generateTimeStamp()}`
        const params = {
            Bucket: bucketName,
            Key: `images/${keyName}`,
            Body: fs.createReadStream(req.file.path),
            ACL: 'public-read',
            
        }
        //req.file.path created from multer, fs createreadstream reads it then unlinks removed the file after it's temp stored in the server uploads/ directory set up in routes
        const command = new PutObjectCommand(params)
        const response = await s3Client.send(command)
        debug('Image upload successfully')
        debug('url:', `https://${bucketName}.s3.us-east-1.amazonaws.com/${params.Key}`)
        const url = `https://${bucketName}.s3.us-east-1.amazonaws.com/${params.Key}`
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('error deleting file')
            } else {
                console.error('file deleted succesfully')
            }
        })

        if (!Array.isArray(req.body.category)){
            req.body.category = [req.body.category]
        }

        const item = new Item({
            name: req.body.itemName,
            description: req.body.itemDescription,
            price: req.body.itemPrice,
            number_in_stock: req.body.itemStock,
            category: req.body.category,
            imgUrl: url
        })
        await item.save()
        res.redirect('/shop')
    }
    
})]

exports.itemDetails = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id).populate('category')
    debug('item:', item)
    res.render('item_details', {
        item: item
    } )
})

exports.item_edit_get = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id).populate('category')

    res.render('item_update_form', {
        item: item
    })
})

