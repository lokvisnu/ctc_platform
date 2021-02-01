//<Libraries and Modules>
const express = require('express');
const compression = require('compression');
const app = express();
const cont = require('./modules/dbcontroller');
const http = require('http');
const path = require('path');
const log = require(path.join(__dirname,'/modules/logUser'))
const errhandle = require('./modules/serverErrorHandling')
const ehb = require('express-handlebars');
const perm = require('./modules/permissions');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const session = require('express-session');
const { strict } = require('assert');
const ErrHandle = require('./modules/serverErrorHandling');
const mongoose = require('mongoose');
const Users = require('./api/models/users');
const { CheckLoged } = require('./modules/serverErrorHandling');
const gv  = require('./modules/globalVariables')
const cpanel = require('./api/models/cpanel');
const { resolve } = require('path');
const { LoginCheck } = require('./modules/permissions');
const shortid = require('shortid');
//</Libraries and Modules>
//<Global Variables>
//<Middle-Ware>
//</Midle-ware>
const SESS ={
    ID:'sid',
    SECRET:'<______Secret _____>'

}

//</Global Variables>
//<Middel-Ware>
//<Compression>
app.use(compression());
//</compression>
//<Handelbars>
app.set('views',path.join(__dirname ,'static' ,'views'));
app.engine('handlebars',ehb({defaultLayout:'main'}));
app.set('view engine','handlebars');
  //</Handlebars>
  //<Static Resourses Management>
app.use('/assets',express.static('assets'))
app.use('/img/',perm.LoggedCheck,express.static(path.join(__dirname,'static','img','users')));
app.use('/vd/',perm.LoggedCheck,express.static(path.join(__dirname,'static','vd')));
app.use('/st/f/img/',(req,res,next)=>
{
    if(req.path.toLowerCase().includes('users'))
    {
        res.status(404);
        res.send('');
    }
    else
        next();
},express.static(path.join(__dirname,'static','img')))
app.use('/st/f/j/',express.static(path.join(__dirname,'static','js')))
app.use('/st/f/css/',express.static(path.join(__dirname,'static','css')))
 //<Static Resourses Management>
app.use(helmet())
//Content Security
app.use(function (req, res, next) {
    res.setHeader(
        'Content-Security-Policy',
      ""
    );
    res.setHeader(
        'Content-Security-Policy-Report-Only',
      "default-src 'self'; font-src 'self' *.googleapis.com *.gstatic.com *.w3schools.com; img-src *.ctcplatform.com *.ctcplatform.com *.ytimg.com *.w3.org *.w3schools.com 'self' ; script-src 'self' 'unsafe-eval' unsafe-inline' https://cdnjs.cloudflare.com https://code.jquery.com https://cdn.jsdelivr.net; style-src 'self'  'unsafe-inline' *.w3schools.com *.googleapis.com *.gstatic.com; frame-src 'self' https://www.youtube.com https://youtube.com https://www.google.com; script-src-elem *.tawk.to https://cdnjs.cloudflare.com https://code.jquery.com https://cdn.jsdelivr.net 'self' 'unsafe-inline' unsafe-eval' ; connect-src *.tawk.to wss://*.tawk.to 'self' "
    );
    next();
  });
//Content Security
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(session({
    name:'qid',
    saveUninitialized:false,
    resave:false,
    secret:'Secret',
    cookie:{
        httpOnly:true,   
        maxAge:1000*60*60*24*7
    }
}));
app.use((req,res,next)=>
{
    //res.set('X-Powered-By',"Spgvark");
    req.originalUrl = req.originalUrl.toLowerCase();
    //console.log("Req Session: "+ req.session.UserId);
    next();
})
//</Middle-Ware/>
function UserLogged(req)
{
    return new Promise((res,rej)=>
    {
        //console.log(req.session.UserId)
        if(req.session.UserId)
        {
             Users.find({id:req.session.UserId.toString()},(err,result)=>
            {
                if(!err&&result.length!=0)
                    res(true);
                else
                    res(false);
            })
        }
        else
            res(false);
    })
}

