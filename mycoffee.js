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

    setLastGeolocation(currentGeolocation);
    // longitude - 經度 - 縱線
    // latitude - 緯度 - 水平線

    // try to get the store info. which is near by me
    listStoreData(locationData.getData());

    var now = new Date();
    var hour = now.getHours() + "";
    var min = now.getMinutes() + "";
    var sec = now.getSeconds() + "";

    min = (min.length === 1)? "0" + min : min;
    sec = (sec.length === 1)? "0" + sec : sec;

        var lastUpdate = hour + ":" + min + ":" + sec;
        // update current address
        if(navigator.onLine === true && typeof GMap !== 'undefined') {
            GMap.utils.getCurrentAddress(currentGeolocation).done(function(address) {
                $('#addressInfo').html(address);
            }).fail(function() {
                $('#addressInfo').html('更新地理位置:' + lastUpdate);
            });
        }
        else {
            $('#addressInfo').html('更新地理位置:' + lastUpdate);
        }
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

        $('#addressInfo').html('無法取得地理位置(需要開啟GPS or 網路)');
        // get last location
        var currentGeolocation = getLastGeolocation();
        // try to get the store info. which is near by me
        listStoreData(locationData.getData());
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
        showProgressBar(false);
	}
}

function showProgressBar(enabled) {
	if(enabled === true ) {
        mSearchStart = new Date();
        $.mobile.loading('show');
        console.log("start: " + mSearchStart);
	} else  {
        mSearchEnd =  new Date();
        $.mobile.loading('hide');
        console.log("end: " + mSearchEnd);
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

	//if(DBG)console.log(dataList);

	if(DBG)console.log("Data is ready ^_^ b :" + dataList.length);

	// try to filter the store info. which is near by me

	updateMessageBar("資料載入完成 ^_^ b");
	disableSearchControl(false);

    var storeNearBy = [];
	// sub code id for testing.
    var geolocation = getLastGeolocation();
    storeNearBy = storeLastStoreInRange(geolocation.latitude, geolocation.longitude);

    showProgressBar(false);
    updateSearchResult(storeNearBy);
}

function updateSearchResult(data) {

	if(DBG)console.log("+ updateSearchResult");

    // clear list view first
    $("#listView").empty();

	appendToList(data);
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

var testDataArray = [];
function appendToList(dataArray) {

	if(DBG)console.log("+ appendToList: " + dataArray.length);
	var searchResult = dataArray;

	// if the geolocation is available
	// calculate the distance.
    var geolocation = getLastGeolocation();

    searchResult.forEach(function(item) {
        item.distance = getDistance(geolocation.latitude, geolocation.longitude,
                                    item.latitude, item.longitude);

    });

    testDataArray = searchResult;
    searchResult.sort(function (a,b) {
        return a.distance - b.distance;
    });

	if(DBG)console.log("ready to append item count:" + dataArray.length);
	if(DBG)console.log("ready to create item for listView: " + searchResult.length);
    //if(DBG)console.log(searchResult);


    var itemTemplate = new Template($('#store-item').html());
    searchResult.forEach(function(item) {
        var distanceString = (item.distance >= 1000)? ((item.distance / 1000.0).toFixed(1) + '公里') : (item.distance + '公尺');
        var storeItem = {
            name: item.name,
            address: item.address,
            phone: item.phone,
            openTime: item.openTime,
            distance: distanceString
        };
        var itemView = itemTemplate.render(storeItem);

		$('#listView').append(itemView);
        $('#listView li a.item').last().data('store-item', storeItem);
    });

    // rebind page navigation for list view item
    $('#listView li a').click(function(event) {
        var $target = $(event.target);
        console.info("### click: " ,$(event.target));
        var storeItem = $(this).data('store-item');
        sessionStorage.storeItem = JSON.stringify(storeItem);
        $("body").pagecontainer('change', '#detail', {reverse: true, transition: 'none'});

        $(this).css("background-color", "#f6f6f6")
        .css("color", "#333")
        .css("text-shadow", "0 0 0");
    });

	if(DBG)console.log("*** create item for listView -> start");

	$("#listView").listview("refresh");
    // update icon buttons
    $("button.location").buttonMarkup();
    $("a.phone").buttonMarkup();
    $("button.openTime").buttonMarkup();

	setUIisReady(true);

	if(DBG)console.log("*** create item for listView -> done");

	updateSearchResultBar("約有 " + searchResult.length +
			" 項結果 (搜尋時間: " + (mSearchEnd - mSearchStart)/1000 + " 秒)");
}


$(function() {
	if(DBG)console.log("++ init");

    $("#auther_label").click(function() {
        window.open("http://studiobinghuan.blogspot.com?view=flipcard", "_blank");
    });

    showProgressBar(true);// Profile#1

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
        showProgressBar(true);// Profile#2
        $("#listView").empty();
        updateMessageBar("@_@ 搜尋中 ...");

        disableSearchControl(true);

        //empty serach result
        var searchResult = [];
        var result;
        var dataList = locationData.getData();

        var queryText = $("#searchbox").val();
        if(DBG)console.log("searchDataByKeyWord with keyword(" + queryText);
        var queryString = "";

        if(queryText != null) {
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
        }
        // for index2.html
        else {
            searchResult = dataList.slice(0);
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
        disableSearchControl(false);

        appendToList(searchResult);
    }

    $("#messageText").hide();

    getCurrentLocation();

    $('#addressInfo').html('位置不明');

    disableSearchControl(true);

    $("#searchbox").keyup(function(event){
        if(event.keyCode === 13){
            onSearchButtonClick();
        }
    });

    // $("#searchbox").on('input', function(e) {
        // onSearchButtonClick();
    // });

    $("#searchButton").click(onSearchButtonClick);

    $("#selectRangeCondition").on('change', onSearchButtonClick);

    $('#updateLocation').on('click', function() {
        showProgressBar(true);
        getCurrentLocation();
    });

    var storeDetailTemplate = new Template($('#store-detail').html());
    $(document).on('pagebeforeshow', '#detail', function(e, data) {
        var storeItem;
        storeItem = JSON.parse(sessionStorage.storeItem);

        var storeDetailView = storeDetailTemplate.render(storeItem);
        var $content = $('#detail').find('[data-role="content"]');
        $content.empty();
        $content.append(storeDetailView);

        // update icon buttons
        $content.find("button.location").buttonMarkup();
        $content.find("button.phone").buttonMarkup();
        $content.find("button.openTime").buttonMarkup();


        // BH_Lin@2014/09/01    ----------------------------------------------->
        // purpose: make iframe to fit 100% of container's remaining height
        $('#mapview').load(function(){

            document.getElementById('mapview').style.height = (window.innerHeight - $("#mapview").position().top - 20) +"px";
            console.log("MAPVIEW: ", window.innerHeight, $("#mapview").position().top, document.getElementById('mapview').style.height);

        });

        window.onresize = function(event) {
            document.getElementById('mapview').style.height = (window.innerHeight - $("#mapview").position().top - 20)+"px";
        };
        // BH_Lin@2014/09/01    -----------------------------------------------<
    });

    // gmap
    function initialize(mapID, mapCSS) {
        if(mapCSS == null) {
            $('#' + mapID).css({height: '100%'});
        } else {
            $('#' + mapID).css(mapCSS);
        }
        // new a map
        window.gmap = new GMap(mapID);

        // detect current location
        window.gmap.setCurrentLocation();
    }

    $('#gmap').on('pageinit', function() {
        initialize('map-canvas', {
            width: '100%',
            height: '100%',
            position: 'absolute'
        });
        initialize('map-canvas');

        // set markers
        dataList.forEach(function(location) {
            window.gmap.addMarkers([location], {
                icon: 'icon/mycoffee-32.png'
            });
        });
    });



    $('#gmap').on('pageshow', function() {
        window.gmap.refresh();
    });

});

