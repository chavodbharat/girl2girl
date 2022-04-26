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
		console.log(oauth.token);
		done();
	});
});

var userId = 646373;

describe('/follow', function () {

	it ("should fail 400 with empty requierd parameters", function (done) {
		chai.request(HOST)
			.get('followings')
			.query({})
			.end(function (err, res) {
				chai.expect(res).to.have.status(400);
				done();
			});
	});
	it ("should fail 400 with bad following_type", function (done) {
		chai.request(HOST)
		.get('followings')
		.query({ following_type: 10 })
		.end(function (err, res) {
			chai.expect(res).to.have.status(400);
			done();
		});
	});
	it ("should get list of groups followed", function (done) {
		chai.request(HOST)
		.get('followings')
		.query({ following_type: 0, follower_id: userId })
		.end(function (err, res) {
			chai.expect(res).to.have.status(200);
			chai.expect(err).to.be.null;
			chai.expect(res.body.followings).to.be.an("array");
			done();
		});
	});
	it ("should get list of convos followed", function (done) {
		chai.request(HOST)
		.get('followings')
		.query({ following_type: 2, follower_id: userId })
		.end(function (err, res) {
			chai.expect(res).to.have.status(200);
			chai.expect(err).to.be.null;
			chai.expect(res.body.followings).to.be.an("array");
			done();
		});
	});
	it ("should get list of users followed", function (done) {
		chai.request(HOST)
		.get('followings')
		.query({ following_type: 1, follower_id: userId })
		.end(function (err, res) {
			chai.expect(res).to.have.status(200);
			chai.expect(err).to.be.null;
			chai.expect(res.body.followings).to.be.an("array");			
			done();
		});
	});
	it ("should get list of all followed", function (done) {
		chai.request(HOST)
		.get('followings')
		.query({ follower_id: userId })
		.end(function (err, res) {
			chai.expect(res).to.have.status(200);
			chai.expect(err).to.be.null;
			chai.expect(res.body.followings).to.be.an("array");
			done();
		});
	});
	
	it ("should fail on follow group because already follows", function (done) {
		chai.request(HOST)
		.post('followings')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.send({ follower_id: userId, following_id: 43, following_type: 0 })
		.end(function (err, res) {
			chai.expect(res).to.have.status(400);
			done();
		});
	});
	
	it ("should fail 404 no such convo", function (done) {
		chai.request(HOST)
		.post('followings')
		.set('Authorization', oauth.token)
		.send({ follower_id: userId, following_type: 2, following_id: -1 })
		.end(function (err, res) {
			chai.expect(res).to.have.status(404);
			done();
		});
	});
	
	it ("should fail 403 on not match id and follower id", function (done) {
		chai.request(HOST)
		.post('followings')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.send({ follower_id: 646372, following_id: 43, following_type: 0 })
		.end(function (err, res) {			
			chai.expect(res).to.have.status(403);
			done();
		});
	});
	
	it ("should create group following and delete it", function (done) {
		chai.request(HOST)
		.post('followings')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.send({ follower_id: userId, following_id: 12, following_type: 0 })
		.end(function (err, res) {		
			console.log(res.body);
			chai.expect(res).to.have.status(200);
			//No, you can't get groups because they are not confirmed!
			chai.request(HOST)
			.del('followings')
			.set('Authorization', 'Bearer: ' + oauth.token)
			.query({ follower_id: userId, following_id: 12, following_type: 0 })
			.end(function (err, res) {		
				console.log(res.body);
				chai.expect(res).to.have.status(200);
				done();
			});
		});
	});
	
	it ("should create user following and delte it", function (done) {
		chai.request(HOST)
		.post('followings')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.send({ follower_id: userId, following_id: 5, following_type: 1 })
		.end(function (err, res) {
			chai.expect(res).to.have.status(200);
			chai.request(HOST)
			.del('followings')
			.set('Authorization', 'Bearer: ' + oauth.token)
			.query({ follower_id: userId, following_id: 5, following_type: 1 })
			.end(function (err, res) {
				console.log(res.body);
				chai.expect(res).to.have.status(200);
				done();
			});
		});
	});
	
	it ("should create and delete convo following", function (done) {
		chai.request(HOST)
		.post('followings')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.send({ follower_id: userId, following_id: 57419, following_type: 2 })
		.end(function (err, res) {
			console.log(res.body);
			chai.expect(res).to.have.status(200);
			chai.request(HOST)
			.del('followings')
			.set('Authorization', 'Bearer: ' + oauth.token)
			.query({ follower_id: userId, following_id: 57419, following_type: 2 })
			.end(function (err, res) {
				console.log(res.body);
				console.log(res.body);
				chai.expect(res).to.have.status(200);
				done();
			});
		});
	});
	
	it ("should fail on bad request", function (done) {
		chai.request(HOST)
		.post('followings')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.send({ follower_id: userId, following_id: userId, following_type: 2 })
		.end(function (err, res) {
			chai.expect(res).to.have.status(400);
			chai.expect(res.body.code).to.equal(400);
			//console.log(res.body.message);
			done();
		});
	});
	
});



