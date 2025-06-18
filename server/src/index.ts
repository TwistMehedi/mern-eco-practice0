import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDb } from './utils/feature.js';
import { ErrorHandler } from './middleware/Error.js';
import userRouter from './routes/User.js';
import productRouter from './routes/product.route.js';
import NodeCache from "node-cache";
import orderRouter from './routes/order.route.js';
import paymentRouter from './routes/payment.routes.js';
import dashbordRouter from './routes/stats.route.js';
 
dotenv.config();
const app = express();


export const nodeCashe = new NodeCache()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials:true
}));


app.use("/api/v1/user", userRouter)
app.use("/api/v1/product", productRouter)
app.use("/api/v1/order", orderRouter)
app.use("/api/v1/payment", paymentRouter)
app.use("/api/v1/dashbord", dashbordRouter)

app.use(ErrorHandler)

const PORT =  process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDb();
  console.log(`Server is running at http://localhost:${PORT}`);
});
