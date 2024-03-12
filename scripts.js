/*****************************************************************************/
/*                             Declarations                                  */
/*****************************************************************************/

const baseURL = "https://tt.chadsoft.co.uk",  //must use https://
largeCategories = ["GCN Baby Park","Jungle Jamble","Undiscovered Offlimit","Wetland Woods","Sunset Forest","White Garden","Mushroom Island",
                  "Colour Circuit","GCN Mushroom Bridge","Fishdom Island","Kinoko Cave","Summer Starville","Spectral Station","Obstagoon's Palace",
                  "Camp Kartigan","Castle of Darkness","Haunted Gardens","Castle of Time"];
//array to fetch more ghosts for top 10 LBs, category is large if top 10 ghosts are not within first 100 entries
//must be manually inputed, it is logged in console during execution for easy knowledge

let urlList = [], categories = [], trackIds = []; //trackIds and categories arrays are used to find data in first mainLB fetch because not all leaderboards are fetched afterwards
const leaderboardsURLS = {
  '150CTGP': 'https://tt.chadsoft.co.uk/ctgp-leaderboards.json',
  '200CTGP': 'https://tt.chadsoft.co.uk/ctgp-leaderboards-200cc.json',
  '200NIN': 'https://tt.chadsoft.co.uk/original-track-leaderboards-200cc.json'
}

class NameQuantityNode {

  /** not all fields need to be filled
   * @param {String} name 
   * @param {Number} quantity usually 1 when initialized
   * @param {String} extra image string 
   * @param {String} player only used for orderedDuration */
  constructor(name, quantity, image, player) {
    this.name = name;
    this.quantity = quantity;
    this.image = image;
    this.player = player;
  }

  /** adds 1 to the quantity value */
  add() {
    this.quantity++;
  }

  //getters
  getName() {
    return this.name;
  }
  getQuantity() {
    return this.quantity;
  }
  getImage() {
    return this.image;
  }
  getPlayer() {
    return this.player;
  }
}


/*****************************************************************************/
/*                         Leaderboard Main Func                             */
/*****************************************************************************/


function loadLeaderboard(load,currentPage) {
  createPageHeader(currentPage)
  buildRecordWebpage()
  fetch(load).then(mainRes => {mainRes.json().then(mainLB =>{this.mainLB = mainLB;

  /*for (let i=0;i<mainLB["leaderboards"].length;i++) {
    urlList.push(new URL(this.mainLB["leaderboards"][`${i}`]["_links"]["item"]["href"]+'?limit=1',baseURL));
  } //FUTURE if new params found: url.searchParams.set("limit",1) */

  for (let i=0;i<mainLB["leaderboards"].length;i++) {
    category = determineCategory(mainLB,i,`${i}`);
    trackIds.push(mainLB["leaderboards"][`${i}`]["trackId"]);

    if (category==="Slower-Glitch") { //prevent slow glitches and slow shortcuts from displaying
      //console.log(mainLB["leaderboards"][`${i}`]["name"] + "Slow glitch");
      continue;
    }
    categories.push(category);
    urlList.push(baseURL+this.mainLB["leaderboards"][`${i}`]["_links"]["item"]["href"]+'?limit=1');
  }
  let fetches = urlList.map(url => fetch(url).then(res => res.json()));

  Promise.allSettled(fetches)
    .then((results) => {

      fetch('./players.json').then(mainRes => {mainRes.json().then(playersPage => {this.playersPage = playersPage;

      let infoTitle = document.getElementById('main').getElementsByTagName('thead')[0];
      createTableHeader11(infoTitle.insertRow(),"Track Name","Category","Time","Player Name","Mii","Nation","Character","Vehicle","Controller","Date","Duration");
      let myTable = document.getElementById("main").getElementsByTagName('tbody')[0];
      //create header row and init body row

      let screenName = '', allDates = [], allYears = [], allRecords = [],
      vehicleTally = [], characterTally = [], controllerTally = [], playerTally = [], 
      glitchTally = [], noGlitchTally = [], countryTally = [], orderedDuration = [];
      //declare arrays

      for (let j=0;j<results.length;j++) {

        let index = `${j}`;
        let row = myTable.insertRow();
        let cell1 = row.insertCell(0), cell2 = row.insertCell(1),
        cell3 = row.insertCell(2), cell4 = row.insertCell(3),
        cell5 = row.insertCell(4), cell6 = row.insertCell(5),
        cell7 = row.insertCell(6), cell8 = row.insertCell(7),
        cell9 = row.insertCell(8), cell10 = row.insertCell(9),
        cell11 = row.insertCell(10);
        //One row and 11 columns for each track and category

        if (results[index]["status"] === "rejected") {
          //display generic track info with main leaderboard if a track leaderboard fails, restarts loop
          let failedTrack = trackIds.indexOf(urlList[index].slice(41,81));
          cell1.innerHTML = mainLB["leaderboards"][`${failedTrack}`]["name"];
          cell2.innerHTML = categories[j];
          cell3.innerHTML = mainLB["leaderboards"][`${failedTrack}`]["fastestTimeSimple"].slice(1);
          cell4.innerHTML = "-";
          cell5.innerHTML = "Failed";
          cell6.innerHTML = "to";
          cell7.innerHTML = "fetch";
          cell8.innerHTML = "ghost";
          cell9.innerHTML = "-";
          cell10.innerHTML = mainLB["leaderboards"][`${failedTrack}`]["fastestTimeLastChange"].slice(0,10);
          cell11.innerHTML = getRecordDuration(mainLB["leaderboards"][`${failedTrack}`]["fastestTimeLastChange"].slice(0,10));
          console.log('Failed Fetching Record for: '+mainLB["leaderboards"][`${failedTrack}`]["name"]);
          allRecords.push(mainLB["leaderboards"][`${failedTrack}`]["fastestTimeSimple"]);
          continue;
        }

        let currentVehicle=getVehicle(results[index]["value"]["ghosts"]["0"]["vehicleId"]),
        currentCharacter=getCharacter(results[index]["value"]["ghosts"]["0"]["driverId"]),
        currentController=getController(results[index]["value"]["ghosts"]["0"]["controller"]),
        recordDate = results[index]["value"]["ghosts"]["0"]["dateSet"].slice(0,10); //UTC Time Date
        duration = getRecordDuration(recordDate);
        //getting strings from switch case statements

        let player = ["Unknown","images/unknown.png"];
        for (let i=0;i<playersPage.length;i++) {
          if (playersPage[i].playerID.includes(results[index]["value"]["ghosts"]["0"]["playerId"])) {
            if (playersPage[i].playerName[0].length === 1) {
              player = [playersPage[i].playerName,playersPage[i].countryID];
            }
            else {
              player = [playersPage[i].playerName[0],playersPage[i].countryID];
            }
            break;
          }
        }

        if (player[0]!="Unknown") {
          //prevent unknown players from being added to player and nation table, ghost stats are still added
          //will still be displayed for overall record table
          if (toBeAdded = addToArray(player[0],playerTally)) {
            playerTally.push(new NameQuantityNode(player[0],1,player[1]))
          }
          if (toBeAdded = addToArray(player[1].slice(7,9),countryTally)) {
            countryTally.push(new NameQuantityNode(player[1].slice(7,9),1,player[1]))
          }
          if (categories[j]==="Glitch" || categories[j]==="Shortcut") {
            if (toBeAdded = addToArray(player[0],glitchTally)) {glitchTally.push(new NameQuantityNode(player[0],1,player[1]))}
          }
          else {
            if (toBeAdded = addToArray(player[0],noGlitchTally)) {noGlitchTally.push(new NameQuantityNode(player[0],1,player[1]))}
          }
          screenName = player[0];
        }
        else {
          console.log("Missing player entry at: "+results[index]["value"]["name"]+": "+categories[j]);
          screenName = checkDefaultMii(results[index]["value"]["ghosts"]["0"]["player"]);
        }

        allDates.push(recordDate);
        allRecords.push(results[index]["value"]["fastestTimeSimple"]);
        orderedDuration.push(new NameQuantityNode(results[index]["value"]["name"]+": "+categories[j],duration,recordDate,player[0]));
        //these two are always pushed to

        if (toBeAdded = addToArray(recordDate.slice(0,4),allYears)) {
          allYears.push(new NameQuantityNode(recordDate.slice(0,4),1))
        }
        if (toBeAdded = addToArray(currentVehicle,vehicleTally)) {
          vehicleTally.push(new NameQuantityNode(currentVehicle,1))
        }
        if (toBeAdded = addToArray(currentCharacter,characterTally)) {
          characterTally.push(new NameQuantityNode(currentCharacter,1))
        }

        if (currentController==="Gamecube" && results[index]["value"]["ghosts"]["0"]["usbGcnAdapterAttached"]) {
          currentController="USB-GCN"; //intercept USB-GCN before addToArray
        }
        if (toBeAdded = addToArray(currentController,controllerTally)) {
          controllerTally.push(new NameQuantityNode(currentController,1))
        }
        //add ghost data to arrays

        cell1.innerHTML = results[index]["value"]["name"];
        cell2.innerHTML = categories[j];
        //cell3.appendChild(createRKGDownload(results[index]["value"]["ghosts"],"0"));
        cell3.innerHTML = results[index]["value"]["fastestTimeSimple"].slice(1); //removes initial 0
        cell4.innerHTML = screenName;
        cell5.innerHTML = checkDefaultMii(results[index]["value"]["ghosts"]["0"]["player"]);
        cell6.appendChild(createImage(player[1]));
        cell7.innerHTML = currentCharacter;
        cell8.innerHTML = currentVehicle;
        cell9.innerHTML = currentController;
        cell10.innerHTML = recordDate;
        cell11.innerHTML = duration;
      }

      //Begin Stats Section

      orderedDuration.sort(sortNodeByQuantity);countryTally.sort(sortNodeByQuantity); 
      vehicleTally.sort(sortNodeByQuantity); characterTally.sort(sortNodeByQuantity);
      controllerTally.sort(sortNodeByQuantity); playerTally.sort(sortNodeByQuantity); 
      glitchTally.sort(sortNodeByQuantity); noGlitchTally.sort(sortNodeByQuantity);
      allYears.sort(sortNodeByName);
      //numeric sorting

      document.getElementById("totalTime").textContent=`Overall Combined Time: ${addGhostTimes(allRecords)}`;
      document.getElementById("totalCount").textContent=`Total Records: ${allDates.length}`;

      displayPie("vehicle",vehicleTally);
      displayPie("character",characterTally);
      displayPie("controller",controllerTally);
      displayPie("country",countryTally); //Pie charts
      
      displayTopTen(orderedDuration);
      displayTableWithPictures("playerList",playerTally,"Player Name","Total Records","Nation");
      displayTableWithPictures("glitchList",glitchTally,"Player Name","Total Records","Nation");
      displayTableWithPictures("noGlitchList",noGlitchTally,"Player Name","Total Records","Nation");
      displayTableWithPictures("countryList",countryTally,"Country","Total Records","Flag");
      displaySimpleTable("vehicleList",vehicleTally,"Vehicle","Total");
      displaySimpleTable("characterList",characterTally,"Character","Total");
      displaySimpleTable("controllerList",controllerTally,"Controller","Total"); //html tables

      let yearSplit = splitNameQuantity(allYears);
      displayBar("years",yearSplit[0],yearSplit[1]); //bar charts
      displayBar("dates",getMonths(allDates),["Jan","Feb","Mar","Apr","May","June","July","Aug","Sep","Oct","Nov","Dec"]);
      createRedirect();
    })})
  })
    .catch((err) => {
      console.log(err);
      console.log("Fatal Error in logic");
  });
}).catch((err) => {
  console.log(err);
  alert("Main database hasn't responded, chadsoft server is most likely down or running too slow, Try again later.")
})
}) //tag closures from original fetch statement
}


