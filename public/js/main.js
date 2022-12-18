$(document).ready(function(){
    $(".text").textillate({
        loop:true, //enable looping
        in:{
            effect:"fadeInDownBig", //set the effect name
            delayScale:3, //set the delay to each consecutive character
            delay:20, //set the delay detween each character
            //shuffle:true
        },
        out:{
            effect:"bounceOut",
            delayScale:2,
            delay:20,
            reverse:true
        }
    });
})

const codes=document.querySelectorAll('.code');

codes[0].focus();

codes.forEach((code,idx)=>{
    code.addEventListener('keydown',(e)=>{
        if(e.key >=0 && e.key<=9){
            codes[idx].value=""
            setTimeout(()=>codes[idx+1].focus(),10)
        }else if(e.key === 'Backspace'){
            setTimeout(()=>codes[idx-1].focus(),10)
        }
    })
})



