export function getTodayOpeningHour(openingTime) {
    if(openingTime == null) {
        return null;
    }
    var days = {0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'};

    var now = new Date();
    var day = days[now.getDay()];

    return openingTime[day];
}

export function isOpeningNow(openingHour) {
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

export function convertDistanceString(distance) {
    if (distance == null) {
        return 'Unknown';
    }
    return (distance >= 1000)? ((distance / 1000.0).toFixed(1) + '公里') : (distance + '公尺');
}

export function storeLastStoreInRange(latitude, longitude) {

  if(DBG)console.log("+ storeLastStoreInRange with geo: " + latitude + "," + longitude);
  var limitRange = $('#selectRangeCondition').val();

  var storeNearBy = [];
  var distance = 0;
  var i = 0;
  var dataList = data;
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

