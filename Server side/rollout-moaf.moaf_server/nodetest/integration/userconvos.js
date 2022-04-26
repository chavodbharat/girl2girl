var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js'),
	pp			= require('js-object-pretty-print').pretty;
	
var HOST = parent.server;
	
chai.use(chaiHttp);

describe("convos/{id}", function () {
	it ("should get convos of user", function (done) {
		chai.request(HOST)
		.get('convos/users/646373')
		.end(function (err, res) {
			chai.expect(err).to.be.null;
			chai.expect(res.body.convos).to.be.an("array");
			console.log(pp(res.body));
			done();
		});
	});
	it ("should find user with empty convos", function (done) {
		chai.request(HOST)
		.get('convos/users/0')
		.end(function (err, res) {
			chai.expect(err).to.be.null;
			chai.expect(res.body.convos).to.be.an("array");
			chai.expect(res.body.convos.length).to.equal(0);
			console.log(pp(res.body));
			done();
		});
	});
	it ("should throw 404", function (done) {
		chai.request(HOST)
		.get('convos/users/-1')
		.end(function (err, res) {
			chai.expect(res).to.have.status(404);
			done();
		});
	});
});