// API endpoints for earthquake data and tectonic plates data
var earthquakeQueryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesQueryUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform GET requests to the query URLs
Promise.all([d3.json(earthquakeQueryUrl), d3.json(platesQueryUrl)])
  .then(function (data) {
    var earthquakeData = data[0];
    var platesData = data[1];

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

    // Create a GeoJSON layer containing the earthquake features array
    var earthquakes = L.geoJSON(earthquakeData.features, {
      pointToLayer: createMarkers,
    });

    // Create a GeoJSON layer for the tectonic plates
    var plates = L.geoJSON(platesData.features, {
      style: {
        color: "orange",
        weight: 2,
      },
    });

    // Create separate overlay groups for earthquakes and tectonic plates
    var overlayMaps = {
      Earthquakes: earthquakes,
      "Tectonic Plates": plates,
    };

    // Add the base layers and overlay layers to the map
    L.control.layers(null, overlayMaps).addTo(map);

    // Add earthquakes layer to the map by default
    earthquakes.addTo(map);
  });
