/* Initialize map */
var map = L.map('map').setView([48.8393, 2.5574], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 attribution: '&copy; OpenStreetMap'
}).addTo(map);

var selectedMarker = null;
var selectedDestination = null;
var routeLine = null;

/* Icons */
var redIcon = new L.Icon({
iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
shadowUrl:'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
iconSize:[25,41],
iconAnchor:[12,41]
});

var blueIcon = new L.Icon({
iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
shadowUrl:'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
iconSize:[25,41],
iconAnchor:[12,41]
});

/* Load adresses */
fetch("adresses.csv")
.then(response => response.text())
.then(csv => {

let results = Papa.parse(csv,{
header:true,
skipEmptyLines:true
});

results.data.forEach(lieu => {

let nom = lieu.nom;
let lat = parseFloat(lieu.latitude);
let lng = parseFloat(lieu.longitude);
let adresse = lieu.adresse;
let horaire = lieu.horaire;
let info = lieu.info;

if(isNaN(lat) || isNaN(lng)){
return;
}

let marker = L.marker([lat,lng],{icon:blueIcon}).addTo(map);

marker.bindPopup(nom);

marker.on("click",()=>{

if(selectedMarker){
selectedMarker.setIcon(blueIcon);
}

marker.setIcon(redIcon);

selectedMarker = marker;
selectedDestination = [lat,lng];

/* afficher les infos */

document.getElementById("nomLieu").innerText = nom;
document.getElementById("adresseLieu").innerText = adresse;
document.getElementById("horaireLieu").innerText = horaire;
document.getElementById("infoLieu").innerText = info;

});

});

});

/* Calculate path*/
async function calculateRoute(){

if(!selectedDestination){
alert("Sélectionnez une destination");
return;
}

let address = document.getElementById("address").value;
let mode = document.getElementById("mode").value;

/* conversion mode HTML -> OSRM */

let profile;

if(mode === "foot-walking"){
profile = "foot";
}else{
profile = "driving";
}

/* geocoding */

let geo = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
let geoData = await geo.json();

if(!geoData.length){
alert("Adresse non trouvée");
return;
}

let userLat = geoData[0].lat;
let userLng = geoData[0].lon;

/* ROUTE API */

let response = await fetch(
`https://router.project-osrm.org/route/v1/${profile}/${userLng},${userLat};${selectedDestination[1]},${selectedDestination[0]}?overview=full&geometries=geojson`
);

let data = await response.json();

let coords = data.routes[0].geometry.coordinates.map(c => [c[1],c[0]]);

/* supprimer ancienne route */

if(routeLine){
map.removeLayer(routeLine);
}

/* afficher nouvelle */

routeLine = L.polyline(coords).addTo(map);

map.fitBounds(routeLine.getBounds());

}