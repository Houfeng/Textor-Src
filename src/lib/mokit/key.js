/*csd*/(function(t){var w,b={},e={16:false,18:false,17:false,91:false},f="all",d={"⇧":16,shift:16,"⌥":18,alt:18,option:18,"⌃":17,ctrl:17,control:17,"⌘":91,command:91},c={backspace:8,tab:9,clear:12,enter:13,"return":13,esc:27,escape:27,space:32,left:37,up:38,right:39,down:40,del:46,"delete":46,home:36,end:35,pageup:33,pagedown:34,",":188,".":190,"/":191,"`":192,"-":189,"=":187,";":186,"'":222,"[":219,"]":221,"\\":220},j=function(k){return c[k]||k.toUpperCase().charCodeAt(0);},a=[];for(w=1;w<20;w++){c["f"+w]=111+w;}function u(k,F){var E=k.length;while(E--){if(k[E]===F){return E;}}return -1;}function l(k,E){if(k.length!=E.length){return false;}for(var F=0;F<k.length;F++){if(k[F]!==E[F]){return false;}}return true;}var x={16:"shiftKey",18:"altKey",17:"ctrlKey",91:"metaKey"};function D(k){for(w in e){e[w]=k[x[w]];}}function n(E){var I,F,H,G,J,K;I=E.keyCode;if(u(a,I)==-1){a.push(I);}if(I==93||I==224){I=91;}if(I in e){e[I]=true;for(H in d){if(d[H]==I){h[H]=true;}}return;}D(E);if(!h.filter.call(this,E)){return;}if(!(I in b)){return;}K=s();for(G=0;G<b[I].length;G++){F=b[I][G];if(F.scope==K||F.scope=="all"){J=F.mods.length>0;for(H in e){if((!e[H]&&u(F.mods,+H)>-1)||(e[H]&&u(F.mods,+H)==-1)){J=false;}}if((F.mods.length==0&&!e[16]&&!e[18]&&!e[17]&&!e[91])||J){if(F.method(E,F)===false){if(E.preventDefault){E.preventDefault();}else{E.returnValue=false;}if(E.stopPropagation){E.stopPropagation();}if(E.cancelBubble){E.cancelBubble=true;}}}}}}function i(E){var H=E.keyCode,G,F=u(a,H);if(F>=0){a.splice(F,1);}if(H==93||H==224){H=91;}if(H in e){e[H]=false;for(G in d){if(d[G]==H){h[G]=false;}}}}function A(){for(w in e){e[w]=false;}for(w in d){h[w]=false;}}function h(E,I,G){var F,H;F=p(E);if(G===undefined){G=I;I="all";}for(var k=0;k<F.length;k++){H=[];E=F[k].split("+");if(E.length>1){H=q(E);E=[E[E.length-1]];}E=E[0];E=j(E);if(!(E in b)){b[E]=[];}b[E].push({shortcut:F[k],scope:I,method:G,key:F[k],mods:H});}}function C(F,K){var I,G,H=[],k,E,J;I=p(F);for(E=0;E<I.length;E++){G=I[E].split("+");if(G.length>1){H=q(G);F=G[G.length-1];}F=j(F);if(K===undefined){K=s();}if(!b[F]){return;}for(k in b[F]){J=b[F][k];if(J.scope===K&&l(J.mods,H)){b[F][k]={};}}}}function v(k){if(typeof(k)=="string"){k=j(k);}return u(a,k)!=-1;}function r(){return a.slice(0);}function o(k){var E=(k.target||k.srcElement).tagName;return !(E=="INPUT"||E=="SELECT"||E=="TEXTAREA");}for(w in d){h[w]=false;}function B(k){f=k||"all";}function s(){return f||"all";}function m(G){var F,k,E;for(F in b){k=b[F];for(E=0;E<k.length;){if(k[E].scope===G){k.splice(E,1);}else{E++;}}}}function p(k){var E;k=k.replace(/\s/g,"");E=k.split(",");if((E[E.length-1])==""){E[E.length-2]+=",";}return E;}function q(k){var F=k.slice(0,k.length-1);for(var E=0;E<F.length;E++){F[E]=d[F[E]];}return F;}function g(F,k,E){if(F.addEventListener){F.addEventListener(k,E,false);}else{if(F.attachEvent){F.attachEvent("on"+k,function(){E(window.event);});}}}g(document,"keydown",function(k){n(k);});g(document,"keyup",i);g(window,"focus",A);var z=t.key;function y(){var E=t.key;t.key=z;return E;}t.key=h;t.key.setScope=B;t.key.getScope=s;t.key.deleteScope=m;t.key.filter=o;t.key.isPressed=v;t.key.getPressedKeyCodes=r;t.key.noConflict=y;t.key.unbind=C;if(typeof module!=="undefined"){module.exports=key;}if(typeof define==="function"&&define.amd){define("key",[],function(){return key;});}})(this);