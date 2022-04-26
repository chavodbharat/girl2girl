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

//zooeydog@icloud.com CT
describe("should test get and put users/users", function () {
	
	it ("send empty valid request", function (done) {
		chai.request(HOST)
		.put('users/646373')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.set('Content-Type',  'multipart/form-data')
		.field("_id", '646373')
		.end(function (err, res) {
			console.log(res.body);
			chai.expect(res).to.have.status(200);
			chai.expect(err).to.be.null;
			done();
		});
	});
	
	it ("users", function (done) {
		chai.request(HOST)
		.get('users/646373')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.end(function (err, res) {
			chai.expect(res).to.have.status(200);
			chai.expect(res.body['_id']).to.equal('646373');
			chai.expect(res.body.email).to.equal("zooeydog@icloud.com");
			chai.expect(res.body.state.abbreviation).to.equal("CT");
			chai.request(HOST)
			.put('users/646373')
			.set('Authorization', 'Bearer: ' + oauth.token)
			.set('Content-Type',  'multipart/form-data')	
			.field("_id", '646373')
			.field('email', 'sometest@mail.com')
			.field('state', '{"abbreviation": "AK", "name": "Alaska" }')
			.end(function (err, res) {
				chai.expect(res).to.have.status(200);
				chai.request(HOST)
				.get('users/646373')
				.set('Authorization', 'Bearer: ' + oauth.token)
				.end(function (err, res) {
					chai.expect(res).to.have.status(200);
					chai.expect(res.body.email).to.equal("sometest@mail.com");
					chai.expect(res.body.state.abbreviation).to.equal("AK");
					chai.expect(res.body.state.name).to.equal("Alaska");
					chai.request(HOST)
					.put('users/646373')
					.set('Authorization', 'Bearer: ' + oauth.token)
					.set('Content-Type',  'multipart/form-data')
					.field('_id', '646373')
					.field('email', 'zooeydog@icloud.com')
					.field('state', '{"abbreviation": "CT", "name": "Connecticut" }')
					.end(function (err, res) {
						chai.expect(res).to.have.status(200);
						console.log(res.body);
						done();
					});
				});
			});
		});
	})
});