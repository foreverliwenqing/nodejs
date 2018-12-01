var remake = document.querySelector('.remake');
var remakea = document.querySelector('.a');
var xiugais = document.querySelectorAll('.xiugai');

console.log(remakea);
for(var i = 0; i < xiugais.length; i++){
    xiugais.index = i;

    xiugais[i].onclick = function(){
        var index = this.index;
        remake.style.display = 'block';
    }
    remakea.onclick = function(){
        console.log('取消');
        remake.style.display = 'none';
    }
}
