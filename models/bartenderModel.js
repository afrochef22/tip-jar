const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tipSchema = new mongoose.Schema({
	tipAmount: {
		type: Number,
		required: true,
	},
	date: {
		type: Date,
		required: true,
	},
});

const bartenderSchema = new Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		tips: [tipSchema],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Bartender", bartenderSchema);
