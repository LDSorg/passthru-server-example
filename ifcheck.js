'use strict';

var PromiseA = require('bluebird')
  , request = PromiseA.promisify(require('request'))
  ;

function checkip(ip) {
  var os = require('os');
  var ifaces = os.networkInterfaces();

  return Object.keys(ifaces).some(function (ifname) {
    return ifaces[ifname].some(function (iface) {
      return iface.address === ip;
    });
  });
}

function getExternalIp() {
  return request({ url: 'https://coolaj86.com/services/whatsmyip' }).spread(function (req, data) {
    return checkip(data) && data;
  });
}

module.exports.getExternalIp = getExternalIp;

if (module === require.main) {
  getExternalIp().then(function (ip) {
    console.log(ip || '127.0.0.1');
  });
}

// en0 192.168.1.101
// eth0 10.0.0.101
