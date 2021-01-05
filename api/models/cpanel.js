const mongoose = require('mongoose');
const Cpanel = mongoose.Schema({
free:{
    type:Number,
    default:0,
}
,
session:[String]
})
var CpanelModel = mongoose.model('Cpanel',Cpanel);
module.exports = CpanelModel;