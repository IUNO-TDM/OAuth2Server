const AbstractClientStore = require('express-brute/lib/AbstractClientStore'),
    humps = require('humps'),
    moment = require('moment'),
    util = require('util'),
    _ = require('lodash');

const PgStore = module.exports = function (options) {
    AbstractClientStore.apply(this, arguments);

    this.options = _.extend({}, PgStore.defaults, options);
    this.db = options.db; // allow passing in native pg client
};

PgStore.prototype = Object.create(AbstractClientStore.prototype);

PgStore.prototype.set = function (key, value, lifetime, callback) {
    const self = this;

    let expiry;

    if (lifetime) {
        expiry = moment().add(lifetime, 'seconds').toDate();
    }

    self.db.query(util.format('UPDATE "%s"."%s" SET "count" = $1, "last_request" = $2, "expires" = $3 WHERE "id" = $4',
        self.options.schemaName, self.options.tableName), [value.count, value.lastRequest, expiry, key],
        function (err, result) {
            if (!err && !result.rowCount) {
                return self.db.query(util.format('INSERT INTO "%s"."%s" ("id", "count", "first_request", "last_request", "expires") VALUES ($1, $2, $3, $4, $5)',
                    self.options.schemaName, self.options.tableName),
                    [key, value.count, value.firstRequest, value.lastRequest, expiry],
                    function (err, result) {

                        return typeof callback === 'function' && callback(err);
                    });
            }

            return typeof callback === 'function' && callback(err);
        }
    );
};

PgStore.prototype.get = function (key, callback) {
    const self = this;

    self.db.query(util.format('SELECT "id", "count", "first_request", "last_request", "expires" FROM "%s"."%s" WHERE "id" = $1',
        self.options.schemaName, self.options.tableName),
        [key],
        function (err, result) {
            if (!err && result.rows.length && new Date(result.rows[0].expires).getTime() < new Date().getTime()) {

                return self.db.query(util.format('DELETE FROM "%s"."%s" WHERE "id" = $1',
                    self.options.schemaName, self.options.tableName),
                    [key],
                    function (err, result) {
                        return typeof callback === 'function' && callback(err, null);
                    });
            }

            return typeof callback === 'function' && callback(err, result.rowCount ? humps.camelizeKeys(result.rows[0]) : null);
        });
};

PgStore.prototype.reset = function (key, callback) {
    const self = this;


    return self.db.query(util.format('DELETE FROM "%s"."%s" WHERE "id" = $1 RETURNING *',
        self.options.schemaName, self.options.tableName),
        [key],
        function (err, result) {
            return typeof callback === 'function' && callback(err, result.rowCount ? humps.camelizeKeys(result.rows[0]) : null);
        });

};

PgStore.defaults = {
    schemaName: 'public',
    tableName: 'brute'
};
