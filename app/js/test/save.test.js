const html_template1 = `<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Desmos</title>
    <link rel="icon" type="image/x-icon" href="./css/logo/desmos_icon.ico"/>
    <link rel="stylesheet" href="./css/desmos.css" />
    <link rel="stylesheet" href="./css/style.css" />
    <script src="./js/desmos.js"></script>
    <script src="./js/save_buttom.js" defer></script>
</head>
<body style="margin:0;margin-left: -3px;">
    <div id="calculator" style="width: 100vw; height: 100vh;margin-left: 3px;"></div>
    <script>
        var elt = document.getElementById('calculator');
        var calculator = Desmos.GraphingCalculator(elt, {
            keypad:true,                        //左下角的鍵盤
            graphpaper:true,                    //繪圖區
            expressions:true,                   //程式區
            settingsMenu:true,                  //右上角設定區
            zoomButtons:true,                   //右上角放大縮小按鈕
            expressionsTopbar:true,             //方程式區域最上方的設定

            fontSize:16,                        //字體大小，default: 16 
            border: false,                      //邊界
            action:true,                        //ticker, action(->)
            pasteGraphLink:true,                //貼上 desmos 連結後，會導入該連結 desmos
        });
        calculator.setState(`;

const html_template2 = ');</script></body></html>';

let setting_buttom = document.getElementsByClassName("dcg-settings-view-container")[0];
let hit_content = document.createElement('div');
let save_buttom = document.createElement('div');
let save_icon = document.createElement('i');
setting_buttom.append(hit_content);
hit_content.append(save_buttom);
save_buttom.appendChild(save_icon);
hit_content.classList.add("dcg-tooltip-hit-area-container");
hit_content.setAttribute("handleevent","true");
save_buttom.setAttribute("class","dcg-icon-btn dcg-do-blur dcg-btn-flat-gray dcg-settings-pillbox");
save_buttom.setAttribute("role","button");
save_buttom.setAttribute("aria-label","Save");
save_buttom.setAttribute("aria-expanded","false");
save_buttom.setAttribute("aria-haspopup","true");     
save_buttom.style.background = "#ededed";
save_icon.classList.add("dcg-icon-save");
save_buttom.addEventListener("click", function (event) {
    download_the_html_file();
});
document.addEventListener("keydown", function(e) {
    if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
        e.preventDefault();  
        download_the_html_file();
    }
}, false);
document.addEventListener("keydown", function(e) {
    if (e.ctrlKey  && e.keyCode == 83) {
        e.preventDefault();  
        download_the_html_file();
    };
}, false);

function download_the_html_file(){
    var state = JSON.stringify( calculator.getState());
    var html = html_template1+state+html_template2;
    let filename = "";
    var File_name = prompt('Download\n Enter the file name');
    if(File_name==""){
        console.log('File name is empty, using the date to be the file name.');
        let date = new Date(Date.now());
        dataValues = date.getFullYear()+"-"+String(date.getMonth() + 1)+"-"+date.getDate()+"-"+date.getHours()+"-"+date.getMinutes();
        File_name = dataValues;
    };
    if(File_name!=null){
        filename = `Desmos_${File_name}.html`;
        download(filename,html);
        tempAlert('Download',3000);
    };
}
function tempAlert(msg,duration){
    var delta_x = 100;
    const animation = [
        { transform: 'translate(400px)' },
        { transform: 'translate(0px)'},
        { transform: 'translate(0px)'},
        { transform: 'translate(0px)'},
        { transform: 'translate(400px)' }
    ];
    var el = document.createElement("div");
    el.setAttribute("class","message");
    el.innerHTML = msg;
    el.animate(animation, duration);
    setTimeout(function(){
        el.parentNode.removeChild(el);
    },duration);
    document.body.appendChild(el);
}
function download(f, t) {
    var e = document.createElement('a');
    e.setAttribute('href','data:text/plain;charset=utf-8,' + encodeURIComponent(t));
    e.setAttribute('download',f);
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
};

//-------------------------------------------------------------------------------------------
let input_hit_content = document.createElement('div');
let input_buttom = document.createElement('div');
let input_icon = document.createElement('i');
let input = document.createElement("input");
hit_content.append(input_hit_content);
input_hit_content.appendChild(input_buttom);
input_buttom.appendChild(input_icon);
input_hit_content.classList.add("dcg-tooltip-hit-area-container");
input_buttom.setAttribute("class","dcg-icon-btn dcg-do-blur dcg-btn-flat-gray dcg-settings-pillbox ");
input_buttom.setAttribute("style","padding:0px;");
input_buttom.style.background = "#ededed";
input.id = "input_html";
input.textContent="";
input.type = "file";
input.accept = ".html";
input.setAttribute("style","");
input_icon.classList.add("dcg-icon-input");

input_buttom.addEventListener('click',function(){
    input.click();                   
})

input.addEventListener('change', function(){
    if(input.value!=''){
        var name = input.files[0].name;
        var full_url = window.location.href;
        var full_url_last_index = full_url.lastIndexOf('/');
        var rest_url = full_url.slice(0,full_url_last_index);
        var rest_url_last_index = rest_url.lastIndexOf('/');
        var pre_name = rest_url.slice(rest_url_last_index+1);
        var desmos_url = rest_url.slice(0,rest_url_last_index);
        if(name=="desmos.html"|name=="science.html"|name=="equation.html"){
            name = "\\desmos_app\\" + name;
        }else{
            name = "\\save\\" + name;
        };
        console.log(pre_name);
        window.location.href = desmos_url + name;
    }
});


document.getElementsByClassName('dcg-expression-icon-container')[0].classList.add('dcg');


window.addEventListener('beforeunload', function (e) {
            e.preventDefault();
            e.returnValue = '';
        });


//
//var note_text_area = document.getElementsByClassName('dcg-smart-textarea');
//for(var i=0;i<note_text_area.length;i++){
//    note_text_area[i].classList.add('md-block');
//}
//













