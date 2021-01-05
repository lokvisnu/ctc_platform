var Payment = {}
const gv = require('./globalVariables')
var request = require('request');
const { Promise } = require('mongoose');
var headers ={
    'X-Api-Key': gv.INSTA_MOJO_API_KEY, 
    'X-Auth-Token': gv.INSTA_MOJO_AUTH_KEY
}

Payment.createPayment = (data)=>
{
    return new Promise((resolve,reject)=>
    {
        //console.log(data); //playload
        var uri = gv.INSTA_MOJO_URL;
        //console.log(uri);
        request.post
        (
            uri,
            {form:data,headers:headers},
            function(error,response,body){
                //console.log(response.body);
                if(!error&&response.statusCode == 201)
                {
                    let dataI = response.body;
                    //console.log("Payment Request "+dataI.payment_request)
                    resolve(dataI);
                }
                else
                {
                    console.log(error)
                    reject(error);
                }
        })
    })
        

}
module.exports = Payment;