/*****************************************************************************/
/*                              PlayerID Lookup                              */
/*****************************************************************************/


function PlayersPageAndPIDbyPlayerName() {
  let inputtedName = document.getElementById("playerName");
  let index = 0;
  let simpleIDs = "";
  //check and remove previous search if necessary
  const element = document.getElementById("h1");
  const element2 = document.getElementById("d1");
  if (element) {
    element.remove();
    element2.remove();
  }

  fetch('./players.json').then(mainRes => {mainRes.json().then(playersPage => {this.playersPage = playersPage;
    for (let i=0;i<playersPage.length;i++) {
      let array = playersPage[i].playerName;
      if (playersPage[i].playerName[0].length === 1) { //playersPage[i].playerName[0].length = 1 when only 1 name is present and therefore not an array
        array = playersPage[i].playerName.toUpperCase();
      }
      else {
        array = array.map(function(x) {return x.toUpperCase();})
      }
      if (array.includes(inputtedName.value.toUpperCase())) {
        index = i;
        break;
      }
    }

    let urlDiv = document.createElement("div");
    urlDiv.id = "d1";
    if (index==0) {
      simpleIDs+="Player not found";
      urlDiv.appendChild(createHeaderTwo("Player not found"));
    }
    else if (playersPage[index].playerID.length==16) { //playerID == 16 if only 1 playerID else it is a single digit
      simpleIDs+=playersPage[index].playerID;
      urlDiv.appendChild(createHyperLink(`https://www.chadsoft.co.uk/time-trials/players/${playersPage[index].playerID.slice(0,2)}/${playersPage[index].playerID.slice(2)}.html`));
    }
    else {
      for (let i=0;i<playersPage[index].playerID.length;i++) {
        simpleIDs+=playersPage[index].playerID[i]+" ";
        urlDiv.appendChild(createHyperLink(`https://www.chadsoft.co.uk/time-trials/players/${playersPage[index].playerID[i].slice(0,2)}/${playersPage[index].playerID[i].slice(2)}.html`));
        let break1 = document.createElement("br");
        urlDiv.appendChild(break1);
      }
    }

    let header1 = document.createElement("h3");
    header1.appendChild(document.createTextNode(simpleIDs));
    header1.id = "h1";
    document.body.appendChild(header1);
    document.body.appendChild(urlDiv);
  })})
}


/*****************************************************************************/
/*                              Top10 Main Func                              */
/*****************************************************************************/

