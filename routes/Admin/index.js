const router = require('express').Router();
const insta = require('instamojo-nodejs')
const path = require('path')
const errHandle = require('../../modules/serverErrorHandling')
const shortid = require('shortid');
const { ConnectionBase } = require('mongoose');
const ErrHandle = require('../../modules/serverErrorHandling');
const perm = require('../../modules/permissions')
const log = require(path.join(__dirname,'../../modules','logUser.js'))
const gv = require(path.join(__dirname,'../../modules','globalVariables.js'));
const fs = require('fs');
const Users = require('../../api/models/users')
const CryptoJS = require('crypto-js');
const CRYPTO = require('crypto');
const CPANEL = require('../../api/models/cpanel')
function ChechADMIN(req,res,next)
{
    var admin = req.session.ADMIN;
    if(admin!=null&&admin!=undefined&&admin!='')
    {
        CPANEL.find({_id:gv.CPANEL},(err,docs)=>{
            if(!err){
                //console.log(docs)
                var session = docs[0].session;
                if(session.includes(admin)){
                    next();
                }
                else{
                    errHandle.reportErr(req,res,'404')

                }
            }
            else{
                errHandle.reportErr(req,res,'404')
            }
        })
    }
    else{
        errHandle.reportErr(req,res,'404')
    }
}
router.get('/',(req,res)=>
{
    
    errHandle.reportErr(req,res,'404')
})
router.get('/p/s',ChechADMIN,(req,res)=>{
    res.render('admin_search')
})
router.get('/ctc/lo/logout',ChechADMIN,(req,res)=>
{
    var ADMIN_SESS = req.session.ADMIN;
    CPANEL.updateOne( {_id:gv.CPANEL}, { $pullAll: {session: [ADMIN_SESS] } },(err,docs)=>{
        if(!err){
            req.session.destroy((err)=>
            {
                if(!err)
                {
                    res.redirect(`${gv.INSTA_MOJO_REDIRECT_URL}/Admin/ctc/lo`);
                }
                else
                {
                    errHandle.reportErr(res,res,500);
                }
            })
        }
        else{
            errHandle.reportErr(res,res,500);
        }
    })
    
});
router.get('/ctc/lo',(req,res)=>
{
    res.render('admin_login');
})
router.post('/ctc/a/l/post',(req,res)=>{
    //console.log(req.body)
    const{usrname,pass} = req.body;
    if(usrname==gv.ADMIN_USERNAME&&pass==gv.ADMIN_PASSWORD)
    {
        //console.log('Admin Login');
        var ADMIN_SESSION = (shortid.generate() + Date.now()).toString();
        req.session.ADMIN = ADMIN_SESSION;
        CPANEL.update({_id:gv.CPANEL},{$addToSet:{session:ADMIN_SESSION}},(err,docs)=>{
           // console.log(docs);
            if(!err)
                res.redirect(`${gv.INSTA_MOJO_REDIRECT_URL}/Admin/p/s`);
            else
            console.log(err)
        });
        
    }
    else{
        errHandle.reportErr(res,res,404);
    }
})
router.get('/p/s/:id',ChechADMIN,(req,res)=>
{
    if(req.params.id)
    {
        Users.find(({list_id:req.params.id}),(err,docs)=>{
            if(!err&&docs&&docs!=null)
            {
                var aadhar = Crypto_Decrypt(docs[0].aadhar);
                var phno = Crypto_Decrypt(docs[0].phno)
                var address = Crypto_Decrypt(docs[0].address)
                docs[0].aadhar = aadhar;
                docs[0].phno = phno;
                docs[0].address = address;
                //console.log("Aadhar: " + aadhar)
                //console.log('Phno: ' + phno)
                //console.log('Address: ' + address);
                var j = JSON.stringify(docs[0].payment)
                docs[0].item = JSON.parse(j)
                //console.log(docs[0]);
                res.render('AdminDetails',docs[0]);
            }
            else
            {
                errHandle.reportErr(res,res,404);
            }
        })
    }
    else{
        errHandle.reportErr(res,res,404);
    }
        
})

function Encrypt(text) {
  return CryptoJS.AES.encrypt(text,gv.SECRET).toString();
}
function Decrypt(text) {
   var bytes = CryptoJS.AES.decrypt(text,gv.SECRET).toString();
  // console.log(bytes)
   var originalText = bytes.toString(CryptoJS.enc.Utf8);
   return originalText;
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
module.exports = router;