import { Request } from "express";
import { Coupon } from "../models/coupon.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { TryCatch } from "../utils/feature.js";
import { CouponRequest } from "../types/User.js";


export const newCoupon = TryCatch(async(req: Request<{},{},CouponRequest>, res, next)=>{

    const {code, disscount} = req.body;

    if(!code || !disscount){
        return next(new ErrorResponse("All fields required", 404))
    };

    await Coupon.create({code, disscount});

    res.status(201).json({
        success: true,
        message: `Coupon created ${code}`
    })
});


export const applyDisscount = TryCatch(async(req, res, next)=>{
    const {coupon} = req.query;

    const disscount = await Coupon.findOne({code:coupon});
    if(!disscount){
        return next(new ErrorResponse("Invalid coupon code", 401))
    };


    res.status(200).json({
        success: true,
        message: disscount.disscount
    })
});

export const allCoupon = TryCatch(async(req, res, next)=>{
    const coupons = await Coupon.find({});
    if(!coupons){
        return next (new ErrorResponse("Coupons not found", 404))
    };

    res.status(200).json({
        success: true,
        coupons
    })
});

export const deleteCoupon = TryCatch(async(req, res, next)=>{
    const {id} = req.params;

    const coupon = await Coupon.findById(id);
    if(!coupon){
        return next (new ErrorResponse("Coupons not found", 404))
    };

    await coupon.deleteOne();
    res.status(200).json({
        success: true,
        message: "Coupon deleted"
    })
})