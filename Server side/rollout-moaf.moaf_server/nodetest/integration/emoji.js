var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js'),
	pp			= require('js-object-pretty-print').pretty;
	
var HOST    = parent.server,
	TEST	= parent.test;
	
chai.use(chaiHttp);

describe("empji", function () {
	it ("should work", function (done) {
		chai.request(TEST)
			.post('emoji')
			.send("😜 ")
			.end(function () {
				done();
			})
	});
});