var DBG = true;

/*
 * use the sub techK
 * Jquery Mobile: http://jquerymobile.com/
 */

var VERSION = "1848";

console.log("### version: " + VERSION);

var MAX_DATA_SIZE = -1;
// for testing.
var remoteDataURL = "http://127.0.0.1/data.html";
// for formal release
var remoteDataURL2 = "http://ec2-23-20-250-204.compute-1.amazonaws.com/data.html";

var ITEM_ID = 0;
var ITEM_NAME = 3;
var ITEM_PHONE = 4;
var ITEM_ADDRESS = 5;
var ITEM_MENU = 6;
var ITEM_OPEN_TIME = 7;
var ITEM_REMARK = 9;
var ITEM_LONGITUDE = 11;
var ITEM_LATITUDE = 12;



var DEFAULT_RANGE = 9999 ; // meter for distance

if(document.location.host === "ec2-23-20-250-204.compute-1.amazonaws.com") {
	DBG = false;
	console.log("The server is located in remote !");
	remoteDataURL = remoteDataURL2;
}

// for calculate
var ITEM_DISTANCE = 22;

function sortDistance(a,b)
{
    return a.distance - b.distance;
}

function getSearchRangeInDB() {
	if( (localStorage.SEARCH_RANGE == undefined) ||
			(localStorage.SEARCH_RANGE == null)) {
		localStorage.SEARCH_RANGE = 500;
	}

	return JSON.parse(localStorage.SEARCH_RANGE);
}

function setSearchRangeInDB(value) {
	localStorage.SEARCH_RANGE = value;
}


// get the distance between two places.

var returnDistance = 0;
/*
function getDistance(lat1,lon1,lat2,lon2) {
	returnDistance = 0;

    var R = 6378.137; // km (change this constant to get miles)
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLon = (lon2-lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.asin(Math.sqrt(a));
    var d = R * c;

    if ( d > 1 ) {
    	returnDistance = Math.round(d*1000); // meter
    } else if (d<=1) {
    	returnDistance = Math.round(d*1000) ; // meter
    }

	return returnDistance;
}
*/



function getDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = (lat2-lat1) * Math.PI / 180;
  var dLon = (lon2-lon1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;

  returnDistance = Math.round(d*1000,10);
  return returnDistance;
}


// try to get current location info.
function getLocation() {
  	if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(successGetGeoInfo,errorGetGeoInfo);
	} else {
		console.warn("Geolocation is not supported by this browser.");
	}
}

function setLastGeolocation(latitude, longitude) {
	localStorage.latitude = latitude;
	localStorage.longitude = longitude;

}

function getLastGeolocationLatitude() {
	return localStorage.latitude;
}

function getLastGeolocationLongitude() {
	return localStorage.longitude;
}

var isGeoinfoAvailable = false;

var isNeededToLoadForNextPlace = false;

