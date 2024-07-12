var search;
var region;
var country;
var municities;
var geojsonLayer;
var polygon;
var buttonDiv = document.createElement("div");
buttonDiv.style.border = "4px solid gray";
var dataDiv = document.createElement("div");
dataDiv.style.border = "4px solid pink";
var map = L.map("map").setView([14.525, 120.975], 10);
var ghm_choice = "GHM_1990";
function addOverlay() {
  // Create a div element for the overlay
  var overlayDiv = document.createElement("div");
  overlayDiv.setAttribute("id", "overlay");
  overlayDiv.style.position = "fixed";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "0";
  overlayDiv.style.width = "100%";
  overlayDiv.style.height = "100%";
  overlayDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlayDiv.style.zIndex = "9999";
  overlayDiv.style.display = "flex";
  overlayDiv.style.justifyContent = "center";
  overlayDiv.style.alignItems = "center";

  // Create a card element
  var cardDiv = document.createElement("div");
  cardDiv.style.backgroundColor = "white";
  cardDiv.style.borderRadius = "10px";
  cardDiv.style.padding = "40px";
  cardDiv.style.textAlign = "center";
  cardDiv.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  cardDiv.style.position = "relative";
  cardDiv.style.width = "400px";
  cardDiv.style.maxWidth = "90%";

  // Create a close button element
  var closeButton = document.createElement("button");
  closeButton.style.position = "absolute";
  closeButton.style.top = "10px";
  closeButton.style.right = "10px";
  closeButton.style.backgroundColor = "transparent";
  closeButton.style.border = "none";
  closeButton.style.color = "#999";
  closeButton.style.fontSize = "24px";
  closeButton.style.cursor = "pointer";
  closeButton.innerHTML = "&times;";

  // Create a percentage element
  var percentageElement = document.createElement("h2");
  percentageElement.style.color = "#4CAF50";
  percentageElement.style.fontSize = "48px";
  percentageElement.style.marginBottom = "20px";
  percentageElement.textContent = "30.03%";

  // Create a message element
  var messageElement = document.createElement("p");
  messageElement.style.color = "#333";
  messageElement.style.fontSize = "24px";
  messageElement.textContent = "Increase (1990-2017)";

  // Append the close button, percentage, and message elements to the card div
  cardDiv.appendChild(closeButton);
  cardDiv.appendChild(percentageElement);
  cardDiv.appendChild(messageElement);

  // Append the card div to the overlay div
  overlayDiv.appendChild(cardDiv);

  // Append the overlay to the body element
  document.body.appendChild(overlayDiv);
}
// Function to remove the overlay
function removeOverlay() {
  var overlay = document.getElementById("overlay");
  if (overlay) {
    overlay.parentNode.removeChild(overlay);
  }
}

function createRadioButton(id, value, labelText, checked) {
  var radioDiv = document.createElement("div");
  radioDiv.classList.add("form-check");
  radioDiv.setAttribute("radioDiv", id);
  var radio = document.createElement("input");
  radio.classList.add("form-check-input");
  radio.setAttribute("type", "radio");
  radio.setAttribute("name", "mapOption");
  radio.setAttribute("value", value);
  radio.setAttribute("id", id);
  radio.checked = checked; // Set checked state

  radio.addEventListener("change", function () {
    // Update ghm_choice variable when radio button is clicked
    ghm_choice_element.value = value;
  });

  var label = document.createElement("label");
  label.classList.add("form-check-label");
  label.setAttribute("for", id);
  label.innerHTML = labelText;

  radioDiv.appendChild(radio);
  radioDiv.appendChild(label);

  return radioDiv;
}

