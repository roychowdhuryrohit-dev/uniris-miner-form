'use strict';

const express = require("express");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();

const https = require('https');

// const os = require('os');
const si = require('systeminformation');

const { createHttpTerminator } = require('http-terminator');

app.set("trust proxy", true);

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile("index.html");
});

app.use(express.json());

const csvWriter = createCsvWriter({
    path: "data/data.csv",
    header: ['name', 'email', 'ip', 'dIface', 'ethMAC', 'wlanMAC', 'timestamp'],
    append: true
});

const emailRe = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const ipifyURL = 'https://api.ipify.org';

app.post("/submit", (req, res) => {

    // console.log(req.ip);

    if (!req.body['name'] || !req.body['email']) {
        res.status(400).send("Invalid Fields!");
        return;
    }

    if (!emailRe.test(req.body.email)) {
        res.status(400).send("Malformed Email!");
        return;
    }

    Promise.all([
        si.networkInterfaceDefault(),
        si.networkInterfaces(),
        si.wifiInterfaces()
    ]).then(data => {
        let ethMAC = "NA";
        let wlanMAC = "NA";
        let defaultIface = "NA";
        let d;

        if (data[0]) {
            defaultIface = data[0];
        }

        for (d of data[1]) {
            if (d['iface'] === process.env.ETH_INTERFACE) {
                ethMAC = d['mac'];
            }
        }

        for (d of data[2]) {
            if (d['iface'] === process.env.WLAN_INTERFACE) {
                wlanMAC = d['mac'];
            }
        }

        https.get(ipifyURL, resp => {

            if (resp.statusCode != 200) {
                res.status(500).send("");
                return;
            }

            resp.on('data', ip => {
                csvWriter.writeRecords([{ name: req.body.name, email: req.body.email, ip: ip, dIface: defaultIface, ethMAC: ethMAC, wlanMAC: wlanMAC, timestamp: Math.floor(Date.now() / 1000) }])
                    .then(() => {
                        res.end("");
                    })
                    .catch(error => {
                        res.status(500).send("");
                        console.log(error);
                    });
            });
        }).on('error', () => {
            res.status(500).send("");
        });
    });
});


const server = app.listen(process.env.PORT, () => {
    console.log(`Listening on localhost:${process.env.PORT}`);
});

const httpTerminator = createHttpTerminator({
    server
});

['SIGINT', 'SIGTERM', 'SIGQUIT']
    .forEach(signal => process.on(signal, async () => {
        console.log('\nShutting down server.');
        await httpTerminator.terminate();
    }));