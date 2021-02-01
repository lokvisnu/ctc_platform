
var gv={};
const ErrHandle = require('./serverErrorHandling');
gv.CRYPTO_SECRET_INSTA_MOJO = "crypto_secret"
gv.SECRET ='secret';
gv.mysqlUNAME="root"
gv.mysqlPASS= ""
gv.mysqlHOST ="localhost"
gv.uid = 1;
gv.IsProd = false;
gv.pid = [];
gv.users = [{
    id:0,
    email:"email",
    pass:'pass',
    role:'user'
}];
gv.code_message =
{
    0:"Success",
    1:"Invalid Email or Password",
    2:"Email Already Exists",
    3:"Invalid Credentials!",
    4:"Phone Number Already Exists"
};

//<INSTA-MOJO>
gv.INSTA_MOJO_API_KEY = "f94add696ddb413a33d76d08d24936fb";
gv.INSTA_MOJO_AUTH_KEY = "8b91288f0a5fedc84b78add48a8609a5";
gv.INSTA_MOJO_URL ='https://www.instamojo.com/api/1.1/payment-requests/';
gv.INSTA_MOJO_PURPOSE = "Registration";
gv.INSTA_MOJO_AMOUNT = '200';
gv.INSTA_MOJO_SEND_MAIL = true;
gv.INSTA_MOJO_SEND_SMS = false;
gv.INSTA_MOJO_REPEATED = false;
gv.INSTA_MOJO_CURRENCY = 'INR';
//https://www.ctcplatform.com
//http://localhost:3000
gv.INSTA_MOJO_REDIRECT_URL = 'http://localhost:3000'
gv.CPANEL = '5feb44c413f6182490c41b70';
gv.MONGOUSNAME = 'ctc';
gv.MONGODBPASS = '25A5vMcYsZnl2vRv'
gv.MONGODBNAME = 'ctcdb'
gv.CheckLog = (req,res,next)=>{
    if(ErrHandle.CheckLoged(req,res)==false)
      next();
    else
      res.redirect(`${gv.INSTA_MOJO_REDIRECT_URL}/home`)
  }
gv.ADMIN_USERNAME = 'cinemathalam'
gv.ADMIN_PASSWORD = 'wFLcvirg*0D)'
gv.CPANEL_PASS = 'wFLcvirg*0D)'
//</INSTA MOJO>
//MongoBD PASS 25A5vMcYsZnl2vRv
module.exports = gv;
