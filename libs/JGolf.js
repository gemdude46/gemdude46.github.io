function AC(e){Array.from(arguments).forEach(function(x,i){if(i)e.appendChild(x)});return arguments.length==2?arguments[1]:NP()}
function B(){return document.body}
function BA(e){AC(B(),e);return e}
function CE(t,a,h){var e=document.createElement(t);Object.keys(a||{}).forEach(function(i){SA(e,i,a[i])});e.innerHTML=h||'';return e}
function CS(c){AC(GE('HEAD'),CE('STYLE',0,c))}
function EI(i){return document.getElementById(i)}
function ES(c){var o='';Array.from(c).forEach(function(x){o+=x=='>'?'&gt;':(x=='<'?'&lt;':(x=='&'?'&amp;':(x=='\n'?'<br>':x)))});return o}
function F(c){return eval('function'+c)}
function FD(){GE('HTML').style.width=GE('HTML').style.height=B().style.width=B().style.height='100%';GE('HTML').style.margin=B().style.margin=0;}
function GA(e,a){return e.getAttribute(a)}
function GE(e){return e[0]=='#'?EI(e.substr(1)):document.getElementsByTagName(e)[0]}
function GH(e){return (e||B()).offsetHeight}
function GW(e){return (e||B()).offsetWidth} 
function NP(){}
function OL(f){onload=f}
function PS(s,c){return CE('AUDIO',{src:s,type:'audio/'+{mp3:'mpeg',wav:'wav',ogg:'ogg'}[s.substr(s.length-3)],autoplay:'yes',onended:--c?'PS('+JSON.stringify(s)+','+c+')':''})}
function RM(){Array.from(arguments).forEach(function(i){i.parentNode.removeChild(i)})}
function SA(e,a,v){e.setAttribute(a,v);return v}
