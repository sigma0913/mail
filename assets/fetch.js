console.clear();
let times = [];
let whose = [];
let notes = [];
const url = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjShSm2KMHdpfDvWkbgRJC2dZyu-OpEsDRdrNq704rRVbOBh1-S5dQZfqyzAhidqDFYH15xhOrXz7n3q__ULkldhIzS6s1QKt-C1_7f5VNXnlgDkHCmPmmeDNGauGqeqofT5RD0D5Rw7aOWZHlYvwBUlGDP8EWIycRFUlqV7WRcqA3zHVUKRvMy1Bok_4Wpzv13vSch0mDcQStFAE1cxv6c4gOT2VJbi-nw9_S81Y_26d6o368ibiMDmkMBC--Y0il56Fm4dU15uwgyCMHwD8l5qbvVUEm_LhsrpJ1H&lib=MGMFwvEFybYZbEEwDgQ57nI-tcHohpwJB"
const config = {
//     method: "GET",
//     mode: "no-cors",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
}

const stampstock = ["good","balloon","oyster_shell","BlueArchiveLogo_pass_izu792"];

function loaddata() {

        fetch(url)
                .then(response => response.json())
                .then(data => {        
                        
                        data.forEach(entry => {
                
                                const x = entry.time;
                                const y = entry.who;
                                const z = entry.note;
                                
                                if (y !== "" || z !== ""){

                                        times.push(x);
                                        whose.push(y);
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
                                                textelem = document.createTextNode(whose[i]);
                                                childtdid = "tdwho";
                                                childtdelem.appendChild(textelem);
                                        } else if (j == 2){
                                                childtdid = "tdnote";
                                                if (String(notes[i]).substring(0,7) == "/stamp/") {
                                                        let stamp = notes[i].slice(7);
                                                        console.log(stamp);
                                                        console.log(stampstock.indexOf(stamp));
                                                        console.log(stampstock);
                                                        if (stampstock.indexOf(stamp) >= 0) {
                                                                textelem = document.createElement("img");
                                                                textelem.setAttribute("src","./assets/stamps/" + stamp + ".png");
                                                        } else {
                                                                textelem = document.createTextNode("スタンプの読み込みに失敗");
                                                        }
                                                        childtdelem.appendChild(textelem);
                                                } else {
                                                        String(notes[i]).split(/\n/).forEach(line => {
                                                                console.log(line)
                                                                childtdelem.appendChild(document.createTextNode(line));
                                                                childtdelem.appendChild(document.createElement("br"));
                                                        })
                                                }
                                        }
                                        childtdelem.setAttribute("class",childtdid);
                                        parenttr.appendChild(childtdelem);

                                }

                        }

                        document.getElementById("load").remove();
                    
                });
};

loaddata();

setInterval(() => {

}, 1000);