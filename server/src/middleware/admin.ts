import {Request, Response, NextFunction } from "express";
import { TryCatch } from "../utils/feature.js";
import { User } from "../models/User.js";
import ErrorResponse from "../utils/ErrorResponse.js";



export const admin = TryCatch(async (req : Request, res: Response, next: NextFunction)=>{

    const id = req.query.id;

    if (!id) {
        return next(new ErrorResponse("Admin ID is required", 400));
    };

    const user = await User.findById(id);
    if(!user){
         return next(new ErrorResponse("User not found", 404));
    };

    if(user.role !== "admin"){
        return next(new ErrorResponse("User is not an admin", 403));
    };

    next();
});