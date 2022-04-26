var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js'),
	pp			= require('js-object-pretty-print').pretty;
	
var HOST      = parent.server;
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

describe("test convos", function () {
	it ("convos/{id}", function (done) {
		chai.request(HOST)
		.get('convos/37093')
		.end(function (err, res) {
			chai.expect(res.body.responses).to.be.an('array');
			done();
		});
	});

	it ('post convos', function (done) {
		chai.request(HOST)
		.post('convos')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.send({
			group_id: 43,
			title: 'The title',
			text: 'convo chai 😜          test',
			user_id: '646373',
			date: '2017-07-31T12:08:34.941Z'
		}).end(function (err, res) {
			chai.expect(err).to.be.null;
			var postId = res.body.message;
			chai.request(HOST)
			.get('convos/' + postId)
			.end(function (err, res) {
				chai.request(TEST_HOST)
				.del('convos/starter/' + postId)
				.end(function (err, res) {
					console.log(err);
					console.log(res.body);
					chai.expect(err).to.be.null;
					done();	
				});
			});
		});
	});
	
});

describe("convo replies", function () {
	it ("post convos/{id}/responses", function (done) {
		chai.request(HOST)
		.post('convos/37093/responses')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.send({
			convo_id: '37093',
			title: 'The response',
			text: 'convo chai  😜           response test',
			user_id: '646373'
		}).end(function (err, res) {
			console.log(res.body);
			var postId = res.body.message;
			console.log("POSTID = " + postId);
			chai.request(HOST)
			.get('convos/37093')
			.end(function (err, res) {				
				var i, len = res.body.responses.length, wasFound = false;
				for (i = 0; i < len; i += 1) {
					if (res.body.responses[i]["_id"] == postId) {
						wasFound = true;
						break;
					}
				}
				chai.expect(wasFound).to.be.false;
				chai.request(TEST_HOST)
				.del('convos/starter/' + postId)
				.end(function (err, res) {
					chai.expect(err).to.be.null;
					done();	
				});
			});
		});
	});
});












