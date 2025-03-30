console.clear();
let times = ["　"];
let whose = ["　"];
let notes = ["直近100件を読み込みます。"];
const url = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLg32RcW3RJFpXyVTTqIC2toahSZKiraUxk7OrkPek5scuzWjen4rEMS6jzhvGl3wJMG9rgeHA9lyqwyB4p0UK2W2z4-gFihWd9wpbu82RmuJGotvOhEIsSomgvrk6OMyU2jeAEknj-Box8HGwIPkV8ke_Yi-WMvNCHxU-QbchoeDCmJMxA02Zd8VvUA-uhfv5-KUWoLoO_6_rnZfgLKPsBKJncd9buZPdUYdfmSJ_irNLTy1ICb1HtqFExoeplQpsyL9Qw3AploA9YW989FCQKmoXl1lykDfqYj-f_B&lib=MGMFwvEFybYZbEEwDgQ57nI-tcHohpwJB"
const config = {
//     method: "GET",
//     mode: "no-cors",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
}

async function loaddata() {

        const resp = await fetch(url,config);

        fetch(url)
                .then(response => response.json())
                .then(data => {        
                        
                        data.forEach(entry => {
                
                                const x = entry.time;
                                const y = entry.who;
                                const z = entry.note;
                                
                                if (x !== "" || y !== "" || z !== ""){

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
                                        } else if (j == 1) {
                                                textelem = document.createTextNode(whose[i]);
                                                childtdid = "tdwho";
                                        } else if (j == 2){
                                                textelem = document.createTextNode(notes[i]);
                                                childtdid = "tdnote";
                                        }

                                        childtdelem.appendChild(textelem);
                                        childtdelem.setAttribute("class",childtdid);
                                        parenttr.appendChild(childtdelem);

                                }

                        }
                    
                });
};

loaddata();