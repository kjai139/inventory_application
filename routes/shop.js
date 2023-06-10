const express = require('express')
const router = express.Router()
const itemController = require('../controllers/itemController')
const categoryController = require('../controllers/categoryController')
const multer = require('multer')
const upload = multer({dest: 'uploads/'})


router.get('/', itemController.index)

router.get('/item/create', itemController.create_item_get)
router.post('/item/create', upload.single('itemImageUrl'), itemController.create_item_post)
//the itemimageurl has to match the name field of the file upload in form

router.get('/item/:id', itemController.itemDetails )

router.get('/item/:id/update', itemController.item_edit_get)
router.post('/item/:id/update', upload.single('itemImageUrl'), itemController.item_edit_post)

router.get('/category/create', categoryController.create_category)
router.post('/category/create', categoryController.create_category_post)

router.get('/item/:id/delete', itemController.item_delete_get)
router.post('/item/:id/delete', itemController.item_delete_post)

module.exports = router