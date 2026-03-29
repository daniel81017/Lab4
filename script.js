//Mapbox Public Token
mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuaWVsODEwMTciLCJhIjoiY21rZWI2eGg4MDU5NjNscHdxbjhkMTNmciJ9.jdsMukp7zHz3llySNBJs0A'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map and edit to your preference
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/daniel81017/cmlofzis0001i01qn3jjqaxjd',
    center: [-79.39, 43.65],
    zoom: 12,
});

let crashdata = null;

fetch('./pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(response => {
        console.log(response);
        crashdata = response;
    });
;

// map.on('load', () => {
//     map.addSource('crashdatatest', {
//         type: 'geojson',
//         data: 'https://raw.githubusercontent.com/daniel81017/Lab4/refs/heads/main/data/pedcyc_collision_06-21.geojson',
//     });

//     map.addLayer({
//         'id': 'crashpedestrians',
//         'type': 'circle',
//         'source': 'walthamstow-data',
//         'paint': {
//             'circle-width': 10,
//             'circle-color': '#000000',
//             'circle-outline': 2,
//         },
//         'filter': ['==', ['properties-INVTYPE'], 'Pedestrian'],
//     });

//     map.addLayer({
//         'id': 'crashpedestrians',
//         'type': 'circle',
//         'source': 'walthamstow-data',
//         'paint': {
//             'circle-width': 10,
//             'circle-color': '#830000',
//             'circle-outline': 2,
//         },
//         'filter': ['==', ['properties-INVTYPE'], 'Cyclist'],
//     });
// });

/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
//HINT: Create an empty variable
//      Use the fetch method to access the GeoJSON from your online repository
//      Convert the response to JSON format and then store the response in your new variable



/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
//HINT: All code to create and view the hexgrid will go inside a map load event handler
//      First create a bounding box around the collision point data
//      Access and store the bounding box coordinates as an array variable
//      Use bounding box coordinates as argument in the turf hexgrid function
//      **Option: You may want to consider how to increase the size of your bbox to enable greater geog coverage of your hexgrid
//                Consider return types from different turf functions and required argument types carefully here



/*--------------------------------------------------------------------
Step 4: AGGREGATE COLLISIONS BY HEXGRID
--------------------------------------------------------------------*/
//HINT: Use Turf collect function to collect all '_id' properties from the collision points data for each heaxagon
//      View the collect output in the console. Where there are no intersecting points in polygons, arrays will be empty



// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows


