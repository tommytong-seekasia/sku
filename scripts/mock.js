const cwd = process.cwd();
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const deasyncPromise = require('deasync-promise');
const skuConfigPath = path.join(cwd, 'sku.config.js');
const builds = require('../config/builds');

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const router = express.Router();

const makeArray = x => (Array.isArray(x) ? x : [x]);

const buildConfigs = fs.existsSync(skuConfigPath)
  ? makeArray(require(skuConfigPath))
  : [{}];

const mockConfig = buildConfigs[0].mock;
const { mock, hosts, port } = buildConfigs[0];

const host = 'dev.seek.com.au';
const appPort = port ? port : 8080;
const apiPort = appPort + 10;

console.log(`Starting up mock server on: http://${host}:${apiPort}}`);

app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.headers.origin && req.headers.origin.indexOf('co.nz') !== -1) {
    res.setHeader(
      'Access-Control-Allow-Origin',
      `http://dev.seek.co.nz:${appPort}`
    );
  } else {
    res.setHeader(
      'Access-Control-Allow-Origin',
      `http://dev.seek.com.au:${appPort}`
    );
  }
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With ,content-type, authorization, Authenticated-User, x-seek-ec-sessionid, X-Seek-Site'
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

mockConfig.forEach(api => {
  router.get(api.endpoint, (req, res, next) => {
    res.status(200).json(api.payload);
  });
});

app.use('/', router);

app.listen(apiPort, () => {
  console.log(`Mock server listening on port ${apiPort}!`);
});
