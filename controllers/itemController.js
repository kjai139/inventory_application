const Category = require('../models/category')
const Item = require('../models/item')
const { body, validationResult} = require('express-validator')
const asyncHandler = require('express-async-handler')
const debug = require('debug')('inventory_application:itemController')
require('dotenv').config()
const crypto = require('crypto')
const fs = require('fs')

const {PutObjectCommand, S3Client, DeleteObjectCommand} = require('@aws-sdk/client-s3')




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
    const [item, allCategories] = await Promise.all([
        Item.findById(req.params.id).populate('category'),
        Category.find()
    ])
    for (const cat of allCategories) {
        for (const target of item.category) {
            if (cat._id.toString() === target._id.toString()) {
                cat.checked = 'true'
                debug(cat.name, 'checked?', cat.checked)
            }
        }
    }
    
    res.render('item_form', {
        item: item,
        categories: allCategories,
        
    })
})

exports.item_edit_post = [
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
            const [item, allCategories] = await Promise.all([
                Item.findById(req.params.id).populate('category'),
                Category.find()
            ])
            for (const cat of allCategories) {
                for (const target of item.category) {
                    if (cat._id.toString() === target._id.toString()) {
                        cat.checked = 'true'
                        debug(cat.name, 'checked?', cat.checked)
                    }
                }
            }
            
            res.render('item_form', {
                item: item,
                categories: allCategories,
                
            })
        } else {

            const item = await Item.findById(req.params.id)
            
            let urlObject
            let objectPath
           
            
            if (item.imgUrl) {
                debug('imgUrl found', item.imgUrl)
                urlObject = new URL(item.imgUrl)
                objectPath = urlObject.pathname.substring(1)
            } else {
                debug('item had no imgUrl')
                objectPath = `images/${generateRandomStr(5)}_${generateTimeStamp()}`
            }
            

            debug('final object path', objectPath)

            const bucketName = 'invenappbucket'
    
            // const keyName = `${generateRandomStr(5)}_${generateTimeStamp()}`
            const params = {
                Bucket: bucketName,
                Key: objectPath,
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

            const newItem = new Item({
                name: req.body.itemName,
                description: req.body.itemDescription,
                price: req.body.itemPrice,
                number_in_stock: req.body.itemStock,
                category: req.body.category,
                imgUrl: url,
                _id: req.params.id
            })
            const theItem = await Item.findByIdAndUpdate(req.params.id, newItem)
            res.redirect(theItem.url)
        }
    })
]


exports.item_delete_get = asyncHandler( async(req, res, next) => {
    const item = await Item.findById(req.params.id).populate('category')
    
    
    res.render('item_delete_form', {
        item: item
    })
})

exports.item_delete_post = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id)

    
    let urlObject
    let objectPath
    const bucketName = 'invenappbucket'
            
    if (item.imgUrl) {
        debug('imgUrl found', item.imgUrl)
        
        urlObject = new URL(item.imgUrl)
        objectPath = urlObject.pathname

        const params = {
            Bucket: bucketName,
            Key: objectPath,
        }

        const command = new DeleteObjectCommand(params)
        const response = await s3Client.send(command)
        debug(response, 's3 response')
        await Item.findByIdAndRemove(req.params.id)
        
        res.redirect('/shop')
    } else {
        debug('item had no imgUrl. Only deleting from mongodb')
        await Item.findByIdAndRemove(req.params.id)
        res.redirect('/shop')
    }
    

})