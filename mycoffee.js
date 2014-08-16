/*
 * use the sub techK
 * Jquery Mobile: http://jquerymobile.com/
 */

var DBG = true;
var VERSION = "1848";
var DEFAULT_RANGE = 9999 ; // meter for distance
var mSearchStart = null;
var mSearchEnd = null;

console.log("### version: " + VERSION);

// template wrapper
function Template(html) {
    this.html = html;

    this.parse(html);
}

Template.prototype = {
    parse: function(html) {
        Mustache.parse(this.html);
    },
    render: function(obj) {
        return Mustache.render(this.html, obj);
    }
};

function LocationData(dataList) {
    this.dataList = dataList;
}

LocationData.prototype.getData = function() {
    return this.dataList;
};

LocationData.prototype.parse = function() {
    // this.dataList.forEach(function(_, index, array) {
        // array.distance = getDistance(currentLat, currentLon, dataArray[i].latitude,  dataArray[i].longitude);
    // });
};

var locationData = new LocationData(dataList);

// get the distance between two places.
function getDistance(lat1, lon1, lat2, lon2) {
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

function setLastGeolocation(geolocation) {
    localStorage.latitude = geolocation.latitude;
    localStorage.longitude = geolocation.longitude;
}

function getLastGeolocation() {
    return {
        latitude: localStorage.latitude,
        longitude: localStorage.longitude
    };
}

// try to get current location info.
function getCurrentLocation() {

    function successGetGeoInfo(position) {

        if(DBG)console.log("++ successGetGeoInfo");

        var latlon = position.coords.latitude + "," + position.coords.longitude;

        var img_url = "http://maps.googleapis.com/maps/api/staticmap?center=" + latlon + "&zoom=14&size=240x320&sensor=false";

        if(DBG)console.log("get current possision is " + latlon);

        var currentGeolocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        // if(distance > (DEFAULT_RANGE / 3)) {
            // isNeededToLoadForNextPlace = true;
        // }

        setLastGeolocation(currentGeolocation);
        // longitude - 經度 - 縱線
        // latitude - 緯度 - 水平線

        isGeoinfoAvailable = true;

        // try to get the store info. which is near by me
        listStoreData(locationData.getData());

        // update current address
        GMap.utils.getCurrentAddress(currentGeolocation).done(function(address) {
            $('#addressInfo').html(address);
        });
    }

    function errorGetGeoInfo(error) {
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
    }

  	if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(successGetGeoInfo,errorGetGeoInfo);

        // update geolocation every 1 second
        // navigator.geolocation.watchPosition(handlePosition, handleError, {
            // venabledHighAccuracy: true,
            // // update time
            // maximumAge: 1000
        // });
	} else {
		console.warn("Geolocation is not supported by this browser.");
	}
}

var isGeoinfoAvailable = false;
var isNeededToLoadForNextPlace = false;

function showProgressBar(enabled) {
	if(enabled === true ) {
        $.mobile.loading('show');
	} else  {
        $.mobile.loading('hide');
	}
}

function storeLastStoreInRange(latitude, longitude) {

	if(DBG)console.log("+ storeLastStoreInRange with geo: " + latitude + "," + longitude);
    var limitRange = $('#selectRangeCondition').val();

    var storeNearBy = [];
	var distance = 0;
	var i = 0;
    var dataList = locationData.getData();
	for (i =0; i< dataList.length; i++) {
		distance = getDistance(latitude, longitude,
                               dataList[i].latitude, dataList[i].longitude);
		if(distance <= limitRange) {
			dataList[i].distance = distance;
			storeNearBy.push(dataList[i]);
		}
	}

	if(DBG)console.log("+ storeLastStoreInRange count: " + storeNearBy.length);
	if(DBG)console.log("+ storeLastStoreInRange -> ok");

    return storeNearBy;
}

function isString(obj) {
  return Object.prototype.toString.call(obj) == '[object String]';
}

