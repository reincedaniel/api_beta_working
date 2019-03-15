const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/project_api',{ useCreateIndex: true,useNewUrlParser: true ,useFindAndModify: false })
mongoose.Promise = global.Promise;

module.exports = mongoose; 