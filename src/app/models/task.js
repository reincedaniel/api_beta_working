const bcrypt = require('bcryptjs')
const mongoose = require('../../database/index');


const TaskSchema = new mongoose.Schema({

    title:{
        type: String, 
        require:true
    },
    project:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Project',
       
    },
    assignedto:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required:true,
    },
    completed:{
        type: Boolean,
        require: true,
        default: false, 
    },
     createdAt:{
        type:Date,
        default:Date.now
    }

})

const Task  = mongoose.model('Task',TaskSchema)

module.exports = Task;