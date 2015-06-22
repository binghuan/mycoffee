/*
 * use the sub techK
 * Jquery Mobile: http://jquerymobile.com/
 */

var DBG = true;
var VERSION = "1848";
var DEFAULT_RANGE = 9999 ; // meter for distance
var mSearchStart = null;
var mSearchEnd = null;
// FIXME: this api key is only for domain: binghuan.github.io
//		  if you want to host this app in your domain, please change this api key
//        or your embeded google map will not work
var GOOGLE_API_KEY = 'AIzaSyBUdBNMLQYIi3egygOdtroo7Aqj7MQJTp8';

console.log("### version: " + VERSION);

function getTodayOpeningHour(openingTime) {
    if(openingTime == null) {
        return null;
    }
    var days = {0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'};

    var now = new Date();
    var day = days[now.getDay()];

    return openingTime[day];
}

function isOpeningNow(openingHour) {
    if(openingHour == null) {
        return false;
    }

    var now = new Date();

    // translate time from "0800" to 800, "2000" to 2000
    var nowTime = parseInt(now.getHours()) * 100 + parseInt(now.getMinutes());

    var tmp = openingHour.split('~');
    var openingTime = parseInt(tmp[0]);
    var closedTime = parseInt(tmp[1]);

    if(closedTime < openingTime) {
        closedTime += 2400;
    }
    if(nowTime >= openingTime && nowTime <= closedTime) {
        return true;
    }

    return false;
}

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

function StoreInfo(dataList) {
    this.stores = dataList;
    this.onlyOpeningStores = false;
}

StoreInfo.prototype.setOnlyOpeningStores = function(bool) {
    this.onlyOpeningStores = bool;
};

StoreInfo.prototype.getStores = function() {
    var stores = this.stores;
    
    if(this.onlyOpeningStores) {
        stores = stores.filter(function(store) {
            var openingTime = store.openingTime;
            var openingHour = getTodayOpeningHour(openingTime);
            // if no openingTime, always show the store
            return (openingTime != null)? isOpeningNow(openingHour) : true;
        });
    }

    return stores;
};

StoreInfo.prototype.getOpeningStores = function() {
};

StoreInfo.prototype.parse = function() {
    // this.dataList.forEach(function(_, index, array) {
        // array.distance = getDistance(currentLat, currentLon, dataArray[i].latitude,  dataArray[i].longitude);
    // });
};

var storeInfo = new StoreInfo(dataList);

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
    listStoreData(storeInfo.getStores());

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
        listStoreData(storeInfo.getStores());
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
    var dataList = storeInfo.getStores();
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
    var limitRange = $('#selectRangeCondition').val();
    var storeNearBy = [];

    dataList.forEach(function(store, index) {
        store.distance = getDistance(currentGeolocation.latitude, currentGeolocation.longitude,
                                    store.latitude, store.longitude);

		if(store.distance <= limitRange) {
            storeNearBy.push(store);
		}
    });

	//if(DBG)console.log(dataList);

	if(DBG)console.log("Data is ready ^_^ b :" + dataList.length);

	// try to filter the store info. which is near by me

	updateMessageBar("資料載入完成 ^_^ b");
	disableSearchControl(false);

    // var storeNearBy = [];
	// sub code id for testing.
    // var geolocation = getLastGeolocation();
    // storeNearBy = storeLastStoreInRange(dataList, geolocation.latitude, geolocation.longitude);
    /*
    dataList.forEach(function(store) {
        if(geolocation.latitude == null || geolocation.longitude == null) {
        }
		var distance = getDistance(geolocation.latitude, geolocation.longitude,
                               store.latitude, store.longitude);
		if(distance <= limitRange) {
			store.distance = distance;
            storeNearBy.push(store);
		}
    });
    */

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
            distance: distanceString,
			google_api_key: GOOGLE_API_KEY
        };
        // use openingTime instead of openTime if it exists
        if(item.openingTime) {
            storeItem.openTime = null;
            storeItem.openingHour = getTodayOpeningHour(item.openingTime);
            storeItem.openingHourString = storeItem.openingHour;
            if(storeItem.openingHour == null) {
                storeItem.openingHourString = '休息';
            }
            else {
                var isOpen = isOpeningNow(storeItem.openingHour);
                if(!isOpen) {
                    storeItem.openingHourString += ('(關店)');
                }
            }
        }
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
    $("button.openingTime").buttonMarkup();

	setUIisReady(true);

	if(DBG)console.log("*** create item for listView -> done");

	updateSearchResultBar("附近有 <b>" + searchResult.length +
			" </b>家店 (搜尋時間: " + (mSearchEnd - mSearchStart)/1000 + " 秒)");
}


