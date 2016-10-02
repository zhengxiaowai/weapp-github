function getWeekDate() {
  var currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 7);
  
  var year = currentDate.getFullYear();
  var month = currentDate.getMonth() + 1;
  var day = currentDate.getDate();

  if (month < 10) {
    month = '0' + month;
  }

  if (day < 10) {
    day = '0' + day;
  }

  return year + '-' + month + '-' + day;
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

module.exports = {
  getWeekDate: getWeekDate,
  b64EncodeUnicode: b64EncodeUnicode
}
