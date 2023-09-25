require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/renderers/SimpleRenderer",
  "esri/symbols/LineSymbol3DLayer",
  "esri/symbols/LineSymbol3D",
  "esri/widgets/TimeSlider",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Home",
  "esri/widgets/ScaleBar",
  "esri/widgets/Search",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
  "esri/Graphic",

], (Map,
  SceneView,
  FeatureLayer,
  SimpleRenderer,
  LineSymbol3DLayer,
  LineSymbol3D,
  TimeSlider,
  Expand,
  Legend,
  BasemapGallery,
  Home,
  ScaleBar,
  Search,
  QueryTask,
  Query,
  Graphic) => {




  // Create iconSymbol and add to renderer
  const iconSymbol = {
    type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 10,
        // resource: {
        //   primitive: "square"
        // },
        material: {
          color: [255, 0, 0, 0.4]
        }
      }
    ]
  };
  const iconSymbolRenderer = {
    type: "simple", // autocasts as new SimpleRenderer()
    symbol: iconSymbol
  };
  // Request feature layers and overwrite renderer https://gis.inia.es/server/rest/services/CISA/brotes_IA_sql/MapServer/0
    // url: "https://gis.inia.es/server/rest/services/CISA/brotes_FAO_XY/MapServer/0"
  const featureLayerBrotes = new FeatureLayer({
    url: "https://gis.inia.es/server/rest/services/CISA/brotes_IA_sql/MapServer/0",
    copyright: "Influenza Aviar",
    title: "Brotes",
    outFields: ['*'],
    visible: true,
    renderer: iconSymbolRenderer,
    popupTemplate: {
      title: "Pais: {country}",
      content: getInfoBrotes,
      visible: false,
      returnGeometry: true,
      fieldInfos: [
        {
          fieldName: 'report_date',
          format: {
            dateFormat: 'short-date'
          }
        }
      ],
    },
  });


  function getInfoBrotes(feature) {
    content = "<p>Outbreak information: " +
      "<ul><li>Location: {location}.</li>" +
      "<li>Report date: {report_date}.</li>" +
      "<li>Species: {species}.</li>" +
      "<li>Serotype: {serotype}.</li>" +
      "<li>More info: <a href='http://empres-i.fao.org/eipws3g/2/obd?idOutbreak={event_id}'> Enlace</a></li>";

    return content;

  }

  var lineSymbolMigrations = new LineSymbol3D({
    symbolLayers: [
      new LineSymbol3DLayer({
        material: { color: [237, 237, 237, 0.3] },
        size: 0.3
      })
    ]
  });


  var rendererMigrations = new SimpleRenderer({

    symbol: lineSymbolMigrations

  });




  

// Función para construir la capa con todas las rutas
// CAPA VIEJA: url: "https://services-eu1.arcgis.com/WCEIifo5j3luTcRc/ArcGIS/rest/services/migrations/FeatureServer/0",
  const featureLayerRutas = new FeatureLayer({
    url: "https://gis.inia.es/server/rest/services/CISA/Map_rutas_nutsprov_server/MapServer/0",
    copyright: "CISA-INIA-CSIC",
    title: "Movements",
    outFields: ["*"],
    renderer: rendererMigrations,
    popupTemplate: {
      title: "Group: {Grupo}",
      /* content: [
          {
              type: "fields",
              fieldInfos: [
                  {
                      fieldName: "species",
                      label: "Especie",
                      visible: true
                  },
              {
                  fieldName: "idAlerta",
                  label: "Codigo",
                  visible: true
              },
              ]
          }
      ] */
    },
    visible: false,
    availableFields: true,

  });
      
// Define elevationInfo and set it on the layer
  const currentElevationInfo = {
    mode: "on-the-ground"}


  featureLayerRutas.elevationInfo = currentElevationInfo;


  const rendererNuts = {
    type: "simple",
    symbol: {
      type: "simple-fill",
      color: [178, 220, 247, 0.03],
      outline: {
        color: [250, 250, 250],
        width: 1.25
      }
    }
  };

