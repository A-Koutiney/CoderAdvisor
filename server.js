import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import schools from './routes/schools.js';
import courses from './routes/courses.js';
import auth from './routes/auth.js';
import connectDB from './config/db.js';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';
import { fileURLToPath } from 'url';
// ES modules set __filename & __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// init express
const app = express();
// load global vars
dotenv.config();
//connect DB
connectDB();
const PORT = process.env.PORT || 5000;
app.use(express.json());
// File upload
app.use(fileUpload());
// Cookie parser
app.use(cookieParser());
// Static folder
app.use(express.static(path.join(__dirname, 'public')));
// Routes
app.use('/api/schools', schools);
app.use('/api/courses', courses);
app.use('/api/auth', auth);
// ErrorHandler init
app.use(errorHandler);
app.listen(PORT, () =>
	console.log(
		`Server is running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
	)
);
