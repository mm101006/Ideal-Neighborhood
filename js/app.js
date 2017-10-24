/*jshint sub:true*/
// if script does not reside in the temp folder or script is wrong
// and no internet connection to retrieve script,
// this googleError function will be used
function googleError() {
  var ModelError = function() {
      $('#slide-popup').modal('show');
  };

  self.userInput =  '';
  self.filterMarkers = '';
  self.disHide = '';
  self.disappear = '';
  self.disShow = '';
  self.reappear = '';
  self.hidebutton = '';
  self.drawIt = '';
  self.showbutton = '';
  self.removeIt = '';
  self.activeMarkers = '';
  self.info = '';

  errorMessage = ko.observable('Please check script tag or internet connection.');

  ko.applyBindings(new ModelError());
}

 // View appears if callback was sucessful but then user loses internet connection
var ModelError = function(e) {
   if (e.type == "error" && e.target['tagName'] == "SCRIPT"){
        $('#slide-popup').modal('show');
      }
};

var ViewModel = function(map,locationList, unfinishedPentagramCoordinates) {
  var self = this;
  self.googleMap = map;

  self.markerArray = [];
  locationList.forEach(function(place){
    self.markerArray.push(new markerCreation(place));
  });

  var infowindow = new google.maps.InfoWindow();

function Create() {
  self.markerArray.forEach(function(place){
    var markers = {
      position: place.location,
      map: map,
      animation: google.maps.Animation.DROP,
      title: place.title,
      icon: place.icon
    };
      place.marker = new google.maps.Marker(markers);

      place.marker.addListener('click', BounceIcon);

      currentMarker = '';

      // Used for when user clicks on an location icon
      // function checks to see if marker is already animated if so cancels animation out,
      // if not marker starts to bounce
      function BounceIcon() {
        self.markerArray.forEach(function(place){
          if (place.marker.animation == 1){
            place.marker.setAnimation(null);
          }
        });
        if (currentMarker == place.marker) {
          place.marker.setAnimation(null);
          infowindow.marker = null;
          infowindow.close(map, place.marker);
          currentMarker = '';
        } else {
        this.setAnimation(google.maps.Animation.BOUNCE);
        populateInfoWindow(this, infowindow);
        title = place.marker.title;
        wiki(title);
        currentMarker = this;
        }
      }

      // Used for when user clicks on a named place within the list of places available
      self.list = function() {
        BounceMarker(this.marker);
      };

      // function checks to see if marker is already animated if so cancels animation out,
      // if not marker starts to bounce
      function BounceMarker(locationBounce) {
        self.markerArray.forEach(function(place){
          if (place.marker.animation == 1){
            place.marker.setAnimation(null);
          }
        });
        if (currentMarker == locationBounce) {
          place.marker.setAnimation(null);
          infowindow.marker = null;
          infowindow.close(map, place.marker);
          currentMarker = '';
        } else {
        locationBounce.setAnimation(google.maps.Animation.BOUNCE);
        populateInfoWindow(locationBounce, infowindow);
        title = locationBounce.title;
        wiki(title);
        currentMarker = locationBounce;
      }
      }

      function populateInfoWindow(marker, infowindow) {
            // Check to make sure the infowindow is not already opened on this marker.
            if (infowindow.marker != marker) {
              // Clear the infowindow content to give the streetview time to load.
              var checkId = document.getElementById('pano');
              if (checkId !== null) {
                document.getElementById('pano').remove();
              }
              infowindow.setContent('');
              // Make sure the marker property is cleared if the infowindow is closed.
              infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
              });
              var streetViewService = new google.maps.StreetViewService();
              var radius = 50;
              // In case the status is OK, which means the pano was found, compute the
              // position of the streetview image, then calculate the heading, then get a
              // panorama from that and set the options
              getStreetView = function(data, status) {
                if (status == google.maps.StreetViewStatus.OK) {
                  var nearStreetViewLocation = data.location.latLng;
                  var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                    infowindow.setContent('<div id="content">' + '<div id="pano">' + '</div>' + marker.title +'</div>');
                    var panoramaOptions = {
                      position: nearStreetViewLocation,
                      pov: {
                        heading: heading,
                        pitch: 0
                      }
                    };
                var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
                }
                createView = function() {
                  map.setStreetView(panorama);
                };
              };
              // Use streetview service to get the closest streetview image within
              // 50 meters of the markers position;
              streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
              // Open the infowindow on the correct marker.
              infowindow.open(map, marker);
            }
          }

    // If user clicks on the x button on infowindow animation will stop running.
    infowindow.addListener('closeclick', stopAnimation);
    function stopAnimation() {
      place.marker.setAnimation(null);
    }
  });
}

function markerCreation(data) {
  this.title = data.title;
  this.location = data.location;
  this.icon = data.icon;
}

// Observes activeMarkers, taken from the markerArray
self.activeMarkers = ko.observableArray();

self.markerArray.forEach(function(place){
  self.activeMarkers.push(place);
});

