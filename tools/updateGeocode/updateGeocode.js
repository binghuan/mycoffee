var request = require('request');
var GOOGLE_GOCODE_API = 'http://maps.googleapis.com/maps/api/geocode/json?language=zh-TW&sensor=true&address=';

// load dataList.js
var dataList = require('../../dataList.js');

function address2Geocodes(address, index, arr) {
    request(GOOGLE_GOCODE_API + address, function(err, res, body) {
        var results = JSON.parse(body);

        if(err) {
            console.err(err);
            return;
        }

        if(results['results'].length != 0) {
            var result = results['results'][0];
            var geocode = result.geometry.location;
            arr[index].latitude = geocode.lat;
            arr[index].longitude = geocode.lng;
        } else {
            console.log("No reuslts for " + address);
            // console.log(body);
        }
    });
}

var https = require('https');
var http = require('http');
// set max socket numbers
https.globalAgent.maxSockets = 1000;
http.globalAgent.maxSockets = 1000;

dataList.forEach(function(val, index, arr) {
    var address = val.address;
    // update no lat or lng stores
    if(address !== '' && (val.latitude == null || val.longitude == null)) {
        address2Geocodes(address, index, arr);
    }
});

process.on('exit', function() {
    // console.log('exit!')
    // write to stdout
    console.log('var dataList = ' + JSON.stringify(dataList, null, 4) + ";\n");
    console.log(
'if(typeof module !== \'undefined\' && module != null && module.exports != null) {\n' + 
'    module.exports = dataList;\n' + 
'}');
});
