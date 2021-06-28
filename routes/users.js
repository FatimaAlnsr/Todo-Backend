const express = require('express')
const { check } = require('express-validator')
const multer = require('multer')

const auth = require('../middleware/auth')
const usersController = require('../controllers/users')

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname)
    }
}) // configuring multer storage yo be uploaded to /upload and an ext name 

const fileFilter = (req, file, cb) => {
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg'){
        cb(null, true)
    } else {
        cb( "error", false)
    }
} // file types multer will accept are only jpeg/png/jpg

// const limits = multer({ limits: 5000}) // limit is not working why?
//, limits: {fileSize: 500000}
const upload = multer({ storage, fileFilter})


router.post('/signup',
    [
        check('name')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail()
            .isEmail(),
        check('password')
            .isLength({min: 6})
    ]
,usersController.signUp )

router.post('/login', usersController.login )

router.use(auth)

router.get('/:uid', usersController.getUser) // find todo by to do id - not needed -


router.patch('/:uid',
    [
        check('name')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail()
            .isEmail()
    ],
    usersController.updateUserInfo)

router.patch('/changeImage/:uid',upload.single("image"), usersController.updateUserImage)

module.exports = router