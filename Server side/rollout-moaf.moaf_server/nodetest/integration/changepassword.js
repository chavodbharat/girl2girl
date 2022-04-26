var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js'),
	pp			= require('js-object-pretty-print').pretty;
	
var HOST      = parent.server;
	
chai.use(chaiHttp);

var oauth;

describe("change password to new, check, change password to old", function () {
	it ("put users/{id}/password", function (done) {
		chai.request(HOST)
		.post('login')
		.send({
			username: "stargazer10",
			password: "Misso2010$%"
		}).end(function (err, res) {
			oauth = res.body.oauth;
			chai.request(HOST)
			.put('users/646373/password')
			.set('Authorization', 'Bearer: ' + oauth.token)
			.send({
				_id: "646373",
				old_password: "Misso2010$%",
				new_password: "Misso2017$%"
			}).end(function (err, res) {
				chai.request(HOST)
				.post('login')
				.send({
					username: "stargazer10",
					password: "Misso2017$%"
				}).end(function (err, res) {
					oauth = res.body.oauth;
					chai.request(HOST)
					.put('users/646373/password')
					.set('Authorization', 'Bearer: ' + oauth.token)
					.send({
						_id: "646373",
						old_password: "Misso2017$%",
						new_password: "Misso2010$%"
					}).end(function (err, res) {
						done();
					});
				});
			});
		});
	});
});