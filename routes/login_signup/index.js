const router = require('express').Router();
//const insta = require('instamojo-nodejs')
const path = require('path')
const errHandle = require('../../modules/serverErrorHandling')
const shortid = require('shortid');
const { ConnectionBase } = require('mongoose');
const ErrHandle = require('../../modules/serverErrorHandling');
const perm = require('../../modules/permissions')
const log = require(path.join(__dirname,'../../modules','logUser.js'))
const gv = require(path.join(__dirname,'../../modules','globalVariables.js'));
const fs = require('fs');
const mime = require('mime-types');
//insta.setKeys(gv.INSTA_MOJO_API_KEY,gv.INSTA_MOJO_AUTH_KEY);
//insta.isSandboxMode(!gv.IsProd);

//<Multer>
var multer = require('multer');
var storageImg = multer.diskStorage({


    destination: function(req, file, callback) {
        callback(null, path.join(__dirname+'/../../static/img/users'));
      },
      filename: function(req, file, callback) {
          callback(null,'IMG-'+shortid.generate().toString() + '_' + Date.now() + path.extname(file.originalname));
    
      }
    });
    var storageVideo = multer.diskStorage({


      destination: function(req, file, callback) 
      {
        if(file.mimetype.startsWith('video/'))
          callback(null, path.join(__dirname+'/../../static/vd'));
        else if(file.mimetype.startsWith('image/'))
          callback(null, path.join(__dirname+'/../../static/img/users'));
        else
        console.log("no File Type Form: " + file.mimetype)

        },
        filename: function(req, file, callback) 
        {
          if(file.mimetype.startsWith('video/'))
            callback(null,   'VIDEO-'+shortid.generate().toString() +'_'+ Date.now() + path.extname(file.originalname));
          else if(file.mimetype.startsWith('image/'))
            callback(null,'IMG-'+shortid.generate().toString() + '_' + Date.now() + path.extname(file.originalname)); 
          else
            console.log("no File Type Form: " + file.mimetype)     
        }
      });
    const uploadImg = multer({ storage: storageImg });
    const uplaodVideo = multer({storage:storageVideo})
    //</Multer>
router.post('/in',perm.LoginCheckPost,log.LoginUser);
router.post('/up',perm.LoginCheckPost,perm.SignupValidate,
uplaodVideo.fields([
  {name: 'profilePhoto', maxCount: 1},
  {name: 'otherPhoto', maxCount: 4},
  {name:'video',maxCount:1}
]),log.SignupUser);
router.all('/p',(req,res)=>
{
    log.Validate_Update_Payment(req.query,req,res);
})
router.get('/img/:img',perm.LoggedCheck,(req,res)=>{
  var p = "some";
  res.status(200);
  try
  {
      p =path.join(__dirname+'/../../static/img/users/',req.params.img)
      var ctype = path.extname(req.params.img).split('.')[1];
      res.set('Content-Type','image/'+ctype);
      res.sendFile(p.toString(),(err)=>{
          if(err)
          {
              ErrHandle.reportErr(req,res,404);
              console.log(err)
          }
      });
  }
  catch(err){
      console.log("Error")
      console.log(err);
      errhandle.reportErr(req,res,404);
  }
})
router.get('/vd/:vd',perm.LoggedCheck,(req,res)=>{
  var p = "some";
  try
  {
      //console.log(req.params.vd)
      p = path.join(__dirname,'/../../static/vd/',req.params.vd.toString());
      if(fs.existsSync(p))
      {
        fs.stat(p, (err, stat) => 
        {

          // Handle file not found
          if (err !=null ||stat==undefined||stat==null||stat.size==undefined) 
          {
              console.log("Error")
              res.status(404).send('ERROR');
          }
          else
          {
            //console.log(stat)
            const fileSize = stat.size
            const range = req.headers.range
        
            if (range) {
        
                const parts = range.replace(/bytes=/, "").split("-");
        
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
                
                const chunksize = (end-start)+1;
                const file = fs.createReadStream(p, {start, end});
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'video/mp4',
                }
                
                res.writeHead(206, head);
                file.pipe(res);
            } 
            else 
            {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': 'video/mp4',
                }
        
                res.writeHead(200, head);
                fs.createReadStream(p).pipe(res);
            }
          }
          
      });
    }
    else{
      console.log("Error")
      res.status(404).send('ERROR');
    }
  }
  catch(err){
      console.log("Error")
      console.log(err);
      res.status(404).send('ERROR');
  }
})
module.exports = router;