/*
Searches once and then searches again, fetching a lot of data so at least one fetch fails typically
*/
function topsByPID() {
  let playerID = document.getElementById("playerID"),
  timesheet = document.getElementById("Timesheet?"),
  urlList = [], allPersonalRecords = [], retryfetches = [], failedFetches = [],
  trackIds = [], categories = [], categories2 = [], csvList = [];

  //check if a leaderboard is built and remove it
  const element = document.getElementById("main");
  const element2 = document.getElementById("timeTotal");
  const element3 = document.getElementById("personalTotal");
  const element4 = document.getElementById("download");
  if (element) {
    element.remove();
    element2.remove();
    element3.remove();
    element4.remove();
  }

  if (playerID.value.length===16) {
    load = leaderboardsURLS[document.querySelector('input[name="leaderboardRadio"]:checked').value];
  }
  else {
    alert("Invalid playerID!");
    return;
  }

  fetch(load).then(mainRes => {mainRes.json().then(mainLB =>{this.mainLB = mainLB;

    if (timesheet.checked === true) { //every ghost
      for (let i=0;i<mainLB["leaderboards"].length;i++) {
        category = determineCategory(mainLB,i,`${i}`);
        trackIds.push(mainLB["leaderboards"][`${i}`]["trackId"]);
    
        if (category==="Slower-Glitch") {continue;} //prevent slow glitches from displaying
        urlList.push(baseURL+this.mainLB["leaderboards"][`${i}`]["_links"]["item"]["href"]);
        categories.push(category);
      }
    }
    else { //top 10 search, try to limit ghosts fetched to speed up process
      for (let i=0;i<mainLB["leaderboards"].length;i++) {
        category = determineCategory(mainLB,i,`${i}`);
        trackIds.push(mainLB["leaderboards"][`${i}`]["trackId"]);
    
        if (category==="Slower-Glitch") {continue;} //prevent slow glitches from displaying
        if (largeCategories.includes(mainLB["leaderboards"][`${i}`]["name"])) {
          urlList.push(baseURL+this.mainLB["leaderboards"][`${i}`]["_links"]["item"]["href"]+'?limit=200');
          categories.push(category);
        }
        else {
          urlList.push(baseURL+this.mainLB["leaderboards"][`${i}`]["_links"]["item"]["href"]+'?limit=100');
          categories.push(category);
        }
      }
    }
    let fetches = urlList.map(url => fetch(url).then(res => res.json()));

    Promise.allSettled(fetches)
      .then((results) => {
        document.body.appendChild(createTable("main"));
        let infoTitle = document.getElementById('main').getElementsByTagName('thead')[0];
        createTableHeader11(infoTitle.insertRow(),"Track Name","Category","Rank","Time","Record's Time","Difference","Character","Vehicle","Controller","Date","Duration");
        let myTable = document.getElementById("main").getElementsByTagName('tbody')[0];
        for (let j=0;j<results.length;j++) {
          let rNum = [], index = `${j}`;

          //add failed fetches to array to try again
          if (results[index]["status"] === "rejected") {
            let failedTrack = trackIds.indexOf(urlList[index].slice(41,81)); //find track id from url and use it to find index of correlated track in master json
            console.log(mainLB["leaderboards"][`${failedTrack}`]["name"]+" failed to fetch"); //master json always exists or it will have failed already
            retryfetches.push(urlList[index]);
            categories2.push(categories[j]);
            continue;
          }

          if (rNum = findGhostRank(results[index]["value"],playerID.value,timesheet.checked)) {
            let ghostLoc = rNum.getName(); //top 10 ghost index, string
            let row = myTable.insertRow();
            let cell1 = row.insertCell(0),
            cell2 = row.insertCell(1),
            cell3 = row.insertCell(2),
            cell4 = row.insertCell(3),
            cell5 = row.insertCell(4),
            cell6 = row.insertCell(5),
            cell7 = row.insertCell(6),
            cell8 = row.insertCell(7),
            cell9 = row.insertCell(8),
            cell10 = row.insertCell(9),
            cell11 = row.insertCell(10);

            cell1.innerHTML = results[index]["value"]["name"];
            cell2.innerHTML = categories[j];
            cell3.innerHTML = rNum.getQuantity(); //rank
            cell4.innerHTML = results[index]["value"]["ghosts"][ghostLoc]["finishTimeSimple"].slice(1); //removes initial 0
            cell5.innerHTML = results[index]["value"]["fastestTimeSimple"];
            cell6.innerHTML = calculateDifference(results[index]["value"]["ghosts"]["0"]["finishTimeSimple"],results[index]["value"]["ghosts"][ghostLoc]["finishTimeSimple"]);
            cell7.innerHTML = getCharacter(results[index]["value"]["ghosts"][ghostLoc]["driverId"]);
            cell8.innerHTML = getVehicle(results[index]["value"]["ghosts"][ghostLoc]["vehicleId"]);
            cell9.innerHTML = getController(results[index]["value"]["ghosts"][ghostLoc]["controller"]);
            cell10.innerHTML = results[index]["value"]["ghosts"][ghostLoc]["dateSet"].slice(0,10);
            cell11.innerHTML = getRecordDuration(results[index]["value"]["ghosts"][ghostLoc]["dateSet"]);

            allPersonalRecords.push(results[index]["value"]["ghosts"][ghostLoc]["finishTimeSimple"]);
            csvList.push([results[index]["value"]["name"].replace(",",""),categories[j],rNum.getQuantity(),
              results[index]["value"]["ghosts"][ghostLoc]["finishTimeSimple"].slice(1),results[index]["value"]["ghosts"][ghostLoc]["player"],
              getCharacter(results[index]["value"]["ghosts"][ghostLoc]["driverId"]),getVehicle(results[index]["value"]["ghosts"][ghostLoc]["vehicleId"]),
              results[index]["value"]["ghosts"][ghostLoc]["dateSet"].slice(0,10),getRecordDuration(results[index]["value"]["ghosts"][ghostLoc]["dateSet"]),
              getController(results[index]["value"]["ghosts"][ghostLoc]["controller"]),results[index]["value"]["ghosts"][ghostLoc]["wasWr"]]);
          }
          else if (timesheet.checked) {
            csvList.push([results[index]["value"]["name"].replace(",",""),categories[j]]);
          }
        }

        if (retryfetches.length>0) {
          console.log("Starting sleep: "+Date.now());
          sleep(66000).then(() => { //wait 66 seconds, so api doesn't automatically reject requests
            console.log("Ending sleep: "+Date.now());
            console.log(retryfetches);

            let fetches2 = retryfetches.map(url => fetch(url).then(res => res.json()));
            Promise.allSettled(fetches2).then((results2) => {
              let myTable = document.getElementById("main").getElementsByTagName('tbody')[0];
              for (let j=0;j<results2.length;j++) {
                let rNum = [], index = `${j}`;
                if (results2[index]["status"] === "rejected") {
                  let failedTrack = trackIds.indexOf(retryfetches[index].slice(41,81)); //find track id from url and use it to find index of correlated track in master json
                  console.log(mainLB["leaderboards"][`${failedTrack}`]["name"]+" failed to fetch twice. Adding to failed list.");
                  failedFetches.push(mainLB["leaderboards"][`${failedTrack}`]["name"]); //master json always exists or it will have failed already
                  csvList.unshift([mainLB["leaderboards"][`${failedTrack}`]["name"].replace(",",""),"Normal"]);
                  continue;
                }
      
                if (rNum = findGhostRank(results2[index]["value"],playerID.value,timesheet.checked)) {
                  let ghostLoc = rNum.getName(); //top 10 ghost index, string
                  let row = myTable.insertRow();
                  let cell1 = row.insertCell(0),
                  cell2 = row.insertCell(1),
                  cell3 = row.insertCell(2),
                  cell4 = row.insertCell(3),
                  cell5 = row.insertCell(4),
                  cell6 = row.insertCell(5),
                  cell7 = row.insertCell(6),
                  cell8 = row.insertCell(7),
                  cell9 = row.insertCell(8),
                  cell10 = row.insertCell(9),
                  cell11 = row.insertCell(10);
      
                  cell1.innerHTML = results2[index]["value"]["name"];
                  cell2.innerHTML = categories2[j];
                  cell3.innerHTML = rNum.getQuantity(); //rank
                  cell4.innerHTML = results2[index]["value"]["ghosts"][ghostLoc]["finishTimeSimple"].slice(1); //removes initial 0
                  cell5.innerHTML = results2[index]["value"]["fastestTimeSimple"];
                  cell6.innerHTML = calculateDifference(results2[index]["value"]["ghosts"]["0"]["finishTimeSimple"],results2[index]["value"]["ghosts"][ghostLoc]["finishTimeSimple"]);
                  cell7.innerHTML = getCharacter(results2[index]["value"]["ghosts"][ghostLoc]["driverId"]);
                  cell8.innerHTML = getVehicle(results2[index]["value"]["ghosts"][ghostLoc]["vehicleId"]);
                  cell9.innerHTML = getController(results2[index]["value"]["ghosts"][ghostLoc]["controller"]);
                  cell10.innerHTML = results2[index]["value"]["ghosts"][ghostLoc]["dateSet"].slice(0,10);
                  cell11.innerHTML = getRecordDuration(results2[index]["value"]["ghosts"][ghostLoc]["dateSet"]);
      
                  allPersonalRecords.push(results2[index]["value"]["ghosts"][ghostLoc]["finishTimeSimple"]);
                  csvList.unshift([results2[index]["value"]["name"].replace(",",""),categories2[j],rNum.getQuantity(),
                    results2[index]["value"]["ghosts"][ghostLoc]["finishTimeSimple"].slice(1), results2[index]["value"]["ghosts"][ghostLoc]["player"],
                    getCharacter(results2[index]["value"]["ghosts"][ghostLoc]["driverId"]),getVehicle(results2[index]["value"]["ghosts"][ghostLoc]["vehicleId"]),
                    results2[index]["value"]["ghosts"][ghostLoc]["dateSet"].slice(0,10),getRecordDuration(results2[index]["value"]["ghosts"][ghostLoc]["dateSet"]),
                    getController(results2[index]["value"]["ghosts"][ghostLoc]["controller"]),results2[index]["value"]["ghosts"][ghostLoc]["wasWr"]]);
                }
                else if (timesheet.checked) {
                  csvList.unshift([results[index]["value"]["name"].replace(",",""),categories2[j]]);
                }
              }
              csvList.sort(function(a, b) { //simple sort was not working
                let nameA = a[0].toUpperCase(), nameB = b[0].toUpperCase();
                if(nameA < nameB) { return -1; }
                if(nameA > nameB) { return 1; }
                return 0;
              });
              createCSV(allPersonalRecords,csvList);
              if (failedFetches.length>0) {
                let failedTracks = "";
                for (let x=0; x < failedFetches.length; x++) {
                  failedTracks += `${failedFetches[x]}, `;//let user know which tracks failed to load
                }
                alert(`Some leaderboards failed to load and were unable to be checked, those tracks were ${failedTracks}`);
              }
            })//second pass
          })//sleep
        }
        else {
          createCSV(allPersonalRecords,csvList);
        }
      })//first pass
    .catch((err) => {
      console.log(err);
      console.log("Failed Fetching Main Leaderboard or another Fatal Error");
      alert("An internal error has happened.")
    });
  })}) //tag closures from original fetch statement
}


