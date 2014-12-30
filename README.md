passthru-server-example
=======================

An example passthru service

Prerequisites (with ScreenCasts)
-----------

* [Creating your VPS (ScreenCast)](http://youtu.be/ypjzi1axH2A)
* [Securing Access to VPS (ScreenCast)](http://youtu.be/YZzhIIJmlE0) • [Securing Access to VPS (Article)](https://gist.github.com/coolaj86/8edaa9f5cb913cf442f1))

Install & Explanation
---------------------

In practice this requires 3 computers, but for the sake of simplicity in the screencast
only two are used (initializer and client will be on the same laptop).

* initializer <https://github.com/LDSorg/passthru-initializer-example>
* server <https://github.com/LDSorg/passthru-server-example>
* client <https://github.com/LDSorg/passthru-client-example>

The server must have a domain name.
You can use DynDNS or whatever, it just has to have something real.
If you want to test on localhost only you can use `local.ldsconnect.com`.

Also, you may be able to use the ip address returned by `node ./ifcheck.js`

First you're going to create a *secret* **on the initializer**.

```bash
# Initializer

git clone https://github.com/LDSorg/passthru-initialzer-example.git passthru-initializer
pushd passthru-initializer/
npm install

node bin/gen-secret.js
> 35acc236-50ea-42c2-b47b-3682419b9b86

node bin/gen-shadow.js 35acc236-50ea-42c2-b47b-3682419b9b86
> GnSh3sEolPnhh0qkLxFMyBaFY5M1fGyGgk5KDpVOsHESdHK5SOOd2G3xf9SymsAS

git submodule init
bash ssl-cert-gen/make-root-ca-and-certificates.sh passthru.example.com
```

Now you're going to save the shadow on the server
(never put the local secret on the server!!!)
and create a secret for the server
(never put the server secret on the local!!!).

```bash
# Server
curl -fsSL bit.ly/easy-install-node | bash

git clone https://github.com/LDSorg/passthru-server-example.git passthru-server
npm install

node ./ifcheck.js
> 127.0.0.1

node bin/gen-salt.js
> eaf089fe-b875-4274-9e50-6adcf618b30a

vim config.js
```

**config.js**
```javascript
'use strict';

module.exports = {
  // server-generated salt goes here
  "salt": "eaf089fe-b875-4274-9e50-6adcf618b30a"

  // initializer-generated shadow goes here
, "shadow": "GnSh3sEolPnhh0qkLxFMyBaFY5M1fGyGgk5KDpVOsHESdHK5SOOd2G3xf9SymsAS"
};
```

**NOTE:** You **must** use a real domain name or the ip address.

```bash
# on the initializer
git submodule init

bash ssl-cert-gen/make-root-ca-and-certificates.sh 'local.foobar3000.com'

# put client keys on client
rsync -avhHPz ./certs/client/ client.example.com:~/passthru-client/certs/client/ 
rsync -avhHPz ./certs/ca/*.crt.pem client.example.com:~/passthru-client/certs/ca/ 

# put server keys on server
rsync -avhHPz ./certs/server/ server.example.com:~/passthru-server/certs/server/ 
rsync -avhHPz ./certs/ca/*.crt.pem server.example.com:~/passthru-server/certs/ca/ 
```

```bash
# Server

node bin/server-runner.js
```

```bash
# Client

curl https://example.net:8043 --cert certs/client/my-app-client.p12:secret --cacert certs/client/my-root-ca.crt.pem
> Cannot GET /

node tests/init.js
> { success: true }

node tests/fails-without-cert.js 2>/dev/null
> SUCCESS: Could not connect without valid certificate

node tests/get-profile.js
> {"individualId":3600476369,"newOption2Member":false}

node tests/restart.js
> {"success":true}
```
