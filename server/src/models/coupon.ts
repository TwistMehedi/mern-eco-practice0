import mongoose from "mongoose";

interface CouponStyle{
    code:number,
    disscount: number
}

const couponSchema = new mongoose.Schema({
    code:{type: Number, required: true},
    disscount:{type:Number, required: true}
},{timestamps:true});

export const Coupon = mongoose.model<CouponStyle>("Coupon", couponSchema);