/*****************************************************************************/
/*                          HTML BUILD FUNCTIONS                             */
/*****************************************************************************/


//json containing html table information, maybe add table headers to array
let tableInfo = {
  "main":{
    "id": "main",
    "class": "large-table",
    "header": "blank"
  },
  "top":{
    "id": "longList",
    "class": "large-table",
    "header": "Top 10 Longest Standing Records"
  },
  "player":{
    "id": "playerList",
    "class": "skinny-table",
    "header": "Combined Player Totals"
  },
  "glitch":{
    "id": "glitchList",
    "class": "skinny-table",
    "header": "Player Totals: Glitch/Shortcut"
  },
  "noGlitch":{
    "id": "noGlitchList",
    "class": "skinny-table",
    "header": "Player Total: Normal/No-shortcut"
  },
  "vehicle":{
    "id": "vehicleList",
    "class": "skinny-table",
    "header": "Vehicle Total Stats",
    "chart": "#vehiclePie"
  },
  "character":{
    "id": "characterList",
    "class": "skinny-table",
    "header": "Character Total Stats",
    "chart": "#characterPie"
  },
  "controller":{
    "id": "controllerList",
    "class": "skinny-table",
    "header": "Controller Total Stats",
    "chart": "#controllerPie"
  },
  "country":{
    "id": "countryList",
    "class": "skinny-table",
    "header": "Country Total Stats",
    "chart": "#countryPie"
  },
  "years":{
    "id": "yearList",
    "class": "skinny-table",
    "header": "Year Total Stats",
    "chart": "#yearBar",
    "tooltip": "Year"
  },
  "dates":{
    "id": "monthList",
    "class": "skinny-table",
    "header": "Records by Month",
    "chart": "#monthsBar",
    "tooltip": "Month"
  }
}

//json containing all necessary information to create html headers
let headerInfo = {
  "index": {
    "title": "Welcome to Sardine's personal website",
    "url": "index.html",
    "urlText": "Home",
    "index": 0
  },
  "records": {
    "title": "All Current CTGP Records",
    "url": "records.html",
    "urlText": "150cc CTGP Records",
    "index": 1
  },
  "recordstwo": {
    "title": "All Current 200cc CTGP Records",
    "url": "recordstwo.html",
    "urlText": "200cc CTGP Records",
    "index": 2
  },
  "recordsnin": {
    "title": "All Current 200cc Nintendo Records",
    "url": "recordsnin.html",
    "urlText": "200cc Nintendo Records",
    "index": 3
  },
  "tops": {
    "title": "Download Top 10 Times or an Entire Timesheet",
    "url": "tops.html",
    "urlText": "Tops or Timesheet",
    "index": 4
  },
  "playerlookup": {
    "title": "Lookup your PlayerID",
    "url": "playerlookup.html",
    "urlText": "Search for playerID",
    "index": 5
  }
}

/** create html elements common across all leaderboards */
function buildRecordWebpage() {
  document.body.appendChild(createTable("main"));
  let break1 = document.createElement("br");
  document.body.appendChild(break1);
  createRedirect();

  let statHeader = document.createElement("h1");
  statHeader.appendChild(document.createTextNode("Statistics"));
  document.body.appendChild(statHeader);
  let statBanner = document.createElement("p");
  statBanner.appendChild(document.createTextNode("Stats are sorted by quantity first and then alphabetically."));
  document.body.appendChild(statBanner);
  document.body.appendChild(createHeaderTwo(tableInfo["top"]["header"]));
  document.body.appendChild(createTable("top"));

  playerDiv = document.createElement("div");
  playerDiv.className = "triple-grid";
  playerDiv.appendChild(createTableHeaderDiv("noGlitch"));
  playerDiv.appendChild(createTableHeaderDiv("player"));
  playerDiv.appendChild(createTableHeaderDiv("glitch"));
  document.body.appendChild(playerDiv);

  mainDiv = document.createElement("div");
  mainDiv.className = "grid-container";
  mainDiv.appendChild(createTableChartDiv("vehicle"));
  mainDiv.appendChild(createTableChartDiv("character"));
  mainDiv.appendChild(createTableChartDiv("controller"));
  mainDiv.appendChild(createTableChartDiv("country"));
  document.body.appendChild(mainDiv);

  chronoDiv = document.createElement("div");
  chronoDiv.className = "triple-grid";
  yearsDiv = document.createElement("div");
  yearsDiv.appendChild(createChart("years"));
  chronoDiv.appendChild(yearsDiv);
  headerDiv = document.createElement("div");
  let totalCount = document.createElement("h2");
  totalCount.id = "totalCount";
  totalCount.appendChild(document.createTextNode("Ghost table is building"));
  headerDiv.appendChild(totalCount);
  let totalTime = document.createElement("h2");
  totalTime.id = "totalTime";
  totalTime.appendChild(document.createTextNode("Stats are building"));
  headerDiv.appendChild(totalTime);
  headerDiv.appendChild(createHeaderTwo("Current Date: "+`${new Date().getMonth()+1}`+"/"+`${new Date().getDate()}`+"/"+`${new Date().getFullYear()}`));
  headerDiv.appendChild(createHeaderTwo("Records by Year and Month"));
  chronoDiv.appendChild(headerDiv);
  datesDiv = document.createElement("div");
  datesDiv.appendChild(createChart("dates"));
  chronoDiv.appendChild(datesDiv);
  document.body.appendChild(chronoDiv);
}

/** Create the header and highlight current page
 * @param {String} currentPage name of html file*/
