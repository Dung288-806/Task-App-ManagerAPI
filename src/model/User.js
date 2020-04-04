const mongoose =  require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../model/task')

const userSchema = new mongoose.Schema({  // dùng schema để dùng middleware
    name: {
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(value.length < 0) {
                throw Error('Length of name must to be postive number')
            }
        }
    },
    age: {
        type: Number,
        validate(value){
            if(value < 0) {
                throw Error('Age must to be postive number')
            }
        }, 
        default: 0
    }, 
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw Error('Email is valid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(value) {
            if(value.includes("password")) {
                throw new Error('PassWord need dont have "password"')
            }
        }
    },   // Mảng các Object tokens.Bên trong chứa các token
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',  // Bảng tham chiếu
    localField: '_id',  // tham chiếu bằng _id
    foreignField: 'owner'  // trường khóa ngoại bên bảng Task
})

userSchema.methods.toJSON = function() {
    const user = this
    const obUser = user.toObject()
    
    delete obUser.password
    delete obUser.tokens

    return obUser
}

//userSchema.post() làm gì đó sau 1 sự kiện được kích hoạt

// pre() làm gì đó trước khi một sự kiện được kích hoạt
// callback function truyền vào tham số thứ 2 không được là arrow function
// next là để báo là hàm này đã kết thúc

// trước khi sự kiện save (trong trường hợp này là dể lưu user) thì là gì đó...

userSchema.pre('save', async function(next) {

    const user = this
    if(user.isModified('password')) {  // chỉ khi nào có sự thay đổi về pass với hash
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

// Trước khi xóa user thì xóa các task mà user đó đã đăng ký

userSchema.pre('remove', async function (next) { 
    const user = this
    try {
        await Task.deleteMany({ owner: user._id })
    } catch (e) {
        throw new Error('Không xóa được các task của user')
    }
    next()
 })

/*
    userSchema.static là để viết các hàm cho Model
    userSchema.method là để viết các hàm cho instance của model đó
    vd: Model User (collection) thì instance là 1 user riêng
*/

userSchema.methods.generateAuthToken = async function(){  // không được arrow function
    const user = this
    try { 
        const token =  jwt.sign({ _id:  user._id.toString() }, process.env.JWT_SECRET)
        user.tokens = user.tokens.concat({ token })
        await user.save()
        return token
    } catch (e) {
        throw new Error(e)
    }  
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if(!user) {
         throw new Error('Not found')
    }
    const isMatch = bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error('Pass is valid')
    }
    return user
}



const User = mongoose.model('User', userSchema)

module.exports = User