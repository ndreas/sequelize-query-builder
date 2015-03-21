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
    .where("bar").ne("baz")
    .order("foo ASC")
    .limit(1)
    .offset(2)
    .build();

    expect(result.attributes).to.deep.equal(["foo"]);
    expect(result.where).to.have.deep.property("foo.$eq", "bar");
    expect(result.where).to.have.deep.property("bar.$ne", "baz");
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

  describe(".where()", function() {
    it("adds a condition to the where clause", function() {
      var where = b.where({ foo: "bar" }).build().where;
      expect(where).to.have.property("foo", "bar");
    });
    it("supports quick equality", function() {
      var where = b.where("foo", "bar").build().where;
      expect(where).to.have.deep.property("foo.$eq", "bar");
    });
    it("stacks assignments", function() {
      var where = b.where("foo", "bar").where("bar", "baz").build().where;
      expect(where).to.have.deep.property("foo.$eq", "bar");
      expect(where).to.have.deep.property("bar.$eq", "baz");
    });
  });

  describe(".eq()", function() {
    it("does nothing without a context", function() {
      var where = b.eq("zomg").build().where;
      expect(where).to.be.undefined;
    });
    it("adds an equality clause for the scope", function() {
      var where = b.where("foo").eq("bar").build().where;
      expect(where).to.have.deep.property("foo.$eq", "bar");
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").eq("bar").eq("baz").build().where;
      expect(where).to.have.deep.property("foo.$eq", "baz");
    });
    it("stacks assignments", function() {
      var where = b.where("foo").eq("bar").where("bar").eq("baz").build().where;
      expect(where).to.have.deep.property("foo.$eq", "bar");
      expect(where).to.have.deep.property("bar.$eq", "baz");
    });
  });

  describe(".ne()", function() {
    it("does nothing without a context", function() {
      var where = b.ne("zomg").build().where;
      expect(where).to.be.undefined;
    });
    it("adds a not equal clause for the scope", function() {
      var where = b.where("foo").ne("bar").build().where;
      expect(where).to.have.deep.property("foo.$ne", "bar");
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").ne("bar").ne("baz").build().where;
      expect(where).to.have.deep.property("foo.$ne", "baz");
    });
    it("stacks assignments", function() {
      var where = b.where("foo").ne("bar").where("bar").ne("baz").build().where;
      expect(where).to.have.deep.property("foo.$ne", "bar");
      expect(where).to.have.deep.property("bar.$ne", "baz");
    });
  });

  describe(".gt()", function() {
    it("does nothing without a context", function() {
      var where = b.gt("zomg").build().where;
      expect(where).to.be.undefined;
    });
    it("adds a greater than clause for the scope", function() {
      var where = b.where("foo").gt(1).build().where;
      expect(where).to.have.deep.property("foo.$gt", 1);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").gt(1).gt(2).build().where;
      expect(where).to.have.deep.property("foo.$gt", 2);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").gt(1).where("bar").gt(2).build().where;
      expect(where).to.have.deep.property("foo.$gt", 1);
      expect(where).to.have.deep.property("bar.$gt", 2);
    });
  });

  describe(".gte()", function() {
    it("does nothing without a context", function() {
      var where = b.gte("zomg").build().where;
      expect(where).to.be.undefined;
    });
    it("adds a greater than or equal to clause for the scope", function() {
      var where = b.where("foo").gte(1).build().where;
      expect(where).to.have.deep.property("foo.$gte", 1);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").gte(1).gte(2).build().where;
      expect(where).to.have.deep.property("foo.$gte", 2);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").gte(1).where("bar").gte(2).build().where;
      expect(where).to.have.deep.property("foo.$gte", 1);
      expect(where).to.have.deep.property("bar.$gte", 2);
    });
  });

  describe(".lt()", function() {
    it("does nothing without a context", function() {
      var where = b.lt("zomg").build().where;
      expect(where).to.be.undefined;
    });
    it("adds a less than clause for the scope", function() {
      var where = b.where("foo").lt(1).build().where;
      expect(where).to.have.deep.property("foo.$lt", 1);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").lt(1).lt(2).build().where;
      expect(where).to.have.deep.property("foo.$lt", 2);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").lt(1).where("bar").lt(2).build().where;
      expect(where).to.have.deep.property("foo.$lt", 1);
      expect(where).to.have.deep.property("bar.$lt", 2);
    });
  });

  describe(".lte()", function() {
    it("does nothing without a context", function() {
      var where = b.lte("zomg").build().where;
      expect(where).to.be.undefined;
    });
    it("adds a less than or equal to clause for the scope", function() {
      var where = b.where("foo").lte(1).build().where;
      expect(where).to.have.deep.property("foo.$lte", 1);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").lte(1).lte(2).build().where;
      expect(where).to.have.deep.property("foo.$lte", 2);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").lte(1).where("bar").lte(2).build().where;
      expect(where).to.have.deep.property("foo.$lte", 1);
      expect(where).to.have.deep.property("bar.$lte", 2);
    });
  });

  describe(".lte()", function() {
    it("does nothing without a context", function() {
      var where = b.lte("zomg").build().where;
      expect(where).to.be.undefined;
    });
    it("adds a less than or equal to clause for the scope", function() {
      var where = b.where("foo").lte(1).build().where;
      expect(where).to.have.deep.property("foo.$lte", 1);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").lte(1).lte(2).build().where;
      expect(where).to.have.deep.property("foo.$lte", 2);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").lte(1).where("bar").lte(2).build().where;
      expect(where).to.have.deep.property("foo.$lte", 1);
      expect(where).to.have.deep.property("bar.$lte", 2);
    });
  });

  describe(".is()", function() {
    it("does nothing without a context", function() {
      var where = b.is("zomg").build().where;
      expect(where).to.be.undefined;
    });
    it("adds an is clause for the scope", function() {
      var where = b.where("foo").is(null).build().where;
      expect(where).to.have.deep.property("foo.$is", null);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").is(1).is(null).build().where;
      expect(where).to.have.deep.property("foo.$is", null);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").is(true).where("bar").is(false).build().where;
      expect(where).to.have.deep.property("foo.$is", true);
      expect(where).to.have.deep.property("bar.$is", false);
    });
  });

  describe(".not()", function() {
    it("does nothing without a context", function() {
      var where = b.not("zomg").build().where;
      expect(where).to.be.undefined;
    });
    it("adds a not clause for the scope", function() {
      var where = b.where("foo").not(null).build().where;
      expect(where).to.have.deep.property("foo.$not", null);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").not(1).not(null).build().where;
      expect(where).to.have.deep.property("foo.$not", null);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").not(true).where("bar").not(false).build().where;
      expect(where).to.have.deep.property("foo.$not", true);
      expect(where).to.have.deep.property("bar.$not", false);
    });
  });

  describe(".like()", function() {
    it("does nothing without a context", function() {
      var where = b.like("zomg").build().where;
      expect(where).to.be.undefined;
    });
    it("adds a like clause for the scope", function() {
      var where = b.where("foo").like("%bar%").build().where;
      expect(where).to.have.deep.property("foo.$like", "%bar%");
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").like("%bar").like("bar%").build().where;
      expect(where).to.have.deep.property("foo.$like", "bar%");
    });
    it("stacks assignments", function() {
      var where = b.where("foo").like("%bar%").where("bar").like("%baz%").build().where;
      expect(where).to.have.deep.property("foo.$like", "%bar%");
      expect(where).to.have.deep.property("bar.$like", "%baz%");
    });
  });

  describe(".notLike()", function() {
    it("does nothing without a context", function() {
      var where = b.notLike("zomg").build().where;
      expect(where).to.be.undefined;
    });
    it("adds a not like clause for the scope", function() {
      var where = b.where("foo").notLike("%bar%").build().where;
      expect(where).to.have.deep.property("foo.$notLike", "%bar%");
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").notLike("%bar").notLike("bar%").build().where;
      expect(where).to.have.deep.property("foo.$notLike", "bar%");
    });
    it("stacks assignments", function() {
      var where = b.where("foo").notLike("%bar%").where("bar").notLike("%baz%").build().where;
      expect(where).to.have.deep.property("foo.$notLike", "%bar%");
      expect(where).to.have.deep.property("bar.$notLike", "%baz%");
    });
  });

  describe(".ilike()", function() {
    it("does nothing without a context", function() {
      var where = b.ilike("zomg").build().where;
      expect(where).to.be.undefined;
    });
    it("adds an ilike clause for the scope", function() {
      var where = b.where("foo").ilike("%bar%").build().where;
      expect(where).to.have.deep.property("foo.$iLike", "%bar%");
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").ilike("%bar").ilike("bar%").build().where;
      expect(where).to.have.deep.property("foo.$iLike", "bar%");
    });
    it("stacks assignments", function() {
      var where = b.where("foo").ilike("%bar%").where("bar").ilike("%baz%").build().where;
      expect(where).to.have.deep.property("foo.$iLike", "%bar%");
      expect(where).to.have.deep.property("bar.$iLike", "%baz%");
    });
  });

  describe(".notIlike()", function() {
    it("does nothing without a context", function() {
      var where = b.notIlike("zomg").build().where;
      expect(where).to.be.undefined;
    });
    it("adds a not ilike clause for the scope", function() {
      var where = b.where("foo").notIlike("%bar%").build().where;
      expect(where).to.have.deep.property("foo.$notILike", "%bar%");
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").notIlike("%bar").notIlike("bar%").build().where;
      expect(where).to.have.deep.property("foo.$notILike", "bar%");
    });
    it("stacks assignments", function() {
      var where = b.where("foo").notIlike("%bar%").where("bar").notIlike("%baz%").build().where;
      expect(where).to.have.deep.property("foo.$notILike", "%bar%");
      expect(where).to.have.deep.property("bar.$notILike", "%baz%");
    });
  });

  describe(".in()", function() {
    it("does nothing without a context", function() {
      var where = b.in(1, 2).build().where;
      expect(where).to.be.undefined;
    });
    it("adds an in clause for the scope", function() {
      var where = b.where("foo").in(1, 2).build().where;
      expect(where).to.have.deep.property("foo.$in").that.is.an("array").that.deep.equals([1, 2]);
    });
    it("supports arrays", function() {
      var where = b.where("foo").in([1, 2]).build().where;
      expect(where).to.have.deep.property("foo.$in").that.is.an("array").that.deep.equals([1, 2]);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").in(1, 2).in(2, 3).build().where;
      expect(where).to.have.deep.property("foo.$in").that.is.an("array").that.deep.equals([2, 3]);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").in(1, 2).where("bar").in([2, 3]).build().where;
      expect(where).to.have.deep.property("foo.$in").that.is.an("array").that.deep.equals([1, 2]);
      expect(where).to.have.deep.property("bar.$in").that.is.an("array").that.deep.equals([2, 3]);
    });
  });

  describe(".notIn()", function() {
    it("does nothing without a context", function() {
      var where = b.notIn(1, 2).build().where;
      expect(where).to.be.undefined;
    });
    it("adds a not in clause for the scope", function() {
      var where = b.where("foo").notIn(1, 2).build().where;
      expect(where).to.have.deep.property("foo.$notIn").that.is.an("array").that.deep.equals([1, 2]);
    });
    it("supports arrays", function() {
      var where = b.where("foo").notIn([1, 2]).build().where;
      expect(where).to.have.deep.property("foo.$notIn").that.is.an("array").that.deep.equals([1, 2]);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").notIn(1, 2).notIn(2, 3).build().where;
      expect(where).to.have.deep.property("foo.$notIn").that.is.an("array").that.deep.equals([2, 3]);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").notIn(1, 2).where("bar").notIn([2, 3]).build().where;
      expect(where).to.have.deep.property("foo.$notIn").that.is.an("array").that.deep.equals([1, 2]);
      expect(where).to.have.deep.property("bar.$notIn").that.is.an("array").that.deep.equals([2, 3]);
    });
  });

  describe(".between()", function() {
    it("does nothing without a context", function() {
      var where = b.between(1, 2).build().where;
      expect(where).to.be.undefined;
    });
    it("adds a between clause for the scope", function() {
      var where = b.where("foo").between(1, 2).build().where;
      expect(where).to.have.deep.property("foo.$between").that.is.an("array").that.deep.equals([1, 2]);
    });
    it("supports arrays", function() {
      var where = b.where("foo").between([1, 2]).build().where;
      expect(where).to.have.deep.property("foo.$between").that.is.an("array").that.deep.equals([1, 2]);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").between(1, 2).between(2, 3).build().where;
      expect(where).to.have.deep.property("foo.$between").that.is.an("array").that.deep.equals([2, 3]);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").between(1, 2).where("bar").between([2, 3]).build().where;
      expect(where).to.have.deep.property("foo.$between").that.is.an("array").that.deep.equals([1, 2]);
      expect(where).to.have.deep.property("bar.$between").that.is.an("array").that.deep.equals([2, 3]);
    });
  });

  describe(".notBetween()", function() {
    it("does nothing without a context", function() {
      var where = b.notBetween(1, 2).build().where;
      expect(where).to.be.undefined;
    });
    it("adds a not between clause for the scope", function() {
      var where = b.where("foo").notBetween(1, 2).build().where;
      expect(where).to.have.deep.property("foo.$notBetween").that.is.an("array").that.deep.equals([1, 2]);
    });
    it("supports arrays", function() {
      var where = b.where("foo").notBetween([1, 2]).build().where;
      expect(where).to.have.deep.property("foo.$notBetween").that.is.an("array").that.deep.equals([1, 2]);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").notBetween(1, 2).notBetween(2, 3).build().where;
      expect(where).to.have.deep.property("foo.$notBetween").that.is.an("array").that.deep.equals([2, 3]);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").notBetween(1, 2).where("bar").notBetween([2, 3]).build().where;
      expect(where).to.have.deep.property("foo.$notBetween").that.is.an("array").that.deep.equals([1, 2]);
      expect(where).to.have.deep.property("bar.$notBetween").that.is.an("array").that.deep.equals([2, 3]);
    });
  });

  describe(".overlap()", function() {
    it("does nothing without a context", function() {
      var where = b.overlap(1, 2, 3).build().where;
      expect(where).to.be.undefined;
    });
    it("adds a overlap clause for the scope", function() {
      var where = b.where("foo").overlap(1, 2, 3).build().where;
      expect(where).to.have.deep.property("foo.$overlap").that.is.an("array").that.deep.equals([1, 2, 3]);
    });
    it("supports arrays", function() {
      var where = b.where("foo").overlap([1, 2, 3]).build().where;
      expect(where).to.have.deep.property("foo.$overlap").that.is.an("array").that.deep.equals([1, 2, 3]);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").overlap(1, 2).overlap(2, 3, 4).build().where;
      expect(where).to.have.deep.property("foo.$overlap").that.is.an("array").that.deep.equals([2, 3, 4]);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").overlap(1, 2).where("bar").overlap([2, 3, 4]).build().where;
      expect(where).to.have.deep.property("foo.$overlap").that.is.an("array").that.deep.equals([1, 2]);
      expect(where).to.have.deep.property("bar.$overlap").that.is.an("array").that.deep.equals([2, 3, 4]);
    });
  });

  describe(".contains()", function() {
    it("does nothing without a context", function() {
      var where = b.contains(1, 2, 3).build().where;
      expect(where).to.be.undefined;
    });
    it("adds a contains clause for the scope", function() {
      var where = b.where("foo").contains(1, 2, 3).build().where;
      expect(where).to.have.deep.property("foo.$contains").that.is.an("array").that.deep.equals([1, 2, 3]);
    });
    it("supports arrays", function() {
      var where = b.where("foo").contains([1, 2, 3]).build().where;
      expect(where).to.have.deep.property("foo.$contains").that.is.an("array").that.deep.equals([1, 2, 3]);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").contains(1, 2).contains(2, 3, 4).build().where;
      expect(where).to.have.deep.property("foo.$contains").that.is.an("array").that.deep.equals([2, 3, 4]);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").contains(1, 2).where("bar").contains([2, 3, 4]).build().where;
      expect(where).to.have.deep.property("foo.$contains").that.is.an("array").that.deep.equals([1, 2]);
      expect(where).to.have.deep.property("bar.$contains").that.is.an("array").that.deep.equals([2, 3, 4]);
    });
  });

  describe(".contained()", function() {
    it("does nothing without a context", function() {
      var where = b.contained(1, 2, 3).build().where;
      expect(where).to.be.undefined;
    });
    it("adds a contained clause for the scope", function() {
      var where = b.where("foo").contained(1, 2, 3).build().where;
      expect(where).to.have.deep.property("foo.$contained").that.is.an("array").that.deep.equals([1, 2, 3]);
    });
    it("supports arrays", function() {
      var where = b.where("foo").contained([1, 2, 3]).build().where;
      expect(where).to.have.deep.property("foo.$contained").that.is.an("array").that.deep.equals([1, 2, 3]);
    });
    it("overwrites previously set values", function() {
      var where = b.where("foo").contained(1, 2).contained(2, 3, 4).build().where;
      expect(where).to.have.deep.property("foo.$contained").that.is.an("array").that.deep.equals([2, 3, 4]);
    });
    it("stacks assignments", function() {
      var where = b.where("foo").contained(1, 2).where("bar").contained([2, 3, 4]).build().where;
      expect(where).to.have.deep.property("foo.$contained").that.is.an("array").that.deep.equals([1, 2]);
      expect(where).to.have.deep.property("bar.$contained").that.is.an("array").that.deep.equals([2, 3, 4]);
    });
  });
});