function setUIisReady(isReady) {
	if(isReady === true) {
		if(DBG)console.log("ready to send message: WM_IFRAME_UI_READY");
		//window.top.postMessage({action: WM_IFRAME_UI_READY}, "*");
		if(DBG)console.log("sent message: WM_IFRAME_UI_READY");
	}
}

function listStoreData(dataList) {
	if(DBG){console.log("listStoreData from server:" + dataList.length);}

    var currentGeolocation = getLastGeolocation();

    dataList.forEach(function(item, index) {
        item.distance = getDistance(currentGeolocation.latitude, currentGeolocation.longitude, 
                                    item.latitude, item.longitude);
    });

	if(DBG)console.log(dataList);

	if(DBG)console.log("Data is ready ^_^ b :" + dataList.length);

	// try to filter the store info. which is near by me

	updateMessageBar("資料載入完成 ^_^ b");
	disableSearchControl(false);

    var storeNearBy = [];
	// sub code id for testing.
	if(isGeoinfoAvailable === true) {
        var geolocation = getLastGeolocation();
		storeNearBy = storeLastStoreInRange(geolocation.latitude, geolocation.longitude);
	}

    // if((searchResult.length === 0) ||
        // (isNeededToLoadForNextPlace === true)) {
        // updateSearchResult(mStoreNearByMe);
    // }
    updateSearchResult(storeNearBy);
}

function updateSearchResult(data) {

	if(DBG)console.log("+ updateSearchResult");

    // clear list view first
    $("#listView").empty();

	appendToList(data);
}

function updateAddressBar(address) {

	$("#messageText").hide();

	if(address.length < 1) {
		$("#messageText").fadeOut('fast');
	} else {
        $('#addressInfo').html("最近的位置:" + address);
		$("#messageText").fadeIn('slow');
	}

}

function disableSearchControl(isLock) {
	var $searchButton = $('#searchButton');
	if($searchButton.length != 0) {
		$searchButton.prop('disabled', isLock);
	}
}

function updateMessageBar(msg) {
	$("#messageText").fadeOut('fast');
	if(msg != null) {
        $('#messageText').html(msg);
	}

	$("#messageText").fadeIn('slow');

	if(DBG)console.log(msg);
}

function updateSearchResultBar(msg) {
	$("#searchResultText").fadeOut('fast');
	$("#searchResultText").html(msg);
	$("#searchResultText").fadeIn('slow');
}

//http://maps.googleapis.com/maps/api/geocode/json?language=zh-TW&sensor=true&address=
/*
function getCurrentAddress(latitude, longitude) {
	var apiUrl = "http://maps.googleapis.com/maps/api/geocode/json?";
	apiUrl += "language=zh-TW";
	apiUrl += "&sensor=true";
	apiUrl += "&latlng=" + latitude + "," + longitude;
	$.get(apiUrl, function(data) {
		if(DBG)console.log("get address info from google:");
		console.log(data);

		// need to modify sub code into a function.
		if(data.status.indexOf('OVER_QUERY_LIMIT') == -1) {
			console.log(data['results'][0].formatted_address);
			updateAddressBar(data['results'][0].formatted_address);
		}
	});
}
*/

var testDataArray = [];
function appendToList(dataArray) {

	if(DBG)console.log("+ appendToList: " + dataArray.length);
	var searchResult = dataArray;

	// if the geolocation is available
	// calculate the distance.
	if(isGeoinfoAvailable === true) {
		console.log("geolocation is available !");
        var geolocation = getLastGeolocation();

        searchResult.forEach(function(item) {
            item.distance = getDistance(geolocation.latitude, geolocation.longitude,
                                        item.latitude, item.longitude);

        });

		testDataArray = searchResult;
		searchResult.sort(function (a,b) {
            return a.distance - b.distance;
        });
	}

	if(DBG)console.log("ready to append item count:" + dataArray.length);
	if(DBG)console.log("ready to create item for listView: " + searchResult.length);
    if(DBG)console.log(searchResult);


    var itemTemplate = new Template($('#store-item').html());
    searchResult.forEach(function(item) {
        var distanceString = (item.distance > 1000)? ((item.distance / 1000.0).toFixed(1) + '公里') : (item.distance + '公尺');
        var itemView = itemTemplate.render({
            name: item.name,
            address: item.address,
            phone: item.phone,
            openTime: item.openTime,
            distance: distanceString
        });

		$('#listView').append(itemView);
    });

	if(DBG)console.log("*** create item for listView -> start");

	$("#listView").listview("refresh");
	setUIisReady(true);

	if(DBG)console.log("*** create item for listView -> done");
	updateSearchResultBar("約有 " + searchResult.length +
			" 項結果 (搜尋時間: " + (mSearchEnd - mSearchStart)/1000 + " 秒)");
}

