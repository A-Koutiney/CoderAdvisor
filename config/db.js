import mongoose from 'mongoose';
import colors from 'colors';
const connectDB = async () => {
	const conn = await mongoose.connect(process.env.MONGO_URI, {
		useCreateIndex: true,
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	});
	console.log(
		`Database connected: ${conn.connection.host}`.cyan.underline.bold
	);
};

export default connectDB;
