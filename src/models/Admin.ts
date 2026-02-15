import mongoose, { Schema, model, models } from 'mongoose';

export interface IAdmin {
  _id?: string;
  email: string;
  password: string;
  createdAt?: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Admin || model<IAdmin>('Admin', AdminSchema);
