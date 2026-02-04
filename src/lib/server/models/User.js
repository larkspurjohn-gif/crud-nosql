import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		firstName: {
      type: String,
      required: true,
      trim: true
    },
		lastName: {
      type: String,
      required: true,
      trim: true
    },
		age: {
      type: Number,
      required: true,
      min: 0
    }
	},
	{ timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
