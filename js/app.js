var map, bounds, infoWindow;
var locations = [];


/*
 * Knockout Model
 * @constructor
 * @param {object} data - Object that contains location data
 */
var Location = function(data) {
  this.title = data.title;
  this.location = data.location;
  this.address = data.address;
  this.contact = data.contact;
  this.url = data.url;

  // Create marker
  this.marker = new google.maps.Marker({
    map: map,
    position: this.location,
    title: this.title,
    animation: google.maps.Animation.DROP
  });

  var self = this;

  // Create an onclick event to open an infoWindow
  this.marker.addListener('click', function() {
    populateInfoWindow(self);
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
    populateInfoWindow(data);
  };
};


function initApp() {
  ko.applyBindings(new ViewModel());
}


/**
 * Foursquare API
 */
function getLocationData(center, categoryId, radius, limit) {
  var url = 'https://api.foursquare.com/v2/venues/search' +
            '?ll=' + center.lat + ',' + center.lng +
            '&categoryId=' + categoryId +
            '&radius=' + radius +
            '&limit=' + limit +
            '&v=20180103&client_id=IP24XPFE4MUOWRQT0UDC2L2B3MYKYKAENTQQ2PENNYYPSOKU&client_secret=4M1EQAFNEPBKR34K1A5WNLWOVC3ZZREF2CQ1B1TDHXD1DBNZ';

  $.ajax({
    type: 'GET',
    url: url,
    dataType: 'json',
    success: function(response) {
      var venues = response.response.venues;
      venues.forEach(function (venue) {
        var title = venue.name;
        var location = venue.location;
        var coord = {
          lat: location.lat,
          lng: location.lng
        };
        var address = location.formattedAddress;
        //var address = formattedAddress[0] + ', ' + formattedAddress[1] + ', ' + formattedAddress[2];
        var contact = venue.contact.formattedPhone;
        var url = venue.url;

        locations.push({
          title: title,
          location: coord,
          address: address,
          contact: contact,
          url: url
        });
      });

      // Initialize Knockout bindings
      initApp();

      // Extend the boundaries of the map for each marker
      map.fitBounds(bounds);
    }
  }).fail(function() {
    alert('There was an error when trying to access the Foursquare API. Try reloading the page.');
  });
}

/*
 * Google Maps API
 */
function initMap() {
  var center = {
    lat: 40.7413549,
    lng: -74.0900000
  };

  // Constructor creates a new map
  map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: 13
  });

  infoWindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();

  // Asynchronously get Foursquare data
  getLocationData(center, '4bf58dd8d48988d147941735', 6000, 30);
}

function mapError() {
  alert('There was an error when trying to access the Google Maps API. Try reloading the page.');
}

// This function populates the infoWindow when the marker is clicked
function populateInfoWindow(location) {
  var marker = location.marker;
  // Check to make sure the infoWindow is not already opened on this marker
  if (infoWindow.marker != marker) {
    // Start BOUNCE animation
    marker.setAnimation(google.maps.Animation.BOUNCE);

    infoWindow.marker = marker;
    infoWindow.setContent(`
      <div>
        <h4>` + location.title + `</h4>
        ` + (location.contact === undefined ? '' : '<div>' + location.contact + '</div>') + `
        ` + (location.url === undefined ? '' : '<div><a href="' + location.url + '" target="_blank">' + location.url + '</a></div>') + `
        <br>
        <h6>Address</h6>
        <div>` + location.address[0] + `</div>
        <div>` + location.address[1] + `</div>
        <div>` + location.address[2] + `</div>
      </div>
    `);
    infoWindow.open(map, marker);

    // Make sure the marker property is cleared if the infoWindow is closed
    infoWindow.addListener('closeclick', function() {
      infoWindow.marker = null;
    });

    // Set timeout for animation
    setTimeout(function() {
      marker.setAnimation(null);
    }, 700);
  }
}
