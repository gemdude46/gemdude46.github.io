window.setPageTitle=function(t){
    var e = document.getElementsByTagName('TITLE');
    if(e.length) e[0].innerHTML=t;
    else document.head+='<title>'+t+'</title>';
};

window.encodeHTML=function(t,s){
    var h='', i=0, c;
    for(;i<t.length;i++){
        c=t[i];
        if (c==' '&&!s) h+='&nbsp;'
        else if(c=='&') h+='&amp;';
        else if(c=='>') h+='&gt;';
        else if(c=='<') h+='&lt;';
        else if(c=='\n')h+='<br />';
        else h+=c;
    }
    return h;
};

window.forEach=function(i,f){
    var j=0, o=[];
    for(;j<i.length;j++) o.push(f(i[j]));
    return o;
};

window.multipleReplace=function(t,p){
    var o='', i=0, j;
    for(;i<t.length;i++){
        f=j=0;
        for(;j<p.length;j++){
            if(t.substr(i,p[j][0].length)==p[j][0]){
                o+=p[j][1];
                f=1;
                break;
            }
        }
        if(!f) o+=t[i];
    }
    return o;
};

window.asyncGET=function(u,f){
    var x;
    if(window.XMLHttpRequest) x = new XMLHttpRequest();
    else x = new ActiveXObject("Microsoft.XMLHTTP");
    x.onreadystatechange=function(){
        if(x.readyState!=4) return;
        f(x.status,x.responseText);
    };
    x.open('GET',u,true);
    x.send(null);
    return x;
};

window.callHref=function(h){
    var a = document.createElement('A');
    a.href=h;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

try {
    localStorage.setItem('MBI LS TEST ```KEY```','MBI TEST ```VALUE```');
    window.localStorageSupported=localStorage.getItem('MBI LS TEST ```KEY```')=='MBI TEST ```VALUE```';
    localStorage.removeItem('MBI LS TEST ```KEY```');
} catch(e) {}

window.WANIP = 'unknown';

asyncGET('https://l2.io/ip',function(s,t){if(s==200)WANIP=t;});

