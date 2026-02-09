import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
	{
		articleName: {
      type: String,
      required: true,
      trim: true
    },
		articleCategory: {
      type: String,
      required: true,
      trim: true
    },
		articleDate: {
      type: Date,
      required: true,
      min:'2026-02-04'
    }
	},
	{ timestamps: true }
);

export default mongoose.models.Article || mongoose.model('Article', articleSchema);
