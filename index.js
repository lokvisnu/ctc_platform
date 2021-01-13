//<Libraries and Modules>
const express = require('express');
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
//</Libraries and Modules>
//<Global Variables>
//<Middle-Ware>
//</Midle-ware>
var staticFiles = {
    css:{path:'/css/',type:'text/css'},
    img:{path:'/img/',type:'image'},
    j  :{path:'/js/',type:'text/javascript'}
}
const SESS ={
    ID:'sid',
    SECRET:'<______Secret _____>'

}

//</Global Variables>
//<Middel-Ware>
  //<Handelbars>
    app.set('views',path.join(__dirname ,'static' ,'views'));
    app.engine('handlebars',ehb({defaultLayout:'main'}));
    app.set('view engine','handlebars');
  //</Handlebars>
app.use('/assets',express.static('assets'))
app.use(helmet())
//Content Security
app.use(function (req, res, next) {
    res.setHeader(
        'Content-Security-Policy',
      ""
    );
    res.setHeader(
        'Content-Security-Policy-Report-Only',
      "default-src 'self'; font-src 'self' *.googleapis.com *.gstatic.com *.w3schools.com; img-src *.ytimg.com *.w3.org *.w3schools.com 'self' ; script-src 'self' 'unsafe-inline'; style-src 'self'  'unsafe-inline' *.w3schools.com *.googleapis.com *.gstatic.com; frame-src 'self' https://www.youtube.com https://youtube.com https://www.google.com; script-src-elem *.tawk.to 'self' 'unsafe-inline' ; connect-src *.tawk.to wss://*.tawk.to 'self' "
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
        console.log(req.session.UserId)
        if(req.session.UserId)
        {
            Users.find({id:req.session.UserId.toString()},(err,result)=>
            {
                if(!err&&result.length!=0)
                    res();
                else
                    rej();
            })
        }
        else
            rej();
    })
}

//<Home , Login , Signup>
//<Artists>
app.get('/artists',perm.LoggedCheck,perm.PayCheck,perm.RenewCheck,(req,res)=>
{
    var Logged = false
    UserLogged(req)
    .then(()=>
    {
        Logged=true;
        render();
    })
    .catch(()=>
    {
        Logged=false;
        render();
    })
   // console.log("Logged ; "+Logged);
    var c= req.query.c;
    var p= req.query.p;
    var date = new Date();
    //console.log(req.query)
    function render()
    {
        var options = 
        {
            IsPayed:true,
            IsRenewed:true,
            active:true,
            expDate:
            {
                $gte:date
            }
        };
        (c!=null&&c!=''&&p!=undefined)? options.categ=c.toLowerCase():null/*console.log("No Category Mentioned in request")*/;
        (p!=null&&p!=''&&p!=undefined)? options.city=p.toLowerCase():null/*console.log("No City Mentioned in request")*/;
        //console.log(options)
        Users.find(options).select(['name','categ','profilePhoto','list_id','city']).lean().exec().then((docs)=>
        {
            var renderArray = docs.map((i,index,array)=>{
                i.link = `${gv.INSTA_MOJO_REDIRECT_URL}/artist/${i.list_id}`
                return i;
            })
            //console.log(renderArray)
            res.render('category',{title:'Artists',item:renderArray,artists:'active',notLog:Logged});
        })
    }
    
    
});

