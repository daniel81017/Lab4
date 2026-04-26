//Mapbox Public Token
mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuaWVsODEwMTciLCJhIjoiY21rZWI2eGg4MDU5NjNscHdxbjhkMTNmciJ9.jdsMukp7zHz3llySNBJs0A'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Map
let map = new mapboxgl.Map({
    container: 'main-map1',
    style: 'mapbox://styles/daniel81017/cmlofzis0001i01qn3jjqaxjd',
    center: [-79.39, 43.65],
    zoom: 12,
});

let crashdata;
let hoveredHexagonId = null

fetch('https://raw.githubusercontent.com/daniel81017/Lab4/refs/heads/main/pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(response => {
        console.log(response, 'SUCCESS!');
        crashdata = response;
        console.log(crashdata);
    });
;


map.on('load', () => {
    //Adds data to map for visualization purposes
    console.log("1-SUCCESSFULLY RUN CRASHDATA JSON", crashdata);
    map.addSource('crashdatavisualized', {
        type: 'geojson', //IS INCORRECT
        data: crashdata,
    });
    console.log("2-SUCCESSFULLY RUN CRASHDATA JSON", crashdata);

    //Adds points to map for visualization purposes
    map.addLayer({
        'id': 'crashpedestrians',
        'type': 'circle',
        'source': 'crashdatavisualized',
        'paint': {
            'circle-width': 10,
            'circle-color': '#D000FF',
            'circle-outline': 2,
        },
        'filter': ['==', ['get', 'INVTYPE'], 'Pedestrian'],
        'layout': {
            'visibility': 'none',
        },
    });
    map.addLayer({
        'id': 'crashcyclists',
        'type': 'circle',
        'source': 'crashdatavisualized',
        'paint': {
            'circle-width': 10,
            'circle-color': '#0800ff',
            'circle-outline': 2,
        },
        'filter': ['==', ['get', 'INVTYPE'], 'Cyclist'],
        'layout': {
            'visibility': 'none',
        },
    });

    //CREATE ENVELOPE
    let enveloperesult = turf.envelope(crashdata);
    console.log(enveloperesult.bbox);
    console.log(enveloperesult.bbox[0]);
    bboxgeojson = {
        "type": "Feature Collection",
        "features": [enveloperesult],
    };
    console.log(bboxgeojson.features[0].geometry.coordinates[0][0][1]);

    //With the coordinates produced by the envelope and subsequent feature collection (visualized in the console.log()), the min/max X/Y coordinates are collected to produce a bounding box.

    //CREATE TORONTO BBOXPOLYGON
    var bbox = enveloperesult.bbox;
    //Creates the bboxpolygon using the coordinates, but does not render on map
    let polygon = turf.bboxPolygon(bbox);
    //Scales hexgrid to full extent of bbox
    const scaledpolygon = turf.transformScale(polygon, 1.1);
    //Loads onto map
    map.addSource('Torontobboxpolygonvisualized', {
        type: 'geojson',
        data: scaledpolygon,
    });
    map.addLayer({
        'id': 'TorontobboxPolygonONMAP',
        'type': 'line',
        'source': 'Torontobboxpolygonvisualized',
        'paint': {
            'line-width': 5,
            'line-color': '#000000',
        },
        'layout': {
            'visibility': 'none',
        },
    });

    //CREATE TORONTO HEXGRID IN BBOXPOLYGON
    let cellSide = 0.5;
    let options = {}; //Default is kilometres
    //Creates the hexgrid within the bbox just created and the size/options customizations, but does not render on map
    let hexgrid = turf.hexGrid(bbox, cellSide);
    //Loads onto map
    map.addSource('Torontohexgridvisualized', {
        type: 'geojson',
        data: hexgrid,
    });
    map.addLayer({
        'id': 'TorontohexgridONMAP',
        'type': 'line',
        'source': 'Torontohexgridvisualized',
        'paint': {
            'line-width': 3,
            'line-color': '#000000',
        },
        'layout': {
            'visibility': 'none',
        },
    });

    //AGGREGATE COLLISION DATA
    let collisionhexagons = turf.collect(hexgrid, crashdata, '_id', 'values');
    console.log("Data valid for aggregate counting", collisionhexagons);

    //COLLISION DATA COUNTS
    let maxcollisions = 0; //Variable created to store the hexagon with the greatest number of collisions, initially assigned zero

    collisionhexagons.features.forEach((feature) => { //Applies to all hexagons. Based on the aggregate hexgrid and crashdata variables, collected using variable "collisionhexagons"
        feature.properties.COUNT = feature.properties.values.length //Counts number of collisions in a feature (hexagon)
        if (feature.properties.COUNT > maxcollisions) { //Continues counting the number of points in a feature (hexagon) exceeds the maxcollisions value. Iterative and repeats itself once a polygon with a greater number of collisions are identified.
            console.log(2 + 2, feature);
            maxcollisions = (feature.properties.COUNT); //Declare maxcollisions to be the new higher value of collisions per hexagon to facilitate the "if" statement again
            // "If" is pursued and ultimately repeats 13 times according to the console.log()  (i.e. there were 13 times that identified a number of collisions in a hexagon greater than all previous ones assessed)
        }
    });
    console.log("One hexagon had", maxcollisions, "pedestrian or cyclist collisions in Toronto"); //Prints final value with the highest collisions in a hexagon because when a hexagon would eclipse another in the if statement.
    // Result: there is a hexagon with a collision high of 72 occurrences.

    // map.addLayer({
    //     'id': 'hexagon-fill',
    //     'type': 'fill',
    //     'source': 'Torontohexgridvisualized',
    //     'layout': {},
    //     'paint': {
    //         'fill-color': '#c2dd13',
    //         'fill-opacity': [
    //             'case',
    //             ['boolean', ['feature-state', 'hover'], false], //INTERPRET ARRAY CORRECTLY
    //             0.3,
    //             0
    //         ]
    //     },
    // });
});

