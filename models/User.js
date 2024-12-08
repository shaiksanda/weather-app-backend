const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    username:{type:"string",required:"true",unique:"true"},
    password:{type:"string",required:"true"},
    email:{type:"string",required:"true",unique:true},
})

module.exports=mongoose.model('User',userSchema)