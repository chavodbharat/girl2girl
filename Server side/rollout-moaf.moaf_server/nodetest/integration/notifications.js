var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js');
	
var HOST = parent.test;
	
chai.use(chaiHttp);

describe('test internal notifications', function () {
	
	it ("should create and delete dummy notification", function (done) {
		chai.request(HOST)
		.post('notifications')
		.send()
		.end(function (err, res) {
			chai.expect(err).to.be.null;
			chai.expect(res).to.have.status(200);
			var newInsertedId = res.body.message;
			chai.request(HOST)
				.del('notifications/' + newInsertedId)
				.end(function (err, res) {
					chai.expect(err).to.be.null;
					chai.expect(res).to.have.status(200);
					chai.expect(res.body.message).to.equal("true");
					done();
				});
		});
	});
	
});