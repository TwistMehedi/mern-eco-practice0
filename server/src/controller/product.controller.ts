import e, { Request, Response, NextFunction } from "express";
import { inValidateCacheProps, TryCatch } from "../utils/feature.js";
import { baseQuesry, ProductType, searchRequest } from "../types/User.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { deleteImage, uploadImage } from "../utils/cloudinary.js";
import Product from "../models/product.model.js";
import { nodeCashe } from "../index.js";


export const createProduct = TryCatch(async (req: Request<{}, {}, ProductType>, res: Response, next: NextFunction) => {

    const { title, description, price, category, stock } = req.body;

    const file = req.file as Express.Multer.File;

    if (!title || !description || !price || !category || !stock) {
        return next(new ErrorResponse("All fields are required", 400));
    };

    if (price <= 2) {
        return next(new ErrorResponse("Price must be a positive number", 400));
    };

    if (stock < 5) {
        return next(new ErrorResponse("Stock must be a number greater than or equal to 5", 400));
    };
    if (!file) {
        return next(new ErrorResponse("Image is required", 400));
    };

    const cloudeResponse = await uploadImage(file.path);

    if (!cloudeResponse) {
        return next(new ErrorResponse("Failed to upload image", 500));
    };

    const product = await Product.create({
        title,
        description,
        price,
        category: category.toLowerCase(),
        image: cloudeResponse.secure_url,
        stock
    });

    await inValidateCacheProps({ product: true});

    res.status(201).json({
        success: true,
        message: "Product created successfully",
        product
    });
});

export const getLatestProduct = TryCatch(async (req, res, next) => {

    let products;

    if (nodeCashe.has("latestProducts")) products = JSON.parse((nodeCashe.get("latestProducts") as string))
    else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(5)
        if (!products) {
            return next(new ErrorResponse("Latest product not found", 404))
        };

        nodeCashe.set("latestProducts", JSON.stringify(products), 60 * 60 * 24); // Cache for 24 hours

    };

    res.status(200).json({
        sucsess: true,
        message: "Latest product founded",
        products
    })

});


export const adminAllProduct = TryCatch(async (req: Request, res: Response, next: NextFunction) => {

    let products;

    if (nodeCashe.has("admin-products")) products = JSON.parse((nodeCashe.get("admin-prodiucts") as string))
    else {
        products = await Product.find({});

        if (!products) {
            next(new ErrorResponse("Product not found", 404));
            return;
        };

        nodeCashe.set("admin-prodiucts", JSON.stringify(products), 60 * 60 * 24)
    };
 //mehedi
    res.status(200).json({
        success: true,
        message: "Admin all prpoduct found",
        products
    })
});

export const getCategory = TryCatch(async (req: Request, res: Response, next: NextFunction) => {

    let productCategory;

    if (nodeCashe.has("catrgories")) productCategory = JSON.parse(nodeCashe.get("category") as string)
    else {
        productCategory = await Product.distinct("category");
        if (!productCategory) {
            next(new ErrorResponse("Product category not found", 404))
        };

        nodeCashe.set("catrgories", JSON.stringify(productCategory), 60 * 60 * 24); // Cache for 24 hours
    };

    res.status(200).json({
        success: true,
        message: "All prosuct category found",
        productCategory
    })

});

export const updateProduct = TryCatch(async (req, res, next) => {

    const { id } = req.params;

    const { title, description, price, category, stock } = req.body;

    const file = req.file;

    if (price <= 2) {
        return next(new ErrorResponse("Price must be greater than 2", 400));
    }

    if (stock < 5) {
        return next(new ErrorResponse("Stock must be a number greater than or equal to 5", 400));
    };

    const product = await Product.findById(id);
    if (!product) {
        return next(new ErrorResponse("Product not found", 404));
    };


    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (stock) product.stock = Number(stock);
    if (category) product.category = category.toLowerCase()


    if (file) {
        if (product.image) {
            await deleteImage(product.image as string)
        };
        const cloudeResponse = await uploadImage(file.path);
        product.image = cloudeResponse.secure_url;
    };

    const updateProduct = await product.save();

    await inValidateCacheProps({ product: true });
    
    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product: updateProduct
    });

});

export const getProduct = TryCatch(async (req, res, next) => {

    const { id } = req.params;

    let product;
    if (nodeCashe.has(`product${id}`)) product = JSON.parse(nodeCashe.get(`product${id}`) as string)
    else {
        product = await Product.findById(id);
        if (!product) {
            return next(new ErrorResponse("Product not found", 404));
        };

        nodeCashe.set(`product${id}`, JSON.stringify(product), 60 * 60 * 24); // Cache for 24 hours
    };

    res.status(200).json({
        success: true,
        message: "Product found",
        product
    });

});

export const allProduct = TryCatch(async (req: Request<{}, {}, {}, searchRequest>, res, next) => {

    const { sort, search, category, price } = req.query;


    const page = Number(req.query.page) || 1;

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;

    const skip = (page - 1) * limit;

    const baseQuery: baseQuesry = {};

    if (search) baseQuery.title = { $regex: search, $options: "i" };

    if (category) baseQuery.category = category.toLowerCase();

    if (price) baseQuery.price = { $lte: Number(price) };


    const productPromise = Product.find(baseQuery).sort(sort && { price: sort === "asc" ? 1 : -1 }).limit(limit).skip(skip);

    const [products, filteredProducts] = await Promise.all([
        productPromise,
        Product.find(baseQuery)
    ]);

    const totalPage = Math.ceil(filteredProducts.length / limit);

    res.status(200).json({
        success: true,
        message: "All products found",
        products,
        totalPage
    });

});