app.get('/artist/:list_id',perm.LoggedCheck,perm.PayCheck,perm.RenewCheck,(req,res)=>{
    var Logged = false
    UserLogged(req)
    .then(()=>
    {
        Logged=true
        render();
    })
    .catch(()=>
    {
        Logged=false
        render();
    })
    //console.log("Logged ; "+Logged);
   // console.log(req.params.list_id)
   function render()
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
        ['list_id','height','weight','bloodgrp','name','exp','utubelink','profilePhoto','otherPhoto','video','techqualification','qualification','city','sex','categ','age','dob','zip','active','IsRenewed','IsPayed'])
            .then((docs)=>{
                //console.log(docs)
                if(docs)
                {
                    if(docs[0].IsPayed==true&&docs[0].IsRenewed==true&&docs[0].active==true)
                    {
                        docs[0].title = docs[0].name;
                        docs[0].artists = 'active';
                        docs[0].notLog=Logged;
                        docs[0].otherPhoto.push(docs[0].profilePhoto)
                    /* docs[0].city = capitalize(docs[0].city)
                        docs[0].categ = capitalize(docs[0].categ)*/
                        res.render('details',docs[0]);
                    }
                    else
                    {
                        errhandle.reportErr(req,res,'404')
                    }
                }
                else
                {
                    //errhandle.reportErr(req,res,'404')
                    console.log(docs[0].expDate)
                }
            })
            .catch((err)=>
            {
                console.log(err);
                errhandle.reportErr(req,res,'404')
            })
   }
    
})
//</Artists>
app.get(['/','/home*'],(req,res)=>
{
    var Logged = true;
    UserLogged(req)
    .then(()=>
    {
        Logged=true;
        render(true)
    })
    .catch(()=>
    {
        Logged=false
        render(true)
    })
   //console.log("Logged ; "+Logged);
   function render(r)
   {
       if(r)
       {
        res.status(200);
        res.render('home',{title:'Cinema Thalam Creations',home:'active',notLog:Logged});
       }
   }
    

})
app.get('/contact',(req,res)=>{
    var Logged = false
    UserLogged(req)
    .then(()=>
    {
        Logged=true;
        render();
    })
    .catch(()=>
    {
        Logged=false
        render();
    })
    function render()
    {
        res.render('contactus',{title:'Countact Us - Cinema Thalam Creations',contact:'active',notLog:Logged});
    }
})
app.get('/renew',perm.PayCheck,perm.LoggedCheck,perm.RenewCheck,(req,res)=>
{
    var Logged = false;
    UserLogged(req)
    .then(()=>
    {
        Logged=true;
        render();
    })
    .catch(()=>
    {
        Logged=false
        render();
    })
    function render(){
        Users.find({id:req.session.UserId})
        .then((docs)=>
        {
            var nowDate = docs[0].expDate;
            var dt = nowDate.getDate()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getFullYear(); 
            res.render('paid',{Exp:dt,title:"Renewal",renew:'active',notLog:Logged})
        })
        .catch(err=>
        {
            console.log(err);
        })
    }
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
    var Logged = false
    UserLogged(req)
    .then(()=>
    {
        Logged=true;
        render();
    })
    .catch(()=>
    {
        Logged=false
        render();
    })
    function render()
    {
        res.render('about',{title:'About - Cinema Thalam Creations',about:'active',notLog:Logged});
    }
    
})
app.get('/whyctc',(req,res)=>{
    var Logged = false
    UserLogged(req)
    .then(()=>
    {
        Logged=true;
        render();
    })
    .catch(()=>
    {
        Logged=false
        render();
    })
    function render()
    {
        res.render('whyctc',{title:'Why Cinema Thalam Creations',whyctc:'active',notLog:Logged});
    }
    
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

//<Static File Access>
app.get('/st/f/:ext/:file',(req,res)=>
{
    var p = "some";
    res.status(200);
    try
    {
        if(staticFiles[req.params.ext].type == 'image')
        {
            var ctype = path.extname(req.params.file).split('.')[1];
            //console.log(ctype)
            res.set('Content-Type',staticFiles[req.params.ext].type+'/'+ctype);
        }
        else
             res.set('Content-Type',staticFiles[req.params.ext].type);
        p = path.join(__dirname,'static',staticFiles[req.params.ext].path,req.params.file);
        res.sendFile(p.toString(),(err)=>
        {
            if(err)
            {
                errhandle.reportErr(req,res,404);
                console.log(err)
            }
        });
        
        
    }
    catch(err)
    {
        console.log("Error")
        console.log(err);
        errhandle.reportErr(res,res,404);
    }
    
});
/*app.post('/u/up',upload.fields([{
    name: 'profile', maxCount: 1
  }, 
  {
    name: 'otherph', maxCount: 1
  }]),(req,res)=>{
      console.log(req.files)
      res.send("Success");
  });*/
//</Static File Access/>
 //<Special Routes>
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
