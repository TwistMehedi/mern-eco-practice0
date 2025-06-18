import e, {Request, Response, NextFunction } from "express";
import ErrorResponse from "../utils/ErrorResponse.js";


export const ErrorHandler = (err: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    res.status(err.statusCode).json({
        success: false, 
        message: err.message,    })    
}