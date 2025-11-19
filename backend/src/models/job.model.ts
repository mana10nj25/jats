import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const jobSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['applied', 'phone-screen', 'interview', 'offer', 'rejected', 'wishlist'],
      default: 'applied'
    },
    dateApplied: Date,
    nextFollowUp: Date,
    notes: String,
    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

type Job = InferSchemaType<typeof jobSchema>;
export type JobDocument = HydratedDocument<Job>;

export const JobModel = model<Job>('Job', jobSchema);
