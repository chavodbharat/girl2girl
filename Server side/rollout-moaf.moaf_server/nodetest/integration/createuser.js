var chai 		= require('chai'),
	chaiHttp	= require('chai-http'),
	parent		= require('./parent.js'),
	pp			= require('js-object-pretty-print').pretty;
	
var HOST    = parent.server,
	TEST	= parent.test;
	
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
		console.log(oauth);
		done();
	});
});


describe.skip("should fail on creating user", function () {
	it ("should create and delete user", function (done) {
		chai.request(HOST)
		.post('users')
		.set('Content-Type',  'multipart/form-data')
		.set('Authorization', 'Bearer: ' + oauth.token)
		.field("birth_date", "1992-01-01T00:00:00.000Z")
		.field("country", "{\"name\": \"United States of America\",\"alpha_3\":\"USA\"}")
		.field("email", "lol@lol.lol")
		.field("email", "lol@lol.lol")
		.field('name_first',  'foo')
		.field('name_last',  'bar')
		.field('password',  'lol')
		.field('photo_url',  'foobarbaz')
		.field('state',  "{\"abbreviation\": \"AK\",\"name\": \"Alaska\"}")
		.field('username',  "stargazer116")
		.end(function (err, res) {
			console.log("debug 1");
			chai.expect(res).to.have.status(200);	
			chai.request(HOST)
			.post('login')
			.send({ username: "stargazer116", password: "lol" })
			.end(function (err, res) {		
				console.log(res.body);
				chai.expect(res).to.have.status(200);
				chai.expect(res).to.have.header('Authorization');
				var ID =  res.body['_id'];
				chai.expect(res).to.have.status(200);	
				chai.request(HOST)
				.get('feed')
				.set('Authorization', res.body.oauth.token)
				.end(function (err, res) {
					chai.request(TEST)
					.del('users/' + ID)
					.end(function (err, res) {
						console.log(err);
						chai.expect(err).to.be.null;
						done();
					});
				});
			});
		});
	})
});