import mongoose from "mongoose";


interface IPoduct extends Document {
    title: string;
    description: string;
    price: number;
    category: string;
    image: Express.Multer.File | string;
    stock: number;
    rating?: number;
    createdBy?: mongoose.Schema.Types.ObjectId;
    createdAt?:Date
};

const productShemea = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 2
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        min: 5
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt:{
        type: Date
    }
},{timestamps: true});

export const Product = mongoose.model<IPoduct>('Product', productShemea);

export default Product;
