let DBG = true;
// get the distance between two places.
export function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLon = (lon2-lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    var returnDistance = Math.round(d*1000,10);
    return returnDistance;
}

export function setLastGeolocation(geolocation) {
    localStorage.latitude = geolocation.latitude;
    localStorage.longitude = geolocation.longitude;
}

export function getLastGeolocation() {
    return {
        latitude: localStorage.latitude,
        longitude: localStorage.longitude
    };
}


// try to get current location info.
export function getCurrentLocation(successCb, errorCb) {

  function errorCb(error) {
      if(DBG)console.log("++ errorGetGeoInfo");

      switch(error.code) {
      case error.PERMISSION_DENIED:
          console.warn("User denied the request for Geolocation.");
          break;
      case error.POSITION_UNAVAILABLE:
          console.warn("Location information is unavailable.");
          break;
      case error.TIMEOUT:
          console.warn("The request to get user location timed out.");
          break;
      case error.UNKNOWN_ERROR:
          console.warn("An unknown error occurred.");
          break;
      }

      $('#addressInfo').html('無法取得地理位置(需要開啟GPS or 網路)');
      // get last location
      var currentGeolocation = getLastGeolocation();
      // try to get the store info. which is near by me
      listStoreData(locationData.getData());
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCb, errorCb);

      // update geolocation every 1 second
      // navigator.geolocation.watchPosition(handlePosition, handleError, {
          // venabledHighAccuracy: true,
          // // update time
          // maximumAge: 1000
      // });
	} else {
    console.warn("Geolocation is not supported by this browser.");
    // showProgressBar(false)
	}
}

