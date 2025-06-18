import Product from "../models/product.model.js";
export const getCatagories = async ({ categories, productCounts }) => {
    const categoryCountPromise = categories.map(category => Product.countDocuments({ category }));
    const categoriesCount = await Promise.all(categoryCountPromise);
    const categoryCount = [];
    categories.forEach((category, index) => {
        categoryCount.push({
            [category]: (categoriesCount[index] / productCounts) * 100
        });
    });
    return categoryCount;
};
export const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};
