import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'Please add a title'],
	},
	description: {
		type: String,

		required: [true, 'Please add a description to your course'],
	},
	durationPerWeek: {
		type: String,
		required: [true, 'Please add the number of weeks'],
	},
	cost: {
		type: Number,
		required: [true, 'Please add the cost of the course'],
	},
	minimumSkill: {
		type: String,
		enum: ['beginner', 'intermediate', 'advanced'],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	school: {
		type: mongoose.Schema.ObjectId,
		ref: 'School',
		required: true,
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
});

CourseSchema.statics.calAvgCost = async function (schoolId) {
	const resultArr = await this.aggregate([
		{
			$match: { school: schoolId },
		},
		{
			$group: {
				_id: '$school',
				averageCost: { $avg: '$cost' },
			},
		},
	]);
	try {
		await this.model('School').findByIdAndUpdate(schoolId, {
			averageCost: Math.ceil(resultArr[0].averageCost / 10) * 10,
		});
	} catch (err) {
		console.error(err);
	}
};

// Call getAverageCost after save
CourseSchema.post('save', function () {
	this.constructor.calAvgCost(this.school);
});

CourseSchema.pre('remove', function () {
	this.constructor.calAvgCost(this.school);
});

export default mongoose.model('Course', CourseSchema);
