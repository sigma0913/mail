console.clear();
let times = [];
let whose = [];
let notes = [];
let aftimes;
let afwhose;
let afnotes;
let loadmsgelem;
let loadmsgboxelem;
let user = "";

if (document.cookie != "") {
        user = document.cookie.substr(16);
        if (user == "") {
                document.getElementById("loginwho").innerText = "未ログイン";
        } else {
                document.getElementById("loginwho").innerText = "ログイン中：" + user;
                document.cookie = 'usernamelogined=' + user + "; max-age=31536000";
        }
}

const blankletter = [" ","　"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","　","	"," ","ᅟ","ᅠ",""]
const aletter = ["а","ａ","ɑ"];
const largealetter = ["A","Α","А","Α","Ａ","Ꭺ","𖽀","ᗅ","ꓮ"]
const gletter = ["ｇ","ɡ","ց","G","Ԍ","Ｇ","Ꮐ","ꓖ"];
const iletter = ["ｉ","і","ⅰ","¡","Ꭵ","וֹ","I","Ι","Ι","𐢉","Ӏ","Ⅰ","Ｉ","І","ӏ","⏽","ߊ","꣎","l","|"];
const mletter = ["ⅿ","ｍ","Μ","M","М","Ꮇ","Μ","Ｍ","𝖬","ꓟ","ꤵ"];
const nletter = ["ｎ","ᥒ","𝘯","𝑛","𝗇","𝗻","𝙣","𝒏","𝐧","ո","𝚗"];
const sletter = ["ѕ","ｓ","𐑈","ꮪ","ꜱ","᥉","S","Ѕ","Ჽ","𐍃","ꓢ","Ｓ","Ꮪ","Տ","ჽ","𖼺","Ꚃ","𖫖"];
const tletter = ["ｔ","ʈ","𝘵","𝒕","𝗍","𝐭","𖼹"];
const largetletter = ["Т","Τ","Ｔ","𐊗","𐊱","𐤯","Ꭲ","𖼊","𑢼","ߠ","ꓔ","𑫝","𐨝","𐝇","𖩋","𐍄"];


const username = ["sigma","Tanatana792","Usuharu1189","AKT","生牡蠣","misan","jingyu","花より団子","Ojo0901"];
const userpass = ["sigma/17291268","Tanatana792/206","Usuharu1189/1016","AKT/299792458","生牡蠣/1026","misan/2042","jingyu/5173","花より団子/107929","Ojo0901/pocha"];
const noslashusername = ["AKT","生牡蠣","sigma","Tanatana792","Usuharu1189","misan","jingyu","花より団子","Ojo0901"]
const noslashuserpass = ["299792458","1026","17291268","206","1016","2042","5173","107929","pocha"]

let bodytag = document.getElementById("body");

const url = "https://script.google.com/macros/s/AKfycbzHbN0L9p7ztIhpYcKWPH8DD06M6av100NThbGbIC5WOBMf4rHE28rqmMphUXkO3KLLiA/exec"
const config = {
//     method: "GET",
//     mode: "no-cors",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
};

let msgbefore;
let reloadok = false;
let showstatus;
let noccbcc;
let ncount;

const stampstock = ["good","balloon","oyster_shell","html","css","javascript","tenkaicon","tenkalogo","BlueArchiveLogo_pass_izu792"];

function loaddata() {

        fetch(url)
        .then(response => {
                if (!response.ok){
                        throw new error("Could NOT load data");
                }
                return response.json();
        })
        .then(data => {        
                
                times = [];
                whose = [];
                notes = [];

                data.forEach(entry => {
        
                        const x = entry.time;
                        const y = entry.who;
                        const z = entry.note;
                        
                        if (y !== "" || z !== ""){

                                times.push(x);
                                let yend = ""
                                let yarr = String(y).split("");
                                for (let yloop = 0; yloop < yarr.length; yloop++) {
                                        yend = String(yend) + String(aletter.indexOf(yarr[yloop]) < 0 ? "" : "a"); 
                                        yend = String(yend) + String(largealetter.indexOf(yarr[yloop]) < 0 ? "" : "A"); 
                                        yend = String(yend) + String(gletter.indexOf(yarr[yloop]) < 0 ? "" : "g"); 
                                        yend = String(yend) + String(iletter.indexOf(yarr[yloop]) < 0 ? "" : "i");
                                        yend = String(yend) + String(mletter.indexOf(yarr[yloop]) < 0 ? "" : "m");
                                        yend = String(yend) + String(nletter.indexOf(yarr[yloop]) < 0 ? "" : "n");
                                        yend = String(yend) + String(sletter.indexOf(yarr[yloop]) < 0 ? "" : "s");
                                        yend = String(yend) + String(tletter.indexOf(yarr[yloop]) < 0 ? "" : "t");
                                        yend = String(yend) + String(largetletter.indexOf(yarr[yloop]) < 0 ? "" : "T");
                                        if (String(yend.length) == String(yloop)) {
                                                if (blankletter.indexOf(yarr[yloop]) < 0) {
                                                        yend = String(yend) + yarr[yloop];
                                                }
                                        }
                                }
                                whose.push(String(yend));
                                notes.push(z);

                        }

                });

                const table = document.getElementById("msgtable");

                let parenttrelem;
                let childtdelem;
                let textelem;
                let childtdid;
                let parenttr;

                for (let i = 0; i < times.length; i++) {

                        parenttrelem = document.createElement("tr");
                        parenttrelem.setAttribute("id","col" + String(i));
                        
                        ncount = 0;
                        showstatus = 0;  //0 hidden 1 stamps 2 show　3 posted
                        noccbcc = 0;

                        for (let j = 0; j < 3; j++) {

                                childtdelem = document.createElement("td");

                                if (j == 0){
                                        textelem = document.createTextNode(times[i]);
                                        childtdid = "tdtime";
                                        childtdelem.appendChild(textelem);
                                } else if (j == 1) {
                                        if (noslashuserpass.indexOf(String(whose[i])) > -1) {
                                                textelem = document.createTextNode(noslashusername[noslashuserpass.indexOf(String(whose[i]))]);
                                                if (user == noslashusername[noslashuserpass.indexOf(String(whose[i]))]) {
                                                        showstatus = 3;
                                                }
                                                childtdelem.setAttribute("style","color: #44c;");
                                        } else if (username.indexOf(whose[i].split(/\//)[0]) > -1) {
                                                if (userpass[username.indexOf(whose[i].split(/\//)[0])] == whose[i]) {
                                                        textelem = document.createTextNode(username[username.indexOf(whose[i].split(/\//)[0])]);
                                                        if (user == username[username.indexOf(whose[i].split(/\//)[0])]) {
                                                                showstatus = 3;
                                                        }
                                                        childtdelem.setAttribute("style","color: #44c;");
                                                } else {
                                                        textelem = document.createTextNode(username[username.indexOf(whose[i].split(/\//)[0])] + "の偽物");
                                                        childtdelem.setAttribute("style","color: red;");
                                                };
                                        } else if (!isNaN(whose[i])) {
                                                textelem = document.createTextNode(String(whose[i]).substring(0,1) + "***********");
                                        } else {
                                                textelem = document.createTextNode(String(whose[i]).substring(0,12));
                                        };
                                        childtdid = "tdwho";
                                        childtdelem.appendChild(textelem);
                                } else if (j == 2){
                                        let mode;
                                        childtdid = "tdnote";
                                        if (String(notes[i]).substring(0,7) == "/stamp/") {
                                                let stamp = notes[i].slice(7);
                                                if (stampstock.indexOf(stamp) >= 0) {
                                                        textelem = document.createElement("img");
                                                        textelem.setAttribute("src","./assets/stamps/" + stamp + ".png");
                                                } else {
                                                        textelem = document.createTextNode("スタンプの読み込みに失敗");
                                                };
                                                childtdelem.appendChild(textelem);
                                                showstatus = 1;
                                        } else {
                                                String(notes[i]).split(/\n/).forEach(line => {
                                                        mode = "none";
                                                        if (ncount < 2) {
                                                                if (line.substr(0,2) == "CC" || line.substr(0,2) == "Cc" || line.substr(0,2) == "cc") {
                                                                        mode = "cc";
                                                                        // if (line.substr(3) == user && user != "" && showstatus != 3) {   
                                                                        //         showstatus = 2;
                                                                        // };
                                                                } else if ((line.substr(0,3) == "BCC" || line.substr(0,3) == "Bcc" || line.substr(0,3) == "bcc") && line.substr(3,1) == " ") {
                                                                        mode = "bcc";
                                                                        // if (line.substr(4) == user && user != "" && showstatus != 3) {
                                                                        //         showstatus = 2;
                                                                        // };
                                                                        // if (showstatus != 3) {
                                                                        //         line = "";
                                                                        // }
                                                                } else {
                                                                        noccbcc++;
                                                                };
                                                        };
                                                        String(line).split(/ /).forEach(space => {

                                                                if (mode == "cc") {
                                                                        if (space == user && user != "" && showstatus != 3) {   
                                                                                showstatus = 2;
                                                                        };
                                                                } else if (mode == "bcc") {
                                                                        if (space == user && user != "" && showstatus != 3) {
                                                                                showstatus = 2;
                                                                        };
                                                                }

                                                                let atagbefore;
                                                                let atag = "";

                                                                if (Number(String(space).search(/http:\/\//)) >= 0) {
                                                                        atagbefore = document.createTextNode(String(space).slice(0,String(space).search(/http:\/\//)));
                                                                        atag = document.createElement("a");
                                                                        atag.setAttribute("href",String(space.slice(String(space).search(/http:\/\//),space.length)));
                                                                        atag.setAttribute("style","word-break: break-all");
                                                                        atag.appendChild(document.createTextNode(space.slice(String(space).search(/http:\/\//),space.length)));
                                                                        childtdelem.appendChild(atagbefore);
                                                                } else if (Number(String(space).search(/https:\/\//)) >= 0) {
                                                                        atagbefore = document.createTextNode(String(space).slice(0,String(space).search(/https:\/\//)));
                                                                        atag = document.createElement("a");
                                                                        atag.setAttribute("href",space.slice(String(space).search(/https:\/\//),space.length));
                                                                        atag.setAttribute("style","word-break: break-all");
                                                                        atag.appendChild(document.createTextNode(space.slice(String(space).search(/https:\/\//),space.length)));
                                                                        childtdelem.appendChild(atagbefore);
                                                                } else {
                                                                        atag = document.createTextNode(space + " ");
                                                                };
                                                                if (mode != "bcc" || showstatus == 3) {
                                                                        childtdelem.appendChild(atag);
                                                                }
                                                        });
                                                        if (mode != "bcc" || showstatus == 3) {
                                                                childtdelem.appendChild(document.createElement("br"));
                                                        }
                                                        ncount++;
                                                });
                                        };
                                };
                                childtdelem.setAttribute("class",childtdid);
                                if (showstatus == 3) {
                                        parenttrelem.setAttribute("class","bluemsg");
                                } else if (showstatus == 2) {
                                        parenttrelem.setAttribute("class","yellowmsg")
                                };
                                
                                table.appendChild(parenttrelem);

                                parenttr = document.getElementById("col" + String(i));
                                
                                parenttr.appendChild(childtdelem);
                        };
                        
                        if (showstatus == 0 && noccbcc != 2 && !(ncount == 1 && noccbcc == 1)) {
                                document.getElementById("col" + i).remove();
                        }
                };
                document.getElementById("refresh").setAttribute("tabindex","1");
                document.getElementById("refresh").setAttribute("class","greenbutton");
                document.getElementById("loadcheck").removeAttribute("disabled");
                reloadok = true;
                if (aftimes !== undefined) {
                        loadmsgboxelem.setAttribute("class","loadmsgboxblue msgbox");
                        loadmsgelem.appendChild(document.createTextNode("新しいメッセージが届きました。"));
                        loadmsgboxelem.appendChild(loadmsgelem);
                        bodytag.appendChild(loadmsgboxelem);
                } else {
                        document.getElementById("load").remove();
                };

                document.getElementById("loadcircle").setAttribute("class","hidden");
        })
        .catch (e => {
                console.error(e);
        });

};

loaddata();

document.getElementById("refresh").addEventListener("click", () => {

        if (document.getElementById("msgbox") !== null){
                document.getElementById("msgbox").remove();
        };

        loadmsgelem = "";
        loadmsgelem = document.createElement("p");
        loadmsgelem.setAttribute("class","loadmsgp");
        loadmsgboxelem = document.createElement("div");
        loadmsgboxelem.setAttribute("id", "msgbox");

        if (reloadok) {        
                
                document.getElementById("loadcircle").setAttribute("class","");

                reloadok = false;
                document.getElementById("refresh").setAttribute("tabindex","-1");
                document.getElementById("refresh").setAttribute("class","glaybutton");
                document.getElementById("loadcheck").setAttribute("disabled","");

                aftimes = [];
                afwhose = [];
                afnotes = [];

                fetch(url)
                .then(response => {
                        if (!response.ok) {
                                throw new error ("読み込みに失敗");
                        }
                        return response.json();
                })
                .then(data => {        
                        
                        data.forEach(entry => {
                
                                const x = entry.time;
                                const y = entry.who;
                                const z = entry.note;
                                
                                if (y !== "" || z !== ""){

                                        aftimes.push(x);
                                        afwhose.push(String(y).substring(0,8));
                                        afnotes.push(z);

                                };
                        });

                        if (times[0] == aftimes[0]) {
                                loadmsgboxelem.setAttribute("class","loadmsgboxred msgbox");
                                document.getElementById("refresh").setAttribute("tabindex","1");
                                document.getElementById("refresh").setAttribute("class","greenbutton");
                                document.getElementById("loadcheck").removeAttribute("disabled");
                                reloadok = true;
                                loadmsgelem.appendChild(document.createTextNode("新しいメッセージはありません。"));
                                loadmsgboxelem.appendChild(loadmsgelem)
                                bodytag.appendChild(loadmsgboxelem);
                                document.getElementById("loadcircle").setAttribute("class","hidden");
                        } else {
                                document.getElementById("msgtable").innerHTML = "";    
                                loaddata();
                        };
                })
                .catch(e => {
                        console.error(e)
                });
        };
});

let loadwas = 0;

setInterval(() => {
        
        if (document.getElementById("loadcheck").checked) {
                if (loadwas == 0) {
                        document.getElementById("refresh").setAttribute("tabindex","-1");
                        document.getElementById("refresh").setAttribute("class","glaybutton");
                        loadwas = 1;
                };
                
                if (document.getElementById("msgbox") !== null){
                        document.getElementById("msgbox").remove();
                };
        
                if (reloadok) {        
                        reloadok = false;
                        document.getElementById("refresh").setAttribute("tabindex","-1");
                        document.getElementById("refresh").setAttribute("class","glaybutton");
        
                        aftimes = [];
                        afwhose = [];
                        afnotes = [];
        
                        fetch(url)
                        .then(response => {
                                if (!response.ok) {
                                        throw new error ("読み込みに失敗");
                                };
                                return response.json();
                        })
                        .then(data => {        
                                
                                data.forEach(entry => {
                        
                                        const x = entry.time;
                                        const y = entry.who;
                                        const z = entry.note;
                                        
                                        if (y !== "" || z !== ""){
        
                                                aftimes.push(x);
                                                afwhose.push(String(y).substring(0,8));
                                                afnotes.push(z);
        
                                        };
                                });
        
                                if (times[0] !== aftimes[0]) {
                                        document.getElementById("msgtable").innerHTML = "";
                                        loaddata();
                                } else {
                                        reloadok = true;
                                };
                        })
                        .catch(e => {
                                console.error(e)
                        });
                };
        } else {
                if (loadwas == 1) {
                        document.getElementById("refresh").setAttribute("tabindex","1");
                        document.getElementById("refresh").setAttribute("class","greenbutton");
                        loadwas = 0;
                        reloadok = true;
                };
        };
}, 1000);

let visible = false;
document.getElementById("hammenu").addEventListener("click", () => {
        viewtoggle();
});
document.getElementById("menuback").addEventListener("click", () => {
        viewclose();
});
document.getElementById("loginbutton").addEventListener("click", function(e) {
        e.stopPropagation();
        sendok = true;
        document.getElementById("loginmenu").style.display = "inline-block";
});
document.getElementById("menuframe").addEventListener("click", function(e) {
        e.stopPropagation();
});

function viewtoggle(){
        if (visible){
                viewclose();
        } else {
                document.getElementById("menuback").style.display = "inline-block";
                
                visible = true;
        };
};
function viewclose(){
        document.getElementById("menuback").style.display = "none";
        document.getElementById("loginmenu").style.display = "none";
        
        visible = false;
        sendok = false;
};

let sendok = false;

document.getElementById("logininput").addEventListener("click", () => {
        loginfunc();
});

function loginfunc() {
        let namein = document.getElementById("loginname").value;
        let passin = document.getElementById("loginpass").value;

        let nameisok = noslashusername.indexOf(namein);

        if (nameisok >= 0) {
                if (passin == noslashuserpass[nameisok]) {
                        user = namein;
                        document.cookie = 'usernamelogined=' + user + "; max-age=31536000";
                        
                        
                        document.getElementById("loginwho").innerText = "ログイン中：" + user;
                        document.getElementById("loginname").value = "";
                        document.getElementById("loginpass").value = "";
                        document.getElementById("msgtable").innerHTML = "";
                        reloadok = false;
                        loaddata();

                } else {
                        document.getElementById("loginwho").innerText = "ログイン失敗";
                        
                };
        } else {
                document.getElementById("loginwho").innerText = "ログイン失敗";
                
        };
};

document.getElementById("logoutinput").addEventListener("click", () => {
        user = "";
        document.cookie = 'usernamelogined='
        document.getElementById("loginwho").innerText = "未ログイン";
        
        document.getElementById("loginname").value = "";
        document.getElementById("loginpass").value = "";
        document.getElementById("msgtable").innerHTML = "";
        loaddata();
});

document.getElementById("loginname").addEventListener("keydown", function(event) {
        
        if (event.key === "Enter" && sendok) {
                loginfunc();
        };
});

document.getElementById("loginpass").addEventListener("keydown", function(event) {
        if (event.key === "Enter" && sendok) {
                loginfunc();
        };
});