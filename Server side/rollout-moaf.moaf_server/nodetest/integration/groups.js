var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js');
	
var HOST = parent.server;
	
chai.use(chaiHttp);

describe("test group groups", function () {
	it ("should get list of groups", function (done) {
		chai.request(HOST)
		.get('groups')
		.end(function (err, res) {
			chai.expect(err).to.be.null;
			chai.expect(res).to.have.status(200);
			chai.expect(res.body['groups']).to.be.an('array');
			done();
		});
	});
	it ("should find one group", function (done) {
		chai.request(HOST)
		.get('groups/43')
		.end(function (err, res) {
			chai.expect(err).to.be.null;
			chai.expect(res).to.have.status(200);
			chai.expect(res.body['_id']).to.equal('43');
			done();
		});
	});
	it ("should fail with not found", function (done) {
		chai.request(HOST)
		.get('groups/0')
		.end(function (err, res) {
			chai.expect(res).to.have.status(404);
			done();
		});
	});
})