function createPageHeader(currentPage) {
  let header = document.getElementsByTagName("header");
  let title = document.createElement("h1");
  title.appendChild(document.createTextNode(headerInfo[`${currentPage}`]["title"]));
  header[0].appendChild(title);
  header[0].appendChild(document.createElement("hr"));
  let navBar = document.createElement("nav");
  let funkyImage = createImage("images/funky.webp");
  funkyImage.height = 100;
  navBar.appendChild(funkyImage);
  navDiv = document.createElement("div");
  redirectList = createHeaderHyperLinks(currentPage);
  for (i=0;i<redirectList.length;i++) {
    navDiv.appendChild(redirectList[i]);
  }
  navBar.appendChild(navDiv);
  let warioImage = createImage("images/wario.webp");
  warioImage.height = 100;
  navBar.appendChild(warioImage);
  header[0].appendChild(navBar);
  header[0].appendChild(document.createElement("hr"));
}

/** highlight correct hyperlink and return array of all hyperlinks
 * @param {String} currentPage 
 * @returns Array */
function createHeaderHyperLinks(currentPage) {
  let hyperlinksList = [];
  for (i=0;i<Object.keys(headerInfo).length;i++) {
    let hyperlink = document.createElement("a");
    hyperlink.href = headerInfo[Object.keys(headerInfo)[i]]["url"];
    hyperlink.appendChild(document.createTextNode(headerInfo[Object.keys(headerInfo)[i]]["urlText"]));
    if (headerInfo[`${currentPage}`]["index"] === i) {
      hyperlink.classList.add("selected");
    }
    hyperlinksList.push(hyperlink);
  }
  return hyperlinksList;
}

/** create html h2 
 * @param {String} text header text
 * @returns html header object */
function createHeaderTwo(text) {
  let header = document.createElement("h2");
  header.appendChild(document.createTextNode(text));
  return header;
}

/** takes a string to reference its objects in tableInfo.json,
 * create a div for a chart
 * @param {string} index 
 * @returns */
function createChart(index) {
  let divChart = document.createElement("div");
  divChart.id = tableInfo[index]["chart"].slice(1);
  divChart.classList.add("chart");
  return divChart;
}

/** takes a string to reference its objects in tableInfo.json
 * @param {string} index 
 * @returns div element containing header and table */
function createTableHeaderDiv(index) {
  let div = document.createElement("div");
  div.appendChild(createHeaderTwo(tableInfo[index]["header"]));
  div.appendChild(createTable(index));
  return div;
}

/** create html image object, height is set to 32
 * @param {string} pictureName format="images/XX.png"
 * @returns html image node */
function createImage(pictureName) {
  let image = document.createElement('img');
  image.src = pictureName;
  image.height = 32;
  return image;
}

/** creates a type html object, can be used for internal or external hyperlinks
 * @param {String} link 
 * @returns */
function createHyperLink(link) {
  let redirect = document.createElement("a");
  redirect.appendChild(document.createTextNode(link));
  redirect.href = link;
  return redirect;
}

/** Creates internal link to the top of the webpage */
function createRedirect() {
  let redirect = document.createElement("a");
  redirect.appendChild(document.createTextNode("Top of Page"));
  redirect.href = "#mainText";
  document.body.appendChild(redirect);
}

/** Take json of track lbs and index to download and create rkg file of record or PB with proper naming scheme */
function createRKGDownload(ghosts,ghostIndex) {
  let RKGDownload = document.createElement('a'),
  ghost = ghosts[ghostIndex].finishTime;
  RKGDownload.appendChild(document.createTextNode(ghost.slice(1,9)));
  RKGDownload.href = baseURL + ghosts[ghostIndex].href;
  //RKGDownload.href = "00m46s3036969 Kasey.rkg";
  RKGDownload.target = "_blank";
  RKGDownload.download = ghost.slice(0,2)+"m"+ghost.slice(3,5)+"s"+ghost.slice(6,13)+" "+ghosts[ghostIndex].player+".rkg";
  return RKGDownload;
}

/** takes a string to reference its objects in tableInfo.json
 * @param {string} index 
 * @returns blank table */
function createTable(index) {
  let tableadd = document.createElement("table");
  tableadd.id = tableInfo[index]["id"];
  tableadd.className = tableInfo[index]["class"];
  tableadd.createTHead();
  tableadd.createTBody();
  return tableadd;
}

/** takes a string to reference its objects in tableInfo.json, 
 * makes large html div with a header and table for grid layout
 * @param {string} index 
 * @returns */
function createTableChartDiv(index) {
  let div = document.createElement("div");
  div.appendChild(createHeaderTwo(tableInfo[index]["header"]));
  let subdiv = document.createElement("div");
  subdiv.className = "inner-grid";
  subdiv.appendChild(createChart(index));
  subdiv.appendChild(createTable(index));
  div.appendChild(subdiv);
  return div;
}

/** Create csv download
 * @param {Array} allPersonalRecords 
 * @param {Array} csvList */
function createCSV(allPersonalRecords,csvList) {
  csvList.unshift(["Track Name","Category","Rank","Time","Mii","Character","Vehicle","Date","Duration","Controller","Was WR?"]);
  csvList.push([`Total Ghosts: ${allPersonalRecords.length}`," ",`Total Personal Time: ${addGhostTimes(allPersonalRecords)}`]);
  var csv = 'data:text/csv;charset=utf-8,' + csvList.map(e => e.join(",")).join("\n");
  let data = encodeURI(csv);

  let testDownload = document.createElement('a');
  testDownload.appendChild(document.createTextNode("Download Timesheet Here"));
  testDownload.id="download";
  testDownload.setAttribute('href',data);
  testDownload.setAttribute('download', 'exports.csv');
  //testDownload.click();
  document.body.appendChild(testDownload);

  let timeTotal = createHeaderTwo(`Overall Combined Time: ${addGhostTimes(allPersonalRecords)}`);
  timeTotal.id = "timeTotal";
  document.body.appendChild(timeTotal);
  let personalTotal = createHeaderTwo(`Total Times: ${allPersonalRecords.length}`);
  personalTotal.id = "personalTotal";
  document.body.appendChild(personalTotal);
}

/** creates large table header, takes a row and 11 strings */
function createTableHeader11(row,t1,t2,t3,t4,t5,t6,t7,t8,t9,t10,t11) {
  let cellt1 = row.insertCell(0),
  cellt2 = row.insertCell(1),
  cellt3 = row.insertCell(2),
  cellt4 = row.insertCell(3),
  cellt5 = row.insertCell(4),
  cellt6 = row.insertCell(5),
  cellt7 = row.insertCell(6),
  cellt8 = row.insertCell(7),
  cellt9 = row.insertCell(8),
  cellt10 = row.insertCell(9),
  cellt11 = row.insertCell(10);
  cellt1.innerHTML=t1;
  cellt2.innerHTML=t2;
  cellt3.innerHTML=t3;
  cellt4.innerHTML=t4;
  cellt5.innerHTML=t5;
  cellt6.innerHTML=t6;
  cellt7.innerHTML=t7;
  cellt8.innerHTML=t8;
  cellt9.innerHTML=t9;
  cellt10.innerHTML=t10;
  cellt11.innerHTML=t11;
}


/*****************************************************************************/
/*                              Helper Functions                             */
/*****************************************************************************/


/** sleep for a certain amount of time 1000=1 second */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** use with JS sort method, sorts Node array by its name */
function sortNodeByName(a,b) {
  return b.getName() - a.getName();
}

/** use with JS sort method, sorts Node array by its quantity */
function sortNodeByQuantity(a,b) {
  return b.getQuantity() - a.getQuantity();
}

/** can sort string or int but uses first array element whatever it is */
function sortByFirstArrayElement(a,b) {
  return b[0] - a[0];
}

/** checks if default player mii was used
 * @param {string} text 
 * @returns proper mii name */
