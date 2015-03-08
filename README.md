passthru-server-example
=======================

An example passthru service

Prerequisites (with ScreenCasts)
-----------

* [Creating your VPS (ScreenCast)](http://youtu.be/ypjzi1axH2A)
* [Securing Access to VPS (ScreenCast)](http://youtu.be/YZzhIIJmlE0) • [Securing Access to VPS (Article)](https://coolaj86.com/articles/securing-your-vps-for-the-semi-paranoid.html))

ScreenCast
----------

[Setting up a Passthru Server](http://youtu.be/5bBBzPjlqWQ)


Install & Explanation
---------------------

In practice this requires 3 computers, but for the sake of simplicity in the screencast
only two are used (initializer and client will be on the same laptop).

* initializer <https://github.com/LDSorg/passthru-initializer-example>
* server <https://github.com/LDSorg/passthru-server-example>
* client <https://github.com/LDSorg/passthru-client-example>

The server must have a domain name.
You can use DynDNS or whatever, it just has to have something real.
If you want to test on localhost only you can use `local.ldsconnect.org`.

Also, you may be able to use the ip address returned by `node ./ifcheck.js`

First you're going to create a *secret* **on the initializer**.

```bash
# Initializer

git clone https://github.com/LDSorg/passthru-initializer-example.git passthru-initializer
pushd passthru-initializer/
npm install

node bin/gen-secret.js
> 35acc236-50ea-42c2-b47b-3682419b9b86

node bin/gen-shadow.js 35acc236-50ea-42c2-b47b-3682419b9b86
> GnSh3sEolPnhh0qkLxFMyBaFY5M1fGyGgk5KDpVOsHESdHK5SOOd2G3xf9SymsAS
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

# update the salt
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
# Initializer

git submodule init
git submodule update
bash ssl-cert-gen/make-root-ca-and-certificates.sh local.ldsconnect.org

# put client keys on client
rsync -avhHPz ./certs/client/ client.example.com:~/passthru-client/certs/client/ 
rsync -avhHPz ./certs/ca/*.crt.pem client.example.com:~/passthru-client/certs/ca/ 

# put server keys on server
rsync -avhHPz ./certs/server/ local.ldsconnect.org:~/passthru-server/certs/server/ 
rsync -avhHPz ./certs/ca/*.crt.pem local.ldsconnect.org:~/passthru-server/certs/ca/
```

```bash
# Server

sudo ufw allow 8043/tcp

node bin/serve.js 8043

# rsync -a passthru.conf /etc/init
# sudo service passthru start
```

```bash
# Initializer

node init.js
> { success: true }

# test that this kills the server (and then manually restart it)
node tests/restart.js
> {"success":true}
```

```bash
# Client

# add username and password for lds.org
vim real-secret.js

curl https://local.ldsconnect.org:8043 --cert certs/client/my-app-client.p12:secret --cacert certs/client/my-root-ca.crt.pem
> Cannot GET /

node tests/fails-without-cert.js 2>/dev/null
> SUCCESS: Could not connect without valid certificate

node token-exchange.js
> {"individualId":1000000001,"newOption2Member":false}
```
