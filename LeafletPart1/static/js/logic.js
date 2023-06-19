// API endpoint for earthquake data
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Create a Leaflet map centered around the United States
  var map = L.map("map").setView([37.09, -95.71], 4);

  // Create the tile layer for the base map
  var streetmap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }
  ).addTo(map);

  // Function to determine marker size based on magnitude
  function getMarkerSize(magnitude) {
    return magnitude * 4;
  }

  // Function to determine marker color based on depth
  function getMarkerColor(depth) {
    if (depth < 10) {
      return "#00FF00";
    } else if (depth < 30) {
      return "#FFFF00";
    } else if (depth < 50) {
      return "#FF9900";
    } else if (depth < 70) {
      return "#FF6600";
    } else if (depth < 90) {
      return "#FF3300";
    } else {
      return "#FF0000";
    }
  }

  // Function to create markers with tooltips
  function createMarkers(feature, latlng) {
    var options = {
      radius: getMarkerSize(feature.properties.mag),
      fillColor: getMarkerColor(feature.geometry.coordinates[2]),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    };

    var marker = L.circleMarker(latlng, options);

    // Create a tooltip with magnitude, location, and depth information
    var tooltipContent =
      "<strong>Magnitude:</strong> " +
      feature.properties.mag +
      "<br>" +
      "<strong>Location:</strong> " +
      feature.properties.place +
      "<br>" +
      "<strong>Depth:</strong> " +
      feature.geometry.coordinates[2] +
      " km";

    // Bind the tooltip to the marker
    marker.bindTooltip(tooltipContent, { sticky: true });

    // Bind popup with additional information to each marker
    marker.bindPopup(
      "<h3>" +
        feature.properties.place +
        "</h3><hr><p>" +
        new Date(feature.properties.time) +
        "</p>" +
        "<hr> <p> Earthquake Magnitude: " +
        feature.properties.mag +
        "</p>"
    );

    return marker;
  }

  // Create a GeoJSON layer containing the features array
  var earthquakes = L.geoJSON(data.features, {
    pointToLayer: createMarkers,
  });

  // Add earthquakes layer to the map
  earthquakes.addTo(map);

  // Create legend
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "legend");

    var grades = [0, 10, 30, 50, 70, 90];
    var labels = [];
    var legendInfo = "<h4>Depth (km)</h4>";

    div.innerHTML = legendInfo;

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        getMarkerColor(grades[i] + 1) +
        '"></i> ' +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }

    return div;
  };

  // Add legend to the map
  legend.addTo(map);
});

