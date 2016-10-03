


module.exports = function(linkHeaders) {
  links = linkHeaders.split(',');

  var linkObjs = {}

  links.forEach(item => {
    var regKey = /rel="(.*?)"/;
    var regValue = /\<(.*?)\>/;

    var v = regValue.exec(item)
    if (v) {
      v = v[1];
    } 

    var k = regKey.exec(item)
    if (k) {
      k = k[1];
    }
     
    linkObjs[k] = v;
  })

  return linkObjs;

}

