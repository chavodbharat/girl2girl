var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js'),
	pp			= require('js-object-pretty-print').pretty;
	
var HOST      = parent.server;
	
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


describe("feed", function () {
	it ("should get unauthorized feed", function (done) {
		chai.request(HOST)
			.get('feed')
			.end(function (err, res) {
				chai.expect(err).to.be.null;
				chai.expect(res.body.convos).to.be.an('array');
				chai.expect(res.body.convos.length).to.equal(20);				
				done();
			});
	});
	it ("should get authorized feed", function (done) {
		chai.request(HOST)
		.get('feed')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.end(function (err, res) {
			chai.expect(err).to.be.null;
			chai.expect(res.body.convos).to.be.an('array');
			chai.expect(res.body.convos.length).to.equal(20);				
			done();
		});
	});
});