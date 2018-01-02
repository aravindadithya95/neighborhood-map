var map;
var locations = [
  {
    title: 'QuickChek',
    location: {
      lat: 40.743759,
      lng: -74.155682
    }
  },
  {
    title: '5 Grains Rice',
    location: {
      lat: 40.745999,
      lng: -74.158852
    }
  },
  {
    title: 'Smashburger',
    location: {
      lat: 40.741283,
      lng: -74.179654
    }
  },
  {
    title: 'The Oculus',
    location: {
      lat: 40.711399,
      lng: -74.011146
    }
  },
  {
    title: 'Newport Centre',
    location: {
      lat: 40.727173,
      lng: -74.036209
    }
  }
];
var markers = [];

/*
 * Knockout Model
 */
var Location = function(data) {
  this.title = data.title;
  this.location = data.location;
}

/*
 * Knockout ViewModel
 */
var ViewModel = function() {
  var self = this;

  this.locationList = ko.observableArray([]);
  this.filteredList = ko.observableArray([]);

  locations.forEach(function(location) {
    self.locationList.push(new Location(location));
    self.filteredList.push(new Location(location));
  });
}

ko.applyBindings(new ViewModel());

function initMap() {
  var center = {
    lat: 40.7413549,
    lng: -74.0900000
  }

  // Constructor creates a new map.
  map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: 13
  });

  var largeInfoWindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

  // Initialize the markers array.
  for (var i = 0; i < locations.length; i ++) {
    // Get marker data
    var position = locations[i].location;
    var title = locations[i].title;

    // Create marker.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });

    // Push marker into the markers array.
    markers.push(marker);

    // Create an onclick event to open an infoWindow.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfoWindow);
    });
    bounds.extend(markers[i].position);
  }

  // Extend the boundaries of the map for each marker
  map.fitBounds(bounds);
}

// This function populates the infoWindow when the marker is clicked.
function populateInfoWindow(marker, infoWindow) {
  // Check to make sure the infoWindow is not already opened on this marker.
  if (infoWindow.marker != marker) {
    infoWindow.marker = marker;
    infoWindow.setContent('<div>' + marker.title + '</div>');
    infoWindow.open(map, marker);
    // Make sure the marker property is cleared if the infoWindow is closed.
    infoWindow.addListener('closeclick', function() {
      infoWindow.setMarker = null;
    });
  }
}
