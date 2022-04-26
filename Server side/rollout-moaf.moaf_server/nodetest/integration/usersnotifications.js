var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	pp			= require('js-object-pretty-print').pretty,
	parent		= require('./parent.js');
	
var HOST = parent.server;
var TEST_HOST = parent.test;
	
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

describe("let us test the notifications module", function () {
	it ("get /notification/notifications", function (done) {
		chai.request(HOST)
		.get('notifications')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.end(function (err, res) {
			chai.expect(res).to.have.status(200);			
			chai.expect(err).to.be.null;			
			done();
		});
	});
	
	//unset directly
	//get
	//set read (is_new 0)
	//get and check that false
	//unset directly
	it ("put notifications", function (done) {
		chai.request(HOST)
		.get('notifications')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.end(function (err, res) {
			var id = res.body.notifications[0]["_id"];
			chai.request(TEST_HOST)
			.put('notifications/' + id)
			.set('Authorization', 'Bearer: ' + oauth.token)
			.end(function (err, res) {
				chai.request(HOST)
				.get('notifications')
				.set('Authorization', 'Bearer: ' + oauth.token)
				.end(function (err, res) {
					chai.expect(res).to.have.status(200);
					chai.expect(err).to.be.null;
					var id = res.body.notifications[0]["_id"];
					console.log ("CHANGED " + id);
					chai.request(HOST)
					.put('notifications/' + id)
					.set('Authorization', 'Bearer: ' + oauth.token)
					.end(function (err, res) {
						chai.expect(err).to.be.null;
						chai.expect(res.body.message).to.equal("OK");
						
						chai.request(HOST)
						.get('notifications')
						.set('Authorization', 'Bearer: ' + oauth.token)
						.end(function (err, res) {
							var i = 0; len = res.body.notifications.length;
							while (i < len) {
								if (res.body.notifications[i]["_id"] == id) {
									break;
								}
								i += 1;
							}
							chai.expect(res.body.notifications[i]['was_read']).to.be.false;
							done();
						});
					});
				});
			});
		});
	});
	
	it ("should create dummy notification to user and delet it", function (done) {
		chai.request(TEST_HOST)
		.post('notifications')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.send()
		.end(function (err, res) {
			console.log("creted notification with id " + res.body.message);
			chai.request(HOST)
			.del('notifications/' + res.body.message)
			.set('Authorization', 'Bearer: ' + oauth.token)
			.end(function (err, res) {
				chai.expect(err).to.be.null;
				chai.expect(res).to.have.status(200);
				chai.expect(res.body.message).to.equal("OK");
				done();
			});
		})
	});
});


















