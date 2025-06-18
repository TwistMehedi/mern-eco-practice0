import mongoose from "mongoose";
const couponSchema = new mongoose.Schema({
    code: { type: Number, required: true },
    disscount: { type: Number, required: true }
}, { timestamps: true });
export const Coupon = mongoose.model("Coupon", couponSchema);
