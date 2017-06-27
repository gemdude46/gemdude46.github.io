{
    var w3plus = document.createElement('SCRIPT');
    w3plus.setAttribute('src', '//gemdude46.github.io/libs/+.js');
    w3plus.setAttribute('type', 'text/javascript');
    w3plus.addEventListener('load',function(){
        ImportJS('//gemdude46.github.io/libs/html+.js');
        ImportCSS('//gemdude46.github.io/libs/+.css');
    });
    document.head.appendChild(w3plus);
}
