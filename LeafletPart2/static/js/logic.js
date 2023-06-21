// API endpoint for earthquake data
var earthquakeQueryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesQueryUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


// Perform GET requests to the query URLs
Promise.all([d3.json(earthquakeQueryUrl), d3.json(platesQueryUrl)])
  .then(function (data) {
    var earthquakeData = data[0];
    var platesData = data[1];

    // Create a Leaflet map centered around the United States
    var map = L.map("map").setView([37.09, -95.71], 4);

    // Create different base maps to choose from
    var streetmap = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }
    );
    var darkmap = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }
    );

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

    // Create the overlay layers for earthquakes and tectonic plates
    var earthquakeLayer = L.geoJSON(earthquakeData.features, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: getMarkerSize(feature.properties.mag),
          fillColor: getMarkerColor(feature.geometry.coordinates[2]),
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        });
      },
      onEachFeature: function (feature, layer) {
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
      },
    });

    var platesLayer = L.geoJSON(platesData.features, {
      style: {
        color: "orange",
        weight: 2,
      },
    });

    // Create overlay groups for earthquakes and tectonic plates
    var overlayMaps = {
      Earthquakes: earthquakeLayer,
      "Tectonic Plates": platesLayer,
    };

    // Add the base maps and overlay layers to the map
    L.control.layers(
      {
        Streetmap: streetmap,
        Darkmap: darkmap,
      },
      overlayMaps
    ).addTo(map);

    // Add earthquakes and streetmap layer to the map by default
    streetmap.addTo(map);
    earthquakeLayer.addTo(map);
  });

