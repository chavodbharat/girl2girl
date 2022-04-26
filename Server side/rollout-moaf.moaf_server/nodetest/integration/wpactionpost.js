var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js');
	
var HOST = parent.test;

chai.use(chaiHttp);

describe("check wp group processing, internal methods", function () {
	it ("should fail with 404", function (done) {
		chai.request(HOST)
		.get("convos/actionpost/1")
		.end(function (err, res) {
			chai.expect(res).to.have.status(404);
			done();
		})
	});
	it ("should find one", function (done) {
		chai.request(HOST)
		.get("convos/actionpost/37093")
		.end(function (err, res) {
			chai.expect(res).to.have.status(200);
			chai.expect(err).to.be.null;
			done();
		})
	});
})