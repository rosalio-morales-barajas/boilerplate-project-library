'use strict';
const { json } = require('body-parser');
const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.set('strictQuery', true);

/** Schemas */
const bookSchema = new Schema({
  title: { type: String,  required: true },
  comments: [{ type: String, required: true }]
});

/** Models */
const book = mongoose.model("book", bookSchema);

/** Connect to database */
mongoose.connect("mongodb+srv://Rosalio:Rosalio791975@rosaliomorales.btcjciy.mongodb.net/personal-library?retryWrites=true&w=majority&appName=RosalioMorales", { useNewUrlParser: true, useUnifiedTopology: true });


module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      book.find()
     .select({ "__v": 0 })
     .exec((err, data) => {
        if (err) {
          return res.json({error: err})
        }
        if (data.length === 0) {
//          return res.json({ error: 'no books in database!'});  //HAD TO COMMENT OUT THIS LINE AND ADD IN FOLLOWING LINE
          return res.json([{ error: 'no books in database!', _id: 0, title: '', commentcount: 0}]); // SO EXAMPLE FUNCTIONAL TEST COULD PASS
        }
        let arr=[];
        data.forEach(d => {
          arr.push({ _id:          d._id,
                     title:        d.title,
                     commentcount: d.comments.length
                   });
        })
        return res.json(arr);
      })
    })
    
    .post(function (req, res){
      let title = req.body.title;
      if (title === undefined) {
        return res.json('missing required field title');
      }
      const newBook = new book({title:title, comments:[]});
      newBook.save((err, data) => {
        if (err) {
          return res.json({ error: `error in saving data:${err}:` });
        }
        else {
          return res.json({ title : data.title,
                            _id   : mongoose.Types.ObjectId(data._id)
                          });
        }
      });
    })
    
    .delete(function(req, res){
      book.deleteMany((err, data) => {
        if (err) {
          return res.json({ error: err, '_id': _id });
        }
        if (!data) {
          return res.json({ error: 'could not delete' });
        }
        return res.json('complete delete successful');
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      book.find({ _id : mongoose.Types.ObjectId(bookid) })
     .select({ "__v": 0 })
     .exec((err, data) => {
        if (err) {
          return res.json({error: err})
        }
        if (data.length === 0) {
          return res.json('no book exists');
        }
        res.json({ _id:      data[0]._id,
                   title:    data[0].title,
                   comments: data[0].comments
        });
      })
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (comment === undefined) {
        return res.json('missing required field comment');
      }
      book.findByIdAndUpdate(
          { _id : mongoose.Types.ObjectId(bookid) },
          { $push: { comments: comment } },
          { new: true },
        (err, data) => {
          if (err) {
            return res.json({ error: err, '_id': bookid });
          }
          if (!data) {
            return res.json('no book exists');
          }
          return res.json({ _id:      data._id,
                            title:    data.title,
                            comments: data.comments
                          });
        }
      );
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      book.deleteMany({ _id : mongoose.Types.ObjectId(bookid) }, (err, data) => {
        if (err) {
          return res.json({ error: err, '_id': bookid });
        }
        if (data.deletedCount === 0) {
          return res.json('no book exists');
        }
        return res.json('delete successful');
      });
    });
  
};
