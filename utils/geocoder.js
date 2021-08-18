import NodeGeocoder from 'node-geocoder';
import dotenv from 'dotenv';
// load gobal vars
dotenv.config();

const options = {
	provider: process.env.GEOCODER_PROVIDER,

	// Optional depending on the providers
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_KEY, // for Mapquest, OpenCage, Google Premier
	formatter: null, // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

export default geocoder;
