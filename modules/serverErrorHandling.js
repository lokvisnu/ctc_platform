const gv = require('./globalVariables')
const mongoose = require('mongoose');
const Users = require('../api/models/users');
var ErrHandle = {}
ErrHandle.reportErr =(req,res,code)=>{
        res.status(code);
        res.render('errpg',{title:code.toString()+" Error",code:code.toString()});
    }
ErrHandle.CheckLoged = (req,res)=>{
    if(req.session.UserId)
    {
         Users.find({id:req.session.UserId.toString()},(err,result)=>
        {
            if(!err&&result&&result.length>0)
            {
                //console.log("Logged")
                return true;

            }
            else
            {
                //console.log("Not Logged")
                return false;
            }
        })
    }
    else
    {
        //console.log("Not Logged")
        return false;
    }
}
    module.exports = ErrHandle;