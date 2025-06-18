import { inValidateCacheProps, reduceStock, TryCatch } from "../utils/feature.js";
import Order from "../models/Order.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { nodeCashe } from "../index.js";
export const createOrder = TryCatch(async (req, res, next) => {
    const { shippingInfo, tax, subtotal, total, user, orderItems } = req.body;
    const confirmOrder = await Order.create({
        shippingInfo, subtotal, total, user, tax, orderItems
    });
    await reduceStock(orderItems);
    await inValidateCacheProps({ order: true, product: true, admin: true });
    res.status(201).json({
        success: true,
        message: "Order successfully",
        order: confirmOrder
    });
});
export const myOrders = TryCatch(async (req, res, next) => {
    const { id: user } = req.query;
    let orders;
    if (nodeCashe.has("my-orders"))
        orders = JSON.parse(nodeCashe.get("my-orders"));
    else {
        orders = await Order.find({ user });
        if (!orders || orders.length === 0) {
            next(new Error("No orders found for this user"));
            return;
        }
        ;
        nodeCashe.set("my-orders", JSON.stringify(orders));
    }
    ;
    res.status(200).json({
        success: true,
        orders
    });
});
export const getSingleOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    let order;
    if (nodeCashe.has(`single-order-${id}`)) {
        order = JSON.parse(nodeCashe.get(`single-order-${id}`));
    }
    else {
        order = await Order.findById(id);
        if (!order) {
            return next(new ErrorResponse("Order not found", 404));
        }
        ;
        nodeCashe.set(`single-order-${id}`, JSON.stringify(order));
    }
    ;
    res.status(200).json({
        success: true,
        message: "Order founded",
        order
    });
});
export const deleteOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
        return next(new ErrorResponse("Order not found", 404));
    }
    ;
    await order?.deleteOne();
    await inValidateCacheProps({ order: true, product: true, admin: true });
    res.status(202).json({
        success: true,
        message: "Deleted order"
    });
});
export const allOrdersForAdmin = TryCatch(async (req, res, next) => {
    let orders;
    if (nodeCashe.has("admin-orders")) {
        orders = JSON.parse(nodeCashe.get("admin-orders"));
    }
    else {
        orders = await Order.find({});
        // console.log(orders)
        if (!orders) {
            return next(new ErrorResponse("Admin orders not found", 404));
        }
        ;
        nodeCashe.set("admin-orders", JSON.stringify(orders));
    }
    ;
    res.status(200).json({
        success: true,
        message: "Admin orders",
        orders
    });
});
export const updateStatus = TryCatch(async (req, res, next) => {
    const { status } = req.body;
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
        return next(new ErrorResponse("Order not found", 404));
    }
    ;
    if (status)
        order.status = status;
    await order.save();
    await inValidateCacheProps({ order: true, product: true, admin: true });
    res.status(201).json({
        success: true,
        message: "Update successfull",
        order
    });
});
