import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { nodeCashe } from "../index.js";
import Order from "../models/Order.js";
export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connected successfully');
    }
    catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};
export const TryCatch = (fn) => {
    const control = async (req, res, next) => {
        try {
            await fn(req, res, next);
        }
        catch (error) {
            console.error('Error in TryCatch:', error.message);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    };
    return control;
};
export const inValidateCacheProps = async ({ product, order, admin }) => {
    if (product) {
        const productKeys = ["latestProducts", "admin-products", "catrgories"];
        const product = await Product.find({}).select("_id");
        if (product) {
            productKeys.push(...product.map((item) => `product${item._id}`));
        }
        nodeCashe.del(productKeys);
    }
    ;
    if (order) {
        const orderKey = ["my-orders", "admin-orders"];
        const orders = await Order.find({}).select("_id");
        orders.forEach(order => {
            orderKey.push(`admin-order-${order._id}`);
        });
    }
    ;
};
export const reduceStock = async (orderItems) => {
    try {
        for (const item of orderItems) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
            }
            else {
                console.error(`Product with ID ${item.productId} not found`);
            }
        }
    }
    catch (error) {
        console.error('Error reducing stock:', error);
        throw error;
    }
};
export const calculatePercentage = (thisMonth, lastMonth) => {
    if (lastMonth === 0)
        return thisMonth * 100;
    const percent = ((thisMonth) / lastMonth) * 100;
    return percent.toFixed(0);
};
