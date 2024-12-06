const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    username:{type:"string",required:"true",unique:"true"},
    password:{type:"string",required:"true"},
    email:{type:"string",required:"true",unique:true},
    fullname:{type:"string",required:"true",unique:"true"},
    gender:{type:"string",required:"true",unique:"true",enum:["Male","Female","Others"]}
})

module.exports=mongoose.model('User',userSchema)