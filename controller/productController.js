const Products = require("../model/productsModel");
const Category = require("../model/categoryModel");
const { date } = require("joi");

//load the products page
const loadProducts = async (req, res) => {
    try {
        const products = await Products.find().populate("categoryId");
        res.render("products", { products });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("user/error-500");
    }
};
//load add products page
const loadAddProducts = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.render("addProducts", { categories });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("user/error-500");
    }
};
//add products post
const addProducts = async (req, res) => {
    try {
        const details = req.body;
        const imageUrls = req.files.map((file) => file.path);

        const category = await Category.findOne({ name: details.category });

        const newProduct = new Products({
            name: details.productName,
            price: details.price,
            orgPrice: details.price,
            quantity: details.quantity,
            categoryId: category._id,
            description: details.description,
            addedDate: new date(),
            images: {
                image1: imageUrls[0],
                image2: imageUrls[1],
                image3: imageUrls[2],
                image4: imageUrls[3],
            },
        });

        const savedProduct = await newProduct.save();
        if (savedProduct) {
            res.redirect("/admin/products");
        } else {
            res.render("addProducts");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("user/error-500");
    }
};

//edit product page load
const loadEditProduct = async (req, res) => {
    try {
        const productId = req.query.id;
        const productData = await Products.findOne({ _id: productId }).populate("categoryId");
        const categories = await Category.find({});
        res.render("editProducts", { productData, categories });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("user/error-500");
    }
};

const updateProducts = async (req, res) => {
    try {
        const productId = req.query.id;
        const details = req.body;
        const files = req.files;

        const existingDetails = await Products.findById({ _id: productId });
        const hasNewFiles = !!files;

        //check there is new files added , if not adding defult ones
        const images = hasNewFiles
            ? [
                  files.image1?.[0]?.filename || existingDetails.images.image1,
                  files.image2?.[0]?.filename || existingDetails.images.image2,
                  files.image3?.[0]?.filename || existingDetails.images.image3,
                  files.image4?.[0]?.filename || existingDetails.images.image4,
              ]
            : [existingDetails.images.image1, existingDetails.images.image2, existingDetails.images.image3, existingDetails.images.image4];

        //finding the category of edited product
        const category = await Category.findOne({ name: details.category });
        const newCategoryId = category._id;

        const editedProduct = {
            name: details.productName,
            quantity: details.quantity,
            price: details.price,
            categoryId: newCategoryId,
            description: details.description,
            images: {
                image1: images[0],
                image2: images[1],
                image3: images[2],
                image4: images[3],
            },
        };

        const updatedProduct = await Products.findByIdAndUpdate({ _id: productId }, editedProduct, { new: true });

        if (updatedProduct) {
            res.redirect("/admin/products");
        } else {
            res.render("editProducts");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("error-500");
    }
};

const blockProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const productData = await Products.findOne({ _id: productId });

        if (productData.isDeleted) {
            await Products.findByIdAndUpdate({ _id: productId }, { $set: { isDeleted: false } });
        } else {
            await Products.findByIdAndUpdate({ _id: productId }, { $set: { isDeleted: true } });
        }
        res.json({ result: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("user/error-500");
    }
};


module.exports = {
    loadProducts,
    loadAddProducts,
    addProducts,
    loadEditProduct,
    updateProducts,
    blockProduct,
};