function createRadioButton2(id, value, labelText, checked) {
  var radioDiv = document.createElement("div");
  radioDiv.classList.add("form-check");
  var radio = document.createElement("input");
  radio.classList.add("form-check-input");
  radio.setAttribute("type", "radio");
  radio.setAttribute("name", "mapOption");
  radio.setAttribute("value", value);
  radio.setAttribute("id", id); // Set checked state

  radio.addEventListener("change", function () {
    ghm_choice_element.value = value;
    console.log(ghm_choice_element.value);
    

    if (ghm_choice_element.value == "Region") {
      if (search != undefined) {
        search.collapse();
        map.removeControl(search);
      }
      if (region != undefined) {
        map.removeLayer(region);
      }
      if (municities != undefined) {
        map.removeLayer(municities);
      }
      if (country != undefined) {
        console.log("country is not undefined");
        map.removeLayer(country);
      }

      addOverlay();
      region = new L.FeatureGroup();
      geojsonLayer = new L.GeoJSON.AJAX("regions/alternative/regions.json", {
        style: function (feature) {
          return {
            fillOpacity: 0,
            opacity: 0,
          };
        },
      }).addTo(region);
      search = L.control
        .search({
          layer: region,
          initial: false,
          propertyName: "NAME_2", // Specify which property is searched into.
          circleLocation: true,
          collapsed: false,
          marker: false,
          autoCollapse: true,
        })
        .addTo(map);
      removeOverlay();

      search.on("search:locationfound", function (e) {
        // Hide all layers in the drawnItems feature group

        region.eachLayer(function (layer) {
          layer.setStyle({ fillOpacity: 0, opacity: 0 });
        });
        // Show the layer that was found by the search show only the outline of the region
        e.layer.setStyle({ fillOpacity: 0, opacity: 1 });

        var layer = e.layer;
        var coordinates;
        var coordinate_list = [];
        if (layer.getLatLngs().length > 1) {
          for (var i = 0; i < layer.getLatLngs().length; i++) {
            for (var j = 0; j < layer.getLatLngs()[i].length; j++) {
              coordinates = layer.getLatLngs()[i][j].map(function (latlng) {
                return [latlng.lng, latlng.lat];
              });
              coordinate_list.push(coordinates);
            }
          }
          var coordinates = [].concat.apply([], coordinate_list);
        } else if (layer.getLatLngs().length === 1) {
          coordinates = layer.getLatLngs()[0].map(function (latlng) {
            return [latlng.lng, latlng.lat];
          });
        }
        if (choice == "ghm_mean") {
          $("#ghmChart").remove();
          //put a transparent canvas over the map-container
          addOverlay();
          var legendDiv = document.getElementById("legend");
          $.ajax({
            url: "http://localhost:5000/process-coordinates",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
              coordinates: coordinates,
            }),
            success: function (response) {
              console.log("hello")
              console.log(response);
              //clear the previous chart
              //clear the previous content of the chart
              //create a new canvas element
              var meanValueContainer = document.createElement("canvas");
              meanValueContainer.setAttribute("id", "ghmChart");
              buttonDiv.appendChild(meanValueContainer);
              // Map each object in meanValueList to a formatted string
              var meanValuesString = response.meanValueList
                .map(function (item) {
                  return (
                    "Year: " + item.year + ", Mean Value: " + item.meanValue
                  );
                })
                .join(", ");
              //create a line chart
              var ctx = document.getElementById("ghmChart").getContext("2d");
              var myChart = new Chart(ctx, {
                type: "line",
                data: {
                  labels: response.meanValueList.map(function (item) {
                    return item.year;
                  }),
                  datasets: [
                    {
                      label: "Mean GHM",
                      data: response.meanValueList.map(function (item) {
                        return item.meanValue;
                      }),
                      backgroundColor: ["rgba(255, 99, 132, 0.2)"],
                      borderColor: ["rgba(255, 99, 132, 1)"],
                      borderWidth: 1,
                    },
                  ],
                },
                options: {
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                },
              });
            },
            error: function (xhr, status, error) {
              console.error("Error sending coordinates:", error);
              alert("Please try redoing the task, if the error persists, please contact the developer");
              removeOverlay();
            },
          });
        }
      });
      removeOverlay();
      //get the propertyName of the search
    } else if (ghm_choice_element.value == "City") {
      if (search != undefined) {
        search.collapse();
        map.removeControl(search);
      }
      if (region != undefined) {
        console.log("region is not undefined");
        map.removeLayer(region);
      }
      if (municities != undefined) {
        console.log("municities is not undefined");
        map.removeLayer(municities);
      }
      if (country != undefined) {
        console.log("country is not undefined");
        map.removeLayer(country);
      }
      municities = new L.FeatureGroup();
      for (var i = 1; i <= 17; i++) {
        geojsonLayer = new L.GeoJSON.AJAX(
          "regions/lowres/region_" + i + ".json",
          {
            style: function (feature) {
              return {
                fillOpacity: 0,
                opacity: 0,
              };
            },
          }
        ).addTo(municities);
      }
      search = L.control
        .search({
          layer: municities,
          initial: false,
          propertyName: "adm2_en", // Specify which property is searched into.
          marker: false,
          collapsed: false,
          autoCollapse: true,
        })
        .addTo(map);
      search.on("search:locationfound", function (e) {
        // Hide all layers in the drawnItems feature group
        municities.eachLayer(function (layer) {
          layer.setStyle({ fillOpacity: 0, opacity: 0 });
        });
        // Show the layer that was found by the search show only the outline of the region
        e.layer.setStyle({ fillOpacity: 0, opacity: 1 });

        var layer = e.layer;
        var coordinates;
        var coordinate_list = [];
        if (layer.getLatLngs().length > 1) {
          for (var i = 0; i < layer.getLatLngs().length; i++) {
            for (var j = 0; j < layer.getLatLngs()[i].length; j++) {
              coordinates = layer.getLatLngs()[i][j].map(function (latlng) {
                return [latlng.lng, latlng.lat];
              });
              coordinate_list.push(coordinates);
            }
          }
          var coordinates = [].concat.apply([], coordinate_list);
        } else if (layer.getLatLngs().length === 1) {
          coordinates = layer.getLatLngs()[0].map(function (latlng) {
            return [latlng.lng, latlng.lat];
          });
        }
        if (choice == "ghm_mean") {
          $("#ghmChart").remove();
          //put a transparent canvas over the map-container
          addOverlay();
          $.ajax({
            url: "http://localhost:5000/process-coordinates",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
              coordinates: coordinates,
            }),
            success: function (response) {
              removeOverlay();
              //clear the previous chart
              //clear the previous content of the chart
              //create a new canvas element
              var meanValueContainer = document.createElement("canvas");
              meanValueContainer.setAttribute("id", "ghmChart");
              buttonDiv.appendChild(meanValueContainer);
              // Map each object in meanValueList to a formatted string
              var meanValuesString = response.meanValueList
                .map(function (item) {
                  return (
                    "Year: " + item.year + ", Mean Value: " + item.meanValue
                  );
                })
                .join(", ");
              //create a line chart
              var ctx = document.getElementById("ghmChart").getContext("2d");
              var myChart = new Chart(ctx, {
                type: "line",
                data: {
                  labels: response.meanValueList.map(function (item) {
                    return item.year;
                  }),
                  datasets: [
                    {
                      label: "Mean GHM",
                      data: response.meanValueList.map(function (item) {
                        return item.meanValue;
                      }),
                      backgroundColor: ["rgba(255, 99, 132, 0.2)"],
                      borderColor: ["rgba(255, 99, 132, 1)"],
                      borderWidth: 1,
                    },
                  ],
                },
                options: {
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                },
              });
            },
            error: function (xhr, status, error) {
              console.error("Error sending coordinates:", error);
              alert(
                "The server is doing too many calculations at the moment. Please try again later. If the error persists, please contact the developer"
              );
              removeOverlay();
            },
          });
        }
      });
      //get the propertyName of the search
    } else if (ghm_choice_element.value == "Country") {
      if (search != undefined) {
        search.collapse();
        map.removeControl(search);
      }
      if (region != undefined) {
        console.log("region is not undefined");
        map.removeLayer(region);
      }
      if (municities != undefined) {
        console.log("municities is not undefined");
        map.removeLayer(municities);
      }
      if (country != undefined) {
        console.log("country is not undefined");
        map.removeLayer(country);
      }

      country = new L.FeatureGroup();
      geojsonLayer = new L.GeoJSON.AJAX("country/country.json", {
        style: function (feature) {
          return {
            fillOpacity: 0,
            opacity: 0,
          };
        },
      }).addTo(country);

      search = L.control
        .search({
          layer: country,
          initial: false,
          propertyName: "adm1_en", // Specify which property is searched into.
          marker: false,
          collapsed: false,
          autoCollapse: true,
        })
        .addTo(map);
      search.on("search:locationfound", function (e) {
        // Hide all layers in the drawnItems feature group
        country.eachLayer(function (layer) {
          layer.setStyle({ fillOpacity: 0, opacity: 0 });
        });
        // Show the layer that was found by the search show only the outline of the region
        e.layer.setStyle({ fillOpacity: 0, opacity: 1 });

        var layer = e.layer;
        var coordinates;
        var coordinate_list = [];
        if (layer.getLatLngs().length > 1) {
          for (var i = 0; i < layer.getLatLngs().length; i++) {
            for (var j = 0; j < layer.getLatLngs()[i].length; j++) {
              coordinates = layer.getLatLngs()[i][j].map(function (latlng) {
                return [latlng.lng, latlng.lat];
              });
              coordinate_list.push(coordinates);
            }
          }
          var coordinates = [].concat.apply([], coordinate_list);
        } else if (layer.getLatLngs().length === 1) {
          coordinates = layer.getLatLngs()[0].map(function (latlng) {
            return [latlng.lng, latlng.lat];
          });
        }
        //concatinate the content of the coordinates_list

        console.log("coordinates:", coordinates);
        if (choice == "ghm_mean") {
          $("#ghmChart").remove();
          //put a transparent canvas over the map-container
          addOverlay();
          $.ajax({
            url: "http://localhost:5000/process-coordinates",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
              coordinates: coordinates,
            }),
            success: function (response) {
              removeOverlay();
              //clear the previous chart
              //clear the previous content of the chart
              //create a new canvas element
              var meanValueContainer = document.createElement("canvas");
              meanValueContainer.setAttribute("id", "ghmChart");
              buttonDiv.appendChild(meanValueContainer);
              // Map each object in meanValueList to a formatted string
              var meanValuesString = response.meanValueList
                .map(function (item) {
                  return (
                    "Year: " + item.year + ", Mean Value: " + item.meanValue
                  );
                })
                .join(", ");
              //create a line chart
              var ctx = document.getElementById("ghmChart").getContext("2d");
              var myChart = new Chart(ctx, {
                type: "line",
                data: {
                  labels: response.meanValueList.map(function (item) {
                    return item.year;
                  }),
                  datasets: [
                    {
                      label: "Mean GHM",
                      data: response.meanValueList.map(function (item) {
                        return item.meanValue;
                      }),
                      backgroundColor: ["rgba(255, 99, 132, 0.2)"],
                      borderColor: ["rgba(255, 99, 132, 1)"],
                      borderWidth: 1,
                    },
                  ],
                },
                options: {
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                },
              });
            },
            error: function (xhr, status, error) {
              console.error("Error sending coordinates:", error);
              alert(
                "If you are seeing this error, it means the region has too many vertices. It is overloading the server. We suggest that you draw a layer over the map. If the error persists, please contact the developer"
              );
              removeOverlay();
            },
          });
        }
      });
    }
  });

  var label = document.createElement("label");
  label.classList.add("form-check-label");
  label.setAttribute("for", id);
  label.innerHTML = labelText;

  radioDiv.appendChild(radio);
  radioDiv.appendChild(label);

  return radioDiv;
}


