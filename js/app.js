var map, bounds, infoWindow;
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


/*
 * Knockout Model
 */
var Location = function(data) {
  this.title = data.title;
  this.location = data.location;

  // Create marker
  this.marker = new google.maps.Marker({
    map: map,
    position: this.location,
    title: this.title,
    animation: google.maps.Animation.DROP
  });

  // Create an onclick event to open an infoWindow
  this.marker.addListener('click', function() {
    populateInfoWindow(this);
  });

  // Extend the boundaries of the map for each marker
  bounds.extend(this.location);
};


/*
 * Knockout ViewModel
 */
var ViewModel = function() {
  var self = this;
  self.locationList = ko.observableArray([]);

  locations.forEach(function(location) {
    self.locationList.push(new Location(location));
  });

  self.searchText = ko.observable('');

  self.filteredLocations = ko.computed(function() {
    var searchText = self.searchText().toLowerCase();

    return ko.utils.arrayFilter(self.locationList(), function(location) {
      if (location.title.toLowerCase().indexOf(searchText) != -1) {
        location.marker.setMap(map);
        return true;
      } else {
        location.marker.setMap(null);
        return false;
      }
    });
  });

  self.openInfoWindow = function(data) {
    $('#modal').modal('hide');
    populateInfoWindow(data.marker);
  };
};


function initApp() {
  ko.applyBindings(new ViewModel());
}


/*
 * Google Maps API
 */
function initMap() {
  var center = {
    lat: 40.7413549,
    lng: -74.0900000
  }

  // Constructor creates a new map
  map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: 13
  });

  infoWindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();

  // Create Knockout bindings
  initApp();
}

// This function populates the infoWindow when the marker is clicked
function populateInfoWindow(marker) {
  // Check to make sure the infoWindow is not already opened on this marker
  if (infoWindow.marker != marker) {
    infoWindow.marker = marker;
    infoWindow.setContent('<div>' + marker.title + '</div>');
    infoWindow.open(map, marker);

    // Make sure the marker property is cleared if the infoWindow is closed
    infoWindow.addListener('closeclick', function() {
      infoWindow.marker = null;
    });
  }
}
