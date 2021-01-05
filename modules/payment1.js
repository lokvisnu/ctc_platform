var Payment = {}
console.log("test1");
const Insta = require('instamojo-nodejs');
const gv = require('./globalVariables');
console.log(gv.INSTA_MOJO_API_KEY);
console.log(gv.INSTA_MOJO_AUTH_KEY);
Insta.setKeys(gv.INSTA_MOJO_API_KEY, gv.INSTA_MOJO_AUTH_KEY);
Payment.createPayment = (obj)=>
{
    console.log("test2");
    return new Promise((resolve,reject)=>{
        console.log("test3");
        Insta.createPayment(obj, function(error, response){
            console.log("test4");
            if (error) 
            {
                console.log("test5");
                reject(error);
            } 
            else
            {
                console.log("test6");
                resolve(response);
            }
        });
    });
    
}
module.exports = Payment;