$(function() {
	if(DBG)console.log("++ init");

    // recover last selectRangeCondition from localStorage
    var limitRange = localStorage.limitRange;
    if(limitRange != null) {
        $("#selectRangeCondition").val(limitRange);
        $("#selectRangeCondition").selectmenu("refresh");
    }

    $("#auther_label").click(function() {
        window.open("http://studiobinghuan.blogspot.tw/2014/08/my-coffee-for-taiwan.html", "_blank");
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
        // save selectRangeCondition for later use
        localStorage.limitRange = $("#selectRangeCondition").val();

        $("#listView").empty();
        updateMessageBar("@_@ 搜尋中 ...");

        disableSearchControl(true);

        //empty serach result
        var searchResult = [];
        var result;
        var dataList = storeInfo.getStores();

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

    $("#searchButton").click(onSearchButtonClick);

    $("#selectRangeCondition").on('change', onSearchButtonClick);

    $('#updateLocation').on('click', function() {
        showProgressBar(true);
        getCurrentLocation();
    });

    var storeDetailTemplate = new Template($('#store-detail').html());
    $(document).on('pagebeforeshow', '#detail', function(e, data) {
        var storeItem;
        if(sessionStorage.storeItem == null) {
            $("body").pagecontainer('change', '#index', {transition: 'none'});
            return;
        }
        storeItem = JSON.parse(sessionStorage.storeItem);

        var storeDetailView = storeDetailTemplate.render(storeItem);
        var $content = $('#detail').find('[data-role="content"]');
        $content.empty();
        $content.append(storeDetailView);

        // update icon buttons
        $content.find("button.location").buttonMarkup();
        $content.find("button.phone").buttonMarkup();
        $content.find("button.openTime").buttonMarkup();
        $content.find("button.openingTime").buttonMarkup();


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

        // hide mapview if no network
        if(navigator.onLine === true) {
            $('#mapview').show();
        }
        else {
            $('#mapview').hide();
        }
    });

    $('#selectOpen').on('click', function() {
        showProgressBar(true);

        // set or unset selectOpen checkbox
        storeInfo.setOnlyOpeningStores($(this).prop('checked'));
        $('[data-type="search"]').keyup();
        // $('[data-type="search"]').keypress('a');
        // $('#listView').filterable('refresh');

        // var stores = storeInfo.getStores();
        // remove closed stores from store list
        // listStoreData(stores);

        showProgressBar(false);
    });

    // hide facebook like button
    $(document).on('pagebeforeshow', '#index', function(e, data) {
        if(navigator.onLine === true) {
            $('#socialButtons').show();
        }
        else {
            $('#socialButtons').hide();
        }
    });

    $('#listView').filterable('option', 'filterCallback', function(index, searchValue) {
        // get selectOpen value
        var checkOpening = $('#selectOpen').prop('checked');

        var storeName = $(this).find('[data-role="store-name"]').text();
        var openingHour = $(this).find('[data-role="openingHour"]').text();

        var searchReg = new RegExp(searchValue, 'i');
        var isFiltered = false;
        var filterClosed = checkOpening? !isOpeningNow(openingHour) : false;

        if(storeName == null) {
            isFiltered = true;
        } else if(searchValue === '') {
            isFiltered = filterClosed;
        }
        else {
            isFiltered = filterClosed || (storeName.search(searchReg) === -1);
        }

        return isFiltered;
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