function checkDefaultMii(text) {
  if (text==="no name") {return "Player"}
  return text;
}

/** Determine quantity of days record has stood
 * @param {Date} recordset 
 * @returns number, 0 or more */
function getRecordDuration(recordset) { //(UTC time stamp)
  return Math.floor( (Date.now() - new Date(recordset)) / (1000*60*60*24) ); //elapsed time divided by one day in milliseconds
}

/** sorts records into month they were achieved
 * @param {Array} dataset 
 * @returns array */
function getMonths(dataset) {
  let months = [0,0,0,0,0,0,0,0,0,0,0,0];
  for (let i=0;i<dataset.length;i++) {
  months[parseInt(dataset[i].slice(5,7))-1]++;
  }
  return months;
}

/** increments array element unless value isn't present and returns true/false to determine if to push in main
 * could make arrays global and be able to push from this method
 * @param {string} input 
 * @param {Array} dataset 
 * @returns boolean */
function addToArray(input,dataset) {
  for (let k=0;k<dataset.length;k++) {
    if (input===dataset[k].getName()) {
      dataset[k].add();
      return false;
    }
  }
  return 1;
}

/** takes an array and returns another array with seperate arrays of the first two columns
 * @param {Array} dataset 
 * @returns array, first array is values, second is names*/
function splitNameQuantity(dataset) {
  let one = [], two = [];
  for (let i=0;i<dataset.length;i++) {
    if (dataset[i].getQuantity()>0) {
      one.push(dataset[i].getQuantity());
      two.push(dataset[i].getName());
    }
  }
  return [one,two];
}

/** Recursive function to return correct alphabetical index. 
 * Function assumes there is another entry with the same count as the first element
 * @param {Array} dataset 
 * @param {Number} index 
 * @param {Number} lowIndex 
 * @returns index of lowest alphabet and same count */
function findLowestAlphabetical(dataset,index,lowIndex) {
  if (index+1===dataset.length) {return lowIndex;}
  else if (dataset[index].getQuantity()===dataset[index+1].getQuantity()) {
    if (dataset[lowIndex].getName()>dataset[index+1].getName()) {
      lowIndex = index+1;
    }
    return findLowestAlphabetical(dataset,index+1,lowIndex)
  }
  else {return lowIndex;}
}

/** creates an array of records per month for a given year
 * unused, was used to combine year and month into one table
 * @param {Array} dataset 
 * @param {number} year 
 * @returns json object with name and data */
function getMonthBundleByYear(dataset,year) {
  let months = [0,0,0,0,0,0,0,0,0,0,0,0];
  for (let i=0;i<dataset.length;i++) {
    if (dataset[i].slice(0,4)===year) {
      for (let m=0;m<12;m++) {
        if (parseInt(dataset[i].slice(5,7))===m+1) {
          months[m]++;
  }}}}
  return {name: year,data: months};
}

/** finds highest ranking ghost in a leaderboard for a playerID
 * @param {Array} dataset 
 * @param {string} id 
 * @param {Boolean} wholeLB //timesheet.checked
 * @returns NameQuantityNode(ghost index,rank) */
function findGhostRank(dataset,id,wholeLB) {
  let count = 0, maximum = 10; //keeps track of unique players, ie top 10
  const str = id.toUpperCase();
  if (wholeLB) {maximum = parseInt(dataset["uniquePlayers"]);}
  for (let i=0;i<dataset["ghosts"].length;i++) {
    if (dataset["ghosts"][i]["playersFastest"]) {count++;}
    if (count>maximum) {break;}
    if (dataset["ghosts"][i]["playerId"]===str) {return new NameQuantityNode(i,count);}
  }
  if (count<=10 && dataset["ghosts"].length===100) {
    console.log(dataset["name"]+" is a large LB, increase fetch size immediately."); 
  }
  console.log("player not found at: "+dataset["name"]);
  return false;
}

/** two strings style XX:XX.XXX
 * @param {string} recordTime 
 * @param {string} nonRecordTime 
 * @returns differences between record and time, can be 00:00.000 */
function calculateDifference(recordTime,nonRecordTime) {
  let milliseconds = parseInt(nonRecordTime.slice(6)) - parseInt(recordTime.slice(6)),
  remainder = 0;
  if (milliseconds<0) {
    milliseconds = 1000 - Math.abs(milliseconds);
    remainder=1;
  }
  if (milliseconds<100 && milliseconds>10) {milliseconds = "0"+milliseconds;}

  else if (milliseconds<10) {milliseconds = "00"+milliseconds;}

  else if (!milliseconds) {milliseconds = "000";}

  let seconds = parseInt(nonRecordTime.slice(3,5)) - (parseInt(recordTime.slice(3,5)) + remainder);
  remainder=0;
  if (seconds<0) {
    seconds = 60 - Math.abs(seconds);
    remainder=1;
  }
  if (seconds<10 && seconds>0) {seconds = "0"+seconds;}

  else if (!seconds) {seconds = "00";}

  let minutes = parseInt(nonRecordTime.slice(0,2)) - (parseInt(recordTime.slice(0,2)) + remainder);

  if (minutes<0) {minutes = Math.abs(minutes);}

  if (minutes+":"+seconds+"."+milliseconds==="0:00.000") {return "Is BKT";}
  return "+"+minutes+":"+seconds+"."+milliseconds;
}

let chartColors = ['#3498DB', '#F39C12', '#8E44AD','#7F8C8D','#E74C3C','#27AE60','#34495E','#F7C003','#1d32a3','#6E6696','#7C5C3C','#CD0027'];

/** creates pie chart
 * @param {string} tableIndex index for tableInfo
 * @param {Array} dataset NameQuantityNode Array */
function displayPie(tableIndex,dataset) {
  let numbers = [], titles = [];
  for (let i=0;i<dataset.length;i++) {
    numbers.push(dataset[i].getQuantity());
    titles.push(dataset[i].getName());
  }

  let options = {
    chart: {type: 'pie',width: 450},
    colors: chartColors,
    labels: titles,
    legend: {
      labels: {
        colors: chartColors,
      }
    },
    series: numbers,
  };

  let chart = new ApexCharts(document.querySelector(tableInfo[tableIndex]["chart"]), options);
  chart.render();
}

/** creates bar charts, used for years and months
 * @param {string} tableIndex tableInfo
 * @param {Array} dataset 
 * @param {Array} x values for x-axis */
function displayBar(tableIndex,dataset,x) {
  let options = {
    chart: {
      height: 350,
      type: 'bar',
      width: 500
    },
    fill: {opacity: 1},
    series: [{
      name: `Current Records set in this ${tableInfo[tableIndex]["tooltip"]}`,
      data: dataset
    }],
    xaxis: {
      categories: x,
      labels: {
        style: {
          colors: chartColors,
        }}
    },
    yaxis: {
      labels: {
        style: {
          colors:['#cc4a40'],
          fontSize: '14px',
        }
      },
      title: {
        text: 'Count',
        style: {
          color: '#cc4a40',
        }}
    }
  };

  let chart = new ApexCharts(document.querySelector(tableInfo[tableIndex]["chart"]), options);
  chart.render();
}

/** used for vehicle/character/controller tables, 
 * passed array must be sorted numerically
 * @param {string} tableName 
 * @param {Array} dataset NameQuantityNode Array
 * @param {string} title1 order matters
 * @param {string} title2  */
