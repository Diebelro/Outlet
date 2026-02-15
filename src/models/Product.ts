import mongoose, { Schema, model, models } from 'mongoose';

export interface IProduct {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sizes: string[];
  image?: string;
  imagePublicId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    sizes: [{ type: String }],
    image: { type: String },
    imagePublicId: { type: String },
  },
  { timestamps: true }
);

export default models.Product || model<IProduct>('Product', ProductSchema);
