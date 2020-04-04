const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    compeleted: {
        type: Boolean,
        default: false
    },
    owner: {  // Chủ nhân của task này là ai ? <tham chiếu tới User đã tạo ra task qua User ID>
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'  // referen. Tham chiếu tới collection User
    }
}, {
    timestamps: true  // lấy thời gian từ hệ thống
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task