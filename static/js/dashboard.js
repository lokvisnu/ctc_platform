var fi = Array.from(document.getElementsByClassName('edit'));
var def = {};
fi.forEach((i)=>def[i.id] = i.value);
var s = document.querySelector('#save-changes')
var  d =document.querySelector('#row').classList[0];
s.disabled =true;
s.classList.add('inactive')
var ed = {};

fi.forEach(i=>{
    i.addEventListener('change',(e)=>{
        //console.log('Clicked')
        //s.enabled = 'enabled';
        console.log(i.id+" : "+i.value)
        if(def[i.id].toLowerCase()!=i.value.toLowerCase())
        {
            s.classList.remove('inactive_s');
            s.classList.add('active_s');
            s.disabled =false;
            ed[i.id] = i.value;
            def[i.id] = i.value.toLowerCase();
        }
            
        console.log(ed)
    })
})
s.addEventListener('click',(e)=>{
    e.preventDefault();
    if(ed)
    {
        ed.p = d;
        var xml = new XMLHttpRequest();
        xml.addEventListener('load',Res)
        xml.open('PUT','/dashboard');
        xml.setRequestHeader("Content-type", "application/json");
       // xml.setRequestHeader("X-D", d.toString());
        xml.send(JSON.stringify(ed));
    }
    

})
var response = {};
function Res()
{
    console.log(this.response)
    response = JSON.parse(this.response)
    if(response.success==false)
    {
        if(response.InvalidField == true)
            document.querySelector('#err').innerHTML = response.message;
        else
            document.querySelector('#err').innerHTML = "Update Falied! Please Try Again Later"
    }
    else if(response.success == true)
    {
        document.querySelector('#success').innerHTML = "Changes Done Successfully"
        location.reload();
    }
    console.log(this.response)
}
