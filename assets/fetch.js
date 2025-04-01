console.clear();
let times = ["-----"];
let whose = ["-----"];
let notes = ["直近100件を読み込みます。"];
const url = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLimRj7p5AjDNQzfGwMIvTbfTUbLMOXMTtEfumKA1N1V-nhKKfzIaZ8PcyqCERdje0mmAjJOaDvOHl5J481lgW4gHMa_NRCoZfCyJ3KWFLmCBKtL6a9WExRWGjwPmcbEv0sSYhe1VR4lK5S0_M4kWhM4S8pxzc6zifFR8LZQRGXk1NQa2xMRMdbmpR1SCdTVxGfOJFO6ieUabAYN9r7R8KIkHOk1kBEVXkvlIF7G6FFyeb-7hN09KrBI6btVfFdRlwE7vz-jZ-OzPK4bKvyr-ui4tqlVi1gGr2C2SbR1&lib=MGMFwvEFybYZbEEwDgQ57nI-tcHohpwJB"
const config = {
//     method: "GET",
//     mode: "no-cors",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
}

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

                        for (let i = times.length - 1; i > -1; i--) {

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
                                                        textelem = document.createElement("img");
                                                        textelem.setAttribute("src","./assets/stamps/" + stamp + ".png");
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