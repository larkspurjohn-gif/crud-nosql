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
    }
	},
	{ timestamps: true }
);

articleSchema.statics.getDailyEngagement = function () {
  return this.aggregate([
    {
      // Normalize date to YYYY-MM-DD
      $addFields: {
        day: {
          $dateToString: { format: '%Y-%m-%d', date: '$articleDate' }
        }
      }
    },
    {
      // Group by day + category
      $group: {
        _id: {
          day: '$day',
          category: '$articleCategory'
        },
        count: { $sum: 1 }
      }
    },
    {
      // Regroup by day
      $group: {
        _id: '$_id.day',
        categories: {
          $push: {
            category: '$_id.category',
            count: '$count'
          }
        }
      }
    },
    {
      // Convert categories array → object
      $project: {
        _id: 0,
        date: '$_id',
        data: {
          $arrayToObject: {
            $map: {
              input: '$categories',
              as: 'c',
              in: ['$$c.category', '$$c.count']
            }
          }
        }
      }
    },
    {
      $sort: { date: 1 }
    }
  ]);
};


export default mongoose.models.Article || mongoose.model('Article', articleSchema);
