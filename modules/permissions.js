const errhandle = require('./serverErrorHandling');
const gv = require('./globalVariables')
const crypto = require('crypto');
const shortid = require('shortid');
const paym = require('./payment');
const Pay_Id = require('../api/models/user_pay_id')
const Users = require('../api/models/users')
module.exports = {
 FrntEnd_Orgin:(req,res,next) =>{
   // console.log("Frontend Orgin check");
    var hed = req.headers;
    if(hed['sec-fetch-site']=='same-orgin'&&hed['sec-fetch-mode']=='no-cors'&&hed.referer!=null||hed.referer!=undefined)
        next();
    else
        errhandle.reportErr(req,res,405);
},
 LoginCheck:(req,res,next) =>{
    if(errhandle.CheckLoged(req,res)==false)
      next();
    else
      res.redirect(`${gv.INSTA_MOJO_REDIRECT_URL}/home`)
},
LoginCheckPost:(req,res,next) =>{
    if(errhandle.CheckLoged(req,res)==false)
      next();
    else
      res.send(`Cannot POST ${req.path}`)
},
LoggedCheck:(req,res,next) =>
{
    var c = errhandle.CheckLoged(req,res);
   // console.log("Logged Check: " +c)
    if(c!=false)
    {
        //console.log("Check logged : Logged")
      next();
    }
    else
    {
        //console.log("Check logged : Not Logged")
      res.redirect(`${gv.INSTA_MOJO_REDIRECT_URL}/login`)
    }
},
PayCheck:(req,res,next) =>{
  Users.find({id:req.session.UserId},(err,docs)=>{
    if(docs[0].IsPayed == true)
      next();
    else
      module.exports.RedirectPayment(req,req.session.UserId,'200',res,'Registration')
  })
    
},
RenewCheck:(req,res,next) =>{
  Users.find({id:req.session.UserId},(err,docs)=>{
    if(docs[0].IsRenewed == true)
      next();
    else
      module.exports.RedirectPayment(req,req.session.UserId,'100',res,'Renewal Charges')
  })
    
},
RedirectPayment:(req,id,amount,res,pur)=>{
    var key = Crypto_Encrypt(id);
    //console.log(id)
            var pid = shortid.generate().toString();
            pid = pid + Date.now().toString();
            var pay_id = new Pay_Id({
                id:id,
                pay_id:pid
            });
            pay_id.save();
            var playload =
            {
                id:key,
                pid:pid
            }
            var load = JSON.stringify(playload);
            load = Crypto_Encrypt(load);
            //</Redirect URL Playload>
            var data ={};
            data.purpose=pur;
            data.amount = amount;
            data.currency =gv.INSTA_MOJO_CURRENCY;
            data.send_sms = gv.INSTA_MOJO_SEND_SMS;
            data.send_email = gv.INSTA_MOJO_SEND_MAIL;
            data.allow_repeated_payments  = gv.INSTA_MOJO_REPEATED;
            Users.find({id:id.toString()},(err,docs)=>
            {
                var u = docs[0];
                //console.log("Phone No"+u.phno)
                var phno = Crypto_Decrypt(u.phno.toString())
                //console.log("Phno: " + phno)
                data.buyer_name = u.name;
                data.email = u.email;
                //console.log(phno);
                data.phone = phno;
                data.redirect_url =`${gv.INSTA_MOJO_REDIRECT_URL}/u/p?p=${load}`;
                paym.createPayment(data)
                .then((response)=>
                {
                       // console.log("Redirect");
                        var resp = JSON.parse(response);
                        var redir = resp.payment_request.longurl;
                        res.redirect(redir);
                })
                .catch((err)=>{
                  console.log(err)
                  errhandle.reportErr(req,res,404);
                })
            })
            
},
SignupValidate:(req,res,next)=>
{
  //console.log(req.body);
  const{firstname,city,lastname,email,pass,aadhar,phno,categ,dob,age,sex,bloodgrp,nationality,address,qualification,techqualification,exp,utubelink} = req.body;
  var errField ={
    firstname:'Name',
    city:'District',
    email:'Email',
    aadhar:'Aadhar',
    phno:'Phone Number',
    categ:'Catgeory',
    dob:'Date Of Birth',
    address:'Address',
    qualification:'Qaulification'
  }
  var redirect = false;
  Object.keys(errField).forEach((key,index,array)=>{
    //console.log(key + ':'+ req.body[key])
    var k = req.body[key];
    if(k==null&&k==undefined&&k=='')
    {
      //console.log("Rejected")
      redirect  = true;
      //res.render('signup',{error:`Please Enter ${errField[key]} To Continue`})
    }
    else
    {
      redirect = false;
     // console.log('Accepted')
    }
  })
  if(redirect)
    res.render('signup',{error:`Please Enter Details To Continue`})
  else
    next();
}
}
function Crypto_Decrypt(e)
{
    var mykey = crypto.createDecipher('aes-128-cbc', gv.CRYPTO_SECRET_INSTA_MOJO);
    var mystr = mykey.update(e.toString(), 'hex', 'utf8')
    mystr += mykey.final('utf8');
   // console.log(mystr); 
    return mystr;
}
function Crypto_Encrypt(e) 
{
    var mykey = crypto.createCipher('aes-128-cbc',gv.CRYPTO_SECRET_INSTA_MOJO);
    var key = mykey.update(e.toString(), 'utf8', 'hex')
    key += mykey.final('hex');
    return key;
}