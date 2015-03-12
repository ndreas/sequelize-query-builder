var Builder = require('../lib/builder');
var _       = require('lodash');

describe("Builder", function() {

  var b;
  
  beforeEach(function() {
    b = Builder();
  });

  it("can be initialized via new", function() {
    expect(new Builder()).to.be.an.instanceof(Builder);
  });

  it("can be initialized by calling the builder function", function() {
    expect(b).to.be.an.instanceof(Builder);
  });

  it("can combine multiple methods", function() {
    var result = b.select("foo")
    .where("foo", "bar")
    .order("foo ASC")
    .limit(1)
    .offset(2)
    .build();

    expect(result.attributes).to.deep.equal(["foo"]);
    expect(result.where.foo).to.equal("bar");
    expect(result.order).to.deep.equal(["foo ASC"]);
    expect(result.limit).to.equal(1);
    expect(result.offset).to.equal(2);
  });

  describe(".build()", function() {
    it("returns an empty object no options have been set", function() {
      expect(_.isEmpty(b.build())).to.be.true;
    });
  });

  describe(".select()", function() {
    it("adds an attributes clause", function() {
      var result = b.select("foo").build();
      expect(result.attributes).to.have.length(1);
      expect(result.attributes).to.include("foo");
    });
    it("supports multiple arguments", function() {
      var result = b.select("foo", "bar", "baz").build();
      expect(result.attributes).to.have.length(3);
      expect(result.attributes).to.include("foo");
      expect(result.attributes).to.include("bar");
      expect(result.attributes).to.include("baz");
    });
    it("supports arrays", function() {
      var result = b.select([ "foo", "bar" ]).build();
      expect(result.attributes).to.have.length(2);
      expect(result.attributes).to.include("foo");
      expect(result.attributes).to.include("bar");
    });
    it("stacks assignments", function() {
      var result = b.select("foo").select("bar", "baz").build();
      expect(result.attributes).to.have.length(3);
      expect(result.attributes).to.include("bar");
      expect(result.attributes).to.include("baz");
    });
  });

  describe(".where()", function() {
    it("adds a condition to the where clause", function() {
      var result = b.where({ foo: "bar" }).build();
      expect(result.where.foo).to.equal("bar");
    });
    it("supports quick equality", function() {
      var result = b.where("foo", "bar").build();
      expect(result.where.foo).to.equal("bar");
    });
    it("stacks assignments", function() {
      var result = b.where("foo", "bar").where("bar", "baz").build();
      expect(result.where.foo).to.equal("bar");
      expect(result.where.bar).to.equal("baz");
    });
  });

  describe(".order()", function() {
    it("adds an order clause", function() {
      var result = b.order("foo DESC").build();
      expect(result.order).to.have.length(1);
      expect(result.order[0]).to.equal("foo DESC");
    });
    it("turns double strings into a Sequelize compatible array", function() {
      var result = b.order("foo", "DESC").build();
      expect(result.order).to.have.length(1);
      expect(result.order[0]).to.deep.equal(["foo", "DESC"]);
    });
    it("stacks assignments", function() {
      var result = b.order("foo DESC").order("bar ASC").build();
      expect(result.order).to.have.length(2);
      expect(result.order[0]).to.equal("foo DESC");
      expect(result.order[1]).to.equal("bar ASC");
    });
  });

  describe(".limit()", function() {
    it("adds a limit clause", function() {
      var result = b.limit(10).build();
      expect(result.limit).to.equal(10);
    });
    it("overwrites previous limits", function() {
      var result = b.limit(10).limit(11).build();
      expect(result.limit).to.equal(11);
    });
  });

  describe(".offset()", function() {
    it("adds a offset clause", function() {
      var result = b.offset(10).build();
      expect(result.offset).to.equal(10);
    });
    it("overwrites previous offsets", function() {
      var result = b.offset(10).offset(11).build();
      expect(result.offset).to.equal(11);
    });
  });
});
