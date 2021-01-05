document.querySelector('#search_btn').addEventListener('click',(e)=>{
    e.preventDefault();
    var q = document.querySelector('#search').value;
    if(q!=''){
        q.trim();
        window.location.href=`/Admin/p/s/${q}`;
    }
})
document.querySelector('#logout').addEventListener('click',(e)=>{
    window.location.href=`/Admin/ctc/lo/logout`;
})