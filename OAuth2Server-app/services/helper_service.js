/**
 * Created by beuttlerma on 09.03.16.
 */

var self = {};

self.clone = function clone(a) {
    return JSON.parse(JSON.stringify(a));
};
self.isObject = function isObject(a) {
    return (!!a) && (a.constructor === Object);
};
self.isArray = function isArray(a) {
    return (!!a) && (a.constructor === Array);
};
self.buildFullUrlFromRequest = function (req) {
    return req.protocol + '://' + req.get('host') + req.baseUrl + '/';
};
self.xwwwfurlenc = function (srcjson) {
    if (typeof srcjson !== "object")
        if (typeof console !== "undefined") {
            console.log("\"srcjson\" is not a JSON object");
            return null;
        }
    u = encodeURIComponent;
    var urljson = "";
    var keys = Object.keys(srcjson);
    for (var i = 0; i < keys.length; i++) {
        urljson += u(keys[i]) + "=" + u(srcjson[keys[i]]);
        if (i < (keys.length - 1)) urljson += "&";
    }
    return urljson;
};

module.exports = self;