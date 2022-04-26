var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js');
	
var HOST = parent.server;
	
chai.use(chaiHttp);

describe('login', function () {
	it ("should fail with 400", function (done) {
		chai.request(HOST)
			.post('login')
			.send()
			.end(function (err, res) {
				chai.expect(res).to.have.status(400);
				chai.expect(res.type).to.equal('application/json');
				chai.expect(res.charset).to.equal('utf-8');
				done();
			});
	});
	it ("should fail with 400", function (done) {
		chai.request(HOST)
			.post('login')
			.send({ username: "", password: "1234" })
			.end(function (err, res) {
				chai.expect(res).to.have.status(400);
				done();
			});
	});
	it ("should fail with 401", function (done) {
		chai.request(HOST)
			.post('login')
			.send({ username: "x", password: "1234567890" })
			.end(function (err, res) {
				console.log(err);
				chai.expect(res).to.have.status(401);
				done();
			});
	});
	it ("should find one", function (done) {
		chai.request(HOST)
			.post('login')
			.send({ username: "stargazer10", password: "Misso2010$%" })
			.end(function (err, res) {
				chai.expect(res).to.have.status(200);
				chai.expect(res).to.have.header('Authorization');				
				chai.request(HOST)
				.get('nop')
				.set("Authorization", res.headers['authorization'])
				.end(function (err, res) {					
					done();
				});
			});
	});
});