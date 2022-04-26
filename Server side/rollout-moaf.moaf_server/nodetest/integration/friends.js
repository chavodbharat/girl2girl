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


describe("friends", function () {
	it ("should get list of friends", function (done) {
		chai.request(HOST)
		.get('friends')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.end(function (err, res) {
			chai.expect(res.body.friends).to.be.an("array");
			done();
		});
	});
});