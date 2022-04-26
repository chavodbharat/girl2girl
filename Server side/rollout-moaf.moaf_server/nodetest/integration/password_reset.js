var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js');
	
var HOST = parent.server;

chai.use(chaiHttp);

describe('/password/reset', function () {
	
	it("should fail on bad reset_key format", function (done) {
		chai.request(HOST)
			.post('password/reset')
			.send({
				reset_key: "abcdefghijklmnop",
				password: "123456"
			})
			.end(function (err, res) {
				chai.expect(res).to.have.status(400);
				done();
			});
	});
	
	it("should fail on expired reset_key", function (done) {
		chai.request(HOST)
		.post('password/reset')
		.send({
			reset_key: "1497052800:asdfghjklqwe",
			password: "123456"
		})
		.end(function (err, res) {
			chai.expect(res).to.have.status(410);
			done();
		});
	});
	it("should fail on not found", function (done) {
		var ut = Math.round(Date.now() / 1000);
		chai.request(HOST)
		.post('password/reset')
		.send({
			reset_key: ut + ":asdfghjklqwe",
			password: "123456"
		})
		.end(function (err, res) {
			chai.expect(res).to.have.status(401);
			done();
		});
	});
	
});