function displaySimpleTable(tableName,dataset,title1,title2) {
  let infoTitle = document.getElementById(tableName).getElementsByTagName('thead')[0];
  let titleRow = infoTitle.insertRow();
  let cellt1 = titleRow.insertCell(0),
  cellt2 = titleRow.insertCell(1);
  cellt1.innerHTML=title1;
  cellt2.innerHTML=title2;
  let infoList = document.getElementById(tableName).getElementsByTagName('tbody')[0];
  let playerIndex = 0; originalLength = dataset.length;

  for (let l=0;l<originalLength;l++) {
    let dataRow = infoList.insertRow();
    let cell1 = dataRow.insertCell(0), cell2 = dataRow.insertCell(1);
    if (dataset.length===1) {
      playerIndex = 0;
    }
    else if (dataset[playerIndex].getQuantity()==dataset[playerIndex+1].getQuantity()) {
      playerIndex = findLowestAlphabetical(dataset,playerIndex,playerIndex); //alphabetically sorting
    }
    cell1.innerHTML = dataset[playerIndex].getName();
    cell2.innerHTML = dataset[playerIndex].getQuantity();
    dataset.splice(playerIndex,1); //remove displayed table element
    playerIndex = 0;
  }
}

/** used for nation and player tables, 3 elements, 
 * passed array must be sorted numerically
 * @param {string} tableName 
 * @param {Array} dataset NameQuantityNode Array
 * @param {string} title1 order matters
 * @param {string} title2 
 * @param {string} title3 */
function displayTableWithPictures(tableName,dataset,title1,title2,title3) {
  let infoTitle = document.getElementById(tableName).getElementsByTagName('thead')[0];
  let titleRow = infoTitle.insertRow();
  let cellt1 = titleRow.insertCell(0),
  cellt2 = titleRow.insertCell(1),
  cellt3 = titleRow.insertCell(2);
  cellt1.innerHTML=title1;
  cellt2.innerHTML=title2;
  cellt3.innerHTML=title3;
  let infoList = document.getElementById(tableName).getElementsByTagName('tbody')[0];
  let playerIndex = 0; originalLength = dataset.length;

  for (let l=0;l<originalLength;l++) {
    let dataRow = infoList.insertRow();
    let cell1 = dataRow.insertCell(0), cell2 = dataRow.insertCell(1), cell3 = dataRow.insertCell(2);
    if (dataset.length===1) {
      playerIndex = 0;
    }
    else if (dataset[playerIndex].getQuantity()==dataset[playerIndex+1].getQuantity()) {
      playerIndex = findLowestAlphabetical(dataset,playerIndex,playerIndex); //alphabetically sorting
    }
    cell1.innerHTML = dataset[playerIndex].getName();
    cell2.innerHTML = dataset[playerIndex].getQuantity();
    cell3.appendChild(createImage(dataset[playerIndex].getImage()));
    dataset.splice(playerIndex,1); //remove displayed table element
    playerIndex = 0;
  }
}

/** top 10 longest standing records,
 * th are fixed, array is already sorted by duration so function just displays first ten elements
 * @param {Array} dataset NameQuantityNode Array */
function displayTopTen(dataset) {
  let infoTitle = document.getElementById('longList').getElementsByTagName('thead')[0];
  let titleRow = infoTitle.insertRow();
  let cellt1 = titleRow.insertCell(0),
  cellt2 = titleRow.insertCell(1),
  cellt3 = titleRow.insertCell(2),
  cellt4 = titleRow.insertCell(3),
  cellt5 = titleRow.insertCell(4);
  cellt1.innerHTML="Rank";
  cellt2.innerHTML="Duration";
  cellt3.innerHTML="Track Name: Category";
  cellt4.innerHTML="Date";
  cellt5.innerHTML="Record Holder";
  let infoList = document.getElementById('longList').getElementsByTagName('tbody')[0];
  for (let q=0;q<10;q++) {
    let infoRow = infoList.insertRow();
    let cell1 = infoRow.insertCell(0),
    cell2 = infoRow.insertCell(1),
    cell3 = infoRow.insertCell(2),
    cell4 = infoRow.insertCell(3),
    cell5 = infoRow.insertCell(4);
    cell1.innerHTML=`${q+1}`;
    cell2.innerHTML=dataset[q].getQuantity();
    cell3.innerHTML=dataset[q].getName();
    cell4.innerHTML=dataset[q].getImage();
    cell5.innerHTML=dataset[q].getPlayer();
  }
}

/** Sums simple ghost times
 * @param {Array} totalTimes 
 * @returns String, total time of all ghosts*/
function addGhostTimes(totalTimes) {
  let hours = 0, minutes = 0, seconds = 0, milliseconds = 0;
  for (let q=0;q<totalTimes.length;q++) {
    milliseconds+=parseInt(totalTimes[q].slice(6));
    if (milliseconds>=1000) {
      milliseconds-=1000;
      seconds+=1;
    }
    seconds+=parseInt(totalTimes[q].slice(3,5));
    if (seconds>=60) {
      seconds-=60;
      minutes+=1;
    }
    minutes+=parseInt(totalTimes[q].slice(1,2));
    if (minutes>=60) {
      minutes-=60;
      hours+=1;
    }
  }

  if (minutes<10) {minutes = `0${minutes}`;}
  if (seconds<10) {seconds = `0${seconds}`;}

  if (milliseconds<10) {milliseconds = `00${milliseconds}`;}
  else if (milliseconds<100) {milliseconds = `0${milliseconds}`;}

  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/** compare two strings representing times XX:XX.XXX
 * @param {string} current_glitch track time being tested
 * @param {string} not_glitch track time from no-glitch category
 * @returns boolean, true if slow glitch, false if faster glitch */
function isSlowGlitch(current_glitch,not_glitch) {
  //Minutes
  if (parseInt(current_glitch.slice(1,2))<parseInt(not_glitch.slice(1,2))) {
    return false;
  }
  if (parseInt(current_glitch.slice(1,2))>parseInt(not_glitch.slice(1,2))) {
    return true;
  }
  //Seconds
  if (parseInt(current_glitch.slice(1,2))==parseInt(not_glitch.slice(1,2)) && 
  parseInt(current_glitch.slice(3,5))>parseInt(not_glitch.slice(3,5))) {
    return true;
  }
  //Milliseconds
  if (parseInt(current_glitch.slice(1,2))==parseInt(not_glitch.slice(1,2)) && 
  parseInt(current_glitch.slice(3,5))==parseInt(not_glitch.slice(3,5)) &&
  parseInt(current_glitch.slice(6))>parseInt(not_glitch.slice(6))) {
    return true;
  }
  return false;
}

/** Checks glitch and shortcut times against surrounding json entries to see if they are fast enough
 * @param {string} category 
 * @param {json} mainLB 
 * @param {number} ghostIndex 
 * @param {number} offset either -1 for glitchs or 2 for shortcuts
 * @returns category string */
function localTrackNameTimeComparator(category,mainLB,ghostIndex,offset) {
  if (ghostIndex<mainLB["leaderboards"].length-1) {
    if (mainLB["leaderboards"][`${ghostIndex}`]["name"] === mainLB["leaderboards"][`${ghostIndex+1}`]["name"] 
                    && noShortcutCategoryIDs.includes(mainLB["leaderboards"][`${ghostIndex+1}`]["categoryId"])) {
      if (isSlowGlitch(mainLB["leaderboards"][`${ghostIndex}`]["fastestTimeSimple"],mainLB["leaderboards"][`${ghostIndex+1}`]["fastestTimeSimple"])) {return "Slower-Glitch";}
      else {return category;}

    }
  }
  if (ghostIndex<mainLB["leaderboards"].length-offset && mainLB["leaderboards"][`${ghostIndex}`]["name"] === mainLB["leaderboards"][`${ghostIndex+offset}`]["name"]) {
    if (isSlowGlitch(mainLB["leaderboards"][`${ghostIndex}`]["fastestTimeSimple"],mainLB["leaderboards"][`${ghostIndex+offset}`]["fastestTimeSimple"])) {return "Slower-Glitch";}
    else {return category;}
  }
  return category;
}

const noShortcutCategoryIDs = [0,2,6];
const glitchCategoryIDs = [1,5];
const shortcutCategoryIDs = [4,16]; //unused current as 4 is unrealible
//0,1,2,16 are 150cc
//4,5,6 are 200cc

/** Checks categoryIds to determine category and handle all API inconsistencies
 * @param {json} mainLB
 * @param {number} ghostIndex
 * @param {string} ghostIndexStr object literal of ghostIndex
 * @returns Normal, Glitch, No-Shortcut, Shortcut, Slower-Glitch */
function determineCategory(mainLB,ghostIndex,ghostIndexStr) {
  if (mainLB["leaderboards"][ghostIndexStr].hasOwnProperty("categoryId")) {
    
    if (noShortcutCategoryIDs.includes(mainLB["leaderboards"][ghostIndexStr]["categoryId"])) {
      if (mainLB["leaderboards"][ghostIndexStr]["name"]==="Coconut Mall") {return "Slower-Glitch";}
      return "No-Shortcut";
    } //No time check is neccessary on No-Shortcut categories

    if (glitchCategoryIDs.includes(mainLB["leaderboards"][ghostIndexStr]["categoryId"])) {
      return localTrackNameTimeComparator("Glitch",mainLB,ghostIndex,-1); //Glitch is returned if faster than No-Shortcut category
    }

    if (mainLB["leaderboards"][ghostIndexStr]["categoryId"] === 16) {
      return localTrackNameTimeComparator("Shortcut",mainLB,ghostIndex,2); //Shortcut is returned if faster than No-Shortcut category
    }

    if (mainLB["leaderboards"][ghostIndexStr]["categoryId"] === 4) {
      //This categoryId is misused for both shortcut times and normal times
      //Most edge cases need to be accounted for here

      if (mainLB["leaderboards"][ghostIndexStr]["name"]==="Six King Labyrinth") {return "Slower-Glitch";}

      if (ghostIndex<mainLB["leaderboards"].length-2 && mainLB["leaderboards"][ghostIndexStr]["name"]===mainLB["leaderboards"][`${ghostIndex+2}`]["name"]) {
        return localTrackNameTimeComparator("Shortcut",mainLB,ghostIndex,2);
      }

      try { 
        if (mainLB["leaderboards"][ghostIndexStr]["name"] === mainLB["leaderboards"][`${ghostIndex+1}`]["name"] 
                      && noShortcutCategoryIDs.includes(mainLB["leaderboards"][`${ghostIndex+1}`]["categoryId"])) {
          if (isSlowGlitch(mainLB["leaderboards"][ghostIndexStr]["fastestTimeSimple"],mainLB["leaderboards"][`${ghostIndex+1}`]["fastestTimeSimple"])) {return "Slower-Glitch";}
          else {return "Shortcut";}
        }
      }
      catch{console.log("Out of Bounds");}
      return "Normal";
    }

    return "None"; //should never trigger, all current categoryIds are accounted for
  }
  else {return "Normal";}
}

/*****************************************************************************/
/*                          Dark Mode Functionality                          */
/*****************************************************************************/

let darkModeText = document.getElementById("darkmode-text");

function toggleDarkMode() {
  if (localStorage.theme == null) {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) localStorage.theme = "dark";
    else localStorage.theme = "light";
  }

  if (localStorage.theme === "light") {
    localStorage.theme = "dark";
    document.documentElement.dataset.theme = "dark";
    darkModeText.innerText = "Light Mode";
  }
  else {
    localStorage.theme = "light";
    delete document.documentElement.dataset.theme; 
    darkModeText.innerText = "Dark Mode";
  }
}

