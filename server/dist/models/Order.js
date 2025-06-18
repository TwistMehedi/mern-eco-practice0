import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    shippingInfo: {
        country: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pinCode: {
            type: Number,
            required: true
        }
    },
    tax: {
        type: Number,
    },
    disscount: {
        type: Number,
    },
    shippingCharge: {
        type: Number,
    },
    subtotal: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    user: {
        type: String,
        required: true,
        ref: "User"
    },
    status: {
        type: String,
        enum: ["Proccesing", "Shipped", "Delivery"],
        default: "Proccesing"
    },
    orderItems: [{
            price: {
                type: Number,
                required: true
            },
            stock: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            country: {
                type: String,
            },
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            }
        }]
}, { timestamps: true });
const Order = mongoose.model("Order", orderSchema);
export default Order;
