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
        // type: 'geojson',
        // data: 'https://raw.githubusercontent.com/daniel81017/Lab4/refs/heads/main/pedcyc_collision_06-21.geojson',
    });
    console.log("2-SUCCESSFULLY RUN CRASHDATA JSON", crashdata);

    //Adds points to map for visualization purposes
    map.addLayer({
        'id': 'crashpedestrians',
        'type': 'circle',
        'source': 'crashdatavisualized',
        'paint': {
            'circle-width': 10,
            'circle-color': 'rgb(208, 0, 255)',
            'circle-outline': 2,
        },
        'filter': ['==', ['get', 'INVTYPE'], 'Pedestrian'],
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
    });

    //PRACTICE
    //CREATE BBOXPOLYGON IN AFRICA
    // console.log("1-", turf);
    // var bbox = [0, 0, 10, 10];
    // let poly = turf.bboxPolygon(bbox);
    // console.log("2-", turf);

    // map.addSource('bboxpolygonvisualized', {
    //     type: 'geojson',
    //     data: poly,
    // });
    // map.addLayer({
    //     'id': 'bboxPolygonONMAP',
    //     'type': 'line',
    //     'source': 'bboxpolygonvisualized',
    //     'paint': {
    //         'line-width': 10,
    //         'line-color': '#000000',
    //     },
    // });

    //CREATE HEXGRID IN USA
    // var bbox = [-96, 31, -84, 40];
    // let cellSide = 50;
    // let options = { units: "miles" };
    // let hexgrid = turf.hexGrid(bbox, cellSide, options);

    // map.addSource('hexgridvisualized', {
    //     type: 'geojson',
    //     data: hexgrid,
    // });
    // map.addLayer({
    //     'id': 'hexgridONMAP',
    //     'type': 'line',
    //     'source': 'hexgridvisualized',
    //     'paint': {
    //         'line-width': 10,
    //         'line-color': '#000000',
    //     },
    // });

    //CREATE BBOX IN NE USA
    // let line = turf.lineString([
    //     [-74, 40],
    //     [-78, 42],
    //     [-82, 35],
    // ]);
    // var bbox = turf.bbox(line);
    // let bboxPolygon = turf.bboxPolygon(bbox);

    // map.addSource('bboxvisualized', {
    //     type: 'geojson',
    //     data: bboxPolygon,
    // });
    // map.addLayer({
    //     'id': 'bboxONMAP',
    //     'type': 'line',
    //     'source': 'bboxvisualized',
    //     'paint': {
    //         'line-width': 10,
    //         'line-color': '#000000',
    //     },
    // });

    //CREATE ENVELOPE
    let enveloperesult = turf.envelope(crashdata);
    console.log(enveloperesult.bbox);
    console.log(enveloperesult.bbox[0]);
    bboxgeojson = {
        "type": "Feature Collection",
        "features": [enveloperesult],
    };
    console.log(bboxgeojson.features[0].geometry.coordinates[0][0][1])

    //With the coordinates produced by the envelope and subsequent feature collection (visualized in the console.log()), the min/max X/Y coordinates are collected to produce a bounding box.

    //CREATE TORONTO BBOXPOLYGON
    var bbox = [-79.621974, 43.590289, -79.122974, 43.837935];
    //Creates the bboxpolygon using the coordinates, but does not render on map
    let polygon = turf.bboxPolygon(bbox);
    //Loads onto map
    map.addSource('Torontobboxpolygonvisualized', {
        type: 'geojson',
        data: polygon,
    });
    map.addLayer({
        'id': 'TorontobboxPolygonONMAP',
        'type': 'line',
        'source': 'Torontobboxpolygonvisualized',
        'paint': {
            'line-width': 5,
            'line-color': '#000000',
        },
    });

    //CREATE TORONTO HEXGRID IN BBOXPOLYGON
    let cellSide = 0.5;
    let options = {}; //Default is kilometres
    //Creates the hexgrid within the bbox just created and the size/options customizations, but does not render on map
    let hexgrid = turf.hexGrid(bbox, cellSide);
    //Scales hexgrid to full extent of bbox
    const scaledhexgrid = turf.transformScale(hexgrid, 5);
    //Loads onto map
    map.addSource('Torontohexgridvisualized', {
        type: 'geojson',
        data: scaledhexgrid,
    });
    map.addLayer({
        'id': 'TorontohexgridONMAP',
        'type': 'line',
        'source': 'Torontohexgridvisualized',
        'paint': {
            'line-width': 3,
            'line-color': '#000000',
        },
    });
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