function createRadioButton3(id, value, labelText, checked, dropDownChoice) {
  var radioDiv = document.createElement("div");
  radioDiv.classList.add("form-check");
  var radio = document.createElement("input");
  radio.classList.add("form-check-input");
  radio.setAttribute("type", "radio");
  radio.setAttribute("name", "mapOption");
  radio.setAttribute("value", value);
  radio.setAttribute("id", id); // Set checked state

  radio.addEventListener("change", function () {
    ghm_choice_element.value = value;
    console.log(ghm_choice_element.value);

    if (ghm_choice_element.value == "Region") {
      if (search != undefined) {
        search.collapse();
        map.removeControl(search);
      }
      if (region != undefined) {
        map.removeLayer(region);
      }
      if (municities != undefined) {
        map.removeLayer(municities);
      }
      if (country != undefined) {
        console.log("country is not undefined");
        map.removeLayer(country);
      }

      addOverlay();
      region = new L.FeatureGroup();
      geojsonLayer = new L.GeoJSON.AJAX("regions/alternative/regions.json", {
        style: function (feature) {
          return {
            fillOpacity: 0,
            opacity: 0,
          };
        },
      }).addTo(region);
      search = L.control
        .search({
          layer: region,
          initial: false,
          propertyName: "NAME_2", // Specify which property is searched into.
          circleLocation: true,
          collapsed: false,
          marker: false,
          autoCollapse: true,
        })
        .addTo(map);
      removeOverlay();

      search.on("search:locationfound", function (e) {
        // Hide all layers in the drawnItems feature group

        region.eachLayer(function (layer) {
          layer.setStyle({ fillOpacity: 0, opacity: 0 });
        });
        // Show the layer that was found by the search show only the outline of the region
        e.layer.setStyle({ fillOpacity: 0, opacity: 1 });

        var layer = e.layer;
        var coordinates;
        var coordinate_list = [];
        if (layer.getLatLngs().length > 1) {
          for (var i = 0; i < layer.getLatLngs().length; i++) {
            for (var j = 0; j < layer.getLatLngs()[i].length; j++) {
              coordinates = layer.getLatLngs()[i][j].map(function (latlng) {
                return [latlng.lng, latlng.lat];
              });
              coordinate_list.push(coordinates);
            }
          }
          var coordinates = [].concat.apply([], coordinate_list);
        } else if (layer.getLatLngs().length === 1) {
          coordinates = layer.getLatLngs()[0].map(function (latlng) {
            return [latlng.lng, latlng.lat];
          });
        }
        
        if (choice == "ghm_freq") {
          $("#ghmChart").remove();
          //put a transparent canvas over the map-container
          addOverlay();
          console.log(choice);
          console.log(ghm_choice)
          $.ajax({
            url: "http://localhost:5000/process-coordinates-freq",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
              coordinates: coordinates,
              attribution: ghm_choice,
            }),
            success: function (response) {
              removeOverlay();
              // display the frequency value as a pie chart
              var freqValueContainer = document.createElement("canvas");
              dataDiv.style.display = "flex"; // Set display to flex
              dataDiv.style.justifyContent = "center"; // Align items horizontally
              dataDiv.style.flexDirection = "column"; // Align items vertically
              dataDiv.appendChild(freqValueContainer);
              freqValueContainer.setAttribute("id", "ghmChart");
              freqValueContainer.style.width = "100%";
              freqValueContainer.style.height = "100%";
              var ctx = document.getElementById("ghmChart").getContext("2d");
              var freqValue = response.freqValue;
              var labels = ["Low", "Moderate", "High"]
              var data = Object.values(freqValue);
              
              new Chart(ctx, {
                type: "pie",
                data: {
                  labels: labels,
                  datasets: [
                    {
                      label: "GHM Frequency %",
                      data: data,
                      backgroundColor: data.map((_, index) => {
                        switch (index) {
                          case 0:
                            // dark blue
                            return "blue";
                          case 1:
                            //violet
                            return "purple";
                          case 2:
                            //yellow
                            return "yellow";
                        }
                      }),
                      borderColor: [
                        "rgba(0, 0, 0, 0.2)",
                        "rgba(0, 0, 128, 0.2)",
                        "rgba(128, 0, 128, 0.2)",
                        "rgba(238, 130, 238, 0.2)",
                        "rgba(255, 192, 203, 0.2)",
                        "rgba(255, 0, 0, 0.2)",
                        "rgba(255, 165, 0, 0.2)",
                        "rgba(255, 204, 102, 0.2)"
                      ],
                      borderWidth: 1,
                    },
                  ],
                },
                options: {
                  responsive:false,
                },
              });          
            },
            error: function (xhr, status, error) {
              console.error("Error sending coordinates:", error);
              alert("Please try redoing the task, if the error persists, please contact the developer");
              removeOverlay();
            },
          });
        }
      });
      removeOverlay();
      //get the propertyName of the search
    } else if (ghm_choice_element.value == "City") {
      if (search != undefined) {
        search.collapse();
        map.removeControl(search);
      }
      if (region != undefined) {
        console.log("region is not undefined");
        map.removeLayer(region);
      }
      if (municities != undefined) {
        console.log("municities is not undefined");
        map.removeLayer(municities);
      }
      if (country != undefined) {
        console.log("country is not undefined");
        map.removeLayer(country);
      }
      municities = new L.FeatureGroup();
      for (var i = 1; i <= 17; i++) {
        geojsonLayer = new L.GeoJSON.AJAX(
          "regions/lowres/region_" + i + ".json",
          {
            style: function (feature) {
              return {
                fillOpacity: 0,
                opacity: 0,
              };
            },
          }
        ).addTo(municities);
      }
      search = L.control
        .search({
          layer: municities,
          initial: false,
          propertyName: "adm2_en", // Specify which property is searched into.
          marker: false,
          collapsed: false,
          autoCollapse: true,
        })
        .addTo(map);
      search.on("search:locationfound", function (e) {
        // Hide all layers in the drawnItems feature group
        municities.eachLayer(function (layer) {
          layer.setStyle({ fillOpacity: 0, opacity: 0 });
        });
        // Show the layer that was found by the search show only the outline of the region
        e.layer.setStyle({ fillOpacity: 0, opacity: 1 });

        var layer = e.layer;
        var coordinates;
        var coordinate_list = [];
        if (layer.getLatLngs().length > 1) {
          for (var i = 0; i < layer.getLatLngs().length; i++) {
            for (var j = 0; j < layer.getLatLngs()[i].length; j++) {
              coordinates = layer.getLatLngs()[i][j].map(function (latlng) {
                return [latlng.lng, latlng.lat];
              });
              coordinate_list.push(coordinates);
            }
          }
          var coordinates = [].concat.apply([], coordinate_list);
        } else if (layer.getLatLngs().length === 1) {
          coordinates = layer.getLatLngs()[0].map(function (latlng) {
            return [latlng.lng, latlng.lat];
          });
        }
        if (choice == "ghm_freq") {
          $("#ghmChart").remove();
          //put a transparent canvas over the map-container
          addOverlay();
          console.log(choice);
          console.log(ghm_choice)
          $.ajax({
            url: "http://localhost:5000/process-coordinates-freq",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
              coordinates: coordinates,
              attribution: ghm_choice,
            }),
            success: function (response) {
              removeOverlay();
              // display the frequency value as a pie chart
              var freqValueContainer = document.createElement("canvas");
              dataDiv.style.display = "flex"; // Set display to flex
              dataDiv.style.justifyContent = "center"; // Align items horizontally
              dataDiv.style.flexDirection = "column"; // Align items vertically
              dataDiv.appendChild(freqValueContainer);
              freqValueContainer.setAttribute("id", "ghmChart");
              freqValueContainer.style.width = "100%";
              freqValueContainer.style.height = "100%";
              var ctx = document.getElementById("ghmChart").getContext("2d");
              var freqValue = response.freqValue;
              var labels = ["Low", "Moderate", "High"]
              var data = Object.values(freqValue);
              
              new Chart(ctx, {
                type: "pie",
                data: {
                  labels: labels,
                  datasets: [
                    {
                      label: "GHM Frequency %",
                      data: data,
                      backgroundColor: data.map((_, index) => {
                        switch (index) {
                          case 0:
                            // dark blue
                            return "blue";
                          case 1:
                            //violet
                            return "purple";
                          case 2:
                            //yellow
                            return "yellow";
                        }
                      }),
                      borderColor: [
                        "rgba(0, 0, 0, 0.2)",
                        "rgba(0, 0, 128, 0.2)",
                        "rgba(128, 0, 128, 0.2)",
                        "rgba(238, 130, 238, 0.2)",
                        "rgba(255, 192, 203, 0.2)",
                        "rgba(255, 0, 0, 0.2)",
                        "rgba(255, 165, 0, 0.2)",
                        "rgba(255, 204, 102, 0.2)"
                      ],
                      borderWidth: 1,
                    },
                  ],
                },
                options: {
                  responsive:false,
                },
              });          
            },
            error: function (xhr, status, error) {
              console.error("Error sending coordinates:", error);
              alert("Please try redoing the task, if the error persists, please contact the developer");
              removeOverlay();
            },
          });
        }
      });
      //get the propertyName of the search
    } else if (ghm_choice_element.value == "Country") {
      if (search != undefined) {
        search.collapse();
        map.removeControl(search);
      }
      if (region != undefined) {
        console.log("region is not undefined");
        map.removeLayer(region);
      }
      if (municities != undefined) {
        console.log("municities is not undefined");
        map.removeLayer(municities);
      }
      if (country != undefined) {
        console.log("country is not undefined");
        map.removeLayer(country);
      }

      country = new L.FeatureGroup();
      geojsonLayer = new L.GeoJSON.AJAX("country/country.json", {
        style: function (feature) {
          return {
            fillOpacity: 0,
            opacity: 0,
          };
        },
      }).addTo(country);

      search = L.control
        .search({
          layer: country,
          initial: false,
          propertyName: "adm1_en", // Specify which property is searched into.
          marker: false,
          collapsed: false,
          autoCollapse: true,
        })
        .addTo(map);
      search.on("search:locationfound", function (e) {
        // Hide all layers in the drawnItems feature group
        country.eachLayer(function (layer) {
          layer.setStyle({ fillOpacity: 0, opacity: 0 });
        });
        // Show the layer that was found by the search show only the outline of the region
        e.layer.setStyle({ fillOpacity: 0, opacity: 1 });

        var layer = e.layer;
        var coordinates;
        var coordinate_list = [];
        if (layer.getLatLngs().length > 1) {
          for (var i = 0; i < layer.getLatLngs().length; i++) {
            for (var j = 0; j < layer.getLatLngs()[i].length; j++) {
              coordinates = layer.getLatLngs()[i][j].map(function (latlng) {
                return [latlng.lng, latlng.lat];
              });
              coordinate_list.push(coordinates);
            }
          }
          var coordinates = [].concat.apply([], coordinate_list);
        } else if (layer.getLatLngs().length === 1) {
          coordinates = layer.getLatLngs()[0].map(function (latlng) {
            return [latlng.lng, latlng.lat];
          });
        }
        //concatinate the content of the coordinates_list

        console.log("coordinates:", coordinates);
        if (choice == "ghm_freq") {
          $("#ghmChart").remove();
          //put a transparent canvas over the map-container
          addOverlay();
          console.log(choice);
          console.log(ghm_choice)
          $.ajax({
            url: "http://localhost:5000/process-coordinates-freq",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
              coordinates: coordinates,
              attribution: ghm_choice,
            }),
            success: function (response) {
              removeOverlay();
              // display the frequency value as a pie chart
              var freqValueContainer = document.createElement("canvas");
              dataDiv.style.display = "flex"; // Set display to flex
              dataDiv.style.justifyContent = "center"; // Align items horizontally
              dataDiv.style.flexDirection = "column"; // Align items vertically
              dataDiv.appendChild(freqValueContainer);
              freqValueContainer.setAttribute("id", "ghmChart");
              freqValueContainer.style.width = "100%";
              freqValueContainer.style.height = "100%";
              var ctx = document.getElementById("ghmChart").getContext("2d");
              var freqValue = response.freqValue;
              var labels = ["Low", "Moderate", "High"]
              var data = Object.values(freqValue);
              
              new Chart(ctx, {
                type: "pie",
                data: {
                  labels: labels,
                  datasets: [
                    {
                      label: "GHM Frequency %",
                      data: data,
                      backgroundColor: data.map((_, index) => {
                        switch (index) {
                          case 0:
                            // dark blue
                            return "blue";
                          case 1:
                            //violet
                            return "purple";
                          case 2:
                            //yellow
                            return "yellow";
                        }
                      }),
                      borderColor: [
                        "rgba(0, 0, 0, 0.2)",
                        "rgba(0, 0, 128, 0.2)",
                        "rgba(128, 0, 128, 0.2)",
                        "rgba(238, 130, 238, 0.2)",
                        "rgba(255, 192, 203, 0.2)",
                        "rgba(255, 0, 0, 0.2)",
                        "rgba(255, 165, 0, 0.2)",
                        "rgba(255, 204, 102, 0.2)"
                      ],
                      borderWidth: 1,
                    },
                  ],
                },
                options: {
                  responsive:false,
                },
              });          
            },
            error: function (xhr, status, error) {
              console.error("Error sending coordinates:", error);
              alert("Please try redoing the task, if the error persists, please contact the developer");
              removeOverlay();
            },
          });
        }
      });
    }
  });

  var label = document.createElement("label");
  label.classList.add("form-check-label");
  label.setAttribute("for", id);
  label.innerHTML = labelText;

  radioDiv.appendChild(radio);
  radioDiv.appendChild(label);

  return radioDiv;
}

