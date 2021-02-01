/*var barItems=Array.from(document.getElementsByClassName("citems")),options={};window.onload=()=>{var a=window.location.search;if(""!=a&&null!=a){var b=new URLSearchParams(a);options.c=b.get("c"),options.p=b.get("p"),(null==options.p||""==options.p)&&(options.p="All"),document.querySelector("#Districts").value=options.p}null==options.c||""==options.c?barItems.forEach(a=>{"All"==a.innerHTML&&a.classList.add("se")}):barItems.forEach(a=>{a.innerHTML==options.c.toString()&&a.classList.add("se")})};var mySidebar=document.getElementById("mySidebar"),overlayBg=document.getElementById("myOverlay");document.getElementsByClassName("w3-bar-item")[0].addEventListener("click",w3_open),document.getElementById("w3-right").addEventListener("click",w3_close);var barItems=Array.from(document.getElementsByClassName("citems"));barItems.forEach(a=>{a.addEventListener("click",()=>{options.c=a.innerHTML,redirect()})});var s=document.querySelector("#Districts");s.addEventListener("change",()=>{options.p=s.value,redirect()});function redirect(){null==options.c||options.c==null||""==options.c||"All"==options.c?options.c="":console.log("Noc "),null==options.p||options.p==null||""==options.p||"All"==options.p?options.p="":console.log("Nod"),window.location.href=`/artists?c=${options.c}&p=${options.p}`}function w3_open(){"block"===mySidebar.style.display?(mySidebar.style.display="none",overlayBg.style.display="none"):(mySidebar.style.display="block",overlayBg.style.display="block")}function w3_close(){mySidebar.style.display="none",overlayBg.style.display="none"}*/
var response = {};
var filter = {};
window.onload =()=>{
    var x = new XMLHttpRequest();
    x.addEventListener('load',load)
    x.open('GET','/arts')
    x.send();
}


function render()
{
   /* response.sort((a,b)=>{
       // console.log(a.visitors - b.visitors);
        return a.visitors - b.visitors
    });*/
    var filterArray = response;
    if(filter)
    {
        if(filter.categ&&filter.categ!='all'){
           filterArray = response.filter(user=>user.categ==filter.categ)
        }
        if(filter.city&&filter.city!='all'){
            filterArray = filterArray.filter(user=>user.city==filter.city)
         }
    }
   /* filterArray = filterArray.sort((a,b)=>{
       // console.log(a.visitors - b.visitors);
        return a.visitors - b.visitors
    });*/
    //console.log(filterArray)
    var template = '{{#if item}}{{#each item}}<div class="col-sm"><div class="card" style="width: 17rem;"><img class="card-img-top" src="{{profilePhoto}}" alt="Card image cap"><div class="card-body"><h6 class="card-title" style="text-transform:capitalize;">  {{name}}</h6><hr><h6 class="card-title"  style="text-transform:capitalize;">{{categ}}</h6><hr><h6 class="card-title"  style="text-transform:capitalize;">{{city}}</h6><hr><a href="/artist/{{list_id}}" class="btn btn-success">View Profile</a></div></div></div></div>{{/each}}{{else}}<h1 style="width:100%;text-align:center;padding:20px;color:white;background:red;">No Result Found!</h1>{{/if}}'
    var temp = Handlebars.compile(template);
    temp = temp({item:filterArray})
   // console.log(temp)
    document.querySelector('#row').innerHTML =temp;
}
function load ()
{
   // console.log(this.response)
    response = JSON.parse(this.response)
    render();
    
}
var catego = Array.from(document.getElementsByClassName('li'));
catego.forEach(element => {
    element.addEventListener('click',(e)=>{
        var a = element;
        console.log(a.innerHTML)
        filter.categ = a.innerHTML.trim().toLowerCase();
        a.classList.add('active')
        console.log(filter);
        render();
    })
});
var dis = document.getElementById('Districts');
dis.addEventListener('change',()=>{
    filter.city = dis.value.toLowerCase();
    console.log(filter);
    render();
})