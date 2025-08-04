require("dotenv").config();

const fs = require("fs");
const https = require("https");
const app = require("./app");

const SSL_PORT = process.env.SSL_PORT || 3443;
const keyPath = "/app/certs/localhost-key.pem";
const certPath = "/app/certs/localhost.pem";

const key = fs.readFileSync(keyPath);
const cert = fs.readFileSync(certPath);

https.createServer({ key, cert }, app).listen(SSL_PORT, () => {
	console.log(`🚀 HTTPS Server listening on https://localhost:${SSL_PORT}`);
});