var radioOptions = [
  // Set one radio button as checked
  { id: "GHM_1990", value: "GHM_1990", labelText: "GHM_1990", checked: true },
  { id: "GHM_1995", value: "GHM_1995", labelText: "GHM_1995", checked: false },
  { id: "GHM_2000", value: "GHM_2000", labelText: "GHM_2000", checked: false },
  { id: "GHM_2005", value: "GHM_2005", labelText: "GHM_2005", checked: false },
  { id: "GHM_2010", value: "GHM_2010", labelText: "GHM_2010", checked: false },
  { id: "GHM_2015", value: "GHM_2015", labelText: "GHM_2015", checked: false },
  { id: "GHM_2017", value: "GHM_2017", labelText: "GHM_2017", checked: false },
];


var dropDown = [
  { id: "GHM_1990", value: "GHM_1990", labelText: "GHM_1990", checked: true },
  { id: "GHM_1995", value: "GHM_1995", labelText: "GHM_1995", checked: false },
  { id: "GHM_2000", value: "GHM_2000", labelText: "GHM_2000", checked: false },
  { id: "GHM_2005", value: "GHM_2005", labelText: "GHM_2005", checked: false },
  { id: "GHM_2010", value: "GHM_2010", labelText: "GHM_2010", checked: false },
  { id: "GHM_2015", value: "GHM_2015", labelText: "GHM_2015", checked: false },
  { id: "GHM_2017", value: "GHM_2017", labelText: "GHM_2017", checked: false },
]

