const mongoose = require('mongoose');

// const ulrConnection = 'mongodb://127.0.0.1:27017/task-manager-api';

mongoose.connect(process.env.URL_CONNECTION, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
