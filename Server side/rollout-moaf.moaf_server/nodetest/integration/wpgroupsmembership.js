var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js');
	
var HOST = parent.test;

chai.use(chaiHttp);

describe("get membership of user", function () {
	
	it ("should find all group id the user is member of", function (done) {
		chai.request(HOST)
		.get("groups/member/646373")
		.end(function (err, res) {
			chai.expect(res).to.have.status(200);
			chai.expect(res.body).to.be.an('array');
			done();
		});
	});
	it ("should find empty list", function (done) {
		chai.request(HOST)
		.get("groups/member/-1")
		.end(function (err, res) {
			chai.expect(res).to.have.status(200);
			chai.expect(res.body).to.be.an('array');
			chai.expect(res.body.length).to.equal(0);
			done();
		});
	});
	
});