function removeControls() {
  map.removeControl(drawControl);
}
var legendDiv = document.getElementById("legend");
var actionButton1 = document.getElementById("actionButton1");
var actionButton2 = document.getElementById("actionButton2");
var selectedOption;
var mapchoiceDiv = document.getElementById("mapchoice");
var choice;

actionButton1.addEventListener("click", function () {
  $("#ghmChart").remove();
  choice = "ghm_mean";
  selectedOption = $('input[name="mapOption"]:checked').val();
  legendDiv.innerHTML = "";
  var meanValueContainer = document.createElement("canvas");
  meanValueContainer.setAttribute("id", "ghmChart");
  var region_city_div = document.createElement("div");
  region_city_div.style.display = "flex"; // Set display to flex
  region_city_div.style.justifyContent = "spaced-around"; // Align items horizontally
  region_city_div.style.flexDirection = "column"; // Align items vertically
  
  ghm_choice_element = document.getElementById("city_region");
  region_city_div.appendChild(
    createRadioButton2("region", "Region", "Generate gHM for a city", true)
  );
  region_city_div.appendChild(
    createRadioButton2("city", "City", "Generate gHM for a province", false)
  );
  region_city_div.appendChild(
    createRadioButton2(
      "country",
      "Country",
      "Generate gHM for a Region (may take a while)",
      false
    )
  );

  //get the propertyName of the search

  legendDiv.appendChild(region_city_div);

  var drawControl = new L.Control.Draw({
    draw: {
      polygon: true,
      polyline: false,
      rectangle: false,
      circle: false,
      marker: false,
    },
    edit: {
      featureGroup: drawnItems,
      remove: true,
    },
  });
  map.addControl(drawControl);

  // allow users to upload csv containing coordinates
  var uploadButton = document.createElement("input");
  uploadButton.type = "file";
  uploadButton.accept = ".csv";
  uploadButton.style.width = "100%";
  var submitButton = document.createElement("button");
  submitButton.textContent = "Submit CSV";
  submitButton.style.color = "gray";
  submitButton.style.backgroundColor = "white";
  submitButton.style.cursor = "not-allowed";
  submitButton.disabled = true;

  buttonDiv.style.width = "80%";
  region_city_div.appendChild(uploadButton);
  legendDiv.appendChild(buttonDiv);
  uploadButton.addEventListener("change", function (e) {
    e.preventDefault();
    submitButton.disabled = true;
    var file = e.target.files[0];
    var reader = new FileReader();

    reader.onload = function (event) {
      var contents = event.target.result;
      // Use 'contents' variable to access the content of the file
      console.log(contents);
      coordinates = contents.split("\n").map(function (line) {
        return line.split(",").map(function (coordinate) {
          return parseFloat(coordinate);
        });
      });
      submitButton.style.cursor = "pointer";
    };

    submitButton.disabled = false;
    submitButton.style.color = "white";
    submitButton.style.backgroundColor = "#007bff";
    submitButton.addEventListener("mouseenter", function () {
      submitButton.style.backgroundColor = "#0056b3";
    });
  
    submitButton.addEventListener("mouseleave", function () {
        submitButton.style.backgroundColor = "#007bff";
    });

    reader.onerror = function (event) {
      console.error("File could not be read! Code " + event.target.error.code);
      // Handle the error appropriately
    };
    // Start reading the file as text. You can also read it as other types like BinaryString, ArrayBuffer, etc.
    reader.readAsText(file);
  });

  submitButton.addEventListener("click", function () {
    addOverlay();
    var latlngs = coordinates.map(function (coordinate) {
      return [coordinate[1], coordinate[0]];
    });
    polygon = L.polygon(latlngs, { color: "red" }).addTo(map);
    //zoom to polygon
    map.fitBounds(polygon.getBounds());

    console.log("Coordinates:", coordinates);
    $.ajax({
      url: "http://localhost:5000/process-coordinates",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        coordinates: coordinates,
      }),
      success: function (response) {
        removeOverlay();
        //clear the previous content of the chart
        $("#ghmChart").remove();
        var meanValueContainer = document.createElement("canvas");
        meanValueContainer.setAttribute("id", "ghmChart");
        buttonDiv.appendChild(meanValueContainer);
        //create a new canvas element
        console.log("Mean value received:", response.meanValueList);
        // Map each object in meanValueList to a formatted string
        var meanValuesString = response.meanValueList
          .map(function (item) {
            return "Year: " + item.year + ", Mean Value: " + item.meanValue;
          })
          .join(", ");
        //create a line chart
        var ctx = document.getElementById("ghmChart").getContext("2d");
        var myChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: response.meanValueList.map(function (item) {
              return item.year;
            }),
            datasets: [
              {
                label: "Mean GHM",
                data: response.meanValueList.map(function (item) {
                  return item.meanValue;
                }),
                backgroundColor: ["rgba(255, 99, 132, 0.2)"],
                borderColor: ["rgba(255, 99, 132, 1)"],
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      },
      error: function (xhr, status, error) {
        console.error("Error sending coordinates:", error);
        alert("Please try redoing the task, if the error persists, please contact the developer");
        removeOverlay();
      },
    });
  });

  // Create back button
  var backButton = document.createElement("button");
  backButton.textContent = "Go Back";
  backButton.addEventListener("click", function () {
    if (search != undefined) {
      console.log("search is not undefined");
      search.collapse();
      map.removeControl(search);
      console.log("search is removed");
      search = undefined;
    }
    if (region != undefined) {
      map.removeLayer(region);
    }
    if (municities != undefined) {
      map.removeLayer(municities);
    }
    if (country != undefined) {
      map.removeLayer(country);
    }

    if (polygon != undefined) {
      map.removeLayer(polygon);
    }

    // Revert to the original buttons
    map.removeControl(drawControl);
    legendDiv.innerHTML = "";
    buttonDiv.innerHTML = "";
    legendDiv.appendChild(actionButton1);
    legendDiv.appendChild(actionButton2);
  });

  // Append elements to legendDiv
  var navigationDiv = document.createElement("div");
  submitButton.style.marginBottom = "10px";
  navigationDiv.appendChild(submitButton)
  navigationDiv.appendChild(backButton);
  navigationDiv.style.display = "flex"; // Set display to flex
  navigationDiv.style.flexDirection = "column"; // Align items vertically
  navigationDiv.style.width = "30%";
  navigationDiv.style.padding = "10px";
  legendDiv.appendChild(navigationDiv);
});

