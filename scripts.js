const noShortcutCategoriyIDs = [2,6],
shortcutCategories = ["GCN DK Mountain","Incendia Castle"],
slowCategories = ["N64 Bowser's Castle","Mushroom Gorge","GCN Mario Circuit","Toad's Factory","DS Desert Hills"];
//arrays for determining categories for edge cases

function loadLeaderboard(load) {
  buildWebpage()
  fetch(load).then(mainRes => {mainRes.json().then(mainLB =>{this.mainLB = mainLB;
  let urlList = ['https://tt.chadsoft.co.uk'+this.mainLB["leaderboards"]["0"]["_links"]["item"]["href"]+'?limit=1'];
  for (let i=1;i<mainLB["leaderboards"].length;i++) { //must use https://
    urlList.push('https://tt.chadsoft.co.uk'+this.mainLB["leaderboards"][`${i}`]["_links"]["item"]["href"]+'?limit=1');
  }

  let fetches = urlList.map(url => fetch(url).then(res => res.json()));
  Promise.allSettled(fetches)
    .then((results) => {

      let infoTitle = document.getElementById('main').getElementsByTagName('thead')[0];
      let titleRow = infoTitle.insertRow();
      let cellt1 = titleRow.insertCell(0),
      cellt2 = titleRow.insertCell(1),
      cellt3 = titleRow.insertCell(2),
      cellt4 = titleRow.insertCell(3),
      cellt5 = titleRow.insertCell(4),
      cellt6 = titleRow.insertCell(5),
      cellt7 = titleRow.insertCell(6),
      cellt8 = titleRow.insertCell(7),
      cellt9 = titleRow.insertCell(8),
      cellt10 = titleRow.insertCell(9),
      cellt11 = titleRow.insertCell(10);
      cellt1.innerHTML="Track Name";
      cellt2.innerHTML="Category";
      cellt3.innerHTML="Time";
      cellt4.innerHTML="Player Name";
      cellt5.innerHTML="Mii";
      cellt6.innerHTML="Nation";
      cellt7.innerHTML="Character";
      cellt8.innerHTML="Vehicle";
      cellt9.innerHTML="Controller";
      cellt10.innerHTML="Date";
      cellt11.innerHTML="Duration";
      let myTable = document.getElementById("main").getElementsByTagName('tbody')[0];
      //create header row and init body row

      let category = 'Normal', allDates = [], allYears = [["2017",0]],
      playerTally = [['Unknown',0,"images/unknown.png"]], countryTally = [['Un',0,"images/unknown.png"]],
      vehicleTally = [['Unknown',0]], characterTally = [['Unknown',0]], controllerTally = [['Unknown',0]],
      glitchTally = [['Unknown',0,"images/unknown.png"]], noGlitchTally = [['Unknown',0,"images/unknown.png"]],
      orderedDuration = [["Unknown",0,"Unknown","Unknown"]];
      //declare category and arrays with a default value for html tables

      for (let j=0;j<mainLB["leaderboards"].length;j++) {

        let index = `${j}`; //previous=`${j-1}`, doubleprevious=`${j-2}`, next=`${j+1}`, doublenext=`${j+2}`
        let recordTime = mainLB["leaderboards"][index]["fastestTimeSimple"]; //00:00.000
        let recordDate = mainLB["leaderboards"][index]["fastestTimeLastChange"]; //UTC Time Date

        if (j>1) {category = determineCategory(mainLB,recordTime,index,j)}

        if (category==="Slower-Glitch") {continue;} //prevent slow glitches from displaying on leaderboard

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
        //One row and 11 columns for each track and category

        if (results[index]["status"] === "fulfilled") {
          let player = getPlayerIDAndRegion(results[index]["value"]["ghosts"]["0"]["playerId"]),
          currentVehicle=getVehicle(results[index]["value"]["ghosts"]["0"]["vehicleId"]),
          currentCharacter=getCharacter(results[index]["value"]["ghosts"]["0"]["driverId"]),
          currentController=getController(results[index]["value"]["ghosts"]["0"]["controller"]),
          duration = getRecordDuration(recordDate);
          //getting strings from switch case statements

          if (toBeAdded = addToArray(player[0],playerTally)) {playerTally.push([player[0],1,player[1]])}
          if (toBeAdded = addToArray(player[1].slice(7,9),countryTally)) {countryTally.push([player[1].slice(7,9),1,player[1]])}
          if (toBeAdded = addToArray(currentVehicle,vehicleTally)) {vehicleTally.push([currentVehicle,1])}
          if (toBeAdded = addToArray(currentCharacter,characterTally)) {characterTally.push([currentCharacter,1])}
          if (toBeAdded = addToArray(recordDate.slice(0,4),allYears)) {allYears.push([recordDate.slice(0,4),1])}
          if (category==="Glitch") {
            if (toBeAdded = addToArray(player[0],glitchTally)) {glitchTally.push([player[0],1,player[1]])}
          }
          else {
            if (toBeAdded = addToArray(player[0],noGlitchTally)) {noGlitchTally.push([player[0],1,player[1]])}
          }
          //array.push doesn't seem to work in a function

          if (currentController==="Gamecube") {
            if (results[index]["value"]["ghosts"]["0"]["usbGcnAdapterAttached"]) {
              currentController="USB-GCN"; //intercept USB-GCN before addToArray
            }
          }
          recordDate=recordDate.slice(0,10);
          allDates.push(recordDate);
          if (toBeAdded = addToArray(currentController,controllerTally)) {controllerTally.push([currentController,1])}
          orderedDuration.push([mainLB["leaderboards"][index]["name"]+": "+category,duration,recordDate,player[0]]);

          cell1.innerHTML = mainLB["leaderboards"][index]["name"];
          cell2.innerHTML = category;
          cell3.innerHTML = recordTime.slice(1); //removes initial 0
          cell4.innerHTML = player[0];
          cell5.innerHTML = results[index]["value"]["ghosts"]["0"]["player"]; //mii name
          cell6.appendChild(createImage(player[1]));
          cell7.innerHTML = currentCharacter;
          cell8.innerHTML = currentVehicle;
          cell9.innerHTML = currentController;
          cell10.innerHTML = recordDate;
          cell11.innerHTML = duration;
        }
        else if (results[index]["status"] === "rejected") {
          //display generic track info with main leaderboard if a track leaderboard fails
          cell1.innerHTML = mainLB["leaderboards"][index]["name"];
          cell2.innerHTML = category;
          cell3.innerHTML = recordTime.slice(1);
          cell4.innerHTML = "-";
          cell5.innerHTML = "Failed";
          cell6.innerHTML = "to";
          cell7.innerHTML = "fetch";
          cell8.innerHTML = "ghost";
          cell9.innerHTML = "-";
          cell10.innerHTML = recordDate.slice(0,10);
          cell11.innerHTML = getRecordDuration(recordDate);
          console.log('Failed Fetching Record for: '+mainLB["leaderboards"][index]["name"]);
        }
      }
      orderedDuration.sort(sortByQ2); countryTally.sort(sortByQ2); vehicleTally.sort(sortByQ2); characterTally.sort(sortByQ2);
      controllerTally.sort(sortByQ2); playerTally.sort(sortByQ2); glitchTally.sort(sortByQ2); noGlitchTally.sort(sortByQ2);
      allYears.sort(sortByQ1); //numerically sorting 
      document.getElementById("totalCount").textContent=`Total Records: ${allDates.length}`;

      displayPie("vehicle",vehicleTally);
      displayPie("character",characterTally);
      displayPie("controller",controllerTally);
      displayPie("country",countryTally);
      
      displayTopTen(orderedDuration);
      displayTableWithPictures("playerList",playerTally,"Player Name","Total Records","Nation");
      displayTableWithPictures("glitchList",glitchTally,"Player Name","Total Records","Nation");
      displayTableWithPictures("noGlitchList",noGlitchTally,"Player Name","Total Records","Nation");
      displayTableWithPictures("countryList",countryTally,"Country","Total Records","Flag");
      displaySimpleTable("vehicleList",vehicleTally,"Vehicle","Total");
      displaySimpleTable("characterList",characterTally,"Character","Total");
      displaySimpleTable("controllerList",controllerTally,"Controller","Total");

      let yearSplit = splitTwoColumn(allYears);
      displayBar("years",yearSplit[0],yearSplit[1]);
      displayBar("dates",getMonths(allDates),["Jan","Feb","Mar","Apr","May","June","July","Aug","Sep","Oct","Nov","Dec"]);
      createRedirect();
  })
    .catch((err) => {
      console.log(err);
      console.log("Failed Fetching Main Leaderboard or another Fatal Error");
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
    "header": "Player Totals: Glitch"
  },
  "noGlitch":{
    "id": "noGlitchList",
    "class": "skinny-table",
    "header": "Player Total: No-glitch"
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

/** create html elements common across all leaderboards */
function buildWebpage() {
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
  datesDiv = document.createElement("div");
  datesDiv.appendChild(createChart("dates"));
  chronoDiv.appendChild(yearsDiv);
  headerDiv = document.createElement("div");
  let totalCount = document.createElement("h2");
  totalCount.id = "totalCount";
  totalCount.appendChild(document.createTextNode("0"));
  headerDiv.appendChild(totalCount);
  headerDiv.appendChild(createHeaderTwo("Current Date: "+`${new Date().getMonth()+1}`+"/"+`${new Date().getDate()}`+"/"+`${new Date().getFullYear()}`));
  headerDiv.appendChild(createHeaderTwo("Records by Year and Month"));
  chronoDiv.appendChild(headerDiv);
  chronoDiv.appendChild(datesDiv);
  document.body.appendChild(chronoDiv);
}

/** create h2 element */
function createHeaderTwo(text) {
  let statHeader = document.createElement("h2");
  statHeader.appendChild(document.createTextNode(text));
  return statHeader;
}

/** create a div for a chart
 * @param {string} index 
 * @returns */
function createChart(index) {
  let divChart = document.createElement("div");
  divChart.id = tableInfo[index]["chart"].slice(1);
  return divChart;
}

/** uses index for tableInfo
 * @param {string} index 
 * @returns div element containing header and table */
function createTableHeaderDiv(index) {
  let div = document.createElement("div");
  div.appendChild(createHeaderTwo(tableInfo[index]["header"]));
  div.appendChild(createTable(index));
  return div;
}

/** create html image object
 * @param {string} pictureName format="images/XX.png"
 * @returns html image node */
function createImage(pictureName) {
  let image = document.createElement('img');
  image.src = pictureName;
  image.height = 32;
  return image;
}

/** Creates internal link to the top of the webpage */
function createRedirect() {
  let redirect = document.createElement("a");
  redirect.appendChild(document.createTextNode("Top of Page"));
  redirect.href = "#mainText";
  document.body.appendChild(redirect);
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

/** takes a string to reference its objects in tableInfo.json
 * makes a div with a header and table for grid layout
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


/*****************************************************************************/
/*                              Helper Functions                             */
/*****************************************************************************/


/** Determine quantity of days record has stood
 * @param {Date} recordset 
 * @returns number, 0 or more */
function getRecordDuration(recordset) { //(UTC time stamp)
  return Math.floor( (Date.now() - new Date(recordset)) / (1000*60*60*24) ); //elapsed time divided by one day in milliseconds
}

/** sorts nested array by its first element */
function sortByQ1(a,b) {
  return b[0] - a[0];
}

/** sorts nested array by its second element */
function sortByQ2(a,b) {
  return b[1] - a[1];
}

/** recursive function to return correct alphabetical index
 * @param {Array} dataset 
 * @param {Number} index 
 * @returns index */
function findLowestAlphabetical(dataset,index) {
  if (dataset[index][1]===dataset[index+1][1]) {return findLowestAlphabetical(dataset,index+1)}
  if (dataset[index][0]<dataset[index-1][0]) {return index;}
  else {return index-1;}
}

/** sorts records into month they were achieved
 * @param {Array} dataset 
 * @returns array*/
function getMonths(dataset) {
  let months = [0,0,0,0,0,0,0,0,0,0,0,0];
  for (let i=0;i<dataset.length;i++) {
  months[parseInt(dataset[i].slice(5,7))-1]++;
  }
  return months;
}

/** increments array element unless value isn't present and returns true/false to determine if to push in main
 * @param {string} input 
 * @param {Array} dataset 
 * @returns boolean */
function addToArray(input,dataset) {
  for (let k=0;k<dataset.length;k++) {
    if (input===dataset[k][0]) {
      dataset[k][1]+=1;
      return false;
    }
  }
  return 1;
}

/** takes an array and returns another array with seperate arrays of the first two columns
 * @param {Array} dataset 
 * @returns array */
function splitTwoColumn(dataset) {
  let one = [], two = [];
  for (let i=0;i<dataset.length;i++) {
    if (dataset[i][1]>0) {
      one.push(dataset[i][1]);
      two.push(dataset[i][0]);
    }
  }
  return [one,two];
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
        }
      }
    }
  }
  return {name: year,data: months};
}

/** creates pie chart
 * @param {string} tableIndex index for tableInfo
 * @param {Array} dataset nested array */
function displayPie(tableIndex,dataset) {
  let numbers = [], titles = [];
  for (let i=0;i<dataset.length-1;i++) {
    numbers.push(dataset[i][1]);
    titles.push(dataset[i][0]);
  }

  let options = {
    colors:['#3498DB', '#F39C12', '#8E44AD','#7F8C8D','#E74C3C','#27AE60','#34495E','#F7DC6F'],
    series: numbers,
    chart: {width: 450,type: 'pie'},
    labels: titles
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
    series: [{
      name: `Current Records set in this ${tableInfo[tableIndex]["tooltip"]}`,
      data: dataset
    }],
    chart: {
    type: 'bar',
    height: 350,
    width: 500
  },
  xaxis: {categories: x},
  yaxis: {title: {text: 'Count'}},
  fill: {opacity: 1}
  };

  let chart = new ApexCharts(document.querySelector(tableInfo[tableIndex]["chart"]), options);
  chart.render();
}

/** used for vehicle/character/controller tables, 
 * function does alphabetic and numerical sorting itself
 * @param {string} tableName 
 * @param {Array} dataset array of arrays ['name',total]
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

  for (let l=0;l<originalLength-1;l++) {
    let dataRow = infoList.insertRow();
    let cell1 = dataRow.insertCell(0), cell2 = dataRow.insertCell(1);
    if (dataset[playerIndex][1]==dataset[playerIndex+1][1]) {
      playerIndex = findLowestAlphabetical(dataset,playerIndex);
    }
    cell1.innerHTML = dataset[playerIndex][0];
    cell2.innerHTML = dataset[playerIndex][1];
    dataset.splice(playerIndex,1);
    playerIndex = 0;
  }
}

/** used for nation and player tables, 3 elements, 
 * function does alphabetic and numerical sorting itself
 * @param {string} tableName 
 * @param {Array} dataset array of arrays ['name',total,'flag']
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

  for (let l=0;l<originalLength-1;l++) {
    let dataRow = infoList.insertRow();
    let cell1 = dataRow.insertCell(0), cell2 = dataRow.insertCell(1), cell3 = dataRow.insertCell(2);
    if (dataset[playerIndex][1]==dataset[playerIndex+1][1]) {
      playerIndex = findLowestAlphabetical(dataset,playerIndex);
    }
    cell1.innerHTML = dataset[playerIndex][0];
    cell2.innerHTML = dataset[playerIndex][1];
    cell3.appendChild(createImage(dataset[playerIndex][2]));
    dataset.splice(playerIndex,1);
    playerIndex = 0;
  }
}

/** top 10 longest standing records,
 * th are fixed, array is already sorted so function just displays first ten elements
 * @param {Array} dataset array of arrays */
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
    cell2.innerHTML=dataset[q][1];
    cell3.innerHTML=dataset[q][0];
    cell4.innerHTML=dataset[q][2];
    cell5.innerHTML=dataset[q][3];
  }
}

/** takes two strings representing record times XX:XX.XXX
 * @param {string} current_glitch track time being tested
 * @param {string} not_glitch track time from no-glitch category
 * @returns boolean */
function isSlowGlitch(current_glitch,not_glitch) { //compares two values of type 02:22.222
  //Minutes
  if (parseInt(current_glitch.slice(1))<parseInt(not_glitch.slice(1))) {
    return false;
  }
  if (parseInt(current_glitch.slice(1))>parseInt(not_glitch.slice(1))) {
    return true;
  }
  //Seconds
  if (parseInt(current_glitch.slice(1))==parseInt(not_glitch.slice(1)) && 
  parseInt(current_glitch.slice(3))>parseInt(not_glitch.slice(3))) {
    return true;
  }
  if (parseInt(current_glitch.slice(1))==parseInt(not_glitch.slice(1)) && 
  parseInt(current_glitch.slice(3))==parseInt(not_glitch.slice(3)) && 
  parseInt(current_glitch.slice(4))>parseInt(not_glitch.slice(4))) {
    return true;
  }
  //Milliseconds
  if (parseInt(current_glitch.slice(1))==parseInt(not_glitch.slice(1)) && 
  parseInt(current_glitch.slice(3))==parseInt(not_glitch.slice(3)) && 
  parseInt(current_glitch.slice(4))==parseInt(not_glitch.slice(4)) && 
  parseInt(current_glitch.slice(6))>parseInt(not_glitch.slice(6))) {
    return true;
  }
  if (parseInt(current_glitch.slice(1))==parseInt(not_glitch.slice(1)) && 
  parseInt(current_glitch.slice(3))==parseInt(not_glitch.slice(3)) && 
  parseInt(current_glitch.slice(4))==parseInt(not_glitch.slice(4)) && 
  parseInt(current_glitch.slice(6))==parseInt(not_glitch.slice(6)) &&
  parseInt(current_glitch.slice(7))>parseInt(not_glitch.slice(7))) {
    return true;
  }
  if (parseInt(current_glitch.slice(1))==parseInt(not_glitch.slice(1)) && 
  parseInt(current_glitch.slice(3))==parseInt(not_glitch.slice(3)) && 
  parseInt(current_glitch.slice(4))==parseInt(not_glitch.slice(4)) && 
  parseInt(current_glitch.slice(6))==parseInt(not_glitch.slice(6)) &&
  parseInt(current_glitch.slice(7))==parseInt(not_glitch.slice(7)) &&
  parseInt(current_glitch.slice(8))>parseInt(not_glitch.slice(8))) {
    return true;
  }
  return false;
}

/** Checks leaderboard name against surrounding names to determine a tracks category
 * options are Normal,No-Glitch,Glitch,No-Shortcut,Shortcut,Slower-Glitch
 * @param {json} mainLB 
 * @param {string} recordTime used to pass to slowGlitch function
 * @param {string} index object literal of j
 * @param {number} j index=j
 * @returns a string containing a tracks category */
function determineCategory(mainLB,recordTime,index,j) {
  let category;
  if (mainLB["leaderboards"][index]["name"]===mainLB["leaderboards"][`${j-1}`]["name"]) {//if current name = previous name

    category = 'Glitch';
    if (isSlowGlitch(recordTime,mainLB["leaderboards"][`${j-1}`]["fastestTimeSimple"])) {category = "Slower-Glitch";}

    try {
      if (noShortcutCategoriyIDs.includes(mainLB["leaderboards"][index]["categoryId"])) {
        category = "No-Shortcut";
      }
    }
    catch(err) {console.log("Error handled: categoryId not present");}

    if (slowCategories.includes(mainLB["leaderboards"][index]["name"],2)) {category = "Normal";}

    if (mainLB["leaderboards"][index]["name"]===mainLB["leaderboards"][`${j-2}`]["name"]) {
      if (slowCategories.includes(mainLB["leaderboards"][index]["name"])) {category = "Normal";}
    }
  } 

  else if (mainLB["leaderboards"][index]["name"]===mainLB["leaderboards"][`${j+1}`]["name"]) {//if current name = next name

    category = 'No-Glitch';
    if (isSlowGlitch(mainLB["leaderboards"][`${j+1}`]["fastestTimeSimple"],recordTime)) {category = "Normal";}

    if (j<mainLB["leaderboards"].length-2) {
      if (mainLB["leaderboards"][index]["name"]===mainLB["leaderboards"][`${j+2}`]["name"] || 
        shortcutCategories.includes(mainLB["leaderboards"][index]["name"])) {category = "Shortcut";}
    }

    try {//used for six king and would work for 150cc Nintendo's
      if (mainLB["leaderboards"][index]["categoryId"]===16) {category = "Shortcut";}
    }
    catch(err) {console.log("Error handled: categoryId not present");}

    if (slowCategories.includes(mainLB["leaderboards"][index]["name"])) {category = "Slower-Glitch";}

    if (mainLB["leaderboards"][index]["name"]==="Six King Labyrinth" && mainLB["leaderboards"][index]["200cc"]) {category = "Slower-Glitch";}

  }
  else {category = 'Normal';}
  return category;
}


/*****************************************************************************/
/*                          Switch Case Statments                            */
/*****************************************************************************/


//default value is unknown and will show up in stats table as unknown with proper tally

/** convert controller (int) to actual controller (string)
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

/** converts vehicleId to actual vehicle, karts 1-17, bikes 18-35
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

/** Takes an int (driverId) and converts to character
 * the first half is seemingly random and I don't think 42-47 are valid
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

/** All current record holders and some former are present
 * Giant switch case to convert playerId to player name and country
 * Add another case for new player records or new playerID for existing player
 * Players often use hard to recognize mii names or incorrect regions when setting records
 * @param {Number} x 
 * @returns array ["player","images/XX.png"] */
function getPlayerIDAndRegion(x) {
  switch (x) {
    case '39B00EEE8050C7F5': return ["Doge","images/US.png"];
    case '51152E6C037842FB': return ["Lawrence","images/US.png"];
    case '0AAE4F3020A206E5': return ["Emil","images/US.png"];
    case '1F401154EB4C8882': return ["Kasey","images/US.png"];
    case 'D04D186FC8E58F13': return ["Abhilash","images/US.png"];
    case '3794AED8D510C2DF': return ["L??k??","images/GB.png"];
    case '414A92F8CA12B4B7': return ["Ice","images/DK.png"];
    case 'B87AC5F4E0D51ABD': return ["Jake","images/US.png"];
    case 'D4609DB8549BBAF2': return ["Enzo","images/NL.png"];
    case 'D31D0B090D52771B': return ["HiahowareU","images/GB.png"];
    case 'AA060CB527F22D33': return ["Boshi","images/CA.png"];
    case '39D91B1B8028227C': return ["Thunder","images/US.png"];
    case 'E9F41458EFDBEDE6': return ["Soon","images/US.png"];
    case '365CE091FB3C78BA': return ["Daseia","images/GR.png"];
    case '6D50919C1845009D': return ["Justin","images/US.png"];
    case '408FC6D7350F9236': return ["Carter","images/US.png"];
    case '5F59DD451DEC7880': return ["Boodog","images/US.png"];
    case 'CBF0CD7528C9C863': return ["Hintz","images/DE.png"];
    case 'E7003EE0EFA24466': return ["Fernandez","images/US.png"];
    case '92C14478FD19D33F': return ["Brody","images/US.png"];
    case '25E7273F221A5B3E': return ["Nota","images/US.png"];
    case '89DE32ADDA0E26FF': return ["Fatality","images/GB.png"];
    case 'F3121BC1347B7C4F': return ["Bluesharp","images/GB.png"];
    case '588538604751E9A3': return ["c????","images/US.png"];
    case '7FF7D058E3292F98': return ["Ray","images/US.png"];
    case 'B7D14921A52DDC10': return ["Steve","images/US.png"];
    case '0D3E582048BC9B45': return ["Vesfef","images/FR.png"];
    case '0F7423A3B5690C6A': return ["Watcha","images/DE.png"];
    case 'BC2F105ACD1B9CFA': return ["Eve","images/US.png"];
    case '3735C6FE62F34E96': return ["Weexy","images/NL.png"];
    case '46EC81CA40C4B022': return ["Shun","images/JP.png"];
    case '4FB442A70CE05EBC': return ["Cl??ment","images/FR.png"];
    case '858060403046B78E': return ["Eli","images/US.png"];
    case 'FAB24E137904F1B7': return ["Kei","images/JP.png"];
    case 'C8BC615C45A5452E': return ["Mikul","images/US.png"];
    case '913B7D0CD8383910': return ["Noah","images/DK.png"];
    case '7EB2C558D30BFE32': return ["M??s????g????","images/US.png"];
    case '8FDE8A2421594852': return ["Peyton","images/US.png"];
    case '658EE53D8CE3B4C8': return ["Streedrop","images/CA.png"];
    case '0B30901E3D1BF5FC': return ["Cosmo","images/CH.png"];
    case 'BD2D1CCF8B642319': return ["Noam","images/IL.png"];
    case '2D323E33C08CD426': return ["Clay","images/US.png"];
    case '3010507BFDF643E7': return ["Arjun","images/US.png"];
    case '029554DECB3F79EE': return ["Vincent","images/US.png"];
    case '45120F275D291BFB': return ["Alex Croteau","images/US.png"];
    case 'D35CD0F2F6576A47': return ["Police","images/US.png"];
    case '95C6241CCE24A853': return ["Batcake","images/US.png"];
    case '890E6F8CCB86DA53': return ["Reece","images/US.png"];
    case '9E0D6D2FBC109C35': return ["Flurry","images/US.png"];
    case '855843F84CCF6FEB': return ["Laty","images/US.png"];
    case 'BA141C33DD30F62B': return ["J??ik??","images/US.png"];
    case '611AF70B6321DE01': return ["Zane","images/US.png"];
    case '2E9390843D29256E': return ["Ivan","images/US.png"];
    case '7F1981604F0044A2': return ["Swampy","images/US.png"];
    case 'FCA8B6A3913B4B6E': return ["Dante","images/GB.png"];
    case 'A108AA2B7BF8D07E': return ["J??K","images/US.png"];
    case '773622CDCD37643D': return ["Ace","images/GB.png"];
    case '2213E98F05362266': return ["Steve","images/GR.png"];
    case '8D5E9B25C4754392': return ["Zilla","images/CA.png"];
    case 'CCD7533B6AC242ED': return ["Supreme","images/US.png"];
    case 'B2AD3F4AE4DDE118': return ["Dxrk","images/DE.png"];
    case '2B5181110E294547': return ["Kit","images/CA.png"];
    case '22475C923D0935C9': return ["Sardine","images/US.png"];
    case '61B745D2CE98F5E0': return ["David","images/GB.png"];
    case '7ED82242442D6B1A': return ["64","images/US.png"];
    case '07C2E13F252B1E34': return ["xWill","images/US.png"];
    case 'F298827F8B5B6A39': return ["John G","images/US.png"];
    case '079F6251C30B49C3': return ["Zuspii","images/US.png"];
    case 'B2F19557B40DB4E0': return ["Nix","images/LU.png"];
    case '40E78839761C0BCF': return ["Orca","images/GB.png"];
    case 'BEFFC1EDEF914AE7': return ["Sgt","images/CA.png"];
    case 'EC855BCF8FE000E2': return ["Booshi","images/FR.png"];
    case '79464E926AE9EECD': return ["Fraterz","images/US.png"];
    case '1F63CE364696FE18': return ["Fantasy","images/US.png"];
    case 'A76198BDC4A3CF95': return ["Hades","images/US.png"];
    case 'C4FB9639F94E8626': return ["Justin.","images/US.png"];
    case '89D95A0CF12C9266': return ["Antonini","images/NL.png"];
    case 'D86C27682F812A2C': return ["Abby","images/US.png"];
    case 'D6A08AABAF569EC3': return ["Carson","images/US.png"];
    case '0F91061953FAD1EB': return ["Ant","images/DZ.png"];
    case '743B83BE3EC57EEB': return ["Kaden","images/GB.png"];
    case '73B48F99FD87462F': return ["Yoshi","images/US.png"];
    case '6C3E0B961B386F1E': return ["Marky","images/DK.png"];
    case '013D172DE491D535': return ["Etterbeer","images/NL.png"];
    case '1C6A832CF6B30CFF': return ["ElecTrick","images/IE.png"];
    case 'B005F110C1FEC1E6': return ["C??sar","images/ES.png"];
    case 'CFE32EBDFA830703': return ["Jake","images/AU.png"];
    case 'BFA9A17E2DDFAE6B': return ["8Click","images/NL.png"];
    case '4BCE2DB0FBB930F5': return ["Consumify","images/GB.png"];
    case '5E432F21F57C5488': return ["End","images/GB.png"];
    case 'BD196411C5B1CBB1': return ["Lucker","images/DE.png"];
    case '5D5CCC435A8F3E60': return ["Masako","images/DE.png"];
    case '5856762B07EFCABB': return ["Type","images/JP.png"];
    case '24DD2108D9B206AD': return ["Harris","images/US.png"];
    case '3E8945E21441A100': return ["Shiv","images/FR.png"];
    case 'B1BB4369EDE01041': return ["Kalium","images/CA.png"];
    case 'C25230E4C4BF8F74': return ["Kilopoppy","images/CA.png"];
    case 'DB7FF699E92272BB': return ["Jorge","images/US.png"];
    case 'FE0455C11D1CD609': return ["Grantham","images/US.png"];
    case 'EE91F250E359EC6E': return ["Naomi","images/US.png"];
    case 'A2AC24D447CA7BCA': return ["Sal","images/IT.png"];
    case 'B6126BA79DD1FD01': return ["Echo","images/US.png"];
    case '95E6C190EE7D9C29': return ["AlexSX","images/US.png"];
    case '350784CA5B2A19E2': return ["Lucas","images/CA.png"];
    case '8E1D33C70B7677B5': return ["Thunda","images/CA.png"];
    case '4054922A89F5551F': return ["Besart","images/AL.png"];
    case '6017D742145FCFD2': return ["Radar","images/CA.png"];
    case 'DDE38FD0B8E94933': return ["Cow Man","images/CA.png"];
    case '3DB7AE8FA5999056': return ["Day E","images/US.png"];
    case '86BEBF7D493903C9': return ["PowerTower","images/US.png"];
    case 'C1F9D44DE9E4957B': return ["Falco","images/AU.png"];
    case 'CC37DD1F13C5ED89': return ["KingAlex","images/CA.png"];
    case '9B376538E2E5D4AF': return ["Bryce","images/US.png"];
    case '4053C39B13F3BD24': return ["Carter C.","images/US.png"];
    case '1EC3384B8D39B684': return ["MasterJCP","images/US.png"];
    case '0243BB4D89833F9D': return ["Adc","images/US.png"];
    case 'BA3BCE569962814B': return ["BossBoy28","images/US.png"];
    case '708BBB3EE59D227F': return ["Core","images/GB.png"];
    case '487447841A8CB10A': return ["SpitFire","images/US.png"];
    case '532C35DD09E2A5C8': return ["Kevin G.","images/US.png"];
    case '47F412EAC1AC604F': return ["Sam","images/GB.png"];
    case 'FDC8971B80CC9823': return ["Abby","images/US.png"];
    case '7C625EF944C73FEA': return ["Emiddle","images/PH.png"];
    case '8B2AA1EB59B08E78': return ["Neptune","images/US.png"];
    case '360C3C594874BE50': case 'E73C5E6305FE5AAF': return ["Jogn","images/US.png"];
    case '92F70E480F1407FD': case 'F60AF6D0EB38BB06': return ["Charlie","images/US.png"];
    case 'D0E4D8B03A9A5849': case 'D0164155D1E00C2F': return ["Sawyer","images/US.png"];//using stubbz old wii
    case '6C37FC09DD67E33B': case '271EC09BB2E937BB': return ["Bickbork","images/US.png"];
    case '40B20BE4FD8CA88C': case 'AEEB0474F0DEABF8': case 'D8EEEF0F2872E83F': return ["????g??????","images/JP.png"];
    case '2240C482ADD7E0D3': case '2CC8A5568F7A106B': case '8A1F856DCE285FEF': return ["Scorpi","images/GB.png"];
    default: return ["Unknown","images/unknown.png"];
}}