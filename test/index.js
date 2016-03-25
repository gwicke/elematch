'use strict';

var assert = require('assert');
var fs = require('fs');
var assert = require('assert');

var ElementMatcher = require('../lib/index');

var htmlparser2 = require('htmlparser2');
var libxmljs = require("libxmljs");

function id(n) { return n; }
var figures = 0;
var links = 0;
function figure(n) { figures++; return n; }
function link(n) { links++; return n; }

var matcher = new ElementMatcher({
    'test-element': id,
    'foo-bar': id,
    'figure': figure,
});

var linkMatcher = new ElementMatcher({
    'a': link,
});

function innerHTML(s) {
    return s.replace(/^<[^>]+>(.*)<\/[^>]+>$/, '$1');
}

var testHead = "<doctype html><head><title>hello</title></head>\n";
var testFooter = "<body></body>";
var customElement = "<test-element foo='bar <figure >' baz=\"booz\">"
            + "<foo-bar></foo-bar><figure>hello</figure></test-element>";

var testDoc = testHead + customElement + testFooter;

module.exports = {
    "basic matching": {
        "custom element": function() {
            var nodes = matcher.matchAll(testDoc);
            assert.equal(nodes[0], testHead);
            var n1 = nodes[1];
            assert.equal(n1.innerHTML, innerHTML(customElement));
            assert.equal(n1.outerHTML, customElement);
            assert.deepEqual(n1.attributes, {
                foo: 'bar <figure >',
                baz: 'booz'
            });
            assert.equal(nodes[2], testFooter);
        },
        "figure": function() {
            var testElement = '<figure>foo</figure>';
            var doc = testHead + '<div>' + testElement + '</div>' + testFooter;
            var nodes = matcher.matchAll(doc);
            assert.equal(nodes[0], testHead + '<div>');
            var n1 = nodes[1];
            assert.equal(n1.innerHTML, innerHTML(testElement));
            assert.equal(n1.outerHTML, testElement);
            assert.deepEqual(n1.attributes, {});
            assert.equal(nodes[2], '</div>' + testFooter);
        }
    },
    "performance": {
        "Obama": function() {
            var obama = fs.readFileSync('test/obama.html', 'utf8');
            var startTime = Date.now();
            var n = 20;
            for (var i = 0; i < n; i++) {
                matcher.matchAll(obama);
            }
            console.log(figures);
            console.log((Date.now() - startTime) / n + 'ms per match');
        }
    },
    "performance, links": {
        "Obama": function() {
            var obama = fs.readFileSync('test/obama.html', 'utf8');
            var startTime = Date.now();
            var n = 10;
            for (var i = 0; i < n; i++) {
                linkMatcher.matchAll(obama);
            }
            console.log(links / n);
            console.log((Date.now() - startTime) / n + 'ms per match');
        }
    },
    "performance, htmlparser2 Default": {
        "Obama": function() {
            var handler = new htmlparser2.DefaultHandler();
            var parser = new htmlparser2.Parser(handler);
            var obama = fs.readFileSync('test/obama.html', 'utf8');
            var startTime = Date.now();
            var n = 10;
            for (var i = 0; i < n; i++) {
                parser.parseComplete(obama);
            }
            console.log((Date.now() - startTime) / n + 'ms per parse');

        }
    },
    "performance, htmlparser2 DOM": {
        "Obama": function() {
            var handler = new htmlparser2.DomHandler();
            var parser = new htmlparser2.Parser(handler);
            var obama = fs.readFileSync('test/obama.html', 'utf8');
            var startTime = Date.now();
            var n = 10;
            for (var i = 0; i < n; i++) {
                parser.parseComplete(obama);
            }
            console.log((Date.now() - startTime) / n + 'ms per parse');

        }
    },
    "performance, libxml DOM": {
        "Obama": function() {
            var obama = fs.readFileSync('test/obama.html', 'utf8');
            var startTime = Date.now();
            var n = 10;
            for (var i = 0; i < n; i++) {
                libxmljs.parseXml(obama);
            }
            console.log((Date.now() - startTime) / n + 'ms per parse');
        }
    },
};

//module.exports.performance.Obama();
