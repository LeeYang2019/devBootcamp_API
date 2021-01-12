const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

//load env vars
dotenv.config({ path: './config/config.env' });

//connect to db
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

//Body parser
app.use(express.json());

//sanitize data
app.use(mongoSanitize());

//set security headers
app.use(helmet());

//prevent cross-site scripting text
app.use(xss());

// rate limiting
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, //10 mins
	max: 100, //100 requests per 10 minutes
});

app.use(limiter);

//prevent http param pollution
app.use(hpp());

// enable cors
app.use(cors());

//cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// file uploading
app.use(fileupload());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// we have to mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

//errorhandler middleware has to come after route
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
	console.log(
		`Listening in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	)
);

//handle unhandled promise rejections
process.on('unhandledRejection', (error, promise) => {
	console.log(`Error: ${error.message}`.red);
	server.close(() => process.exit(1));
});