$(function() {
	if(DBG)console.log("++ init");

	if(navigator.userAgent.toLowerCase().indexOf("trident") === -1) {
		var $pinButton = $("#pinButton");
		if($pinButton != null) {
			$pinButton.hide();
		}
	}

	window.applicationCache.addEventListener('updateready', function(e) {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
          // Browser downloaded a new app cache.
          // Swap it in and reload the page to get the new hotness.
          window.applicationCache.swapCache();
            window.location.reload();
        } else {
          console.log("Manifest didn't changed. Nothing new to server.");
        }
    }, false);

    function onSearchButtonClick() {
        var queryText = $("#searchbox").val();
        if(DBG)console.log("searchDataByKeyWord with keyword(" + queryText);

        // if(queryText.length < 1) {

            // updateSearchResult(mStoreNearByMe);
            // return;
        // }

        showProgressBar(true);
        $("#listView").empty();
        updateMessageBar("@_@ 搜尋中 ...");
        mSearchStart = new Date();

        disableSearchControl(true);

        //empty serach result
        var searchResult = [];

        var result ;

        var queryString = "";
        if (queryText.indexOf(",") != -1) {
            queryText = queryText.replace(/,/g," ");
        }

        if(queryText.indexOf(" ") != -1) {
            var queryArray = queryText.split(" ");
            var i=0;
            for( i=0; i< queryArray.length; i++) {
                if(queryString.length > 0) {
                    queryString += ".*" + queryArray[i];
                } else {
                    queryString = queryArray[i];
                }
            }
        } else {
            queryString = queryText;
        }

        var search = new RegExp(queryString, "gi");
        var dataList = locationData.getData();
        if(DBG)console.log("reay query ___" + queryString + 
                           "___ in DB Array length:" + dataList.length);

        i = 0;
        for ( i=0; i < dataList.length; i++) {
            var dataString = "";
            var hit = false;
            var k = 0;
            for( k =0; k< Object.keys(dataList[i]).length ; k++) {
                dataString += dataList[i][Object.keys(dataList[i])[k]];
            }

            if(dataString.match(search)) {
                hit = true;
                console.log(" search --> hit");
            }

            //console.log(result);
            if(hit === true) {
                searchResult.push(dataList[i]);
            }
        }
        // 1. filtering distance
        var limitRange = $('#selectRangeCondition').val();
        searchResult = searchResult.filter(function(item) {
            return item.distance <= limitRange;
        });

        if(DBG)console.log("searchDataByKeyWord --> done");
        if(DBG)console.log(searchResult);
        updateMessageBar("^_^b 搜尋完成.");
        showProgressBar(false);
        mSearchEnd = new Date();

        disableSearchControl(false);

        appendToList(searchResult);
    }

    $("#messageText").hide();

    getCurrentLocation();

    disableSearchControl(true);

    $("#searchbox").keyup(function(event){
        if(event.keyCode === 13){
            onSearchButtonClick();
        }
    });

    $("#searchButton").click(onSearchButtonClick);

    $("#selectRangeCondition").on('change', onSearchButtonClick);

    $('#updateLocation').on('click', function() {
        getCurrentLocation();
    });
});

