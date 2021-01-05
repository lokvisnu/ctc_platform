const mongoose = require('mongoose');
const user_pay_id = mongoose.Schema({
    id:
    {
        type:String,
        required:true
    },
    pay_id:
    {
        type:String,
        required:true
    }
})
module.exports = mongoose.model('UserPayId',user_pay_id);