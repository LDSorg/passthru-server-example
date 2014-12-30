#!/usr/bin/env node
'use strict';

var https = require('https')
  , port = process.argv[2] || 8043
  , fs = require('fs')
  , path = require('path')
  , ifcheck = require('../ifcheck')
  , config = require('../config')
  , Passthru = require('passthru')
  , server
  , options
  ;

options = {
  key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'server', 'my-server.key.pem'))
, ca: [ fs.readFileSync(path.join(__dirname, '..', 'certs', 'ca', 'my-root-ca.crt.pem'))]
, cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'server', 'my-server.crt.pem'))
, requestCert: true
, rejectUnauthorized: true
};


server = https.createServer(options);

Passthru.create(config, server).then(function (app) {
  server.on('request', app);
  ifcheck.getExternalIp().then(function (ip) {
    var host = ip || 'localhost'
      , fqdn = ip || 'local.foobar3000.com'
      ;

    server.listen(port, function () {
      port = server.address().port;

      console.log('');
      console.log('Listening on https://127.0.0.1:' + port);

      if ('localhost' !== host) {
        console.log('Listening on https://localhost:' + port);
      }

      console.log('Listening on https://' + host + ':' + port);

      if (host !== fqdn) {
        console.log('Listening on https://' + fqdn + ':' + port);
      } else {
        console.log('');
        console.log('You will need to access this server by its domain name.');
      }

      console.log('');
    });
  });
});