// Boton todas las rutas (ahora mismo coge las localizaciones exactas de anillamiento-recogida)
// El botón está desactivado en el html


  window.onload = function () {
    document.getElementById("migrations").addEventListener("click", activarMigrations);

    view.ui.add(migrations, "top-right");

  }




  function activarMigrations(feature) {
    if (featureLayerRutas.visible === false) {
      return featureLayerRutas.visible = true;
    } else {
      return featureLayerRutas.visible = false;
    }

  }




  /// DEFINICIÓN DE LOS NUTS

  const featureLayerNuts = new FeatureLayer({
    url: "https://gis.inia.es/server/rest/services/CISA/NUTS_PROV/MapServer/0",
    copyright: "CISA-INIA-CSIC",
    title: "Nuts",
    outFields: ['*'],
    visible: true,
    renderer: rendererNuts,
    supportsQuery: true,
    popupTemplate: {
      title:  "Admin: {ADMIN_name}" +
              "<br>Admin type: {ADMINTYPE}" +
              "<br>Country: {COUNTRY}"/*  +
            "<br>Group: {Group_spec_1}</br>" */,
      content: getInfoComarcas,
      visible: false,
      returnGeometry: true,
    },


  });



  /// ESTA FUNCIÓN PROGRAMA EL POPUPTEMPLATE
  function getInfoComarcas(feature) {

    /* view.graphics.removeAll() */

    var graphic, attributes;

    graphic = feature.graphic;
    attributes = graphic.attributes;
    /* console.log("Atributes:" + attributes)
    Region de origen --> ISO_CODE
    https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/rutasVisorInfluenza.geojson
    https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/rutas_visorIA.geojson*/


    var urlRutas = 'https://raw.githubusercontent.com/DiFLUsion/VisorIA3D/main/GeoJSON/rutasVisorAI.geojson';
    // Se inicia la peticion ajax a la url ruta

    var request = new XMLHttpRequest();
    request.open("GET", urlRutas, false); // false for synchronous request
    request.send(null);
    let rutas = JSON.parse(request.responseText)
    console.log('obj ruta', rutas)

    for (let index = 0; index < rutas.features.length; index++) {
      const element = rutas.features[index];
      console.log('element', element)


      // element son las rutas y attributes la capa de nuts

      if (element.properties.Provincia_de_destino == attributes.rotulo || element.properties.Region_de_origen == attributes.iso_code ) {
        var polyline = {
          type: "polyline", // new Polyline()
          paths: element.geometry.coordinates
        };
        var lineSymbol = {
          type: "simple-line", // new SimpleLineSymbol()
          color: [51, 200, 200, 0.8], // RGB color values as an array
          //width: element.properties.Total/15
          width: 0.3
        };
        var polylineGraphic = new Graphic({
          geometry: polyline, // Add the geometry created in step 4
          symbol: lineSymbol, // Add the symbol created in step 5
          popupTemplate: {
            title: "Species group: " + element.properties.Grupo +
              "<br>Total: " + element.properties.Total/*  +
                  "<br>Group: {Group_spec_1}</br>" */,
            content: getInfoComarcas,
            visible: false,
            returnGeometry: true,
          },
        });
        view.graphics.add(polylineGraphic);
      }
    }

    view.on("hold", function (e) {
      view.graphics.removeAll(polylineGraphic);
      console.log("Remove")
    })


  }

  // Create the Map
  const map = new Map({
    basemap: "dark-gray-vector",
    layers: [featureLayerBrotes, featureLayerNuts, featureLayerRutas]
  });

  // Create the SceneView and set initial camera
  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
            position: {
                latitude: 22.00000,
                longitude: 22.00000,
                z: 7034560
            },
            tilt: 16.5,
            heading: 1
        },


    highlightOptions: {
      color: "cyan"
    }
  });

  view.constraints = {

    minScale: 147000000
  };

  // Agregar la leyenda
  const legendExpand = new Expand({
    collapsedIconClass: "esri-icon-legend",
    expandIconClass: "esri-icon-legend",
    expandTooltip: "Legend",
    view: view,
    content: new Legend({
      view: view
    }),
    expanded: false
  });
  view.ui.add(legendExpand, "top-left");


  //// SCALEBAR

  var scaleBar = new ScaleBar({
    view: view,
    unit: "metric",
    estilo: "line",
  });
  // Add widget to the bottom left corner of the view
  view.ui.add(scaleBar, {
    position: "bottom-right",

  });

  /// SEARCH WIDGET
  var searchWidget = new Search({
    view: view
  });
  // Add the search widget to the top right corner of the view
  view.ui.add(searchWidget, {
    position: "top-right"
  });

  /// WIDGET DE MAPAS BASES

  var basemapGallery = new BasemapGallery({
    view: view,
    container: document.createElement("div")
  });

  /// BASEMAP GALLERY

  // Create an Expand instance and set the content
  // property to the DOM node of the basemap gallery widget
  // Use an Esri icon font to represent the content inside
  // of the Expand widget
  var bgExpand = new Expand({
    collapsedIconClass: "esri-icon-basemap",
    expandIconClass: "esri-icon-basemap",
    expandTooltip: "Mapas",
    content: basemapGallery,
    view: view
  });

  // close the expand whenever a basemap is selected
  basemapGallery.watch("activeBasemap", function () {
    var mobileSize =
      view.heightBreakpoint === "xsmall" ||
      view.widthBreakpoint === "xsmall";

    if (mobileSize) {
      bgExpand.collapse();
    }
  });

  // Add the expand instance to the ui

  view.ui.add(bgExpand, "top-right");

  /// WIDGET DE HOME PARA LA VISTA INICIAL
  var homeBtn = new Home({
    view: view,

  });

  // Add the home button to the top left corner of the view
  view.ui.add(homeBtn, "top-right");

  ///TIMESLIDER DE BROTES

  const timeSliderBrotes = new TimeSlider({
    container: "timeSliderBrotes",
    // la propiedad "playRate" del widgetb es el tiempo (en milisegundos) entre los pasos de la animación. Este valor predeterminado es 1000.
    playRate: 100,
    view: featureLayerBrotes,
    stops: {
      interval: {
        value: 1,
        unit: "days"
      }
    }
  });
  view.ui.add(timeSliderBrotes, "manual");

  // espera hasta que se cargue la vista de capa
  view.whenLayerView(featureLayerBrotes).then(function (lv) {
    layerViewBrotes = lv;

    // hora de inicio del control deslizante de tiempo
    //Descomentar para volver a poner 3 meses
   // const startBrotes = new Date();
   // startBrotes.setHours(0, 0, 0, 0);
   // startBrotes.setDate(startBrotes.getDate());
   // startBrotes.setDate(startBrotes.getDate() - 455);

//Comentar para quitar que el timeslider comience en 2020
    const startBrotes = new Date('2020-01-01');
    startBrotes.setHours(0, 0, 0, 0);

    const LastMonday = new Date();
    LastMonday.setHours(0, 0, 0, 0);
    LastMonday.setDate(LastMonday.getDate());

    // set time slider's full extent to
    // until end date of layer's fullTimeExtent
    timeSliderBrotes.fullTimeExtent = {
      start: startBrotes,
      end: LastMonday
    };
    const endBrotes = new Date(LastMonday);
    endBrotes.setDate(endBrotes.getDate() - 91);

    timeSliderBrotes.values = [endBrotes, LastMonday];
  });

});
