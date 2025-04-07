console.clear();
let times = [];
let whose = [];
let notes = [];
let aftimes;
let afwhose;
let afnotes;
let loadmsgelem;
let loadmsgboxelem;

const username = ["sigma"];
const userpass = ["sigma/17291268"];

let bodytag = document.getElementById("body");

const url = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgqLRw48fOtRxXIYYqMPK0mWkRJfPGyN1Ah0cnfSk1KpV5NbjaqbDki8R6oj7dDDFs0uYdL1_RNwvmpk411fPZYeiQ65pDAdi3pyG0YDu_lHH9ulfZuxKdK43cyoQaDGc5A5dQTheFGuDnsUsgTB7OiGKR8C1bsIgkI8EpxZgBZ6clzcgVNI165i7JsT-QiMK-P7wzpMeNXF2Oxi5f8MCfQWNUuvD_b_51KIPWQcN1jUFBQQTJdTrJMNGvmmFAlSitSSi_3YIGTIcXnrq96EHoUuW4RNJCAEtOakb8G&lib=MGMFwvEFybYZbEEwDgQ57nI-tcHohpwJB"
const config = {
//     method: "GET",
//     mode: "no-cors",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
}

let msgbefore;
let reloadok = false;

const stampstock = ["good","balloon","oyster_shell","html","css","javascript","tenkaicon","tenkalogo","BlueArchiveLogo_pass_izu792"];

function loaddata() {

        fetch(url)

                .then(response => response.json())
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
                                        whose.push(String(y));
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
                                parenttrelem.setAttribute("id","col" + String(i))
                                table.appendChild(parenttrelem);

                                parenttr = document.getElementById("col" + String(i))

                                for (let j = 0; j < 3; j++) {

                                        childtdelem = document.createElement("td");

                                        if (j == 0){
                                                textelem = document.createTextNode(times[i]);
                                                childtdid = "tdtime";
                                                childtdelem.appendChild(textelem);
                                        } else if (j == 1) {
                                                for (let l = 0; l < username.length; l++) {
                                                        if (whose[i].split(/\//)[0].indexOf(username[l]) > -1) {
                                                                console.log(String(i) + ": before : " + userpass[l]);
                                                                console.log(String(i) + ": " + whose[i]);
                                                                if (userpass[l] == whose[i]) {
                                                                        textelem = document.createTextNode(username[l]);
                                                                        console.log(username[l]);
                                                                        break;
                                                                } else {
                                                                        textelem = document.createTextNode(username[l] + "の偽物");
                                                                        childtdelem.setAttribute("style","color: red;");
                                                                        break;
                                                                }
                                                        }
                                                        if (l == username.length - 1) {
                                                                console.log(String(i) + ": afret : " + whose[i]);
                                                                textelem = document.createTextNode(String(whose[i]).substring(0,12));
                                                        }
                                                }
                                                childtdid = "tdwho";
                                                childtdelem.appendChild(textelem);
                                        } else if (j == 2){
                                                childtdid = "tdnote";
                                                if (String(notes[i]).substring(0,7) == "/stamp/") {
                                                        let stamp = notes[i].slice(7);
                                                        if (stampstock.indexOf(stamp) >= 0) {
                                                                textelem = document.createElement("img");
                                                                textelem.setAttribute("src","./assets/stamps/" + stamp + ".png");
                                                        } else {
                                                                textelem = document.createTextNode("スタンプの読み込みに失敗");
                                                        }
                                                        childtdelem.appendChild(textelem);
                                                } else {
                                                        String(notes[i]).split(/\n/).forEach(line => {
                                                                childtdelem.appendChild(document.createTextNode(line));
                                                                childtdelem.appendChild(document.createElement("br"));
                                                        })
                                                }
                                        }
                                        childtdelem.setAttribute("class",childtdid);
                                        parenttr.appendChild(childtdelem);
                                }
                        }
                        document.getElementById("refresh").setAttribute("tabindex","1");
                        document.getElementById("refresh").setAttribute("class","greenbutton");
                        reloadok = true;
                        if (aftimes !== undefined) {
                                loadmsgboxelem.setAttribute("class","loadmsgboxblue msgbox");
                                loadmsgelem.appendChild(document.createTextNode("新しいメッセージが届きました。"));
                                loadmsgboxelem.appendChild(loadmsgelem);
                                bodytag.appendChild(loadmsgboxelem);
                        } else {
                                document.getElementById("load").remove();
                        }

                        document.getElementById("loadcircle").setAttribute("class","hidden");
                });

};

loaddata();

document.getElementById("refresh").addEventListener("click", () => {

        console.log(document.getElementById("msgbox"));

        if (document.getElementById("msgbox") !== null){
                document.getElementById("msgbox").remove();
        }

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

                aftimes = [];
                afwhose = [];
                afnotes = [];

                fetch(url)
                .then(response => response.json())
                .then(data => {        
                        
                        data.forEach(entry => {
                
                                const x = entry.time;
                                const y = entry.who;
                                const z = entry.note;
                                
                                if (y !== "" || z !== ""){

                                        aftimes.push(x);
                                        afwhose.push(String(y).substring(0,8));
                                        afnotes.push(z);

                                }
                        });

                        if (times[0] == aftimes[0]) {
                                loadmsgboxelem.setAttribute("class","loadmsgboxred msgbox");
                                document.getElementById("refresh").setAttribute("tabindex","1");
                                document.getElementById("refresh").setAttribute("class","greenbutton");
                                reloadok = true;
                                loadmsgelem.appendChild(document.createTextNode("新しいメッセージはありません。"));
                                loadmsgboxelem.appendChild(loadmsgelem)
                                bodytag.appendChild(loadmsgboxelem);
                                document.getElementById("loadcircle").setAttribute("class","hidden");
                        } else {
                                for (let k = 0; k < times.length; k++) {
                                        document.getElementById("col" + k).remove();
                                }       
                                loaddata();
                        }
                });
        };
});