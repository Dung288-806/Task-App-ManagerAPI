const express = require('express');
const User = require('../model/User')
const auth = require('../middleware/auth')
const multer = require('multer')
const { sendEmailToUserBeforCreateAcc, sendEmailToUserProRemoveAcc } = require('../email/account')

const userRouter = new express.Router()

// Lưu user xuống db

// userRouter.get('/user', (req, res) => {
//    const user = new User(req.body);

//    user.save().then((result) => {
//         res.send(user)
//    }).catch((error) => {
//        res.status(400).send(error)
//    })
// })

//// Tạo

// Dùng Promise
// userRouter.get('/user/create', (req, res) => {
//     const user = new User(req.body)
//     user.save().then(user => res.send(user)).catch(e => res.status(500).send())
// })

// Dùng Async-Await
userRouter.post('/user/create', async (req, res) => {
    const user = new User(req.body);
    try {
        //await user.save()
        const token = await user.generateAuthToken() // khi tạo token thì user đã được saved
        sendEmailToUserBeforCreateAcc(user.email, user.name)
        res.send({ user, token })
    } catch (e) {
        res.status(500).send(e +' ')
    }
})

//Tìm All

// userRouter.get('/user', (req, res) => {
//     User.find().then(users => res.send(users)).catch(e => res.status(500).send('<h1>Not Found</h1>'));
// })

// có 1 Middleware Auth xác nhận 
userRouter.get('/user/me', auth ,async (req, res) => {
    // try {
    //     const users = await User.find()
    //     res.send(users)
    // } catch (e) {
    //     res.status(500).send('Not Found')
    // }
    
    res.send(req.user)
})

const updateAvatar = multer({
    // dest: 'src/avatar',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            return cb(new Error('Pls upload file *.png|jpg|jpeg'))
        }
        cb(undefined, true)
    }
})

userRouter.post('/user/me/avatar', auth ,updateAvatar.single('imgAvatar') ,async (req, res) => {
    req.user.avatar = req.file.buffer
    //console.log(req.file.buffer)
    await req.user.save()
    res.send()
}, (e, req, res, next) => {  // sau mỗi Router: POST, GET, PATCH, DELETE có 1 hàm xử lý lỗi. 
    // phải cung cấp đủ 4 argument.
    res.status(400).send(e + ' ')
})

userRouter.delete('/user/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

userRouter.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error(e)
        }
        res.set('Content-Type', 'image/jpeg')
        res.send(user.avatar)
    } catch (e) {
        res.status(400).send()
    }
}) 

userRouter.post('/user/login', async (req, res) => {
    
    /*
        user không thực sự logout
        The token đang tồn tại nghĩa là User đang login
    */

    try {
        // Khi xác thực đăng nhập thì User. .Nghĩa là điều xác thực do collection la
        // còn khi tạo token thì mỗi user tạo riêng
        
        const user = await User.findByCredentials(req.body.email, req.body.password)  // xác nhận pass và Email
        //console.log(user)
        const token = await user.generateAuthToken()  // tạo ra 1 token
        res.send({ user, token })
    } catch (e) {
        res.status(400). send(e + ' ')
    }
    // const user = await User.findOne({ email: req.body.email })
    // if(!user) {
    //     return res.status(400).send()
    // }
    // const isMatch = await bcrypt.compare(req.body.password, user.password)
    // if(!isMatch) {
    //     return res.status(400).send()
    // }
    // res.send(user)
})

// Logout thực chất là xóa token đã tồn tại khi Login
// Logout tại thiết 1 hiện tại
userRouter.post('/user/logout', auth, async (req, res) => {
    const user = req.user
    const token = req.token
    try {
        user.tokens = user.tokens.filter((obToken) => {  // trong mỗi Object Token có _Id token và token
            return obToken.token !== token
        })
        await user.save()
        res.send()
    } catch (e) {
        res.status(400).send(e + ' ')
    }
})

// Logout hết tất cả các thiệt bi

userRouter.post('/user/logoutAll', auth, async (req, res) => {
    const user = req.user
    try {
        user.tokens = []
        await user.save()
        res.send()
    } catch (e) {
        res.status(400).send(e + ' ')
    }
})

userRouter.get('/user/:id', async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)
        if(!user) {
            return res.status(404).send('Not Found')
        }
            res.send(user)
    } catch (e) {
        res.status(500).send('Not Found')
    }
})

userRouter.delete('/user/me', auth ,async (req, res) => { 
    try {
        await req.user.remove()
        sendEmailToUserProRemoveAcc(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e + ' ')
    }
})


// Update

// userRouter.get('/user/update/:id', async (req, res) => {   
//     try {
//         const user = await User.findByIdAndUpdate(req.params.id, {
//             name: 'Đùng Đình Giao 123',
//             age: 211
//         }, { new: true, runValidators: true })  //new: true thì user trả về sẽ là user đã được Update
//         res.send(user.name)  // runValidators: true là để áp dụng các validator cho lệnh update
//     } catch (e) {
//         res.status(500).send('Not Found')
//     }
// })


userRouter.patch('/user/me', auth ,async (req, res) => { 
 
    const propertiesNeedUpdate = Object.keys(req.body)
    const propertiesAllowUpdate = ['name', 'password', 'age', 'email']

    const isValidProperties = propertiesNeedUpdate.every((property) => {
        return propertiesAllowUpdate.includes(property)
    })

    if(!isValidProperties) {
        return res.status(400).send('Có thuộc tính update không cần thiết')
    }
    try {
        const updatePropertis = Object.keys(req.body)

        const user = req.user
        updatePropertis.forEach((property) => {
            user[property] = req.body[property]
        });
        
        await user.save()
        res.send(user)

    } catch (e) {
        res.status(400).send(e + ' ')
    }
})

// userRouter.post('/user', (req, res) => {
//     User.find({}).then((users) => {
//         res.status(200).send(users)
//     }).catch((e) => {
//         res.status(404).send()
//     })
// })



module.exports = userRouter