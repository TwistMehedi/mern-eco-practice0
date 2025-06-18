import mongoose from "mongoose";

 
type shippingTyle = {
    country: string,
    city: string,
    state: string,
    pinCode: number
};

type orderItemsStyle = {
    price: number,
        stock: number,
        quantity: number,
        country: string,
        productId: string
};

export interface OrderStyle extends Document{
    shippingInfo: shippingTyle,
    tax: number,
    disscount: number,
    subtotal: number,
    total: number,
    user: string,
    status: string,
    shippingCharge: number,
    orderItems:orderItemsStyle[],
    createdAt?: Date

}

const orderSchema = new mongoose.Schema({

    shippingInfo:{
        country:{
            type: String,
            required: true
        },
        city:{
            type: String,
            required: true
        },
        state:{
            type: String,
            required: true
        },
        pinCode:{
            type: Number,
            required: true
        }
    },

    tax:{
        type: Number,
        
    },

    disscount:{
        type: Number,
         
    },
    shippingCharge:{
        type: Number,
        
    },
    subtotal:{
        type: Number,
        required: true
    },
    total:{
        type: Number,
        required: true
    },
    user:{
        type: String,
        required: true,
        ref: "User"
    },
    status:{
        type: String,
        enum:["Proccesing", "Shipped", "Delivery"],
        default:"Proccesing"
    },

    orderItems:[{
        price:{
            type: Number,
            required: true
        },
        stock:{
            type: Number,
            required: true
        },
        quantity:{
            type: Number,
            required: true
        },
        country:{
            type: String,
        },
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        }
    }]

},{timestamps: true});


const Order = mongoose.model<OrderStyle>("Order", orderSchema);

export default Order;