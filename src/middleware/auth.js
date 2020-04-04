const jwt = require('jsonwebtoken')
const User = require('../model/User')
/*
    Khi người dùng login xong. thì sau đó, mỗi request tới server kèm theo cái token ở header
    Middleware: 
    client ---> Dosomething ---> server
*/
const auth = async (req, res, next) => {
    
    try {
        // lấy token được gửi đi trong phần Header của mỗi req
        const token = req.header('Authorization').replace('Bearer ', '')
        //console.log(token)
        // Bước xác thực
        const decode = jwt.verify(token, 'daodinhdung')
        // có được decode của token. trong decode có id của user.
        // tìm xem có user với cái ID đấy và có token trong mảng tokens hay không
        const user = await User.findOne({ _id: decode._id , 'tokens.token' : token })
        if(!user) {
            throw new Error('Not found user')
        }
        req.token = token
        req.user = user  // tìm được user rồi thì đưa nó vào request để tiếp tục gửi tới root handle
        next()

    } catch (e) {
        res.status(400).send(e + '')
    }

}

module.exports = auth