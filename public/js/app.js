// success
function success(position) {

  var qry = "-filter:retweets";
  var count = 50;
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  var lang = getLang();
  var link = "./api?lat="+ lat +"&lon="+ lng +"&q="+ qry +"&lang="+ lang +"&count="+ count;

  $('#status').attr("href", link);

  getAddress(lat, lng);

  getTweets(link);

}
function getLang() {
  var lang = $("html").attr("lang");
  return lang ? lang : "en";
}
// error
function error(msg) {
  var message = (typeof msg == 'string') ? msg : "failed";
  $('#status').attr("href", "#").text(message)
}
// getAddress
// http://maps.googleapis.com/maps/api/geocode/json?latlng=44.4647452,7.3553838&sensor=true
function getAddress(lat, lng) {
  var xmlhttp = new XMLHttpRequest();
  var params = "latlng="+ lat +","+ lng +"&sensor=true";
  var url = "http://maps.googleapis.com/maps/api/geocode/json?"+ params;

  showMap("map", lat, lng, "600x300");

  $.getJSON(url, function(data){
    addAddress("address", data);
  });

}
function addAddress(elem, data) {
  var out = (Array.isArray(data.results)) ? data.results[0].formatted_address : "Not found!";
  document.getElementById(elem).innerHTML = out;
}
function showMap(elem, lat, lng, size) {
  var params = "center="+ lat +","+ lng +"&zoom=16&size="+ size;
  var map = "https://maps.googleapis.com/maps/api/staticmap?"+ params;

  document.getElementById(elem).src = map;
}

// init
$(function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    error('not supported');
  }

  $(window).scroll( function(){
    $('.card').each( function(i){
      var bottom_of_object = $(this).offset().top + $(this).outerHeight();
      var bottom_of_window = $(window).scrollTop() + $(window).height() + 200;
      if( bottom_of_window > bottom_of_object ) {
        $(this).animate({'opacity':'1'},500);
      }
    });
  });

  // Menu
  $(".button-collapse").sideNav();
  // Menu
  $('select').material_select();
  $('select').change(function() {
    setAutocompleteCountry()
  });

  // Google
  initialize();

});


function addCard(avatar, msg, image) {
  var media = "";
  if (image) {
    media = '<div class="card-image valign-wrapper">' +
      '  <img class="valign" src="'+ image +'">' +
      '</div>';
  }
  var template = '<div class="card" style="opacity:0;">' + media +
      '  <div class="card-content">' +
      '    <div class="item-avatar">' +
      '      <img src="'+ avatar +'" alt="Avatar">' +
      '      <p>'+ msg +'</p>' +
      '      <div style="padding: 10px 0">' +
      '        <i class="mdi-action-thumb-up right"></i>' +
      '        <i class="mdi-communication-chat right"></i>' +
      '        <i class="mdi-social-share right"></i>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>';
  return template;
}

function listOfCards(collection) {
  var listCard = "", avatar, message, image;
  var regex = /(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?)/ig
  console.log(collection)
  for (var i = collection.statuses.length - 1; i >= 0; i--) {
    avatar   = collection.statuses[i].user.profile_image_url;
    message  = collection.statuses[i].text;
    image    = collection.statuses[i].entities.media;
    image    = Array.isArray(image) ? image[0].media_url : false;
    replaced_msg = message.replace(regex, "<a href='$1' target='_blank'>$1</a>");
    listCard += addCard(avatar, replaced_msg, image);
  };
  var lnk = collection.search_metadata.next_results;
  // lnk = collection.search_metadata.next_results +"&cursor="+ collection.search_metadata.max_id_str
  var nextPgLink = '<button class="btn-next btn-large btn-flat waves-effect waves-teal" data-next-page="./api'+ lnk +'">More</button>';
  listCard += nextPgLink;
  return listCard;
}

function getMore() {
  $(".btn-next").click(function(event){
    event.preventDefault();
    var link = $(this).data('next-page');
    getTweets(link);
    $(this).addClass('old').html('<i class="mdi-notification-sync"></i> loading');
  });
}

function getTweets(url) {
  $.getJSON(url, function(data) {
    var cards = listOfCards(data);
    $('#jscroll').append(cards);
    getMore();
    $(".loading").hide("fast");
    $(".btn-next.old").fadeOut(300, function(){ $(this).remove(); });
    $(".card:lt(3)").animate({'opacity':'1'},500);
  });
}




// This example uses the autocomplete feature of the Google Places API.
// It allows the user to find all hotels in a given place, within a given
// country. It then displays markers for all the hotels returned,
// with on-click details for each hotel.

var map, places, infoWindow;
var markers = [];
var autocomplete;
var countryRestrict = { 'country': 'au' };
var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');

var countries = {
  'au': {
    center: new google.maps.LatLng(-25.3, 133.8),
    zoom: 4,
    lang: 'en'
  },
  'br': {
    center: new google.maps.LatLng(-14.2, -51.9),
    zoom: 3,
    lang: 'pt'
  },
  'ca': {
    center: new google.maps.LatLng(62, -110.0),
    zoom: 3,
    lang: 'en'
  },
  'fr': {
    center: new google.maps.LatLng(46.2, 2.2),
    zoom: 5,
    lang: 'fr'
  },
  'de': {
    center: new google.maps.LatLng(51.2, 10.4),
    zoom: 5,
    lang: 'de'
  },
  'mx': {
    center: new google.maps.LatLng(23.6, -102.5),
    zoom: 4,
    lang: 'es'
  },
  'nz': {
    center: new google.maps.LatLng(-40.9, 174.9),
    zoom: 5,
    lang: 'en'
  },
  'it': {
    center: new google.maps.LatLng(41.9, 12.6),
    zoom: 5,
    lang: 'it'
  },
  'za': {
    center: new google.maps.LatLng(-30.6, 22.9),
    zoom: 5,
    lang: 'en'
  },
  'es': {
    center: new google.maps.LatLng(40.5, -3.7),
    zoom: 5,
    lang: 'es'
  },
  'pt': {
    center: new google.maps.LatLng(39.4, -8.2),
    zoom: 6,
    lang: 'pt'
  },
  'us': {
    center: new google.maps.LatLng(37.1, -95.7),
    zoom: 3,
    lang: 'en'
  },
  'uk': {
    center: new google.maps.LatLng(54.8, -4.6),
    zoom: 5,
    lang: 'en'
  }
};

