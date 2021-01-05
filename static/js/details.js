console.log("working")
document.querySelector('#copy').addEventListener('click',()=>{
    var copyText = document.querySelector('#Ref');
    copyText.select();
    copyText.setSelectionRange(0,999999)
    document.execCommand("copy");
})