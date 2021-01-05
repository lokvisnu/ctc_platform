document.getElementsByTagName
Array.from(document.getElementsByTagName('input')).forEach((i,index,a)=>{
    i.addEventListener('change',clearErr);
})
var a = document.querySelector('#aadhar');
document.querySelector('#aadhar').addEventListener('change',()=>
{
    if (a.value.length > a.maxLength) 
        a.value = a.value.slice(0, a.maxLength);
})
var p = document.querySelector('#phno');
document.querySelector('#phno').addEventListener('change',()=>
{
    if (p.value.length > p.maxLength) 
        p.value = p.value.slice(0, p.maxLength);
})
    //document.querySelector('#pass').addEventListener('change',RpC);
    document.querySelector('#rePwd').addEventListener('change',RpC);;
    function RpC()
    {
        console.log("RpC")
        var pass= document.querySelector('#pass').value.trim();
        var rpass = document.querySelector('#rePwd').value.trim();
        if(pass!=rpass)
        {
            document.querySelector('#err').innerHTML = 'Password And Confirm Password Don\'t Match'
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }
    }
    var otherph = Array.from(document.getElementsByClassName('otherPhoto'));
    console.log(otherph)
    var allowedExtensions =  /(\.jpg|\.jpeg|\.png)$/i; 
    otherph.forEach((i,index,a)=>
    {
        
        i.addEventListener('change',()=>
        {
            console.log(i)
            if(i.value&&!allowedExtensions.exec(i.value)){
               // e.preventDefault();
                i.value ='';
                document.querySelector('#err').innerHTML = 'Please Select The Other Photo Properly'
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
            }
        })
       
    })  
///Submit Validation
document.querySelector('#submit').addEventListener('click',(e)=>
{
    var allowedExtensions =  
                    /(\.jpg|\.jpeg|\.png)$/i; 
    var prof = document.querySelector('#profilePhoto').value; 
    if(prof&&!allowedExtensions.exec(prof)){
        e.preventDefault();
        document.querySelector('#profilePhoto').value ='';
        document.querySelector('#err').innerHTML = 'Please Select The Profile Photo Properly'
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
    let otherph = Array.from(document.getElementsByClassName('otherPhoto'));
     otherph.forEach((i,index,a)=>
     {
        if(i.value&&!allowedExtensions.exec(i.value)){
            e.preventDefault();
            i.value ='';
            document.querySelector('#err').innerHTML = 'Please Select The Other Photo Properly'
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }
     })
     var allowedExtensionVideo =  
                    /(\.m4v|\.avi|\.mpg|\.mp4)$/i; 
    var video = document.querySelector('#video').value; 
    if(video&&!allowedExtensionVideo.exec(video)){
        e.preventDefault();
        document.querySelector('#video').value ='';
        document.querySelector('#err').innerHTML = 'Please Select The Video Properly'
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
    var pass= document.querySelector('#pass').value.trim();
    var rpass = document.querySelector('#rePwd').value.trim();
    document.document.querySelector('#pass').value = pass;
    if(pass!=rpass)
    {
        e.preventDefault();
        document.querySelector('#err').innerHTML = 'Password And Confirm Password Don\'t Match'
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

})
///Submit Validation

//Error
function clearErr()
{
    console.log('Clear Error')
    document.querySelector('#err').innerHTML = ''
}
//Error