function initialize() {
  var myOptions = {
    zoom: countries['us'].zoom,
    center: countries['us'].center,
    mapTypeControl: false,
    panControl: false,
    zoomControl: false,
    streetViewControl: false
  };

  // map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);

  infoWindow = new google.maps.InfoWindow({
    content: document.getElementById('info-content')
  });

  // Create the autocomplete object and associate it with the UI input control.
  // Restrict the search to the default country, and to place type "cities".
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {HTMLInputElement} */(document.getElementById('autocomplete')),
      {
        types: ['geocode','establishment'],
        componentRestrictions: countryRestrict
      });
  // places = new google.maps.places.PlacesService(map);

  google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);

  // Add a DOM event listener to react when the user selects a country.
  google.maps.event.addDomListener(document.getElementById('country'), 'change',
      setAutocompleteCountry);
}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
function onPlaceChanged() {
  var place = autocomplete.getPlace();
  if (place.geometry) {
    // map.panTo(place.geometry.location);
    // map.setZoom(15);
    console.log(place.geometry.location, place.geometry.location.A, place.geometry.location.F)
    search2(place.geometry.location.A, place.geometry.location.F);

    // search();
  } else {
    document.getElementById('autocomplete').placeholder = 'Enter a location';
  }

}
function search2(lat, lng) {
  $("#jscroll .card, #jscroll .btn-next").show().remove();
  var country = document.getElementById('country').value;
  var link = "./api?lat="+ lat +"&lon="+ lng +"&lang="+ countries[country].lang;
  getAddress(lat, lng);
  getTweets(link);

}


// Search for hotels in the selected city, within the viewport of the map.
function search() {
  var search = {
    bounds: map.getBounds(),
    types: ['lodging']
  };

  places.nearbySearch(search, function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      clearResults();
      clearMarkers();
      // Create a marker for each hotel found, and
      // assign a letter of the alphabetic to each marker icon.
      for (var i = 0; i < results.length; i++) {
        var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
        var markerIcon = MARKER_PATH + markerLetter + '.png';
        // Use marker animation to drop the icons incrementally on the map.
        markers[i] = new google.maps.Marker({
          position: results[i].geometry.location,
          animation: google.maps.Animation.DROP,
          icon: markerIcon
        });
        // If the user clicks a hotel marker, show the details of that hotel
        // in an info window.
        markers[i].placeResult = results[i];
        google.maps.event.addListener(markers[i], 'click', showInfoWindow);
        setTimeout(dropMarker(i), i * 100);
        addResult(results[i], i);
      }
    }
  });
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    if (markers[i]) {
      markers[i].setMap(null);
    }
  }
  markers = [];
}

// [START region_setcountry]
// Set the country restriction based on user input.
// Also center and zoom the map on the given country.
function setAutocompleteCountry() {
  var country = document.getElementById('country').value;
  if (country == 'all') {
    autocomplete.setComponentRestrictions([]);
    // map.setCenter(new google.maps.LatLng(15, 0));
    // map.setZoom(2);
  } else {
    autocomplete.setComponentRestrictions({ 'country': country });
    // map.setCenter(countries[country].center);
    // map.setZoom(countries[country].zoom);
  }
  clearResults();
  clearMarkers();
}
// [END region_setcountry]

function dropMarker(i) {
  return function() {
    markers[i].setMap(map);
  };
}

function addResult(result, i) {
  var results = document.getElementById('results');
  var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
  var markerIcon = MARKER_PATH + markerLetter + '.png';

  var tr = document.createElement('tr');
  tr.style.backgroundColor = (i % 2 == 0 ? '#F0F0F0' : '#FFFFFF');
  tr.onclick = function() {
    google.maps.event.trigger(markers[i], 'click');
  };

  var iconTd = document.createElement('td');
  var nameTd = document.createElement('td');
  var icon = document.createElement('img');
  icon.src = markerIcon;
  icon.setAttribute('class', 'placeIcon');
  icon.setAttribute('className', 'placeIcon');
  var name = document.createTextNode(result.name);
  iconTd.appendChild(icon);
  nameTd.appendChild(name);
  tr.appendChild(iconTd);
  tr.appendChild(nameTd);
  results.appendChild(tr);
}

function clearResults() {
  var results = document.getElementById('results');
  while (results.childNodes[0]) {
    results.removeChild(results.childNodes[0]);
  }
}

// Get the place details for a hotel. Show the information in an info window,
// anchored on the marker for the hotel that the user selected.
function showInfoWindow() {
  var marker = this;
  places.getDetails({placeId: marker.placeResult.place_id},
      function(place, status) {
        if (status != google.maps.places.PlacesServiceStatus.OK) {
          return;
        }
        infoWindow.open(map, marker);
        // buildIWContent(place);
      });
}
