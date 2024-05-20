const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    number:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    state:{
        type:String,
        default:'registered'
    },
    dob:{
        type:String
    },
    salary:{
        type:String,
    },
    address:{
        type:String
    }
})

const User = mongoose.model('User',userSchema);

module.exports = User;