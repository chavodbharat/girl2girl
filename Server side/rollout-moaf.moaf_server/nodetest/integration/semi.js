var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js');
	
var HOST = parent.server;
	
chai.use(chaiHttp);

var oauth;

before(function (done) {
	chai.request(HOST)
	.post('login')
	.send({
		username: "stargazer10",
		password: "Misso2010$%"
	}).end(function (err, res) {
		oauth = res.body.oauth;
		done();
	});
});

describe("shoul test semi-authorized methods", function () {
	it ("should return public data", function (done) {
		chai.request(HOST)
			.get('semi')
			.end(function (err, res) {
				chai.expect(err).to.be.null;
				chai.expect(res).to.have.status(200);
				chai.expect(res.body.result).to.equal('public');
				done();
			});
	});
	it ("should return private data", function (done) {
		chai.request(HOST)
		.get('semi')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.end(function (err, res) {
			chai.expect(err).to.be.null;
			chai.expect(res).to.have.status(200);
			chai.expect(res.body.result).to.equal('private');
			done();
		});
	});
});