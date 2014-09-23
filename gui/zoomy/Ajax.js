/*jslint indent: 2, plusplus: true*/
"use strict";

var zz = zz || {};

zz.Ajax = function () {
  var XMLHttpFactories = [
      function () {return new XMLHttpRequest(); },
      function () {return new ActiveXObject("Msxml2.XMLHTTP"); },
      function () {return new ActiveXObject("Msxml3.XMLHTTP"); },
      function () {return new ActiveXObject("Microsoft.XMLHTTP"); }
    ],
    that = this;

  function createXMLHTTPObject() {
    var i, xmlhttp = false;
    for (i = 0; i < XMLHttpFactories.length; i++) {
      try {
        xmlhttp = XMLHttpFactories[i]();
      } catch (e) {
        continue;
      }
      break;
    }
    return xmlhttp;
  }

  function onLoaded(done) {
    if (this.status === 200) {
      done(null, this.responseText);
    } else {
      done("status is not 200");
    }
    this.onload = null;
    this.onerror = null;
    delete this.response;
    delete this.responseText;
    delete this.responseXML;
  }

  this.download = function (url, done) {
    var xhr = createXMLHTTPObject();
    if (!xhr) {
      return done("can't create xml request object");
    }
    xhr.onload = onLoaded.bind(xhr, done);
    xhr.onerror = onLoaded.bind(xhr, done);
    xhr.open('GET', url, true);
    xhr.responseType = 'text';
    xhr.send();
  };

  this.downloadJSON = function (url, done) {
    that.download(url, function (err, text) {
      var json;
      if (err) {
        return done(err);
      }
      try {
        json = JSON.parse(text);
      } catch (ex) {
        return done(ex);
      }
      done(null, json);
    });
  };
};

