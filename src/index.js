const express = require('express');
const app = express();
require('./db/mongoose')
app.use(express.json());

const port = process.env.PORT

// Model Task

const taskRouter = require('../src/Routers/Task')
app.use(taskRouter)

// Model User
const userRouter = require('../src/Routers/User')
app.use(userRouter)

/*
 Các Method cho HTTP Request
POST => create
GET => Read
PATCH => Update
Delete => Delete

 */

//  const jwt = require('jsonwebtoken')

//  const myF = async () => {
//      const token = jwt.sign({ _id: '12345'}, 'daodinhdung')
//      console.log(token)
//  }

//  myF()
 

app.get('*', (req, res) => {
    res.status(404).send('NOT FOUND 404')
})

app.listen(port, () => {
    console.log('Server is listening ', port);
})

const Task = require('../src/model/task')
const User = require('../src/model/User')
const Main = async () => {
    //console.log(task)
    //tương đương với việc tìm User qua ID phía dưới. Syntax của es6 dùng trong tham chiếu
    // tìm chủ nhân của task có id 
    // populate tự động tìm và kết nối đến bảng có ref trong field. 
    //Sau đó sẽ tự động tìm ra những trường nào có owner bằng nhau. 

    // const task = await Task.findById('5e853b2e4d70503bd86cd44f')
    // await task.populate('owner', 'name').execPopulate()
    // console.log(task.owner)

    const user = await User.findById('5e84c3eda9b03501fc54c9a1')

    await user.populate({
        path: 'tasks',
        match: {
            compeleted: true
        }
    }).execPopulate()

    console.log(user.tasks)
    



    //const user = await User.findById(task.owner)
    // const user = await User.findById('5e835af7beb7102b14de1e88')
    // await user.populate('tasks').execPopulate()
    // console.log(user.tasks)
}

// Main()


const multer = require('multer')
const upload = multer({
    dest: 'src/images'
})

app.post('/upload', upload.single('upload') ,(req, res) => {
    res.send()
})