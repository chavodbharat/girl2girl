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

describe('/nop', function () {
	it ("should get nop", function (done) {
		chai.request(HOST)
		.get('nop')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.end(function (err, res) {
			oauth = res.body.oauth;
			chai.expect(err).to.be.null;
			chai.expect(res).to.have.status(200);
			chai.expect(res.body).to.have.own.property('token');
			chai.expect(res.body).to.have.own.property('username');
			chai.expect(res.body).to.have.own.property('display_name');
			chai.expect(res.body).to.have.own.property('user_id');
			chai.expect(res.body).to.have.own.property('isAdmin');
			chai.expect(res.body).to.have.own.property('groupsMembership');
			chai.expect(res.body['groupsMembership']).to.be.an('array');
			done();
		});
	})
})