// Create the Leaflet map
var map = L.map('map').setView([0, 0], 2);

// Add tile layers
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(map);

// Create separate layer groups for earthquakes and tectonic plates
var earthquakesLayer = L.layerGroup().addTo(map);
var tectonicPlatesLayer = L.layerGroup().addTo(map);

// Create overlay control to toggle layers
var overlayMaps = {
  "Earthquakes": earthquakesLayer,
  "Tectonic Plates": tectonicPlatesLayer
};

L.control.layers(null, overlayMaps).addTo(map);

// Function to get color based on earthquake depth
function getMarkerColor(depth) {
  // Define your own color ranges based on your dataset
  if (depth < 30) {
    return '#00ff00';
  } else if (depth < 70) {
    return '#ffff00';
  } else {
    return '#ff0000';
  }
}

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

// Retrieve earthquake GeoJSON data and create markers
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        var magnitude = feature.properties.mag;
        var depth = feature.geometry.coordinates[2];
        var radius = Math.max(2, magnitude * 2);
        var color = getMarkerColor(depth);

        return L.circleMarker(latlng, {
          radius: radius,
          fillColor: color,
          color: '#000',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Depth: " + feature.geometry.coordinates[2] + " km");
      }
    }).addTo(earthquakesLayer);
  });

// Retrieve tectonic plates GeoJSON data and add to the map
fetch('data/PB2002_plates.json')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: function (feature) {
        return {
          color: '#ff0000',
          weight: 2
        };
      }
    }).addTo(tectonicPlatesLayer);
  });










