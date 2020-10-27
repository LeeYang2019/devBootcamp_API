const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

//load env vars
dotenv.config({ path: './config/config.env' });

//connect to db
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');

const app = express();

//Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// we have to mount routers
app.use('/api/v1/bootcamps', bootcamps);

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
