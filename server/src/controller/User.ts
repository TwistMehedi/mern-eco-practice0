import {Request, Response, NextFunction } from "express";
import { NewUser } from "../types/User.js";
import { TryCatch } from "../utils/feature.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { uploadImage } from "../utils/cloudinary.js";
import { User } from "../models/User.js";


export const createUser = TryCatch(async (req:Request<{},{},NewUser>, res:Response, next: NextFunction)=>{
     const { _id, name, email, password, age, role, dob, gender } = req.body;
     const file = req.file as Express.Multer.File;
 
      
     const existingUser = await User.findOne({_id})
       
        if (existingUser) {
                next(new ErrorResponse("User with this ID already exists", 400));
                return;
            };

        if (!name || !email || !password || !role || !dob || !gender){
            next(new ErrorResponse("All fields are required", 400));
            return;
        };

        if(!file){
            next(new ErrorResponse("Image is required", 400));
            return;
        }

        if (role !== 'user' && role !== 'admin') {
            next(new ErrorResponse("Role must be either 'user' or 'admin'", 400));
            return;
        };

        const cloudeResponse = await uploadImage(file.path);
             
        if (!cloudeResponse) {
            next(new ErrorResponse("Failed to upload image", 500));
            return;
        };
        const user = {
            _id,
            name,
            email,
            password,
            role,
            age,
            dob,
            gender,
            image: cloudeResponse.secure_url
        };

        await User.create(user);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user,
        })
});

export const getAllUsers = TryCatch(async(req: Request, res: Response, next: NextFunction)=>{
    const users = await User.find({});

    if(users.length === 0){
        next(new ErrorResponse("No users found", 404));
        return;
    };

    res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        users,
    });

});

export const getUser = TryCatch(async(req: Request, res: Response, next: NextFunction)=>{
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        next(new ErrorResponse("User not found", 404));
        return;
    };
    res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        user,
    });
});