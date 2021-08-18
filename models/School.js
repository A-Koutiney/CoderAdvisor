import mongoose from 'mongoose';
import slugify from 'slugify';
import geocoder from '../utils/geocoder.js';

const SchoolSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please add a name.'],
			unique: true,
			trim: true,
			maxlength: [50, 'Name can not be more than 50 charachters.'],
		},
		slug: String,
		description: {
			type: String,
			required: [true, 'Please add a description.'],
			maxlength: [2000, 'description can not be more than 500 charachters.'],
		},

		website: {
			type: String,
			match: [
				/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
				'Please use a valid URL with HTTP or HTTPS',
			],
		},
		phone: {
			type: String,
			maxlength: [20, 'Phone number can not be longer than 20 characters'],
		},
		email: {
			type: String,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				'Please add a valid email',
			],
		},
		address: {
			type: String,
			required: [true, 'Please add an address'],
		},
		location: {
			// GeoJSON Point
			type: {
				type: String,
				enum: ['Point'],
			},
			coordinates: {
				type: [Number],
				index: '2dsphere',
			},
			formattedAddress: String,
			street: String,
			city: String,
			state: String,
			zipcode: String,
			country: String,
		},

		photo: {
			type: String,
			default: 'no-photo.jpg',
		},
		careers: {
			type: [String],
			enum: [
				'UX/UI Design',
				'Cyber Security',
				'Data Analysis',
				'Web Development',
				'Mobile Development',
				'Data Science',
			],
		},
		housing: {
			type: Boolean,
			default: false,
		},
		jobAssistance: {
			type: Boolean,
			default: false,
		},
		jobGuarantee: {
			type: Boolean,
			default: false,
		},
		averageCost: Number,
		createdAt: {
			type: Date,
			default: Date.now,
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Create a slug from name
SchoolSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

// Geocode & create location field
SchoolSchema.pre('save', async function (next) {
	const loc = await geocoder.geocode(this.address);
	this.location = {
		type: 'Point',
		coordinates: [loc[0].longitude, loc[0].latitude],
		formattedAddress: loc[0].formattedAddress,
		street: loc[0].streetName,
		city: loc[0].city,
		state: loc[0].stateCode,
		zipcode: loc[0].zipcode,
		country: loc[0].countryCode,
	};

	// Make address field empty
	this.address = undefined;

	next();
});
// Delete all courses related to school when school deleted
SchoolSchema.pre('remove', async function (next) {
	await this.model('Course').deleteMany({ school: this._id });
	next();
});

// Create a virtual field

SchoolSchema.virtual('courses', {
	ref: 'Course',
	localField: '_id',
	foreignField: 'school',
	justOne: false,
});

export default mongoose.model('School', SchoolSchema);
