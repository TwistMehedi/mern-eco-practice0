import {Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
 
export interface NewUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  dob: Date;
  gender: 'male' | 'female';
  age: number,
  image?: string
};

export interface ProductType {
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


export interface searchRequest{
  search?: string;
  page?: number;
  category?: string;
  price?: number;
  sort?: string;
};

export interface baseQuesry{
    title?: {$regex: string, $options: 'i'};
    price?:{$lte: number};
    category?: string;
};


type shippingTyle = {
    country: string,
    city: string,
    state: string,
    pinCode: number
};

export type orderItemsStyle = {
        price: number,
        stock: number,
        quantity: number,
        country: string,
        productId: string
};

export interface NewOrder{
    shippingInfo: shippingTyle,
    tax: number,
    disscount: number,
    subtotal: number,
    total: number,
    user: string,
    status?: string,
    shippingCharge: number,
    orderItems:orderItemsStyle[]

};

export interface InvalidateCache {
    product?: boolean;
    order?: boolean;
    admin?: boolean;
};


//coupon
export interface CouponRequest{
  code: number,
  disscount: number
};

export type ControlType =  (req: Request ,res: Response, next: NextFunction) => Promise<void>;