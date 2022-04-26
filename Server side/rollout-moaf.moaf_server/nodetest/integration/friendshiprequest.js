var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	pp			= require('js-object-pretty-print').pretty,
	parent		= require('./parent.js');
	
var HOST = parent.server;
var TEST = parent.test;
	
chai.use(chaiHttp);
var oauth1;
var followerId;
var oauth2;
var followingId;

before(function (done) {
	chai.request(HOST)
	.post('login')
	.send({
		username: "stargazer10",
		password: "Misso2010$%"
	}).end(function (err, res) {
		oauth1 = res.body.oauth;
		followerId = oauth1['user_id'];
		console.log(followerId);
		chai.request(HOST)
		.post('login')
		.send({
			username: "PrincessOfTheNorth",
			password: "qaz1QAZ!"
		}).end(function (err, res) {
			oauth2 = res.body.oauth;
			followingId = oauth2['user_id'];
			console.log(followingId);
			done();
		});
	});
});

var userId = 646373;

describe ("should create friendship request, than accept, then create, then decline", function () {
	it ("should", function (done) {
		chai.request(HOST)
		.post('followings')
		.set('Authorization', 'Bearer: ' + oauth1.token)
		.send({ follower_id: followerId, following_id: followingId, following_type: 1 })
		.end(function (err, res) {
			chai.expect(res).to.have.status(200);
			
			chai.request(HOST)
			.get('notitifications/friendship')
			.set('Authorization', 'Bearer: ' + oauth2.token)
			.end(function (err, res) {
				console.log(pp(res.body));
				chai.expect(res.body.notifications).to.be.an("array");
				var noteId = res.body.notifications[0]["_id"];
				
				chai.request(HOST)
				.put('notitifications/friendship/' + noteId)
				.set('Authorization', 'Bearer: ' + oauth2.token)
				.end(function (err, res) {
					console.log(res.body);
					chai.request(TEST)
					.del('notifications/' + noteId)
					.end(function (err, res) {
						console.log(res.body);
						
						chai.request(HOST)
						.del("followings")
						.set('Authorization', 'Bearer: ' + oauth1.token)
						.query({ follower_id: followerId, following_id: followingId, following_type: 1 })
						.end(function (err, res) {
							console.log(res.body);
							done();
						});
					});
				});
			});
		});
	
	});
});














