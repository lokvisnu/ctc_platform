const mysql = require('mysql');
//var bcrypt = require('bcrypt');//new
const fs = require('fs');
const path = require('path')
const Gp = require('./globalVariables')
const crypto = require('crypto-js');
const CRYPTO = require('crypto');
const shortid = require('shortid');
const { query } = require('express');

//<<Mongoose>
const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://${Gp.MONGOUSNAME}:${Gp.MONGODBPASS}@ctccluster.q0xme.mongodb.net/${Gp.MONGODBNAME}?retryWrites=true&w=majority`,{useUnifiedTopology:true, useNewUrlParser: true})
.then(()=>console.log('successful'));
const UserSchema = require('../api/models/users');
const gv = require('./globalVariables');
const { profile } = require('console');
//</Mongoose>

var controller = {};
controller.IfPassCorrect = (obj,req)=>
{
  var email = obj.email.trim();
  //console.log(email)
  var pass = obj.pass.trim();
  return new Promise((resolve,reject)=>
  {
      UserSchema.find({email:email},function(err,docs){

        if(!err&&docs[0]!=null||docs[0]!=undefined)
        {
          var passd = Crypto_Decrypt(docs[0].pass);
         // console.log(passd)
          if(passd==pass)
          {
            req.session.is = docs[0].IsPayed;
            req.session.UserId = docs[0].id;
            console.log(docs[0].email +" Logged","Id: ",docs[0].id)
            resolve(docs[0].id);
          }
          else
          {
            console.log(email +" Invalid Login Credentials")
            reject(1);
          }
        }
        else
        {
            console.log(email +" Invalid Login Credentials")
            reject(1);
        }
      })
  })    
}
controller.AddNewUser = (obj,req)=>{
  return new Promise((resolve,reject)=>
  {
    const{firstname,city,height,weight,zip,lastname,email,pass,aadhar,phno,categ,dob,age,sex,bloodgrp,nationality,address,qualification,techqualification,exp,utubelink} = obj;
    try
    {
      var name = firstname.trim() ;
      var id = Date.now();
      id = id + parseInt(obj.phno);
      var hashedPass = Crypto_Encrypt(pass);//new
      //var hashedPass = bcrypt.hashSync(pass,8);//new
      var hashedAadhar = Crypto_Encrypt(aadhar) ;
      var hashedPh = Crypto_Encrypt(phno);
      var hashedAddress = Crypto_Encrypt(address);
      //<Exp Date>
      var dt = new Date();
      var ExpDate = new Date(dt.setMonth(dt.getMonth() + 12));
      //</Exp Date>
      var id = (shortid.generate().toString()+id.toString())
      var video = ''
      if(req.files['video'])
      {
        video = `${gv.INSTA_MOJO_REDIRECT_URL}/u/vd/${req.files['video'][0].filename}`;
      }
      var otherPhoto = req.files['otherPhoto'].map((i,index,array)=>`${gv.INSTA_MOJO_REDIRECT_URL}/u/img/${i.filename}`)
      var user = new UserSchema
      (
        {
          id:id,
          list_id:mongoose.Types.ObjectId(),
          name:name,
          categ:categ.toLowerCase(),
          aadhar:hashedAadhar,
          email:email,
          pass:hashedPass,
          phno:hashedPh,
          dob:dob,
          age:age,
          sex:sex,
          height:height,
          weight:weight,
          bloodgrp:bloodgrp,
          address:hashedAddress,
          qualification:qualification,
          techqualification:techqualification,
          exp:exp,
          created:GetDate(),
          IsPayed:false,
          visitors:0,
          profilePhoto: `${gv.INSTA_MOJO_REDIRECT_URL}/u/img/${req.files['profilePhoto'][0].filename}`,
          otherPhoto:otherPhoto,
          nationality:nationality,
          city:city.toLowerCase(),
          utubelink:utubelink,
          video: video,
          zip:zip
          //exp_date:ExpDate
        }
      )
      user.save()
      .then((doc)=>
      {
        //console.log("ID Id Id Id ID" + doc.id)
        console.log("Account Created Successfully "+doc.email);
        req.session.UserId = doc.id;
        resolve(doc.id);
      })
      .catch((error)=>
      {
        //console.log(error.message);
        fs.unlink(path.join(__dirname,'../static/img/users/',req.files['profilePhoto'][0].filename),(err)=>
        {
          if(err)
            console.log(err)
        });
        req.files['otherPhoto'].forEach((i,index,array)=>
        {
          //console.log(i);
          fs.unlink(path.join(__dirname,'../static/img/users/',i.filename),(err)=>{
            if(err)
              console.log(err)
          });
        });
       // console.log(req.files['video'][0].filename);
       if(req.files['video'])
       {
          fs.unlink(path.join(__dirname,'../static/vd/',req.files['video'][0].filename),(err)=>
          {
            if(err)
              console.log(err)
            reject(error.message)
          });
       }
       else
       {
          //console.log(err)
        reject(error.message)
       }
    })


    }
    catch(err)
    {
      console.log(err)
    }
 })
  function monthDiff(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() + 
      (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
   }
function GetDate()
{
  var nowDate = new Date(); 
  var date = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate(); 
  return date;
}

}
controller.UpdatePayment = (id)=>
{
  
}
function Encrypt(text) {
  return crypto.AES.encrypt(text,Gp.SECRET).toString();
}
function Decrypt(text) {
   var bytes = crypto.AES.decrypt(text,Gp.SECRET).toString();
   return bytes.toString(crypto.enc.Utf8);
}
function Crypto_Encrypt(e) 
{
    var mykey = CRYPTO.createCipher('aes-128-cbc',gv.CRYPTO_SECRET_INSTA_MOJO);
    var key = mykey.update(e.toString(), 'utf8', 'hex')
    key += mykey.final('hex');
    return key;
}
function Crypto_Decrypt(e)
{
    var mykey = CRYPTO.createDecipher('aes-128-cbc', gv.CRYPTO_SECRET_INSTA_MOJO);
    var mystr = mykey.update(e.toString(), 'hex', 'utf8')
    mystr += mykey.final('utf8');
    //console.log(mystr); 
    return mystr;
}
module.exports = controller;
