import { nodeCashe } from "../index.js";
import Order from "../models/Order.js";
import Product from "../models/product.model.js";
import { User } from "../models/User.js";
import { calculatePercentage, TryCatch } from "../utils/feature.js";
import { calculateAge, getCatagories } from "../helper/stats.js";

export const getDashbordStats = TryCatch(async (req, res, next) => {

    let stats = {};

    if (nodeCashe.has("admin-stats")) stats = JSON.parse(nodeCashe.get("admin-stats") as string);
    else {
        const today = new Date();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        };

        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        };

        // products first to last month
        const thisMonthProductsPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });

        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });

        //user first to last month
        const thisMonthUserPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });

        const lastMonthUserPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });

        //order first to last month
        const thisMonthOrderPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });

        const lastMonthOrderPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });

        // 6 moth order 
        const lastSixMothOrderPromise = Order.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        });

        const latestTransactionPromise = Order.find({}).select(["orderItems", "total", "disscount", "status"]).limit(4);

        const [
            thisMonthProducts,
            thisMonthUser,
            thisMonthOrder,
            lastMonthProducts,
            lastMonthUser,
            lastMonthOrder,
            userCounts,
            productCounts,
            allOrders,
            lastSixMonthsOrder,
            categories,
            femaleCounts,
            latestTransaction
        ] = await Promise.all([
            thisMonthProductsPromise,
            thisMonthUserPromise,
            thisMonthOrderPromise,
            lastMonthProductsPromise,
            lastMonthUserPromise,
            lastMonthOrderPromise,
            User.countDocuments(),
            Product.countDocuments(),
            Order.find({}).select("total"),
            lastSixMothOrderPromise,
            Product.distinct("category"),
            User.countDocuments({ gender: "female" }),
            latestTransactionPromise
        ]);


        const thisMonthRevenue = thisMonthOrder.reduce((total, order) => total + (order.total || 0), 0);

        const lastMonthRevenue = lastMonthOrder.reduce((total, order) => total + (order.total || 0), 0);

        const percents = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            users: calculatePercentage(
                thisMonthUser.length,
                lastMonthUser.length
            ),

            products: calculatePercentage(
                thisMonthProducts.length,
                lastMonthProducts.length
            ),

            orders: calculatePercentage(
                thisMonthOrder.length,
                lastMonthOrder.length
            )
        };

        const totalRevenue = allOrders.reduce((total, order) => total + (order.total || 0), 0);

        const count = {
            totalRevenue,
            product: productCounts,
            user: userCounts,
            order: allOrders.length
        };

        // 6 month charts
        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthyRevenue = new Array(6).fill(0);

        lastSixMonthsOrder.forEach((order) => {
            const creationDate = order.createdAt;
            if (!creationDate) return;

            const monthDiff = (today.getMonth() - (creationDate as Date).getMonth() + 12) % 12;

            if (monthDiff < 6) {
                const index = 6 - monthDiff;
                orderMonthCounts[index - 1] += 1;
                orderMonthyRevenue[index - 1] += order.total;
            }
        });

        const categoryCount = await getCatagories(
            {
                categories,
                productCounts
            }
        );

        const usersRatio = {
            male: userCounts - femaleCounts,
            female: femaleCounts,
        };

        const modifiedLatesTransaction = latestTransaction.map((i) => ({
            id: i._id,
            disscount: i.disscount,
            amount: i.total,
            status: i.status,
            quantity: i?.orderItems.length
        }))

        stats = {
            categoryCount,
            percents,
            count,
            charts: {
                order: orderMonthCounts,
                revenue: orderMonthyRevenue
            },
            usersRatio,
            latestTransaction: modifiedLatesTransaction
        };

        nodeCashe.set("admin-stats", JSON.stringify(stats))
    };

    res.status(200).json({
        success: true,
        stats
    });

});

export const getPieCharts = TryCatch(async (req, res, next) => {
    let charts = {};

    if (nodeCashe.has("admin-pie-charts")) charts = JSON.parse(nodeCashe.get("admin-pie-charts") as string)
    else {

        const allOrderPromise = Order.find({}).select(["total", "disscount", "subTotal", "tax", "shippingCharge"]);

        const [proccesingOrder, shippedOrder, deliveredOrder,
            categories, productCounts, outOfStock, allOrders, allUsers, adminUser, customUser] = await Promise.all([
                Order.countDocuments({ status: "Proccesing" }),
                Order.countDocuments({ status: "Shipped" }),
                Order.countDocuments({ status: "Delivery" }),
                Product.distinct("category"),
                Product.countDocuments(),
                Product.countDocuments({ stock: 0 }),
                allOrderPromise,
                User.find({}).select("dob"),
                User.countDocuments({ role: "admin" }),
                User.countDocuments({ role: "user" }),
            ]);


        const orderFullFillment = {
            proccecing: proccesingOrder,
            shippend: shippedOrder,
            deliver: deliveredOrder
        };

        const categoryCount = await getCatagories({
            categories,
            productCounts
        });

        const productStock = {
            inStock: productCounts - outOfStock,
            outOfStock
        };


        const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0)
        const disscount = allOrders.reduce((prev, order) => prev + (order.disscount || 0), 0)
        const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharge || 0), 0)
        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0)
        const marketingCost = Math.round(grossIncome * (30 / 100));

        const netMargin = disscount - productionCost - burnt - marketingCost;

        const revenueDistribuition = {
            netMargin,
            disscount,
            productionCost,
            burnt,
            marketingCost
        };

        const userAgeGroupe = {
            teen: allUsers.filter(user => calculateAge(user.dob) < 20).length,
            adult: allUsers.filter(user => {
                const age = calculateAge(user.dob);
                return age >= 20 && age < 30;
            }).length,
            old: allUsers.filter(user => {
                const age = calculateAge(user.dob);
                return age >= 30 && age < 40;
            }).length,
        };

        const adminCustomer = {
            admin: { adminUser },
            customer: customUser
        };

        charts = {
            userAgeGroupe,
            adminCustomer,
            categoryCount,
            orderFullFillment,
            productStock,
            revenueDistribuition
        };

        nodeCashe.set("admin-pie-charts", JSON.stringify(charts))


        res.status(200).json({
            success: true,
            charts
        })
    }
});

export const getLineCharts = TryCatch(async (req, res, next) => { });
export const getBarCharts = TryCatch(async (req, res, next) => { });