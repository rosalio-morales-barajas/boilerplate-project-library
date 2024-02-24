/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  // test('#example Test GET /api/books', function(done){
  //    chai.request(server)
  //     .get('/api/books')
  //     .end(function(err, res){
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, 'response should be an array');
  //       assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
  //       assert.property(res.body[0], 'title', 'Books in array should contain title');
  //       assert.property(res.body[0], '_id', 'Books in array should contain _id');
  //       done();
  //     });
  // });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {
    let _id = "";
    suite('POST /api/books with title => create book object/expect book object', function() {
      test('Test POST /api/books with title', function(done) {
        chai
          .request(server)
          .keepOpen()  // add
          .post('/api/books')
          .send({ title: "Title 1" })
          .end(function (err, res) {
            if (err) {
              console.log(`err:${err}:`);
              return done(err);
            }
            assert.equal(res.status, 200);
            _id = res.body._id;
            assert.property(res.body, 'title', 'Book should contain title');
            assert.equal(res.body.title, 'Title 1');
            done();
          });
      });
      test('Test POST /api/books with no title given', function(done) {
        chai
          .request(server)
          .keepOpen()  // add
          .post('/api/books')
          .end(function (err, res) {
            if (err) {
              console.log(`err:${err}:`);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.text, '\"missing required field title\"');
            done();
          });
      });
    });

    suite('GET /api/books => array of books', function(){
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .keepOpen()  // add
          .get('/api/books')
          .end(function(err, res){
            if (err) {
              console.log(`err:${err}:`);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            assert.equal(res.body[0].title, 'Title 1');
            assert.equal(res.body[0]._id, _id);
            assert.equal(res.body[0].commentcount, 0);
            done();
          });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function(){
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .keepOpen()  // add
          .get('/api/books/63e0000000b783222c9660ef')
          .end(function(err, res){
            if (err) {
              console.log(`err:${err}:`);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.text, '\"no book exists\"');
            done();
          });
      });
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .keepOpen()  // add
          .get('/api/books/' + _id)
          .end(function(err, res){
            if (err) {
              console.log(`err:${err}:`);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.isArray(res.body.comments, 'Book comments should be an array');
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.property(res.body, 'title', 'Book should contain title');
            assert.property(res.body, 'comments', 'Book should contain comments array');
            assert.equal(res.body._id, _id);
            assert.equal(res.body.title, 'Title 1');
            done();
          });
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      test('Test POST /api/books/[id] with comment', function(done){
        const comment = 'I liked this book a lot!';
        chai.request(server)
          .keepOpen()  // add
          .post('/api/books/' + _id)
          .send({comment: comment})
          .end(function(err, res){
            if (err) {
              console.log(`err:${err}:`);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.isArray(res.body.comments, 'Book comments should be an array');
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.property(res.body, 'title', 'Book should contain title');
            assert.property(res.body, 'comments', 'Book should contain comments array');
            assert.equal(res.body._id, _id);
            assert.equal(res.body.title, 'Title 1');
            assert.equal(res.body.comments, comment);
            done();
          });
      });
      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .keepOpen()  // add
          .post('/api/books/' + _id)
          .end(function(err, res){
            if (err) {
              console.log(`err:${err}:`);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.text, '\"missing required field comment\"');
            done();
          });
      });
      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        const comment = 'I liked this book a lot!';
        chai.request(server)
          .keepOpen()  // add
          .post('/api/books/63e0000000b783222c9660ef')
          .send({comment: comment})
          .end(function(err, res){
            if (err) {
              console.log(`err:${err}:`);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.text, '\"no book exists\"');
            done();
          });
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {
      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .keepOpen()  // add
          .delete('/api/books/' + _id)
          .end(function(err, res){
            if (err) {
              console.log(`err:${err}:`);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.text, '\"delete successful\"');
            done();
          });
      });
      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
          .keepOpen()  // add
          .delete('/api/books/63e0000000b783222c9660ef')
          .end(function(err, res){
            if (err) {
              console.log(`err:${err}:`);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.text, '\"no book exists\"');
            done();
          });
      });
    });
  });

});
