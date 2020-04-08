// import { stringify } from "querystring";

$(document).ready(function () {
  $("currentlyTracking").hide();

  // THE VARIABLE BELOW IS THE INTEGER ID# of USER'S CHOSEN GENRE
  var userSelectedGenre;
  var genreID;

  $(".js-example-data-ajax").select2({
    ajax: {
      url: "api/genre",
      dataType: 'json',
      delay: 250,
      AccessControlAllowOrigin: 'http://localhost:8080',
      // data: function (params) {
      //   return {
      //     q: params.term, // search term
      //   };
      // },
      processResults: function (data, params) {

        var id;

        $(".select2-search__field").keydown(function autoFill() {

          $("#mapInfoDiv").empty();

          console.log(data)
          // console.log(data.results)
          var inputText = $("input").val();
          console.log(inputText);
          // var loopStop = 0;
          for (id = 0; id < data.length; id++) {
            console.log(inputText);

            //PICK UP HERE!!!!!

            if ((data[id].name).match(inputText)) {
              $("#mapInfoDiv").append(`<a class="chosenGenre" id=${id} data-name="${data[id].name}"> <option>${data[id].name}</option></a>`);
            }
            else {
              console.log("your input does not call up any genres");
            }

          };
        });

        // parse the results into the format expected by Select2
        // since we are using custom formatting functions we do not need to
        // alter the remote JSON data, except to indicate that infinite
        // scrolling can be used
        params.page = params.page || 1;
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        console.log(params.page);


        return {
          results: data,
          pagination: {
            more: (params.page * 30) < data.total_count,
          }
        };
      },
      cache: true

    },
    placeholder: 'Search Genres',

    minimumInputLength: 1,
    templateResult: formatResults,
    templateSelection: formatResultsSelection,

  });
  // This are left over from documentation /setup... 
  // These functions are currently blocking the dropdown menu for selections, and
  // this is probably preferable. 
  function formatResults(repo) {
    if (repo.loading) {
      // return repo.text;
    }

  }
  function formatResultsSelection(repo) {
    if (repo.loading) {
      // return repo.text;
    }
    // return repo.full_name || repo.text;
  }

});

$.fn.select2.defaults.set('amdBase', 'select2/');
$.fn.select2.defaults.set('amdLanguageBase', 'select2/i18n/');

$(document).on("click", ".chosenGenre", function userGenreChoice(userSelectedGenre, genreID) {
  $("#currentlyTracking").show();

  // / / / / / / / / / / / / / / / / / / / / / / / / / / / / /
  // / / / / / / / / / / / / / / / / / / / / / / / / / / / / / 
  if (map.getLayer('clusters')) map.removeLayer('clusters');
  if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
  if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point');
  if (map.getLayer('earthquake-labels')) map.removeLayer('earthquake-labels');


  // / / / / / / / / / / / / / / / / / / / / / / / / / / / / /
  // / / / / / / / / / / / / / / / / / / / / / / / / / / / / / 





  $("#trackingGenre").html("currently mapping: " + this.text)
  genreID = this.id;
  userSelectedGenre = this.text;
  // console.log(genreID);
  // console.log(userSelectedGenre);

  $.get('/api/genre/' + this.text.trim()).then(data => {
    // console.log(data);

    try {
      map.removeSource('genreData');
    } catch (e) {
      console.log(e);
      console.log("IN THE CATCH BLOCK");
    }

    map.addSource('genreData', {
      type: 'geojson',
      // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
      // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
      data: data,
      //cluster: true,
      clusterMaxZoom: 5, // Max zoom to cluster points on
      clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      // clusterProperties: { 
      //   'point_count': ['+', ['case', point_count, 1, 0]]
      //  }
    });

    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'genreData',
      filter: ['has', 'point_count'],
      paint: {
        'circle-opacity': .6,

        // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
        // with three steps to implement three types of circles:
        //   * Blue, 20px circles when point count is less than 100
        //   * Yellow, 30px circles when point count is between 100 and 750
        //   * Pink, 40px circles when point count is greater than or equal to 750
        'circle-color': [
          'step',
          ['get', 'point_count'],

          '#514EA3',
          100000,
          '#C4FA70',
          130000,
          '#4A8C7B',
          180000,
          '#f28cb1',
          300000,
          '#E21C30',
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],


          5,
          1000,
          30,
          20000,
          40,
          500000,
          55,
          1000000,
          70,

        ]
      },

    });

    // THIS IS THE LAYER WITH TEXT TAGS THAT NEEDS TO UPDATE
    map.addLayer({
      'id': 'earthquake-labels',
      'type': 'symbol',
      'source': 'genreData',
      'filter': ['!=', 'cluster', true],
      'layout': {
        'text-field': [
          'concat',
          ['get', 'point_count'],
        ],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 10
      },
      'paint': {
        'text-color': '#f6f6f6'
      }
    });


  })

});