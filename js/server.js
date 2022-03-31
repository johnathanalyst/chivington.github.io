#!/usr/bin/env nodejs
// Name: Johnathan Chivington
// Project: chivington.net App Server
// Description: Basic node file/app server
// Version: 0.0.1 - Serves apps by subdomain.

// Includes
const os = require('os');
const fs = require('fs');
const url = require('url');
const http = require('http');
const qs = require('querystring');


// utils
function hash(s) {
  return Array.from(s).reduce((h,c) => 0 | (31 * h + c.charCodeAt(0)), 0)
};

// mime-types
const mimeTypes = {
  'html': 'text/html',
  'css': 'text/css',
  'js': 'application/javascript',
  'json': 'text/json',
  'ico': 'image/ico',
  'svg': 'image/svg+xml',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'webp': 'image/webp',
  'mp4': 'video/mp4',
  'pdf': 'application/pdf',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'otf': 'application/x-font-otf'
};

// logger
function log_details(type,details) {
  console.log(`.`);
  console.log(`${type} REQUEST:\n`,details);
  console.log(`.`);
};

// request parser
function parse_request(request) {
  // Constants
  const app_root = `/var/www/domains/chivington.net`;
  const last_modified = `Tue, 29 Mar 2022 13:00:00 GMT`;
  const age = `max-age=86400`;
  const datetime = new Date(Date.now() + 86400000).toUTCString();

  // Request Details
  const subdomain = request.headers.host.split('.')[0];
  const uri = url.parse(request.url).pathname;
  const exists = fs.existsSync(`${app_root}${uri}`);
  const resource = app_root + (uri == '/' ? '/index.html' : (exists ? `${uri}` : `/index.html`));
  const extension = resource.split('.')[2];
  const mime = mimeTypes[extension] ? mimeTypes[extension] : mimeTypes['html'];

  // Return request details
  return [app_root,last_modified,age,datetime,subdomain,uri,exists,resource,extension,mime];
};

// send util
function send_response(req, res, headers, data, app) {
  res.writeHead(200, headers);
  res.write(app == 'RTC' ? JSON.stringify(data) : data);
  res.end();
};


// RTC API
let threads = {};
const empty_msg = {sender:'Le Chat', msg:'This thread contains no messages.'};
const empty_thread = {thread_name: 'Le Chat', msgs: [empty_msg]};
function rtc_api(request,response) {
  const [app_root,last_modified,age,datetime,subdomain,uri,exists,resource,extension,mime] = parse_request(request);

  let body = ``;
  request.on('data', function(chunk) {
    body += chunk;
    if (body > 1e6) body.msg = `Message too long`;
  });

  request.on('end', function() {
    log_details(`RTC`,{datetime,uri,body,threads});
    const parsed_req = JSON.parse(body);
    const headers = {'content-type': mime, 'last-modified': last_modified, 'cache-control': age, 'expires': datetime, 'Allow': 'GET, POST'};

    const api = {
      'BEGIN_THREAD': (data) => {
        if (!data.thread_name || !data.msg) send_response(request, response, headers, {status:'bad'}, 'RTC');
        else {
          if (Object.keys(threads).length > 10) send_response(request, response, headers, {status:'bad'}, 'RTC');
          else {
            if (!threads[data.thread_name]) threads[data.thread_name] = [];
            threads[data.thread_name].push(Object.assign(data.msg, {timestamp:datetime}));
            send_response(request, response, headers, {thread_name:`${data.thread_name}`, msgs: threads[data.thread_name]}, 'RTC');
          }
        }
      },
      'UPDATE_THREAD': (data) => {
        if (!data.thread_name || !data.msg) send_response(request, response, headers, {status:'bad'}, 'RTC');
        else {
          if (!threads[data.thread_name]) threads[data.thread_name] = [];
          threads[data.thread_name].push(Object.assign(data.msg, {timestamp:datetime}));
          send_response(request, response, headers, {thread_name:`${data.thread_name}`, msgs: threads[data.thread_name]}, 'RTC');
        }
      },
      'REFRESH_THREADS': (data) => {
        send_response(request, response, headers, !data.thread_names ? {status:'bad'} : data.thread_names.map(tn => ({thread_name:tn, msgs:!!threads[tn] ? threads[tn] : [empty_message]})), 'RTC')
      },
      'DELETE_THREAD': (data) => {
        if (!data.thread_name) send_response(request, response, headers, {status:'bad'}, 'RTC');
        else {
          if (threads[data.thread_name]) delete threads[data.thread_name];
          send_response(request, response, headers, {status:'ok'}, 'RTC');
        }
      },
      'DELETE_THREADS': (data) => {
        if (!data.thread_names) send_response(request, response, headers, {status:'bad'}, 'RTC');
        else {
          data.thread_names.forEach(tn => { if (threads[tn]) delete threads[tn] });
          send_response(request, response, headers, {status:'ok'}, 'RTC');
        }
      },
      'LOGIN': (data) => {
        const creds = JSON.parse(fs.readFileSync('../resources/creds.json'));
        const chars = ['>','<','=','{','}','(',')', ' '];
        chars.forEach(c => { data.user = data.user.replace(c,''); data.pass = data.pass.replace(c,''); });
        if (data.user==creds.user && data.pass==creds.pass) {
          const response_threads = Object.keys(threads);
          send_response(request, response, headers, !!response_threads.length ? response_threads.map(tn => ({thread_name:tn, msgs:threads[tn]})) : [empty_thread], 'RTC');
        }
        else send_response(request, response, headers, {status:'bad'}, 'RTC');
      }
    };

    if (!parsed_req.type || !api[parsed_req.type]) send_response(request, response, headers, {status:'bad'}, 'RTC');
    else api[parsed_req.type](!!parsed_req.payload.thread_name ? Object.assign(parsed_req.payload, {thread_name: parsed_req.payload.thread_name.toLowerCase()}) : parsed_req.payload);
  });
};


// serve app
function app_api(request,response) {
  const [app_root,last_modified,age,datetime,subdomain,uri,exists,resource,extension,mime] = parse_request(request);

  // log app request
  log_details(`APP`,{datetime,uri});

  // header details
  const headers = {'content-type': mime, 'last-modified': last_modified, 'cache-control': age, 'expires': datetime, 'Allow': 'GET, POST'};

  // send response
  fs.readFile(resource, null, (err, data) => send_response(request, response, headers, data, 'APP'));
};


// request handler
function requestHandler(request,response) {
  // serve app or relay rtc
  if (request.method == `POST`) rtc_api(request,response);
  else app_api(request,response);
};


http.createServer(requestHandler).listen(3000, '127.0.0.1');
console.log('[chivington.net - app server] online at 127.0.0.1:3000/');
