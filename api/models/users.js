const mongoose = require('mongoose');

const UserSchems = mongoose.Schema
({
    id:{
        type:String,
        unique:true,
        trim:true,
        required:true
    },
    list_id:mongoose.Schema.Types.ObjectId,
    name:String,
    categ:{
        type:String,
        lowercase:true,
    },
    aadhar:String,
    email:{
        type:String,
        lowercase:true,
        trim:true,
        required:true,
    },
    pass:String,
    phno:String,
    dob:String,
    age:Number,
    sex:String,
    bloodgrp:String,
    address:String,
    qualification:String,
    techqualification:String,
    utubelink:String,
    exp:
    {
        type:Number,
        default:0
    },
    created:{
        type:String,
        default:GetDate()
    },
    profilePhoto:String,
    video:String,
    otherPhoto:[String],
    book_marked:[ {id : String , name:String} ],
    visitors:{type:Number,default:0},
    payment:[
        {
            payment_id:String,
            payment_request_id:String,
            date:{
                type:String,
                default:GetDate()
            }
        }
    ],
    lastPayed:{
        type:String
    },
    IsPayed:{
        type:Boolean,
        default:false
    },
    IsRenewed:{
        type:Boolean,
        default:false
    },
    nationality:String,
    city:{
        type:String,
        lowercase:true,
    }
    ,height:{
        type:String
    },
    weight:{
        type:String
    },
    zip:{
        type:Number
    },
    active:{
        type:Boolean,
        default:true
    }
})
UserSchems.pre('save', function (next) {
    var self = this;
    UserModel.find({email:self.email}, function (err, docs) {
        if (!docs.length){
            next();
        }else{                
            console.log('user exists: ',self.email);
            next(new Error("2"));
        }
    });
});
function GetDate(){
    var nowDate = new Date(); 
    var date = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate(); 
    return date;
  }
var UserModel = mongoose.model('Users',UserSchems);
module.exports = UserModel;