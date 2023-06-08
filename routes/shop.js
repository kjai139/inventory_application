const express = require('express')
const router = express.Router()
const shopController = require('../controllers/shopController')
const multer = require('multer')
const upload = multer({dest: 'uploads/'})


router.get('/', shopController.index)

router.get('/item/create', shopController.create_item_get)
router.post('/item/create', upload.single('itemImageUrl'), shopController.create_item_post)
//the itemimageurl has to match the name field of the file upload in form

router.get('/item/:id', shopController.itemDetails )

router.get('/item/:id/update', shopController.item_edit_get)



module.exports = router