actionButton2.addEventListener("click", function () {
  choice = "ghm_freq";
  selectedOption = $('input[name="mapOption"]:checked').val();
  legendDiv.innerHTML = "";
  var meanValueContainer = document.createElement("div");
  meanValueContainer.setAttribute("id", "meanValueContainer");
  var dropDownDiv = document.createElement("div");
  legendDiv.appendChild(dropDownDiv);
  ghm_choice_element = document.getElementById("city_region");
  //add a dropdown menu containing the options in dropDown options
  var dropDown = document.createElement("select");
  dropDown.setAttribute("id", "ghm_choice");
  dropDown.style.width = "100%";
  dropDown.style.marginBottom = "10px";
  dropDownDiv.appendChild(dropDown);
  //add options to dropdown
  dropDown.innerHTML = "";
  dropDown.innerHTML = dropDown.innerHTML + '<option value="GHM_1990">GHM_1990</option>';
  dropDown.innerHTML = dropDown.innerHTML + '<option value="GHM_1995">GHM_1995</option>';
  dropDown.innerHTML = dropDown.innerHTML + '<option value="GHM_2000">GHM_2000</option>';
  dropDown.innerHTML = dropDown.innerHTML + '<option value="GHM_2005">GHM_2005</option>';
  dropDown.innerHTML = dropDown.innerHTML + '<option value="GHM_2010">GHM_2010</option>';
  dropDown.innerHTML = dropDown.innerHTML + '<option value="GHM_2015">GHM_2015</option>';
  dropDown.innerHTML = dropDown.innerHTML + '<option value="GHM_2017">GHM_2017</option>';
  dropDown.addEventListener("change", function () {
    ghm_choice = dropDown.value;
    console.log(ghm_choice);
  });

  dropDownDiv.appendChild(
    createRadioButton3("region", "Region", "Generate gHM for a city", true)
  );
  dropDownDiv.appendChild(
    createRadioButton3("city", "City", "Generate gHM for a province", false)
  );
  dropDownDiv.appendChild(
    createRadioButton3(
      "country",
      "Country",
      "Generate gHM for a Region (may take a while)",
      false
    )
  );
  

  var drawControl = new L.Control.Draw({
    draw: {
      polygon: true,
      polyline: false,
      rectangle: false,
      circle: false,
      marker: false,
    },
    edit: {
      featureGroup: drawnItems,
      remove: true,
    },
  });
  map.addControl(drawControl);

  // Create input element for coordinates

  var uploadButton = document.createElement("input");
  uploadButton.type = "file";
  uploadButton.accept = ".csv";
  var submitButton = document.createElement("button");
  submitButton.textContent = "Submit CSV";
  submitButton.textContent = "Submit CSV";
  submitButton.style.color = "gray";
  submitButton.style.backgroundColor = "white";
  submitButton.style.cursor = "not-allowed";
  submitButton.disabled = true;
  dropDownDiv.appendChild(uploadButton);
  dropDownDiv.style.display = "flex"; // Set display to flex
  dropDownDiv.style.justifyContent = "center"; // Align items horizontally
  dropDownDiv.style.flexDirection = "column"; // Align items vertically
  dropDownDiv.style.width = "200px";
  dataDiv = document.createElement("div");
  dataDiv.style.width = "40%";
  dataDiv.style.border = "5px solid gray";
  legendDiv.appendChild(dataDiv);
  
  uploadButton.addEventListener("change", function (e) {
    submitButton.disabled = true;
    e.preventDefault();
    var file = e.target.files[0];
    var reader = new FileReader();

    reader.onload = function (event) {
      var contents = event.target.result;
      // Use 'contents' variable to access the content of the file
      console.log(contents);
      coordinates = contents.split("\n").map(function (line) {
        return line.split(",").map(function (coordinate) {
          return parseFloat(coordinate);
        });
      });
      submitButton.disabled = false;
      submitButton.style.color = "white";
      submitButton.style.backgroundColor = "#007bff";
      submitButton.addEventListener("mouseenter", function () {
        submitButton.style.backgroundColor = "#0056b3";
      });
    
      submitButton.addEventListener("mouseleave", function () {
          submitButton.style.backgroundColor = "#007bff";
      });
      submitButton.style.cursor = "pointer";
    };

    reader.onerror = function (event) {
      console.error("File could not be read! Code " + event.target.error.code);
      // Handle the error appropriately
    };

    // Start reading the file as text. You can also read it as other types like BinaryString, ArrayBuffer, etc.
    reader.readAsText(file);
    submitButton.disabled = false;
  });

  submitButton.addEventListener("click", function () {
    addOverlay();
    var latlngs = coordinates.map(function (coordinate) {
      return [coordinate[1], coordinate[0]];
    });
    polygon = L.polygon(latlngs, { color: "red" }).addTo(map);
    //zoom to polygon
    map.fitBounds(polygon.getBounds());

    console.log("Coordinates:", coordinates);
    $("#ghmChart").remove();
    //put a transparent canvas over the map-container
    var legendDiv = document.getElementById("legend");
    var ghm_choice = document.getElementById("ghm_choice").value;
    $.ajax({
      url: "http://localhost:5000/process-coordinates-freq",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        coordinates: coordinates,
        attribution: ghm_choice,
      }),
      success: function (response) {
        removeOverlay();
        // display the frequency value as a pie chart
        var freqValueContainer = document.createElement("canvas");
        dataDiv.style.display = "flex"; // Set display to flex
        dataDiv.style.justifyContent = "center"; // Align items horizontally
        dataDiv.style.flexDirection = "column"; // Align items vertically
        dataDiv.appendChild(freqValueContainer);
        freqValueContainer.setAttribute("id", "ghmChart");
        freqValueContainer.style.width = "100%";
        freqValueContainer.style.height = "100%";
        var ctx = document.getElementById("ghmChart").getContext("2d");
        var freqValue = response.freqValue;
        var labels = ["Low", "Moderate", "High"]
        var data = Object.values(freqValue);
        
        new Chart(ctx, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [
              {
                label: "GHM Frequency %",
                data: data,
                backgroundColor: data.map((_, index) => {
                  switch (index) {
                    case 0:
                      // dark blue
                      return "blue";
                    case 1:
                      //violet
                      return "purple";
                    case 2:
                      //yellow
                      return "yellow";
                  }
                }),
                borderColor: [
                  "rgba(0, 0, 0, 0.2)",
                  "rgba(0, 0, 128, 0.2)",
                  "rgba(128, 0, 128, 0.2)",
                  "rgba(238, 130, 238, 0.2)",
                  "rgba(255, 192, 203, 0.2)",
                  "rgba(255, 0, 0, 0.2)",
                  "rgba(255, 165, 0, 0.2)",
                  "rgba(255, 204, 102, 0.2)"
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive:false,
          },
        });          
      },
      error: function (xhr, status, error) {
        console.error("Error sending coordinates:", error);
        alert("Please try redoing the task, if the error persists, please contact the developer");
        removeOverlay();
      },
    });
  });

  // Create back button

  // Create back button
  var backButton = document.createElement("button");
  backButton.textContent = "Go Back";
  backButton.addEventListener("click", function () {
    if (search != undefined) {
      console.log("search is not undefined");
      search.collapse();
      map.removeControl(search);
      console.log("search is removed");
      search = undefined;
    }
    if (region != undefined) {
      map.removeLayer(region);
    }
    if (municities != undefined) {
      map.removeLayer(municities);
    }
    if (country != undefined) {
      map.removeLayer(country);
    }

    if (polygon != undefined) {
      map.removeLayer(polygon);
    }

    // Revert to the original buttons
    map.removeControl(drawControl);
    legendDiv.innerHTML = "";
    legendDiv.appendChild(actionButton1);
    legendDiv.appendChild(actionButton2);
  });

  // Append elements to legendDiv
  var choiceDiv = document.createElement("div");
  choiceDiv.appendChild(submitButton);
  choiceDiv.appendChild(backButton);
  submitButton.style.marginBottom = "10px";
  submitButton.style.width = "200px";
  choiceDiv.style.display = "flex"; // Set display to flex
  choiceDiv.style.justifyContent = "center"; // Align items horizontally
  choiceDiv.style.flexDirection = "column"; // Align items vertically
  legendDiv.appendChild(choiceDiv);
});


