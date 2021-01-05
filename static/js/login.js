var modal = document.getElementById('id01');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
document.querySelector('#email').addEventListener('change',cleraErr)
document.querySelector('#pass').addEventListener('change',cleraErr)
function cleraErr(){
    document.querySelector('#errText').innerHTML = '';
}
document.querySelector('#loginBtn').addEventListener('click',(e)=>
{
   
    var email = document.querySelector('#email').value.trim();
    var pass = document.querySelector("#pass").value.trim();
    if(email!=''&&pass!=''&&email!=null&&pass!=null)
    {
       /* var formData = {email:email.toString(),pass:pass.toString()}
        var xml = new XMLHttpRequest();
        xml.open("POST", "/u/in", true);
        xml.setRequestHeader("Content-Type", "application/json");
        xml.onreadystatechange = function() { 
            if (this.readyState === XMLHttpRequest.DONE && this.status === 404) {
                console.log(xml.responseText)
                document.querySelector('#errText').innerHTML = JSON.parse(xml.responseText).message;
            }
            else if(this.readyState === XMLHttpRequest.DONE && this.status === 200){
                window.location.href = '/artists'
            }
        }
        xml.send(JSON.stringify(formData))*/
  
}
else
{
    e.preventDefault();
    document.querySelector('#errText').innerHTML = 'Enter Email and Password';
}
});