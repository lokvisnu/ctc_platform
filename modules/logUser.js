const gv = require('./globalVariables')
const dbcont = require('./dbcontroller');
const crypto = require('crypto');
const shortid = require('shortid');
const paym = require('./payment');
const errHandle  = require('./serverErrorHandling')
//<Mongoose>
const mongoose = require('mongoose');
const Users = require('../api/models/users');
const Pay_Id = require('../api/models/user_pay_id')
const Cpanel = require('../api/models/cpanel')
const { users } = require('./globalVariables');
//</Mongoose>
let log={};

log.LoginUser = async (req,res)=>
{
    const {email,pass} = req.body;
    //onsole.log(req.body)
        dbcont.IfPassCorrect(req.body,req)
        .then((id)=>
        {
            req.session.UserId = id;
            res.redirect('/artists');
        })
        .catch((code)=>
        {
            if(!req.body.email)
            {
                req.body.email ='';
            }
            req.session.UserId = null;
            //res.render('login',{error:'Invalid Email or Password',email:req.body.email})
            res.redirect(`/login?e=${req.body.email}&r=${code.toString()}`);
        
        });
        ///Set Session Id
}
log.SignupUser = async (req,res)=>
{
    //console.log(req.files);
    const {firstname,lastname,email,pass,aadhar,phno,categ,dob,age,sex,bloodgrp,address,qualification,techqualification,exp,utubelink} = req.body;
        dbcont.AddNewUser(req.body,req)
        .then((id)=>
        {
            //console.log("Payment Entered")
            req.session.UserId = id;
            NotFree(id)
            .then(()=>
            {
                //<Redirect URL Playload>
                //console.log("Paid Signup")
                var key = Crypto_Encrypt(id);
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
                var data = {};
                data.purpose=gv.INSTA_MOJO_PURPOSE;
                data.amount = gv.INSTA_MOJO_AMOUNT;
                data.currency =gv.INSTA_MOJO_CURRENCY;
                data.send_sms = gv.INSTA_MOJO_SEND_SMS;
                data.send_email = gv.INSTA_MOJO_SEND_MAIL;
                data.allow_repeated_payments  = gv.INSTA_MOJO_REPEATED;
                data.buyer_name = (firstname);
                data.email = email;
                data.phone = phno;
                data.redirect_url =`${gv.INSTA_MOJO_REDIRECT_URL}/u/p?p=${load}`;
                paym.createPayment(data)
                .then((response)=>
                {
                        req.session.is = true;
                        var resp = JSON.parse(response);
                        var redir = resp.payment_request.longurl;
                        res.redirect(redir);
                })
                .catch((err)=>
                {
                    console.log(err)
                    res.send("Payment Failed Please Try Again Later <br> Contact CTC If You Any Issue Rearding Payment") 
                })
            })
            .catch(()=>
            {
                //console.log("Free Signup")
                res.redirect(`${gv.INSTA_MOJO_REDIRECT_URL}/artists`);
            })
            
        })
        .catch((code)=>
        {
            
            res.render('signup',{error:gv.code_message[code]})
        });
    }
    

