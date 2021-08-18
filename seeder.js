import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import colors from 'colors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load vars
dotenv.config();

// get models

import School from './models/School.js';
import Course from './models/Course.js';
import User from './models/User.js';

// connect DB

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});

// read files

const schools = JSON.parse(fs.readFileSync(`${__dirname}/_data/schools.json`));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`));

const importData = async () => {
	try {
		await School.create(schools);
		await Course.create(courses);
		await User.create(users);
		console.log('Data imported...'.green.bold);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

const deleteData = async () => {
	try {
		await School.deleteMany();
		await Course.deleteMany();
		await User.deleteMany();
		console.log('Data deleted...'.red.bold);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

if (process.argv[2] === '-i') {
	importData();
} else if (process.argv[2] === '-d') {
	deleteData();
}