// Function to remove the overlay
function removeOverlay() {
  var overlay = document.getElementById("overlay");
  if (overlay) {
    overlay.parentNode.removeChild(overlay);
  }
}



var drawnItems = new L.FeatureGroup();
var region = new L.FeatureGroup();




var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

var ghmLayer = L.tileLayer(
  "https://storage.googleapis.com/impact_map/ImpactMap/{z}/{x}/{y}",
  {
    attribution: "GHM",
    name: "GHM",
  }
);

var ghm_1990Layer = L.tileLayer(
  "https://storage.googleapis.com/ghm_1990/ghm-1990/{z}/{x}/{y}.png",
  {
    attribution: "GHM_1990",
    name: "GHM_1990",
  }
);

var ghm_1995Layer = L.tileLayer(
  "https://storage.googleapis.com/ghm_1995/ghm-1995/{z}/{x}/{y}.png",
  {
    attribution: "GHM_1995",
    name: "GHM_1995",
  }
);

var ghm_2000Layer = L.tileLayer(
  "https://storage.googleapis.com/ghm_2000/ghm-2000/{z}/{x}/{y}.png",
  {
    attribution: "GHM_2000",
    name: "GHM_2000",
  }
);

var ghm_2005Layer = L.tileLayer(
  "https://storage.googleapis.com/ghm_2005/ghm-2005/{z}/{x}/{y}.png",
  {
    attribution: "GHM_2005",
    name: "GHM_2005",
  }
);

