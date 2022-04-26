var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js');
	
var HOST = parent.server;
	
chai.use(chaiHttp);

describe('/login/password/forgot', function () {
	
	it("should fail on bad email", function (done) {
		chai.request(HOST)
			.post('password/forgot')
			.send()
			.end(function (err, res) {
				chai.expect(res).to.have.status(400);
				done();
			});
	});
	
	it("should fail on not found", function (done) {
		chai.request(HOST)
		.post('password/forgot')
		.send({ email: "sypachev_s_s@mail.ru" })
		.end(function (err, res) {
			chai.expect(res).to.have.status(404);
			done();
		});
	});
	
	xit("should send email", function (done) {
		chai.request(HOST)
		.post('password/forgot')
		.send({ email: "zooeydog@icloud.com" })
		.end(function (err, res) {
			chai.expect(res).to.have.status(200);
			done();
		});
	});
	
});