addEventListener("DOMContentLoaded", () => {
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.dataset.theme = "dark";
    darkModeText.innerText = "Light Mode";
  }
})

/*****************************************************************************/
/*                          Switch Case Statments                            */
/*****************************************************************************/

/** converts controller (int) to a controller name
 * @param {Number} x 
 * @returns controller string */
function getController(x) {
  switch (x) {
      case 0: return "Wii Wheel";
      case 1: return "Nunchuk";
      case 2: return "Classic";
      case 3: return "Gamecube";
      default: return "Unknown";
}}

/** converts vehicleId (int) to a vehicle name; karts 0-17; bikes 18-35
 * @param {Number} x 
 * @returns vehicle string */
function getVehicle(x) {
  switch (x) {
      case 0: return "Standard Kart S";
      case 1: return "Standard Kart M";
      case 2: return "Standard Kart L";
      case 3: return "Booster Seat";
      case 4: return "Classic Dragster";
      case 5: return "Offroader";
      case 6: return "Mini Beast";
      case 7: return "Wild Wing";
      case 8: return "Flame Flyer";
      case 9: return "Cheep Charger";
      case 10: return "Super Blooper";
      case 11: return "Piranha Prowler";
      case 12: return "Tiny Titan";
      case 13: return "Daytripper";
      case 14: return "Jetsetter";
      case 15: return "Blue Falcon";
      case 16: return "Sprinter";
      case 17: return "Honeycoupe";
      case 18: return "Standard Bike S";
      case 19: return "Standard Bike M";
      case 20: return "Standard Bike L";
      case 21: return "Bullet Bike";
      case 22: return "Mach Bike";
      case 23: return "Flame Runner";
      case 24: return "Bit Bike";
      case 25: return "Sugarscoot";
      case 26: return "Wario Bike";
      case 27: return "Quacker";
      case 28: return "Zip Zip";
      case 29: return "Shooting Star";
      case 30: return "Magikruiser";
      case 31: return "Sneakster";
      case 32: return "Spear";
      case 33: return "Jet Bubble";
      case 34: return "Dolphin Dasher";
      case 35: return "Phantom";
      default: return "Unknown";
}}

/** converts driverId (int) to a character name;
 * order is random; numbers [28-29,34-35,40-47] are unobtainable
 * @param {Number} x 
 * @returns character string */
function getCharacter(x) {
  switch (x) {
      case 0: return "Mario";
      case 1: return "Baby Peach";
      case 2: return "Waluigi";
      case 3: return "Bowser";
      case 4: return "Baby Daisy";
      case 5: return "Dry Bones";
      case 6: return "Baby Mario";
      case 7: return "Luigi";
      case 8: return "Toad";
      case 9: return "Donkey Kong";
      case 10: return "Yoshi";
      case 11: return "Wario";
      case 12: return "Baby Luigi";
      case 13: return "Toadette";
      case 14: return "Koopa Troopa";
      case 15: return "Daisy";
      case 16: return "Peach";
      case 17: return "Birdo";
      case 18: return "Diddy Kong";
      case 19: return "King Boo";
      case 20: return "Bowser Jr.";
      case 21: return "Dry Bowser";
      case 22: return "Funky Kong";
      case 23: return "Rosalina";
      case 24: return "Small Mii Outfit A Male";
      case 25: return "Small Mii Outfit A Female";
      case 26: return "Small Mii Outfit B Male";
      case 27: return "Small Mii Outfit B Female";
      case 28: return "Small Mii Outfit C Male";
      case 29: return "Small Mii Outfit C Female";
      case 30: return "Medium Mii Outfit A Male";
      case 31: return "Medium Mii Outfit A Female";
      case 32: return "Medium Mii Outfit B Male";
      case 33: return "Medium Mii Outfit B Female";
      case 34: return "Medium Mii Outfit C Male";
      case 35: return "Medium Mii Outfit C Female";
      case 36: return "Large Mii Outfit A Male";
      case 37: return "Large Mii Outfit A Female";
      case 38: return "Large Mii Outfit B Male";
      case 39: return "Large Mii Outfit B Female";
      case 40: return "Large Mii Outfit C Male";
      case 41: return "Large Mii Outfit C Female";
      case 42: return "Medium Mii";
      case 43: return "Small Mii";
      case 44: return "Large Mii";
      case 45: return "Peach Biker Outfit";
      case 46: return "Daisy Biker Outfit";
      case 47: return "Rosalina Biker Outfit";
      default: return "Unknown";
}}