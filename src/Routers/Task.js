const express = require('express')
const Task = require('../model/task')
const auth = require('../middleware/auth')
const taskRouter = new express.Router();

taskRouter.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        description: req.body.description,
        compeleted: req.body.compeleted,
        owner: req.user._id
    })
    try {
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(500).send('E:  ' + e + ' ')
    }
})

 //CRUD

// taskRouter.post('/task', (req, res) => {
//     Task.find({}).then((task) => {
//         res.status(200).send(task)
//     }).catch((e) => {
//         res.status(404).send()
//     })
// })

// lấy ra những task mà user này (user trong auth) đã tạo
taskRouter.get('/tasks', auth ,async (req, res) => {
    try {

    // const tasks = await Task.find({ owner : req.user._id })
    // const tasks = await Task.find()
        const match = {}
        const sort = {}  // /tasks?sort=updateAt:desc
        // nếu mà có truyền vào completed trên URL thì ép
        if(req.query.compeleted) {
            match.compeleted = (req.query.compeleted === 'true' ? true : false)
        }
        if(req.query.sort) {
            const parts = req.query.sort.split(':')
            sort[parts[0]] = (parts[1] === 'desc' ? -1 : 1 )
        }

       const user = req.user
       const tasks = await user.populate({
           path: 'tasks',
           match,
           options: {
               limit: parseInt(req.query.limit),
               skip: parseInt(req.query.skip),
               sort
           }
       }).execPopulate()

        if(!tasks) {
            return res.status(404).send('Not Found')
        }
        res.send(tasks.tasks)
    } catch (e) {
        res.status(404).send('E:  ' + e + ' ');
    }
})


// taskRouter.get('/task/:id', (req, res) => {
//     const _id = req.params.id
//     Task.findById(_id).then((task) => {
//         res.status(200).send(task)
//     }).catch((e) => {
//         res.status(404).send()
//     })
// })

taskRouter.get('/task/:id', auth ,async  (req, res) => {
    const _id = req.params.id
    try {
       // const task = await Task.findById(_id)
       const task = await Task.findOne( { _id, owner: req.user._id })  // tìm task mà user đó đã tạo thông qua id task
        if(!task) {
            return res.status(404).send('Not Found')
        }
        res.send(task)
    } catch (e) {
        res.status(404).send('E:  ' + e + ' ');
    }
})

taskRouter.patch('/task/:id', auth ,async (req, res) => {

    try {
        const updateProperties = Object.keys(req.body)
        const allowUpdate = ['compeleted', 'description']
        const isValidOpration = updateProperties.every((property) => {
                return allowUpdate.includes(property)
        })
        // nếu tòn tại 1 property khong có trong Model thì không cho update
        if(!isValidOpration) {
            return res.status(400).send('Không có thuộc tính update')
        }

        const _id = req.params.id
        // console.log(_id +'  '+ req.user._id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        
        if(!task) {
            return res.status(404).send('Not found')
        }
        updateProperties.forEach((property) => {
            task[property] = req.body[property]
        })
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e + ' ')
    }
})

taskRouter.delete('/task/:id', auth , async (req, res) => {
    const _id = req.params.id
    try {
        //const taskDeleted = await Task.findByIdAndDelete(id)
        const taskDeleted = await Task.findOne({ _id, owner: req.user._id })
        await taskDeleted.delete()
        res.send(taskDeleted)
    } catch (e) {
        res.status(404).send('E:  ' + e + ' ');
    }
})

module.exports = taskRouter