var ghm_2010Layer = L.tileLayer(
  "https://storage.googleapis.com/ghm_2010/ghm-2010/{z}/{x}/{y}.png",
  {
    attribution: "GHM_2010",
    name: "GHM_2010",
  }
);

var ghm_2015Layer = L.tileLayer(
  "https://storage.googleapis.com/ghm_2015/ghm-2015/{z}/{x}/{y}.png",
  {
    attribution: "GHM_2015",
    name: "GHM_2015",
  }
);

var ghm_2017Layer = L.tileLayer(
  "https://storage.googleapis.com/ghm_2017/ghm-2017/{z}/{x}/{y}.png",
  {
    attribution: "GHM_2017",
    name: "GHM_2017",
  }
);


map.addLayer(drawnItems);
  



var baseLayers = {
  OpenStreetMap: OpenStreetMap,
};

var overlays = {
  Satellite: Esri_WorldImagery,
  GHM_1990: ghm_1990Layer,
  GHM_1995: ghm_1995Layer,
  GHM_2000: ghm_2000Layer,
  GHM_2005: ghm_2005Layer,
  GHM_2010: ghm_2010Layer,
  GHM_2015: ghm_2015Layer,
  GHM_2017: ghm_2017Layer,
};

var control = new L.control.layers(baseLayers, overlays).addTo(map);
control.expand();

map.on("draw:created", function (e) {
  var layer = e.layer;
  drawnItems.addLayer(layer);
  
  // Extract coordinates from the Leaflet polygon
  var coordinates = layer.getLatLngs()[0].map(function (latlng) {
    return [latlng.lng, latlng.lat];
  });
  console.log(coordinates);

  if (choice == "ghm_mean") {
    $("#ghmChart").remove();
    //put a transparent canvas over the map-container
    addOverlay();

    $.ajax({
      url: "http://localhost:5000/process-coordinates",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        coordinates: coordinates,
      }),
      success: function (response) {
        removeOverlay();
        //clear the previous chart
        //clear the previous content of the chart
        //create a new canvas element
        var meanValueContainer = document.createElement("canvas");
        meanValueContainer.setAttribute("id", "ghmChart");
        buttonDiv.appendChild(meanValueContainer);
        
        // Map each object in meanValueList to a formatted string
        var meanValuesString = response.meanValueList
          .map(function (item) {
            return (
              "Year: " + item.year + ", Mean Value: " + item.meanValue
            );
          })
          .join(", ");
        //create a line chart
        var ctx = document.getElementById("ghmChart").getContext("2d");
        var myChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: response.meanValueList.map(function (item) {
              return item.year;
            }),
            datasets: [
              {
                label: "Mean GHM",
                data: response.meanValueList.map(function (item) {
                  return item.meanValue;
                }),
                backgroundColor: ["rgba(255, 99, 132, 0.2)"],
                borderColor: ["rgba(255, 99, 132, 1)"],
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      },
      error: function (xhr, status, error) {
        console.error("Error sending coordinates:", error);
        alert("Please try redoing the task, if the error persists, please contact the developer");
        removeOverlay();
      },
    });
  } else if (choice == "ghm_freq") {
    $("#ghmChart").remove();
    //put a transparent canvas over the map-container
    addOverlay();
    var ghm_choice = document.getElementById("ghm_choice").value;
    $.ajax({
      url: "http://localhost:5000/process-coordinates-freq",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        coordinates: coordinates,
        attribution: ghm_choice,
      }),
      success: function (response) {
        removeOverlay();
        // display the frequency value as a pie chart
        var freqValueContainer = document.createElement("canvas");
        dataDiv.style.display = "flex"; // Set display to flex
        dataDiv.style.justifyContent = "center"; // Align items horizontally
        dataDiv.style.flexDirection = "column"; // Align items vertically
        dataDiv.appendChild(freqValueContainer);
        freqValueContainer.setAttribute("id", "ghmChart");
        freqValueContainer.style.width = "100%";
        freqValueContainer.style.height = "100%";
        var ctx = document.getElementById("ghmChart").getContext("2d");
        var freqValue = response.freqValue;
        var labels = ["Low", "Moderate", "High"]
        var data = Object.values(freqValue);
        
        new Chart(ctx, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [
              {
                label: "GHM Frequency %",
                data: data,
                backgroundColor: data.map((_, index) => {
                  switch (index) {
                    case 0:
                      // dark blue
                      return "blue";
                    case 1:
                      //violet
                      return "purple";
                    case 2:
                      //yellow
                      return "yellow";
                  }
                }),
                borderColor: [
                  "rgba(0, 0, 0, 0.2)",
                  "rgba(0, 0, 128, 0.2)",
                  "rgba(128, 0, 128, 0.2)",
                  "rgba(238, 130, 238, 0.2)",
                  "rgba(255, 192, 203, 0.2)",
                  "rgba(255, 0, 0, 0.2)",
                  "rgba(255, 165, 0, 0.2)",
                  "rgba(255, 204, 102, 0.2)"
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive:false,
          },
        });          
      },
      error: function (xhr, status, error) {
        console.error("Error sending coordinates:", error);
        alert("Please try redoing the task, if the error persists, please contact the developer");
        removeOverlay();
      },
    });
  }
});