// Handles Pentalpha on map found within the map tools
  unfinishedPentagram = new google.maps.Polyline({
        path: unfinishedPentagramCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

    this.showbutton = ko.observable(false); // undo
    this.hidebutton = ko.observable(true); // drawit

    self.drawIt = function() {
       unfinishedPentagram.setMap(map);
       this.showbutton(true);
       this.hidebutton(false);
       self.info('The Pentalpha, a symbnol of liberty and freedom or a puzzle where the goal is to place nine stones on the ten intersections of a pentagram or a means to ensnare demons to do your bidding like in Faust?');
    };

    self.removeIt = function() {
      unfinishedPentagram.setMap(null);
      this.showbutton(false);
      this.hidebutton(true);
  };

  // Handles the map tools for show and disappear
  this.disHide = ko.observable(true); //disappear
  this.disShow = ko.observable(false); // show

  this.disappear = function() {
    self.activeMarkers.removeAll();
    self.markerArray.forEach(function(place) {
      place.marker.setMap(null);
    });
    this.disHide(false);
    this.disShow(true);
  };

  this.reappear = function() {
    Create();
    this.disHide(true);
    this.disShow(false);
    self.markerArray.forEach(function(place){
      self.activeMarkers.push(place);
    });
  };


  // Searches for anything that matches what the user put in
  self.userInput =  ko.observable('');

  self.filterMarkers = function() {
    var searchInput = self.userInput().toLowerCase();

    self.activeMarkers.removeAll();
    self.markerArray.forEach(function(place){
    place.marker.setMap(null);

      if (place.title.toLowerCase().indexOf(searchInput) !== -1) {
        self.activeMarkers.push(place);
      }
    });

    self.activeMarkers().forEach(function(place) {
      place.marker.setMap(self.googleMap);
    });
  };

  // Handles wiki api and info changes based on user click of location
  self.info = ko.observable();

  function wiki(title) {
    var placeName = title;
    var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + placeName + "&limit=1&format=json&callback=wikiCallback";
    $.ajax({
      url: wikiUrl,
      dataType: "jsonp",
      success: function( data ) {
          self.info(data[2][0]);
      },
      error: function(request, status, error){
          self.info('Failed to retrieve info from wikipedia. Please check internet connection or code.');
      }
    });
  }

  // Handles any errors with script tag or loss internet connection
  window.addEventListener("error", ModelError, true);

  errorMessage = ko.observable('Please check script tag or internet connection.');

  // creates the markers when viewmodel has loaded
  Create();
};


function googleSuccess() {
  locations = [
      {
        title: 'Library of Congress',
        location: {lat: 38.8887, lng: -77.0047},
        icon: 'assets/images/placeIcons/library.png'
      },
      {
        title: 'United States Capitol',
        location: {lat: 38.8899, lng: -77.0091},
        icon: 'assets/images/placeIcons/monument-historique.png'
      },
      {
        title: 'Supreme Court of the United States',
        location: {lat: 38.8906, lng: -77.0044},
        icon: 'assets/images/placeIcons/temple-2.png'
      },
      {
        title: 'International Spy Museum',
        location: {lat: 38.8969, lng: -77.0236},
        icon: 'assets/images/placeIcons/museum_war.png'
      },
      {
        title: 'Washington Monument',
        location: {lat: 38.8895, lng: -77.0353},
        icon: 'assets/images/placeIcons/modernmonument.png'
      },
      {
        title: 'The Ellipse',
        location: {lat: 38.8940, lng: -77.0365},
        icon: 'assets/images/placeIcons/anthropo.png'
      },
      {
        title: 'Lafayette Square, Washington, D.C.',
        location: {lat: 38.8995, lng: -77.0366},
        icon: 'assets/images/placeIcons/citysquare.png'
      },
      {
        title: 'Thomas Circle',
        location: {lat: 38.9057, lng: -77.0320},
        icon: 'assets/images/placeIcons/citysquare.png'
      },
      {
        title: 'Logan Circle, Washington DC',
        location: {lat: 38.9096, lng: -77.0296},
        icon: 'assets/images/placeIcons/citysquare.png'
      },
      {
        title: 'White House',
        location: {lat: 38.8977, lng: -77.0365},
        icon: 'assets/images/placeIcons/palace-2.png'
      },
      {
        title: 'Reflecting Pool',
        location: {lat: 38.8893, lng: -77.0447},
        icon: 'assets/images/placeIcons/fountain-2.png'
      },
      {
        title: 'Scott Circle',
        location: {lat: 38.9072, lng: -77.0365},
        icon: 'assets/images/placeIcons/citysquare.png'
      },
      {
        title: 'Dupont Circle',
        location: {lat: 38.9097, lng: -77.0433},
        icon: 'assets/images/placeIcons/citysquare.png'
      },
      {
        title: 'Historical Society of Washington, D.C.',
        location: {lat: 38.9026, lng: -77.0229},
        icon: 'assets/images/placeIcons/monument-historique.png'
      },
      {
        title: 'Washington Circle',
        location: {lat: 38.9025, lng: -77.05},
        icon: 'assets/images/placeIcons/citysquare.png'
      }
    ];

  unfinishedPentagramCoordinates = [
      {lat: 38.9025, lng: -77.05}, // washington circle
      {lat: 38.9026, lng: -77.0229}, // historical society
      {lat: 38.9097, lng: -77.0433}, // dupont circle
      {lat: 38.8977, lng: -77.0365}, // lafayette Square
      {lat: 38.9096, lng: -77.0296}, // logan circle
      {lat: 38.90563940670687, lng:-77.04116223442384} // not known
  ];

  var center = {lat: 38.8995, lng: -77.0237};

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: center,
    mapTypeId: 'satellite',
    streetViewControl: false,
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
    }
  });

  var googleMap = map;
  ko.applyBindings(new ViewModel(googleMap, locations, unfinishedPentagramCoordinates));

}
