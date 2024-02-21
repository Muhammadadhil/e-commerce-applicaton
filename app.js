const createError = require('http-errors');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mongoose=require('mongoose');
require('dotenv').config();
const session=require('express-session');

mongoose.connect('mongodb://localhost:27017/project-furbar')
const app = express();

// Use Morgan middleware for logging requests
app.use(morgan('dev')); 

//configuring express-session 
app.use(session({
    secret:process.env.SECRET_KEY,
    resave:false,
    saveUninitialized:true
}))

const adminRouter = require('./routes/admin.Route');
const usersRouter = require('./routes/usersRoute');

// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine','ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use('/',usersRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//   console.log('hey aadhi , error page working !!!!!');
 
//   // render the error page
//   res.status(err.status || 500);
//   // res.render('error');
//   res.send('error someewhere')
// });

const port=4005

app.listen(port,()=>console.log(`server running on the port http://localhost:${port}`));


module.exports = app;
