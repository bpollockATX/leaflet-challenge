// Store our API endpoint inside queryUrl

function buildUrl(){
    const
        domain = "earthquake.usgs.gov",
        endpoint = "/earthquakes/feed/v1.0/summary/all_week.geojson"

    return `https://${domain}${endpoint}`;
}

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    function styling(feature) {
        return {
          opacity: 1,
          fillOpacity: .7,
          fillColor: circleColors(feature.properties.mag),
          color: "#000000",
          radius: circleRadius(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
      }

    function circleColors(magnitude) {
        if (magnitude > 5) {
          return "#EA2C2C";
        }
        if (magnitude > 4) {
          return "#EA822C";
        }
        if (magnitude > 3) {
          return "#EE9C00";
        }
        if (magnitude > 2) {
          return "#EECC00";
        }
        if (magnitude > 1) {
          return "#D4EE00";
        }
        return "#98EE00";
      };

    // Set magnitude-radius of the earthquake
    function circleRadius(magnitude) {
        if (magnitude === 0) {
        return 1;
        }
        return magnitude * 5;
    };

    // Create a GeoJSON layer containing the features array on the earthquakeData object
        // Run the onEachFeature function once for each piece of data in the array
    const earthquakes = L.geoJson(earthquakeData, {
        // We turn each feature into a circleMarker on the map.
        pointToLayer: function(feature, latlng) {
            console.log(earthquakeData);
            return L.circleMarker(latlng);
          },
        // We set the style for each circleMarker using our styling function.
        style: styling,
        onEachFeature: onEachFeature
      })
    
    // Sending earthquakes layer to createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    const streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.streets",
            accessToken: API_KEY
    });

    const darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.dark",
            accessToken: API_KEY
    });

    // Define a baseMaps object to hold base layers
    const baseMaps = {
            "Street Map": streetmap,
            "Dark Map": darkmap
    };

    // Create overlay object to hold overlay layer
    const overlayMaps = {
            Earthquakes: earthquakes
    };

    // Create the map with streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 5,
            layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
    }).addTo(myMap);

    // Set magnitudes and colors. Note: colors have been translated
    // in a Hex color generator from the ones set above to match 0.7 transparency
    const magnitudes = [0, 1, 2, 3, 4, 5];
    const colors = [
    "#98f000",
    "#d4f000",
    "#f0cc00",
    "#f09c00",
    "#ea832e",
    "#ea2e2e"
    ];

    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
            var div = L.DomUtil.create("div", "info legend");
            var labels = [];
        var legendInfo = "<h1>Magnitude</h1>" +
                "<div class=\"labels\">" +
                "</div>";
        div.innerHTML = legendInfo;
        magnitudes.forEach(function(limit, index) {
            labels.push('<li style="background-color: ' + colors[index] +'AB">' + magnitudes[index] + '</li>');
        });
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
        }
    legend.addTo(myMap);

    }


(async function(){
    const queryUrl = buildUrl();
    const data = await d3.json(queryUrl);
    // Send the response data.features object to the createFeatures function
    createFeatures(data.features);
})()
