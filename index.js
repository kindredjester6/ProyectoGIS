fetch('http://127.0.0.1:3000/geojson.geojson')
  .then(response => {
    const reader = response.body.getReader();
    return new ReadableStream({
      start(controller) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            push();
          });
        }
        push();
      }
    });
  })
  .then(stream => new Response(stream))
  .then(response => response.json())
  .then(dataJson => layerGeoJson(dataJson));

// function getCentroid(coords) {
//     var area = 0, x = 0, y = 0;
//     for (var i = 0, j = coords.length - 1; i < coords.length; j = i++) {
//       var p1 = coords[i], p2 = coords[j];
//       var f = p1[0] * p2[1] - p2[0] * p1[1];
//       area += f;
//       x += (p1[0] + p2[0]) * f;
//       y += (p1[1] + p2[1]) * f;
//     }
//     f = area * 3;
//     return [x / f, y / f];
//   }


function layerGeoJson(geoJsonList){
    L.geoJSON(geoJsonList, {
      onEachFeature: renderFeatureGeoJson,
      pointToLayer:myMarker,
      filter:myFilter,
      style:style
    }).addTo(map);

    // var houseIcon = L.icon({
    //     iconUrl: 'icons/home.svg',
    //     iconSize: [10, 10],
    //     iconAnchor: [15, 10],
    //     popupAnchor: [0, -38]
    //   });
    
    //   geoJsonList.features.forEach(function(feature) {
    //     if(feature.properties.building == "house"){
    //     var coords = feature.geometry.coordinates[0];
    //     var centroid = getCentroid(coords);
    //     L.marker([centroid[1], centroid[0]], {icon: houseIcon}).addTo(map)
    //       .bindPopup("Icono dentro del " + feature.properties.name)
    //       .openPopup();
    //     }
    //   });
   // L.marker([9.849591, -83.903129], {title:"MyPoint",alt:"The Big I",draggable:false}).addTo(map).bindPopup("I am a custom marker.");

}

function style(feature){
    return {color: feature.properties.power=="minor_line"?"red":
        feature.geometry.type=="LineString"?"gray":
        feature.properties.building=="house"?"orange":
        feature.properties.leisure=="park"?"green":"blue"
    }
}

function myFilter(feature, layer){
    return ((feature.properties.uid == "21962918" ||
         feature.properties.name == "Urbanización Valle Verde" ||
        feature.properties.name == "Calle 37" ||
        feature.properties.name == "Avenida 38" ||
        feature.properties.name == "Avenida 30" ||
        feature.properties.name == "Calle 37A") && !(feature.id=="way/107704451"));
}

function myMarker(feature, latlng){
    var myIcon = L.icon({
        iconUrl: 'icons/flash.svg',
        iconSize:     [40, 30], 
        shadowSize:   [60, 40], 
        iconAnchor:   [20, 20], 
        shadowAnchor: [20, 40],  
        popupAnchor:  [0, -10] 
    });
    
    return L.marker(latlng, {icon:myIcon});
}

function renderFeatureGeoJson(feature, map){
    console.log(feature)
    if(feature.geometry.type == "Polygon"){
      //  L.marker(feature.geometry.coordinates[2], {title:"MyPoint",alt:"The Big I",draggable:false}).addTo(map).bindPopup("I am a custom marker.");
        map.bindPopup("Casa " + feature.properties.name);
    }else if(feature.properties.power == "pole"){
        map.bindPopup("Poste electrico");
    }else if(feature.properties.power == "minor_line"){
        map.bindPopup("Linea electrica");
    }else if(feature.geometry.type == "LineString"){
        map.bindPopup(feature.properties.name);
    }
}