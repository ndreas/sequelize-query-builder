var _ = require('lodash');

module.exports = Builder;

function Builder() {
  if (!(this instanceof Builder)) return new Builder();

  this._select = []
  this._where  = {}
  this._order  = []
  this._limit  = null;
  this._offset = null;
}

Builder.prototype.build = function() {
  var result = {};

  if (!_.isEmpty(this._select)) {
    result.attributes = this._select;
  }

  if (!_.isEmpty(this._where)) {
    result.where = this._where;
  }

  if (!_.isEmpty(this._order)) {
    result.order = this._order;
  }

  if (this._limit) {
    result.limit = this._limit;
  }

  if (this._offset) {
    result.offset = this._offset;
  }

  return result;
}

Builder.prototype.select = function() {
  this._select = this._select.concat(_.flatten(_.toArray(arguments), true));
  return this;
}

Builder.prototype.where = function(a, b) {
  if (_.isObject(a)) {
    this._where = _.assign(this._where, a);
  } else {
    this._where[a] = b;
  }

  return this;
}

Builder.prototype.order = function(a, b) {
  if (b) {
    this._order.push([a, b]);
  } else {
    this._order.push(a);
  }

  return this;
}

Builder.prototype.limit = function(limit) {
  this._limit = limit;
  return this;
}
Builder.prototype.offset = function(offset) {
  this._offset = offset;
  return this;
}
