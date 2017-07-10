var markers = [];
var map;
var myInfoWindow;
var restaurants = [];
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 11,
      center: {lat: 30.7333, lng: 76.7794}
    });

    myInfoWindow = new google.maps.InfoWindow();
    var selectedIcon = new changeMarkerColor('2caae1');

    for (var i = 0; i < restaurants.length; i++){
        var title = restaurants[i].name;
        var latlng = new google.maps.LatLng(
            parseFloat(restaurants[i].location.latitude),
            parseFloat(restaurants[i].location.longitude));
        var marker = new google.maps.Marker({
            position: latlng,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        markers.push(marker);
        marker.addListener('mouseover', changeMarker);
        marker.addListener('click', populateWindow);
        marker.addListener('mouseout', function(){
            this.setIcon(null);
        });
    }
    function changeMarker(){
        this.setIcon(selectedIcon);
    }
    function populateWindow(){
        populateInfoWindow(this,myInfoWindow);
    }
    showMarkers();
}

function showMarkers(){
    var mapBounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++){
        markers[i].setMap(map);
        mapBounds.extend(markers[i].position);
    }
    map.fitBounds(mapBounds);
}

function changeMarkerColor(markerColor){
    var marker = new google.maps.MarkerImage('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+
        markerColor+'|40|_|%E2%80%A2',
    new google.maps.Size(21,34),
    new google.maps.Point(0,0),
    new google.maps.Point(10,34),
    new google.maps.Size(21,34));
    return marker;
}

function animateMarker(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 700);
}

function populateInfoWindow(marker, myInfoWindow){
    animateMarker(marker);
    if(myInfoWindow.marker != marker){
        myInfoWindow.marker = marker;
        var content = '<div class="InfoWindow"><div><center><h5>'+ marker.title +'</center></h5>';
        content += restaurants[marker.id].location.address + '</div><div><img class= "infoImage" src="';
        content += restaurants[marker.id].image + '"></div></div>';
        myInfoWindow.setContent(content);
        myInfoWindow.open(map,marker);
        myInfoWindow.addListener('closeclick', function(){
            myInfoWindow.marker = null;
        });
    }
}

function selectMarker(value){
    if (myInfoWindow.marker != value.location) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title == value.name) {
                populateInfoWindow(markers[i], myInfoWindow);
                break;
            }
        }
    }
}

function googleError(){
    alert("Error in Loading Map");
}

function getRestaurants(){
    $.ajax({
        url: 'https://developers.zomato.com/api/v2.1/search?',
        headers: {
            'Accept' : 'application/json',
            'user-key' : 'da96ba1b274737a95f9e8ca498a3c773'
        },
        data: 'entity_id=12&entity_type=city&q=restaurants&count=15&lat=30.7333&lon=76.7794&radius=10000&sort=rating&order=desc',
        async: true
    }).done(function(data){
        for(var i = 0; i < data.restaurants.length; i++){
            var restaurant = [];
            restaurant.id = data.restaurants[i].restaurant.id;
            restaurant.location = data.restaurants[i].restaurant.location;
            restaurant.name = data.restaurants[i].restaurant.name;
            restaurant.url = data.restaurants[i].restaurant.url;
            restaurant.image =data.restaurants[i].restaurant.featured_image;
            restaurants.push(restaurant);
        }
        viewModel.init();
        initMap();
    }).fail(function(){
        alert("Error in fetchig restaurants");
    });

}

var down = false;
function toggleList(){
    $('.list-group').toggleClass("toggleList");
    if(down === true){
        down = false;
        $('#arrowImage').attr('src','css/images/upArrow.png');
    }
    else{
        down = true;
        $('#arrowImage').attr('src','css/images/downArrow.png');
    }
}

var viewModel = {
    query: ko.observable(''),
    list: ko.observableArray([]),
    error: ko.observable(''),
    init: function(query){
        for(var l = 0; l < restaurants.length; l++){
            viewModel.list.push(restaurants[l]);
        }
    },
    searchFunction: function(query) {
        viewModel.list.removeAll();
        for (var x = 0; x < markers.length; x++) {
            markers[x].setVisible(false);
        }
        for(var l in restaurants) {
            if(restaurants[l].name.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
              viewModel.list.push(restaurants[l]);
              var latlng = new google.maps.LatLng(
                parseFloat(restaurants[l].location.latitude),
                parseFloat(restaurants[l].location.longitude));
              var marker = latlng;
                for (var i = 0; i < markers.length; i++) {
                    if (markers[i].position.lat().toFixed(5) == marker.lat().toFixed(5) &&
                        markers[i].position.lng().toFixed(5) == marker.lng().toFixed(5)) {
                            markers[i].setVisible(true);
                    }
                }
            }
        }
    }
};
viewModel.query.subscribe(viewModel.searchFunction);
ko.applyBindings(viewModel);