//<Home , Login , Signup>
//<Artists>
app.get('/artists',perm.LoggedCheck,perm.PayCheck,perm.RenewCheck,(req,res)=>{
         res.render('category',{title:'Artists',artists:'active'});
})
app.get('/arts',perm.LoggedCheck,perm.PayCheck,perm.RenewCheck,(req,res)=>
{

        var options = {
            IsPayed:true,
            IsRenewed:true,
            active:true,
            expDate:{
                $gte:Date.now()
            }

        }
        Users.find(options).sort({visitors:-1}).select(['name','categ','profilePhoto','list_id','city']).lean().exec().then((docs)=>
        {
            res.status(200).json(docs);
        })
    });

app.get('/artist/:list_id',perm.LoggedCheck,perm.PayCheck,perm.RenewCheck,(req,res)=>{
    UserLogged(req)
    .then((Logged)=>
    {
        var date = new Date();
        Users.find(
            {
                list_id:req.params.list_id,
                expDate:
                {
                    $gte:date
                }
            },
            ['id','visitors','list_id','height','weight','bloodgrp','name','exp','utubelink','profilePhoto','otherPhoto','video','techqualification','qualification','city','sex','categ','age','dob','zip','active','IsRenewed','IsPayed','visitor'])
                .then((docs)=>{
                    if(docs)
                    {
                        //console.log(docs[0].id,req.session.UserId)
                        if(docs[0].id===req.session.UserId)
                            res.redirect('/dashboard')
                        else
                        {
                            
                            if(docs[0].IsPayed==true&&docs[0].IsRenewed==true&&docs[0].active==true)
                            {
                                docs[0].title = docs[0].name;
                                docs[0].artist = 'active';
                                docs[0].notLog=Logged;
                                docs[0].otherPhoto.push(docs[0].profilePhoto)
                                var dob = new Date(docs[0].dob).getFullYear();
                                var today = new Date().getFullYear()
                                docs[0].age = today - dob;
                                //console.log(docs[0].name," : ",docs[0].visitor,'visitors : ',docs[0].visitors);
                                if(!docs[0].visitor||!docs[0].visitor.includes(req.session.UserId))
                                {
                                
                                    
                                    
                                    Users.updateOne({ list_id:req.params.list_id},
                                    {
                                        $addToSet:{
                                            visitor:req.session.UserId
                                        },
                                        $inc:{
                                            visitors:1
                                        }
                                    }).then((docs)=>{render()})
                                }
                                else
                                   render();
                                function render()
                                {
                                    res.render('details',docs[0]);
                                }
                            }
                            else
                            {
                                errhandle.reportErr(req,res,'404')
                            }
                        }   
                    }
                    else
                    {

                        console.log(docs[0].expDate)
                    }
                })
                .catch((err)=>
                {
                    console.log(err);
                    errhandle.reportErr(req,res,'404')
                })
    })
})
//</Artists>
app.get(['/','/home*'],(req,res)=>
{
    UserLogged(req)
    .then((Logged)=>
    {
        res.render('home',{title:'Cinema Thalam Creations',home:'active',notLog:Logged});
    })
})
app.get('/contact',(req,res)=>{
    UserLogged(req)
    .then((Logged)=>
    {
        res.render('contactus',{title:'Countact Us - Cinema Thalam Creations',contact:'active',notLog:Logged});
    })
 
})
app.get('/renew',perm.PayCheck,perm.LoggedCheck,perm.RenewCheck,(req,res)=>
{
    UserLogged(req)
    .then((Logged)=>
    {
        Users.find({id:req.session.UserId})
        .then((docs)=>
        {
            var nowDate = docs[0].expDate;
            var dt = nowDate.getDate()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getFullYear(); 
            res.render('paid',{Exp:dt,title:"Renewal",renew:'active',notLog:Logged})
        })
        .catch(err=>
        {
            if(err)
                console.log(err);
        })
    })
});
app.get('/login',perm.LoginCheck,(req,res)=>
{
    
    var email = req.query.e;
    var err = '';
    if(req.query.r)
        err = "Invalid Email or Password";
    //req.query = null;
    res.render('login',{title:'Login',login:'active',error:err,email:email});
})
app.get('/signup',perm.LoginCheck,(req,res)=>
{
    res.render('signup',{title:'Signup',signup:'active'});
})
app.get('/about',(req,res)=>{
    UserLogged(req)
    .then((Logged)=>
    {
        res.render('about',{title:'About - Cinema Thalam Creations',about:'active',notLog:Logged});
    })
    
})
app.get('/whyctc',(req,res)=>{
    UserLogged(req)
    .then((Logged)=>
    {
        res.render('whyctc',{title:'Why Cinema Thalam Creations',whyctc:'active',notLog:Logged});
    })
})
app.get('/logout',(req,res)=>{
    req.session.destroy(function(err) 
    {
        if(!err)
        {
            req.session = null;
            res.redirect(`${gv.INSTA_MOJO_REDIRECT_URL}/home`);
        }
        else
        {
            req.session.UserId = null;
            req.session = null;
            req.session.is = null;
            req.session = {};
            res.redirect(`${gv.INSTA_MOJO_REDIRECT_URL}/home`);
        }
        
    })
    
})
//</Home , Login , Signup>
//</Static File Access/>
 //<Special Routes>
 //<Dashboard>
 app.get('/dashboard',perm.LoggedCheck,(req,res)=>
 {
     Users.findOne({id:req.session.UserId})
     .then((docs)=>
     {
        //<Dashboadr ID>
        //console.log(docs);
        var dId = shortid.generate()+ req.session.UserId;
        req.session.dId = dId;
        var playload = {
            user:req.session.UserId,
            id:dId
        }
        playload = JSON.stringify(playload);
        var load = perm.Crypto_Encrypt(playload);
        docs.I = load;
        docs.phno = perm.Crypto_Decrypt(docs.phno)
        docs.address = perm.Crypto_Decrypt(docs.address);
        docs.otherPhoto.push(docs.profilePhoto);
        var ca = docs.categ.toLowerCase();
        ca = ca.replace(' ','') ;
        ca = ca.replace("'",'');
        var ci = docs.city.toLowerCase();
        ci = ci.replace(' ','');
        ci = ci.replace("'",'');
        docs[ca] = 'selected';
        docs[ci] = 'selected';
        //</Dashboard ID>
        UserLogged(req)
        .then((Logged)=>
        {
            docs.title = `Dashborad - ${docs.name}`
            docs.notLog = Logged;
            docs.dashboard = 'active';
            res.render('dashboard',docs);
        })
        
     });
     
 })
 const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
 app.put('/dashboard',perm.LoggedCheck,perm.DashboardCheck,(req,res)=>{
     console.log(req.body)
    var FinalFields = {};
    var ValidFields = ['name','age','dob','phno','address','exp','categ','city','bloodgrp','qualification','techqualification','utubelink','height','weight','zip']
    //<Filter Valid Fileds>
    try
    {
        if(req.body)
        {
           ValidFields.forEach((i)=>{
               if(req.body[i])
                FinalFields[i] = req.body[i]

           })
           if(FinalFields.phno)
           {
               var ph = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
               if(!FinalFields.phno.match(ph))
               {
                console.log("Details Update Failed For : "+req.session.UserId +" Invalid Phnoe Number :" + FinalFields.phno)
                res.status.json({success:false,InvalidField:true,message:'Invalid Phone Number'})
               }
               FinalFields.phno = perm.Crypto_Encrypt(FinalFields.phno);
           }
           if(FinalFields.address)
            FinalFields.address = perm.Crypto_Encrypt(FinalFields.address);
           Users.updateOne({id:req.session.UserId},FinalFields)
           .then(()=>{
               console.log("Details Updated For : "+req.session.UserId+" As "+JSON.stringify(FinalFields))
               res.status(200).json({success:true,message:'Details Updated Successfully'});
           })
        }
        else
        {
            console.log("Details Update Failed For : "+req.session.UserId)
            res.status(404).json({success:false,message:'Upadate Process Failed'})
        }
    }
    catch(err){
        console.log(err)
        res.json({success:false,message:'Invalid Request'})
    }
        
    //</Filter Valid Fields>
 })
 //</Dashboard>
 app.use(['/u'],require('./routes/login_signup/index.js'))
 app.use(['/Admin'],require('./routes/Admin/index.js'))
//</Special Routes>
 app.get('*',(req,res)=>{
    errhandle.reportErr(res,res,404);
 })
var port = '3000';
var hostname ='0.0.0.0';
http.createServer(app).listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