// document.getElementById('defaultviewbutton').addEventListener('click', () => {});



let pointVisible = false;
const buttonPoint = document.getElementById("pointbuttonJS");
buttonPoint.addEventListener(
    'click',
    () => {
        console.log("111=", pointVisible);
        pointVisible = !pointVisible;
        console.log("222=", pointVisible);
        const visibility = map.getLayoutProperty('crashpedestrians','visibility');
        if (pointVisible) {
            map.setLayoutProperty("crashpedestrians", 'visibility', 'visible');
            buttonPoint.classList.toggle("active", pointVisible)
        }
        else {
            map.setLayoutProperty("crashpedestrians", 'visibility', 'none');
            buttonPoint.classList.toggle("active", pointVisible);
        };
    }
);

let hexagonVisible = false;
const buttonHexagon = document.getElementById("hexagonbuttonJS");
buttonHexagon.addEventListener(
    'click',
    () => {
        console.log("aaa=", hexagonVisible);
        hexagonVisible = !hexagonVisible;
        console.log("bbb=", hexagonVisible);
        const visibility1 = map.getLayoutProperty('crashpedestrians','visibility');
        if (hexagonVisible) {
            map.setLayoutProperty("crashpedestrians", 'visibility', 'visible');
            buttonHexagon.classList.toggle("active", hexagonVisible)
        }
        else {
            map.setLayoutProperty("crashpedestrians", 'visibility', 'visible');
            buttonHexagon.classList.toggle("active", hexagonVisible);
        };
    }
);

// buttonPoint.onclick = () => {

// };



// After the last frame rendered before the map enters an "idle" state.
map.on('idle', () => {
    // If these two layers were not added to the map, abort
    // if (!map.getLayer('crashpedestrians') || !map.getLayer('crashcyclists') || !map.getLayer('TorontobboxPolygonONMAP') || !map.getLayer('TorontohexgridONMAP')) {
    //     return;
    // }

    // Enumerate ids of the layers.
    const toggleableMenuIds = ["Point", "Hexagon"];

    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableMenuIds) {
        // Skip layers that already have a button set up.
        if (document.getElementById(id)) {
            continue;
        }

        // Create a link.
        const link = document.createElement('a');
        link.id = id;
        link.href = '#';
        link.textContent = id;
        link.className = 'active';

        // Show or hide layer when the toggle is clicked.
        // link.onclick = function (e) {
        //     const clickedLayer = this.textContent;
        //     e.preventDefault();
        //     e.stopPropagation();

        //     const visibility = map.getLayoutProperty(
        //         clickedLayer,
        //         'visibility'
        //     );

        //     // Toggle layer visibility by changing the layout object's visibility property.
        //     if (visibility === 'visible') {
        //         map.setLayoutProperty(clickedLayer, 'visibility', 'none');
        //         this.className = '';
        //     } else {
        //         this.className = 'active';
        //         map.setLayoutProperty(
        //             clickedLayer,
        //             'visibility',
        //             'visible'
        //         );
        //     }
        // };

        const layers = document.getElementById('menu');
        layers.appendChild(link);
    }
    console.log("SUCCESSFUL TOGGLES (4)")
});

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


