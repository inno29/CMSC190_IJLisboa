const ee = require("@google/earthengine");
const cors = require('cors');
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path"); // Import the path module
const port = process.env.PORT || 5000;
const app = express();
const config = require('./config');

// Middleware to parse JSON bodies
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Impact-Map.html"));
});

app.use(express.static(path.join(__dirname, "public")));

function getMeanGHM(coordinates, image, flag){

    var exportRegion = ee.Geometry.Polygon([
      coordinates
    ]);

    // Compute the mean pixel value within the Metro Manila region.
  // Compute the mean pixel value within the Metro Manila region.
  var stats = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: exportRegion,
    scale: 300, // Adjust the scale according to your requirements
  });

  // Check if the key 'gHM' exists in the dictionary
  // Check if the 'gHM' key exists in the dictionary
  if (flag == 0) {
    // Get the mean GHM value from the dictionary
    var meanGHMValue = stats.get('gHM');
    var meanValue = ee.Number(meanGHMValue).getInfo();
    // Print the computed mean value
    console.log("Mean GHM value within area", meanValue);
    return meanValue;
  } 
// Check if the 'constant' key exists in the dictionary
  else if (flag == 1) {
    var meanGHMValue = stats.get('constant');
    var meanValue = ee.Number(meanGHMValue).getInfo();
    console.log("Mean GHM value within area", meanValue);
    return meanValue;
  } 

  else {
    console.log("No GHM value found within area");
  }

}


function getFreqGHM(coordinates, image, flag){

  var exportRegion = ee.Geometry.Polygon([
    coordinates
  ]);

  // Compute the mean pixel value within the Metro Manila region.
// Compute the mean pixel value within the Metro Manila region.
  var histogram = image.reduceRegion({
    reducer: ee.Reducer.frequencyHistogram(),
    geometry: exportRegion,
    scale: 300, // Adjust the scale according to your requirements
  });
    // Get the histogram data
    var ee_dict = ee.Dictionary(histogram.get('constant')); 
    var list = ee_dict.keys()
  
    var values = Array(list)
  
    var myList = values[0].getInfo()
    //create frequency map
    var freqMap = { "0.0 - 0.1": 0, "0.1 - 0.4":0, "0.4 - 1.0":0}

    var freqPercent = { "0.0 - 0.1": 0, "0.1 - 0.4":0, "0.4 - 1.0":0}


    for(var i = 0; i < myList.length; i++){
      //print rounded value to 2 decimal places
      if(myList[i] >= 0.0 && myList[i] < 0.1){   
        freqMap["0.0 - 0.1"] += 1
      }
      else if(myList[i] >= 0.1 && myList[i] < 0.4){
       freqMap["0.1 - 0.4"] += 1 
      }
      else if(myList[i] >= 0.4 && myList[i] <= 1.0){
        freqMap["0.4 - 1.0"] += 1 
      }

      for(var key in freqMap){
        freqPercent[key] = (freqMap[key]/myList.length) * 100
      }
      
    }

    
    return freqPercent;

}



app.post("/process-coordinates", (req, res) => {
  const { coordinates} = req.body;
  console.log('Received coordinates:', coordinates);
  var H2017static = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_2017_300_60land");
  var H2015change = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_2015c_300_60land");
  var H2010change = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_2010c_300_60land");
  var H2005change = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_2005c_300_60land");
  var H2000change = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_2000c_300_60land");
  var H1995change = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_1995c_300_60land");
  var H1990change = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_1990c_300_60land");
  var meanValue = 0;
  // Define the visualization parameters.

  datasetList = [H1990change, H1995change, H2000change, H2005change, H2010change, H2015change, H2017static];
  datasetyears = ["1990", "1995", "2000", "2005", "2010", "2015", "2017"];
  meanValueList = [];
  for (var i = 0; i < datasetList.length; i++){
    meanValueList.push(getMeanGHM(coordinates, datasetList[i], 1));
  }
  
  for (var i = 0; i < meanValueList.length; i++){
    console.log("Mean GHM value for year", datasetyears[i], meanValueList[i]);
  }

  // create an object mapping the years to the mean values
  var meanValueList = datasetyears.map((year, index) => {
    return {
      year: year,
      meanValue: meanValueList[index]
    };
  });

  console.log("Mean GHM value for all years", meanValueList);

   res.status(200).json({ meanValueList: meanValueList })
});


app.post("/process-coordinates-freq", (req, res) => {
  const { coordinates, attribution } = req.body;
  console.log('Received attribution:', attribution);
  var dataset = ee.ImageCollection("CSP/HM/GlobalHumanModification").first();
  var H2017static = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_2017_300_60land");
  var H2015change = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_2015c_300_60land");
  var H2010change = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_2010c_300_60land");
  var H2005change = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_2005c_300_60land");
  var H2000change = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_2000c_300_60land");
  var H1995change = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_1995c_300_60land");
  var H1990change = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_1990c_300_60land");
  var meanValue = 0;


  var image = ee.Image("projects/sat-io/open-datasets/GHM/ghm_v15_2017_300_60land");

  switch(attribution){
    case "GHM":
      meanValue = getFreqGHM(coordinates, dataset, 0);
      break;
    case "GHM_1990":
      meanValue = getFreqGHM(coordinates, H1990change, 1);
      break;
    case "GHM_1995":
      meanValue = getFreqGHM(coordinates, H1995change, 1);
      break;
    case "GHM_2000":
      meanValue = getFreqGHM(coordinates, H2000change, 1);
      break;
    case "GHM_2005":
      meanValue = getFreqGHM(coordinates, H2005change, 1);
      break;
    case "GHM_2010":
      meanValue = getFreqGHM(coordinates, H2010change, 1);
      break;
    case "GHM_2015":
      meanValue = getFreqGHM(coordinates, H2015change, 1);
      break;
    case "GHM_2017":
      meanValue = getFreqGHM(coordinates, H2017static, 1);
      break;
    default:
      console.log("No attribution found");
  }
  // // Send a response
   res.status(200).json({ freqValue: meanValue });
});




console.log("Authenticating Earth Engine API using private key...");
ee.data.authenticateViaPrivateKey(
  {type: config.type,
    project_id: config.project_id,
    private_key_id: config.private_key_id,
    private_key: config.private_key,
    client_email: config.client_email,
    client_id: config.client_id,
    auth_uri: config.auth_uri,
    token_uri: config.token_uri,
    auth_provider_x509_cert_url: config.auth_provider_x509_cert_url,
    client_x509_cert_url: config.client_x509_cert_url,
    universe_domain: config.universe_domain,},
  () => {
    console.log("Authentication successful.");
    ee.initialize(
      null,
      null,
      () => {
        console.log("Earth Engine client library initialized.");
        app.listen(port);
        console.log(`Listening on port ${port}`);
      },
      (err) => {
        console.log(err);
        console.log(
          `Please make sure you have created a service account and have been approved.
Visit https://developers.google.com/earth-engine/service_account#how-do-i-create-a-service-account to learn more.`
        );
      }
    );
  },
  (err) => {
    console.log(err);
  }
);
