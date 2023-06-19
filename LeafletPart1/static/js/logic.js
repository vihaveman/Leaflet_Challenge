// API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Determine Map marker size
function markerSize(magnitude) {
  return magnitude * 20000;
}

// Loop through the features and create one marker for each place object
function colors(magnitude) {
  var color = "";
  if (magnitude <= 1) {
    return (color = "#83FF00");
  } else if (magnitude <= 2) {
    return (color = "#FFEC00");
  } else if (magnitude <= 3) {
    return (color = "#ffbf00");
  } else if (magnitude <= 4) {
    return (color = "#ff8000");
  } else if (magnitude <= 5) {
    return (color = "#FF4600");
  } else if (magnitude > 5) {
    return (color = "#FF0000");
  } else {
    return (color = "#ff00bf");
  }
}

function createFeatures(earthquakeData) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      "<h3>" +
        feature.properties.place +
        "</h3><hr><p>" +
        new Date(feature.properties.time) +
        "</p>" +
        "<hr> <p> Earthquake Magnitude: " +
        feature.properties.mag +
        "</p>"
    );
  }

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      // Determine Marker Colors, Size, and Opacity for each earthquake.
      var geoMarkers = {
        radius: markerSize(feature.properties.mag),
        fillColor: colors(feature.properties.mag),
        fillOpacity: 0.3,
        stroke: true,
        weight: 1,
      };
      return L.circleMarker(latlng, geoMarkers);
    },
  });

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }
  );

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map1", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetmap, earthquakes],
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(null, { Earthquakes: earthquakes }).addTo(myMap);
}
