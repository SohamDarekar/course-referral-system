import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  purchaseDate: Date;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be a positive number'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate purchases
PurchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);
