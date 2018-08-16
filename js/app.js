//Foursquare API client
var client_ID = 'OIANAZPLHKG4BNZUZ5AKDYUR4JAF0NQEOAV3WJZVCQGJHQT0';
var client_Secret = 'NZ4UWTS4UOD144LCE4FMRFLBRGE4QYSO53F00XG1OVMSWODQ';


var initializeData =[
    {
        title: 'India Gate',
        location: {
            lat: 28.6129,
            lng: 77.2295
  }
},
    {
  title: 'Qutub Minar',
   location: {
     lat: 28.5244,
     lng: 77.1855
  }
},
    {
  title: 'Red Fort',
   location: {
    lat: 28.6562,
     lng: 77.2410
  }
},
    {
  title: 'Humayuns Tomb',
   location: {
    lat: 28.5932,
    lng: 77.2506
  }
},
    {
  title: 'Jantar Mantar',
   location: {
    lat: 28.6271,
     lng: 77.2166
  }
},
    {
  title: 'Raj Ghat',
   location: {
    lat: 28.6406,
     lng: 77.2495
  }
},

{
title: 'Hauz Khas',
location: {
lat: 28.5494,
 lng: 77.2001
}
},

{
title: 'South Delhi',
location: {
lat: 28.4817,
 lng: 77.1873
}
},

{
title: 'Deer Park',
location: {
lat: 28.5550,
 lng: 77.1916
}
},
    {
  title: 'Parliament House',
   location: {
    lat: 28.6172,
     lng: 77.2081
  }
},
    {
  title: 'Rashtrapati Bhavan',
   location: {
    lat: 28.6143,
     lng: 77.1994
  }
},
    {
  title: 'Nehru Planeterium',
   location: {
    lat: 28.6039,
     lng: 77.1981
  }
},

    {
  title: 'Mughal Garden',
   location: {
    lat: 28.6145,
     lng: 77.1978
    }
},

   {
  title: 'National Rail Museum',
   location: {
    lat: 28.5858,
     lng: 77.1798
   }
},

  {
 title: 'National Rail Museum',
  location: {
   lat: 28.5858,
    lng: 77.1798
  }
},

    {
  title: 'Teen Murti Bhavan',
   location: {
    lat: 28.6026,
     lng: 77.1988
  }
}
];

// declaring global variables here
var map;
var infoWindow;
var bounds;

//here we will make the location model
var LocationMarker = function(data) {
    var self = this;

    this.title = data.title;
    this.position = data.location;
    this.street = '',
    this.city = '',
    this.zip = '',
    this.country = '',
    this.phone = '';
    this.visible = ko.observable(true);



    // getting JSON request of foursquare data
    var url = 'https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat + ',' + this.position.lng + '&client_id=' + client_ID + '&client_secret=' + client_Secret + '&v=20160118' + '&query=' + this.title;

    $.getJSON(url).done(function(data) {
		var results = data.response.venues[0];
        self.street = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];
        self.zip = results.location.formattedAddress[3];
        self.country = results.location.formattedAddress[4];
        self.phone = results.contact.formattedPhone ? results.contact.formattedPhone : 'N/A';
     }).fail(function() {
        alert('There is some problem with foursquare');
     });

    self.marker = new google.maps.Marker({
        map: map,
        position: this.position,
        title: this.title,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon
    });

    self.filterMarkers = ko.computed(function () {
        // set marker and extend bounds (showListings)
        if(self.visible() === true) {
            self.marker.setMap(map);
            bounds.extend(self.marker.position);
            map.fitBounds(bounds);
        } else {
            self.marker.setMap(null);
        }
    });

    // InfoWindow
    self.marker.addListener('click', function() {
        populateInfoWindow(this, self.street, self.city, self.zip, self.country, self.phone, infoWindow);
        toggleBounce(this);
        map.panTo(this.getPosition());
        map.panBy(0, -200)
    });

    var defaultIcon = makeMarkerIcon('000080');
    var highlightedIcon = makeMarkerIcon('FFC0CB');

    this.marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
    });
    this.marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
    });

    // this will show the information of the location selected
    this.show = function(location) {
        google.maps.event.trigger(self.marker, 'click');
    };

    this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};

};

//ViewModel
var ViewModel = function() {
    var self = this;

    this.searchItem = ko.observable('');
    this.mapList = ko.observableArray([]);

    // here we are adding location markers for each location
    initializeData.forEach(function(location) {
        self.mapList.push( new LocationMarker(location) );
    });

    this.locationList = ko.computed(function() {
        var searchFilter = self.searchItem().toLowerCase();
        if (searchFilter) {
            return ko.utils.arrayFilter(self.mapList(), function(location) {
                var str = location.title.toLowerCase();
                var result = str.includes(searchFilter);
                location.visible(result);
				return result;
			});
        }
        self.mapList().forEach(function(location) {
            location.visible(true);
        });
        return self.mapList();
    }, self);
};

function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(22, 35),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 35),
        new google.maps.Size(22, 35));
    return markerImage;
}

// This function is for populating the infoWindow
function populateInfoWindow(marker, street, city, zip, country, phone, infowindow) {
    if (infowindow.marker != marker) {
        infowindow.setContent('');
        infowindow.marker = marker;
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 60;
        var windowContent = '<h3>' + marker.title + '</h3>' +
            '<p>' + street + "<br>" + city + '<br>'+ zip + "<br>" + country + '<br>'  + phone + "</p>";

//If status is OK, the position of streetview image is computed & from that we get the panaroma
          var getStreetView = function (data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent(windowContent + '<div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 25
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent(windowContent + '<div style="color: black">Street View not Found</div>');
            }
        };

        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        infowindow.open(map, marker);
    }
}

function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 700);
  }
}


function initMap() {
    var indiagate = {
        lat: 28.6129,
        lng: 77.2295
    };

    var mapOptions = {
      center: indiagate,
      zoom: 4,
      mapTypeControl:false,

      styles: [
    {
      "featureType": "landscape",
      "stylers": [
        { "hue": "#FFBB00"},
        {"saturation": 43.400000000000006},
        {"lightness": 37.599999999999994},
        {"gamma": 1}
      ]
    },{
      "featureType": "road.highway",
      "stylers": [
        {"hue": "#FFC200"},
        {"saturation": -61.8},
        {"lightness": 45.599999999999994},
        {"gamma": 1}
      ]
    },{
      "featureType": "road.arterial",
      "stylers": [
        {"hue": "#FF0300"},
        {"saturation": -100},
        {"lightness": 51.19999999999999},
        {"gamma": 1}
      ]
    },{
      "featureType": "road.local",
      "stylers": [
        {"hue": "#FF0300"},
        {"saturation": -100},
        {"lightness": 52},
        {"gamma": 1}
      ]
    },{
      "featureType": "water",
      "stylers": [
        {"hue": "#0078FF"},
        {"saturation": -13.200000000000003},
        {"lightness": 2.4000000000000057},
        {"gamma": 1}
      ]
},
 {
  "featureType": "poi",
  "stylers": [
    {
      "visibility": "off"
    }
  ]
}
]
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    infoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();
    ko.applyBindings(new ViewModel());
  }

// handling map error
onGMapsError = function() {
  alert('An error took place! Please try again later');
};
