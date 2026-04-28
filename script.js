//Mapbox Public Token
mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuaWVsODEwMTciLCJhIjoiY21rZWI2eGg4MDU5NjNscHdxbjhkMTNmciJ9.jdsMukp7zHz3llySNBJs0A';

// Map
let map = new mapboxgl.Map({
    container: 'main-map1',
    style: 'mapbox://styles/daniel81017/cmlofzis0001i01qn3jjqaxjd',
    center: [-79.39, 43.65],
    zoom: 12,
});

//Global variables
let crashdata;
let hoveredHexagonId = null

//Retrieve data from remote repository
fetch('https://raw.githubusercontent.com/daniel81017/Lab4/refs/heads/main/pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(response => {
        crashdata = response;
        console.log(crashdata);
    });
;

//After map loads...
map.on('load', () => {
    //ADDS DATA TO MAP FOR VISUALIZATION PURPOSES
    map.addSource('crashdatavisualized', {
        type: 'geojson',
        data: crashdata,
    });

    //ADDS POINTS TO MAP FOR VISUALIZATION PURPOSES
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

    //CREATE TURF.JS ENVELOPE
    //With the coordinates produced by the envelope and subsequent feature collection (visualized in the console.log()), the min/max X/Y coordinates are collected to produce a bounding box.
    let enveloperesult = turf.envelope(crashdata);
    //Envelope coordinate retrieval
    console.log("Envelope longitudes and latitudes, min and max", enveloperesult.bbox);
    bboxgeojson = {
        "type": "Feature Collection",
        "features": [enveloperesult],
    };

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

    //CREATE HEXGRID IN BBOXPOLYGON
    let cellSide = 0.5;
    let options = {}; //Default is kilometres
    //Creates the hexgrid within the bbox just created and the size/options customizations, but does not render on map
    let hexgrid = turf.hexGrid(bbox, cellSide);
    //Assignment of feature ID of hexagons to facilitate Mapbox interoperability.
    hexgrid.features.forEach((feature, i) => {
        feature.id = i;
    });
    //Loads onto map
    map.addSource('Torontohexgridvisualized', {
        type: 'geojson',
        data: hexgrid,
    });
    //Renders hexgrid lines
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
    //Renders hexgrid interior colour (using layer type 'fill')
    map.addLayer({
        'id': 'TorontohexgridFILL',
        'type': 'fill',
        'source': 'Torontohexgridvisualized',
        'paint': {
            'fill-color': '#000000',
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.3,
                0
            ],
        },
        'layout': {
            'visibility': 'none',
        },
    });

    //MOUSE POINTER STYLING CHANGE
    //Changes the pointer to a cursor when hovering over polygon feature, reverting back to pointer when not hovering.
    //Also adjusts the hover opacity. See lines 131-136.
    map.on('mousemove', 'TorontohexgridFILL', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        if (e.features.length > 0) {
            if (hoveredHexagonId !== null) {
                map.setFeatureState(
                    { source: 'Torontohexgridvisualized', id: hoveredHexagonId },
                    { hover: false }
                );
            }
            hoveredHexagonId = e.features[0].id;
            map.setFeatureState(
                { source: 'Torontohexgridvisualized', id: hoveredHexagonId },
                { hover: true }
            );
        }
    });
    map.on('mouseleave', 'TorontohexgridFILL', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredHexagonId !== null) {
            map.setFeatureState(
                { source: 'Torontohexgridvisualized', id: hoveredHexagonId },
                { hover: false }
            );
        }
        //Reassigned as "null" to facilitate future hovers after returning cursor to inside of map boundary
        hoveredHexagonId = null;
    });

    //AGGREGATE COLLISION DATA
    let collisionhexagons = turf.collect(hexgrid, crashdata, '_id', 'values');

    //COLLISION DATA COUNTS
    let maxcollisions = 0; //Variable created to store the hexagon with the greatest number of collisions, initially assigned zero

    collisionhexagons.features.forEach((feature) => { //Applies to all hexagons. Based on the aggregate hexgrid and crashdata variables, collected using variable "collisionhexagons"
        feature.properties.COUNT = feature.properties.values.length //Counts number of collisions in a feature (hexagon)
        if (feature.properties.COUNT > maxcollisions) { //Continues counting the number of points in a feature (hexagon) exceeds the maxcollisions value. Iterative and repeats itself once a polygon with a greater number of collisions are identified.
            maxcollisions = (feature.properties.COUNT); //Declare maxcollisions to be the new higher value of collisions per hexagon to facilitate the "if" statement again
            // "If" is pursued and ultimately repeats 13 times according to the console.log()  (i.e. there were 13 times that identified a number of collisions in a hexagon greater than all previous ones assessed)
        }
    });
    console.log("One hexagon had", maxcollisions, "pedestrian or cyclist collisions in Toronto, the highest in the city."); //Prints final value with the highest collisions in a hexagon because when a hexagon would eclipse another in the "if" statement.
    // Result: there is a hexagon with a collision high of 72 occurrences. 

    //Variables for popup and button
    let hexagonVisible = false;
    let hexagonpopup = null;

    //CALCULATE COLLISION DATA PER HEXAGON FOR HEXAGON CLICKS
    map.on('click', (e) => {
        //Prevents popup from being opened without hexagon layer turned on.
        if (!hexagonVisible) return;
        let collisionhexagons1 = turf.collect(hexgrid, crashdata, '_id', 'values'); //Differentiates from the 'collisionhexagons' variable defined earlier, while continuing use of Turf.js collect.
        let clickedpoint = turf.point([e.lngLat.lng, e.lngLat.lat]); //Stores the user input "e" longitude and latitude for later use.
        let clickedhexagon = null; //Used later to check whether user-inputted point is in the polygon using Turf.js boolean function. Set to null to facilitate eventual visualization of non-null individual hexagons associated with a user-inputted click location.

        collisionhexagons1.features.forEach((feature) => {
            if (turf.booleanPointInPolygon(clickedpoint, feature)) { //Checker that observes whether the stored (e) user-clicked coordinates are inside a hexagon and, if so, identifies the points in a polygon with Turf.js.
                console.log(feature); //'Feature' is the counts of collisions per hexagons (where there are collisions, of course). Prints in console.log().
                clickedhexagon = feature; //Set variable for future use, no longer null if there are collisions in a hexagon that the user clicks.
            } //Iterative process that repeats.
        });

        //For use if only want to function for hexagons that contain pedestrian/cyclist collision points:
        if (clickedhexagon.properties.COUNT == 1) {
            //Popup creation (collisions singular)
            hexagonpopup = new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML('This hexagon (500m width) had ' + clickedhexagon.properties.COUNT + ' collision (pedestrian and cyclist) from 2006 to 2021.')
                .addTo(map);
        }
        else {
            //Popup creation (collisions plural and zero)
            hexagonpopup = new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML('This hexagon (500m width) had ' + clickedhexagon.properties.COUNT + ' collisions (pedestrian and cyclist) from 2006 to 2021.')
                .addTo(map);
        };
    });

    //Button for point layer activation, event listener
    let pointVisible = false;
    const buttonPoint = document.getElementById("pointbuttonJS");
    buttonPoint.addEventListener(
        'click',
        () => {
            pointVisible = !pointVisible;
            // const visibility = map.getLayoutProperty('crashpedestrians','visibility');
            if (pointVisible) {
                map.setLayoutProperty("crashpedestrians", 'visibility', 'visible');
                map.setLayoutProperty("crashcyclists", 'visibility', 'visible');
            }
            else {
                map.setLayoutProperty("crashpedestrians", 'visibility', 'none');
                map.setLayoutProperty("crashcyclists", 'visibility', 'none');
            };
            buttonPoint.classList.toggle("active", pointVisible);
        }
    );

    //Button for hexagon layer activation, event listener
    const buttonHexagon = document.getElementById("hexagonbuttonJS");
    buttonHexagon.addEventListener(
        'click',
        () => {
            hexagonVisible = !hexagonVisible;
            if (hexagonVisible) {
                map.setLayoutProperty("TorontobboxPolygonONMAP", 'visibility', 'visible');
                map.setLayoutProperty("TorontohexgridONMAP", 'visibility', 'visible');
                map.setLayoutProperty("TorontohexgridFILL", 'visibility', 'visible');
            }
            else {
                map.setLayoutProperty("TorontobboxPolygonONMAP", 'visibility', 'none');
                map.setLayoutProperty("TorontohexgridONMAP", 'visibility', 'none');
                map.setLayoutProperty("TorontohexgridFILL", 'visibility', 'none');
                if (hexagonpopup) {
                    hexagonpopup.remove();
                    hexagonpopup = null;
                };
            };
            buttonHexagon.classList.toggle("active", hexagonVisible);
        }
    );

});