function successGetGeoInfo(position) {

	if(DBG)console.log("++ successGetGeoInfo");

	var latlon=position.coords.latitude+","+position.coords.longitude;

	var img_url="http://maps.googleapis.com/maps/api/staticmap?center=" +latlon+"&zoom=14&size=240x320&sensor=false";

	if(DBG)console.log("get current possision is " + latlon);

	if(getDistance(getLastGeolocationLatitude(), getLastGeolocationLongitude(),
		position.coords.latitude, position.coords.longitude) > (DEFAULT_RANGE/3)) {
			isNeededToLoadForNextPlace = true;
	}

	setLastGeolocation(position.coords.latitude, position.coords.longitude);
	// longitude - 經度 - 縱線
	// latitude - 緯度 - 水平線

	isGeoinfoAvailable = true;

	//getCurrentAddress(position.coords.latitude, position.coords.longitude);

	// try to get the store info. which is near by me
	listStoreData(dataList);

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

function showProgressBar(enabled) {
	if(enabled == true ) {
		$.mobile.showPageLoadingMsg();
	} else  {
		$.mobile.hidePageLoadingMsg();
	}
}

var mRestaurantDBDataArray = dataList;
var totalDataCount = 0;
var searchResult = new Array();
var barOflocationInfo;

function storeLastStoreInRange(latitude, longitude) {

	if(DBG)console.log("+ storeLastStoreInRange with geo: " + latitude + "," + longitude);
	var limitRange = document.getElementById('selectRangeCondition').value

	storeNearByMe = new Array();
	var distance = 0;
	var i=0;
	for (i =0; i< mRestaurantDBDataArray.length; i++) {
		distance = getDistance(latitude,longitude,
			mRestaurantDBDataArray[i].latitude, mRestaurantDBDataArray[i].longitude);
		if(distance <= limitRange) {
			mRestaurantDBDataArray[i].distance = distance;
			mStoreNearByMe.push(mRestaurantDBDataArray[i]);
		}
	}

	if(DBG)console.log("+ storeLastStoreInRange count: " + mStoreNearByMe.length);
	if(DBG)console.log("+ storeLastStoreInRange -> ok");
}

var listResultDistance = new Array();

var toString = Object.prototype.toString;
function isString(obj) {
  return toString.call(obj) == '[object String]';
}

function onSearchButtonClick() {

	var queryText = document.getElementById("searchbox").value;
	if(DBG)console.log("searchDataByKeyWord with keyword(" + queryText);

		searchResult = [];

		if(queryText.length < 1) {

			updateSearchResult(mStoreNearByMe);

			return;
		}

		showProgressBar(true);
		$("#listView").empty();
		updateMessageBar("@_@ 搜尋中 ...");
		mSearchStart = new Date();

		lockSearchControl(true);

		//empty serach result
		searchResult = [];

		var result ;

		var queryString = "";
		if (queryText.indexOf(",") != -1) {
			queryText = queryText.replace(/,/g," ")
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

		search = new RegExp(queryString, "gi");
		if(DBG)console.log("reay query ___" + queryString
			+ "___ in DB Array length:" + mRestaurantDBDataArray.length);
		var i=0;
		for ( i=0; i < mRestaurantDBDataArray.length; i++) {
			//console.log("query time: " + i);
			var dataString = "";
			var hit = false;
			var k = 0;
			for( k =0; k< Object.keys(mRestaurantDBDataArray[i]).length ; k++) {
				dataString += mRestaurantDBDataArray[i][Object.keys(mRestaurantDBDataArray[i])[k]];
			}

			if(dataString.match(search)) {
			//if(dataString.indexOf(queryString) != -1) {
				hit = true;
				console.log(" search --> hit");
			}

			//console.log(result);
			if(hit == true) {
				searchResult.push(mRestaurantDBDataArray[i]);
			}
		};

		if(DBG)console.log("searchDataByKeyWord --> done");
		if(DBG)console.log(searchResult);
		updateMessageBar("^_^b 搜尋完成.");
		showProgressBar(false);
		mSearchEnd = new Date();

		lockSearchControl(false);

		appendToList(searchResult);
		storeLastSearchResult(searchResult);

		var outputString = "";
		var j =0;
		for( j=0; j< searchResult.length ; j++) {
			outputString += searchResult[j] + "<br>";
		}
		//document.getElementById("searchResultArea").innerHTML = outputString;
}

var mSearchStart = new Date();
var mSearchEnd = new Date();

var isBase64ApiSupported = false;
function checkBase64ApiSupported() {
	if(isChrome() || isSafari() || isFirefox() || isOpera()) {
		isBase64ApiSupported = true;
	}
}

function setUIisReady(isReady) {
	if(isReady === true) {
		if(DBG)console.log("ready to send message: WM_IFRAME_UI_READY");
		//window.top.postMessage({action: WM_IFRAME_UI_READY}, "*");
		if(DBG)console.log("sent message: WM_IFRAME_UI_READY");
	}
}

function init() {

	if(DBG)console.log("++ init");

	if(navigator.userAgent.toLowerCase().indexOf("trident") === -1) {
		var pinButton = document.getElementById("pinButton");
		if(pinButton != undefined) {
			pinButton.style.visibility = "hidden";
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

	$("#messageText").hide();

	getLocation();

	barOflocationInfo = document.getElementById("locationInfo");
	$("#loadRemoteData").click(function() {
		if(DBG)console.log("button onclick: loadRemoteData");
		tryToLoadRemoteData();
	});

	lockSearchControl(true);

/*
	$("#searchbox").keyup(function(event){
		if(event.keyCode === 13){
			onSearchButtonClick();
		}
	});
*/
	$("#searchButton").click(onSearchButtonClick);


	$("#buttonShowProgress").click(function() {
		showProgressBar(true);
	});

	$("#buttonHideProgress").click(function() {
		showProgressBar(false);
	});

}

var mStoreNearByMe = [];

function listStoreData(data) {
	if(DBG){console.log("listStoreData from server:" + data.length);}
	var items = [];
	var dataArray = new Array(dataList.length);
	var i=0;

	var currentLat = getLastGeolocationLatitude();
	var currentLon = getLastGeolocationLongitude();

	for(i=0; i< dataList.length; i++) {
		items = dataList[i].split("|");
		dataArray[i] = {
			latitude: items[0],
		    longitude: items[1],
	    	id: items[2],
		    country: items[3],
		    section: items[4],
		    name: items[5],
		    phone: items[6],
		    address: items[7],
		    menu: items[8],
		    openTime: items[9],
		    remark: items[11],
		    comment: items[12],
		    foodType: items[15],
		    backup_food: items[16]
		};

		dataArray[i].distance = getDistance(currentLat, currentLon,
			dataArray[i].latitude,  dataArray[i].longitude);

	}
	if(DBG)console.log(dataArray[0]);
	if(DBG)console.log(dataArray[1]);
	mRestaurantDBDataArray = dataArray;
	if(DBG)console.log(mRestaurantDBDataArray[0]);

	totalDataCount = mRestaurantDBDataArray.length;
	console.log("get total data from server: " + totalDataCount);

	if(DBG)console.log("Data is ready ^_^ b :" + mRestaurantDBDataArray.length);

	// try to filter the store info. which is near by me

	updateMessageBar("資料載入完成 ^_^ b");
	lockSearchControl(false);

	// sub code id for testing.
	if(isGeoinfoAvailable == true) {
		storeLastStoreInRange(getLastGeolocationLatitude(), getLastGeolocationLongitude());
	}

	if((searchResult.length ==0) ||
		(isNeededToLoadForNextPlace == true)) {
		updateSearchResult(mStoreNearByMe);
	}
}

function updateSearchResult(data) {

	if(DBG)console.log("+ updateSearchResult");

	searchResult = data;
	appendToList(searchResult);
}

function updateAddressBar(address) {

	$("#messageText").hide();

	if(address.length < 1) {
		$("#messageText").fadeOut('fast');
	} else {
		document.getElementById('addressInfo').innerHTML = "最近的位置:" + address;
		$("#messageText").fadeIn('slow');
	}

}

function lockSearchControl(enabled) {
	var searchButton = document.getElementById('searchButton');
	if(searchButton) {
		searchButton.disabled = enabled;
	}
}

function updateMessageBar(msg) {
	$("#messageText").fadeOut('fast');
	if(msg == null || msg === undefined) {

	} else {
		document.getElementById("messageText").innerHTML =  msg;
	}

	$("#messageText").fadeIn('slow');

	if(DBG)console.log(msg);
}

function updateSearchResultBar(msg) {
	$("#searchResultText").fadeOut('fast');
	document.getElementById("searchResultText").innerHTML =  msg;
	$("#searchResultText").fadeIn('slow');
}

function receiveDataFail (e) {
	//
	if(e.status != 200) {
		console.error("retrieve remote data -> FAIL");
		console.log(e);
	} else {
		console.log("retrieve remote data -> OK");
	}

}

//http://maps.googleapis.com/maps/api/geocode/json?language=zh-TW&sensor=true&address=
function getCurrentAddress(latitude, longitude) {
	var apiUrl = "http://maps.googleapis.com/maps/api/geocode/json?";
	apiUrl += "language=zh-TW";
	apiUrl += "&sensor=true";
	apiUrl += "&latlng=" + latitude + "," + longitude;
	$.get(apiUrl, function(data) {
		if(DBG)console.log("get address info from google:");
		console.log(data);

		// need to modify sub code into a function.
		if(data.status.indexOf('OVER_QUERY_LIMIT') != -1) {

		} else {
			console.log(data['results'][0].formatted_address);
			updateAddressBar(data['results'][0].formatted_address);
		}
	});
}

function tryToLoadRemoteData() {

	if(DBG)console.log("try to load remote data from server:" + remoteDataURL);

	updateMessageBar("資料載入中... ")

	$.ajax({
        url: remoteDataURL,
        type: 'get',
        jsonpCallback: "jsonCallback",
        dataType: 'jsonp',
        contentType: "application/json",
        //contentType: "plain/text",
        success: receiveData,
        error: receiveDataFail
	});
}

//window.addEventListener("load", handlePageLoad);
$(document).ready(init);

var testDataArray = new Array();
function appendToList(dataArray) {

	if(DBG)console.log("+ appendToList: " + dataArray.length);
	if(DBG)console.log(dataArray[0]);
	if(DBG)console.log(dataArray[1]);
	var searchResulArray = dataArray;

	// if the geolocation is available
	// calculate the distance.
	if(isGeoinfoAvailable == true) {
		console.log("geolocation is available !");
		var currentLatitude = getLastGeolocationLatitude();
		var currentLongitude = getLastGeolocationLongitude();
		var i=0;
		for( i=0; i< dataArray.length ; i++) {
			var distance = getDistance(currentLatitude, currentLongitude,
					searchResulArray[i].latitude, searchResulArray[i].longitude);

			searchResulArray[i].distance = distance;
		}

		testDataArray = searchResulArray;
		searchResulArray.sort(sortDistance);
	}

	if(DBG)console.log("ready to append item count:" + dataArray.length);
	if(DBG)console.log("ready to create item for listView: " + searchResulArray.length);
	//if(DBG)console.log(searchResulArray);

	var injectHTML = "";
	var itemTempalte = "";
	var i =0;
	for( i =0; i < searchResulArray.length; i++) {

		if(searchResulArray[i].remark.indexOf("結束營業") != -1) {
			continue;
		}

		itemTempalte =
			"<li class='ui-li ui-li-static ui-btn-up-c'" +
			"<div class='ui-btn-inner ui-li'><div class='ui-btn-text'>" +
			"<p class='ui-li-aside ui-li-desc'><strong>"  + "距離: " + searchResulArray[i].distance + "公尺</strong></p>"+
			"<h2 class='ui-li-heading'>" + searchResulArray[i].name + "</h2>"+
			"<a class='ui-li-desc' href='http://maps.google.com.tw/?q=" + searchResulArray[i].address  + "' target='_blank'>" + searchResulArray[i].address + "</a>" +
			"<p class='ui-li-desc' style='white-space: normal;'>推廌餐點: " + searchResulArray[i].menu +  "</p>";

		if(searchResulArray[i].openTime !== "無") {
			itemTempalte += "<p class='ui-li-desc'>營業時間: <strong>" + searchResulArray[i].openTime +  "</strong></p>";
		}
		if(searchResulArray[i].remark !== "無") {
			itemTempalte += "<p class='ui-li-desc' style='white-space: normal;'>ps: " + searchResulArray[i].remark +  "</p>";
		}

		if(searchResulArray[i].phone !== "無") {
			itemTempalte +=
			"<a class='goog_qs-tidbit goog_qs-tidbit-0' href=''>tel:" + searchResulArray[i].phone + "</a>" +
			"</li>";
		}

		$("#listView").append(itemTempalte);

	}
	if(DBG)console.log("*** create item for listView -> start");

	$("#listView").listview("refresh");
	setUIisReady(true);

	if(DBG)console.log("*** create item for listView -> done");
	updateSearchResultBar("約有 " + searchResulArray.length +
			" 項結果 (搜尋時間: " + (mSearchEnd - mSearchStart)/1000 + " 秒)");

};



