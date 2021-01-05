// Get the Sidebar
//console.log('Working: '+window.location.href)
var barItems = Array.from(document.getElementsByClassName('citems'));
var options = {};
window.onload = ()=>{
  var q = window.location.search;
  //console.log("Search: " + q);
  if(q!=''&&q!=null)
  {
    var sP = new URLSearchParams(q); 
    options.c = sP.get('c');
    options.p = sP.get('p')
    if(options.p==null||options.p=='')
      options.p = 'All'
      //(options.p==nul||options.p=='')?options.p = 'All':console.log(options.p);
    document.querySelector('#Districts').value =options.p;
  }
  if(options.c==null||options.c==''){
    barItems.forEach((i,index,array)=>{
      if(i.innerHTML=='All')
        i.classList.add('se')
    })
  }
  else{
    barItems.forEach((i,index,array)=>{
      if(i.innerHTML==options.c.toString())
        i.classList.add('se')
    })
  }
}
var mySidebar = document.getElementById("mySidebar");
// Get the DIV with overlay effect
var overlayBg = document.getElementById("myOverlay");
document.getElementsByClassName('w3-bar-item')[0].addEventListener('click',w3_open);
document.getElementById('w3-right').addEventListener('click',w3_close);
var barItems = Array.from(document.getElementsByClassName('citems'));
barItems.forEach((i)=>{
  i.addEventListener('click',(e)=>{
    options.c= i.innerHTML;
    redirect();
  })
})
var s = document.querySelector('#Districts');
s.addEventListener('change',(e)=>{
  options.p=  s.value;
  redirect();
})
function redirect(){
  (options.c==null||options.c==undefined||options.c==''||options.c=='All')?options.c='':console.log('Noc ');
  (options.p==null||options.p==undefined||options.p==''||options.p=='All')?options.p='':console.log('Nod');
  window.location.href = `/artists?c=${options.c}&p=${options.p}`
}
// Toggle between showing and hiding the sidebar, and add overlay effect
function w3_open() {
  if (mySidebar.style.display === 'block') {
    mySidebar.style.display = 'none';
    overlayBg.style.display = "none";
  } else {
    mySidebar.style.display = 'block';
    overlayBg.style.display = "block";
  }
}

// Close the sidebar with the close button
function w3_close() {
  mySidebar.style.display = "none";
  overlayBg.style.display = "none";
}
 