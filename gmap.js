(function(global) {

    function GMap(mapId, mapOptions) {
        var defaultMapOptions = {
            center: new google.maps.LatLng(25.1044810, 121.5164450),
            panControl: false,
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            scaleControl: true,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        mapOptions = defaultMapOptions;

        this.map = new google.maps.Map(document.getElementById(mapId), mapOptions);
        this.markers = [];
        this.currentLocation = null;
        this.directionsDisplay = null;
        this.markerIcon = "";
    }

    GMap.prototype.setMarkerIcon = function(image) {
        this.markerIcon = image;
    };

    GMap.prototype.setCurrentLocation = function() {
        // detect current location
        if(navigator.geolocation) {
            var _this = this;
            navigator.geolocation.getCurrentPosition(function(pos) {
                var geocode = {
                    latitude: pos.coords.latitude, 
                    longitude: pos.coords.longitude
                };
                var location = GMap.utils.geocode2LatLng(geocode);
                window.current_pos = location;
                _this.setCenter(location);
                _this.addMarkers([geocode]);
            });
        }
    };

    GMap.prototype.setCenter = function(location) {
        this.map.setCenter(location);
    };

    GMap.prototype.addMarkers = function(locationArray, markerOption) {
        if(markerOption == null) {
            markerOption = {};
        }
        // To add the marker to the map, use the 'map' property
        var _this = this;
        locationArray.forEach(function(location, index, array) {
            var latLng = GMap.utils.geocode2LatLng(location);
            var marker = new google.maps.Marker({
                position: latLng,
                map: _this.map,
                icon: _this.markerIcon || markerOption.icon,
                title: location.name || 'Hello'
            });

            _this.markers.push(marker);
        });

        return this.markers;
    };

    GMap.prototype.clearMarkers = function() {
        this.markers.forEach(function(val, index, arr) {
            arr[index].setMap(null);
        });
    };

    GMap.prototype.route = function(start, end, mode) {
        mode = (mode == null)? GMap.Mode.driving : mode;

        // clear previous directions display
        if(this.directionsDisplay != null) {
            this.directionsDisplay.setMap(null);
        }

        var directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer();// also, constructor can get "DirectionsRendererOptions" object
        this.directionsDisplay.setMap(this.map); // map should be already initialized.

        var request = {
            origin: start,
            destination: end,
            travelMode: mode,
            durationInTraffic: true
        };

        var _this = this;
        directionsService.route(request, function(response, status) {
            if(status == google.maps.DirectionsStatus.OK) {
                _this.directionsDisplay.setDirections(response);
                console.log("DirectionsResult:");
                console.log(response);
            }
        });
    };

    GMap.Mode = {
        driving: google.maps.TravelMode.DRIVING,
        walking: google.maps.TravelMode.WALKING
    };

    // utils
    var geocoder = new google.maps.Geocoder();   
    GMap.utils = {
        geocode: function(address) {
            var defer = $.Deferred();
            geocoder.geocode({ 'address': address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    console.log("Geolocation = ");
                    console.log(results[0]);
                    defer.resolve(results[0].geometry.location);
                } else {
                    console.log("Geocode was not successful for the following reason: " + status);
                    defer.reject(status);
                }
            });

            return defer;
        },
        geocode2LatLng: function(geocode) {
            // geocode: {latitude: Number, longitude: Number}
            return new google.maps.LatLng(geocode.latitude, geocode.longitude);
        },
        getCurrentAddress: function(geocode) {
            var defer = $.Deferred();
            var latLng = new google.maps.LatLng(geocode.latitude, geocode.longitude);
            geocoder.geocode({latLng: latLng}, function(results, status) {
                if(status === google.maps.GeocoderStatus.OK) {
                    if(results[0]) {
                        console.log(results);
                        // $("#address").html(format_addr);
                        // var addrComponents= results[0].address_components;
                        var formattedAddr = '';

                        // addrComponents.reverse().forEach(function(comp) {
                            // formattedAddr += comp.long_name;
                            // if(comp.types.indexOf('street_number') !== -1) {
                                // formattedAddr += "號";
                            // }
                        // });
                        formattedAddr = results[0].formatted_address;
                    }

                    defer.resolve(formattedAddr);
                }
                else {
                    defer.reject();
                }
            });

            return defer;
        }
    };

    global.GMap = GMap;
})(window);