log.Validate_Update_Payment= async (obj,req,res)=>
{

    try
    {
        //console.log(obj);
        const{p,payment_id,payment_request_id,payment_status} = obj;
    if(payment_status=='Credit')
    {
        var load = Crypto_Decrypt(p.toString());
        load = JSON.parse(load);
        //console.log("Pid : " +load.pid);
        var i = Crypto_Decrypt(load.id);
        Pay_Id.find({pay_id:load.pid},function (err, docs) 
        {
            //console.log(docs);
            if (docs.length>0&&docs.length>=0&&docs[0].id == i &&!err)
            {
                Users.find({id:i},(err,UserResult)=>
                {
                
                var lastPayed = new Date(UserResult[0].lastPayed)
                if(UserResult[0].lastPayed!=null||UserResult[0].lastPayed!=undefined)
                {
                    var now = new Date(GetDate().toString())
                    var monthpassed = monthDiff(lastPayed,now);
                }
                if(UserResult[0].lastPayed==null||UserResult[0].lastPayed==undefined||monthpassed>=12)
                {
                    var dt = new Date();
                    var ExpDate = new Date(dt.setMonth(dt.getMonth() + 12));
                    Users.updateOne({id:i},
                    {
                        IsPayed:true,
                        IsRenewed:true,
                        lastPayed:GetDate(),
                        $addToSet:
                        {
                            payment:[
                                {
                                    payment_id:payment_id,
                                    payment_request_id:payment_request_id,
                                    date:GetDate()
                                }
                            ]
                        },
                        expDate:ExpDate
                    })
                    .then((result)=>{
                        req.session.r = false;
                        req.session.UserId = i;
                        Pay_Id.deleteOne({id:i}).then(()=>res.redirect(`${gv.INSTA_MOJO_REDIRECT_URL}/artists`));
                                        
                    })
                    .catch(err=>
                    {
                        console.log(err)
                        Pay_Id.deleteOne({id:i}).then(()=>res.redirect(`${gv.INSTA_MOJO_REDIRECT_URL}/home`));
                    });
                }
                else
                {
                    Pay_Id.deleteOne({id:i}).then(()=>res.redirect(`${gv.INSTA_MOJO_REDIRECT_URL}/home`));
                }
            })
        }
            
            else
            {
                //console.log("Payment Unsuccessful");
                //res.send("Payment Unsuccessful")
                Pay_Id.deleteOne({id:i}).then(()=>res.redirect(`${gv.INSTA_MOJO_REDIRECT_URL}/home`));
            }
            
        })
    }
}
catch(err){
    console.log(err);
    errHandle.reportErr(req,res,'404');
}
}
log.ForgotPassword = (req,res)=>
{
    var email = req.body.email || null;
    if(email)
    {
        Users.findOne({email:email.toString()}).select().exec((err,data)=>{
            if(err || !data)
                res.status(404).json({sucess:false,message:"Entered Email Does Not Exist"})
            else
            {

            }
        })
    }
    else
        res.status(404).json({sucess:false,message:"Please Enter The Email"})
}
//////////////////////////////////
function GetDate(){
    var nowDate = new Date(); 
    var date = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate(); 
    return date;
  }
  function monthDiff(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() + 
      (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
   }
function Crypto_Encrypt(e) 
{
    var mykey = crypto.createCipher('aes-128-cbc',gv.CRYPTO_SECRET_INSTA_MOJO);
    var key = mykey.update(e.toString(), 'utf8', 'hex')
    key += mykey.final('hex');
    return key;
}
function Crypto_Decrypt(e)
{
    var mykey = crypto.createDecipher('aes-128-cbc', gv.CRYPTO_SECRET_INSTA_MOJO);
    var mystr = mykey.update(e.toString(), 'hex', 'utf8')
    mystr += mykey.final('utf8');
    //console.log(mystr); 
    return mystr;
}
function NotFree(id)
{
    return new Promise((resolve,reject)=>{
        Cpanel.find({_id:gv.CPANEL},(err,docs)=>
        {
            console.log('Err  : '+err)
            //console.log("Docs : "+docs)
            if(!err&&docs[0].free>0)
            {
                Cpanel.updateOne({_id:gv.CPANEL},{ $inc: { free: -1 } },(err,docs)=>{
                    if(!err)
                    {
                        var dt = new Date();
                        var ExpDate = new Date(dt.setMonth(dt.getMonth() + 12));
                        Users.update({id:id},
                        {
                            IsPayed:true,
                            IsRenewed:true,
                            lastPayed:GetDate(),
                            expDate:ExpDate
                        },(err,docs)=>
                        {
                            if(!err)
                            {
                                console.log("Free Signup : "+docs.email)
                                reject();
                            }
                            else
                                resolve();
                        })
                    }
                    else
                        resolve();
                })
            }
            else
                resolve();
        })
    });
}


module.exports = log;
