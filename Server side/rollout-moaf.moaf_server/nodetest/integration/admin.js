var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js'),
	pp			= require('js-object-pretty-print').pretty;
	
var TEST = parent.test;
	
chai.use(chaiHttp);

var oauth;

describe("get admin data", function () {
	it ("should find admin emails", function (done) {
		chai.request(TEST)
		.get('adminemails')
		.end(function (err, res) {
			chai.expect(err).to.be.null;
			chai.expect(res.body).to.be.an("array");			
			done();
		});
	});
});