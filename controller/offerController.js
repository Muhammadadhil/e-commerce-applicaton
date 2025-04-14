const Products = require("../model/productsModel");
const Category = require("../model/categoryModel");
const Offer = require("../model/offerModel");

const offerLoader = async (req, res) => {
    try {
        const offers = await Offer.find({}).populate("product").populate("category");
        res.render("offers", { offers });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

const addOfferLoader = async (req, res) => {
    try {
        const products = await Products.find({});
        const categories = await Category.find({});
        res.render("addOffer", { products, categories });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};
//save Offer to database
const addOffer = async (req, res) => {
    try {
        const { name, offerType, product, category, discountPercentage, expiryDate } = req.body;

        let newOffer = new Offer({
            name: name,
            offerType: offerType,
            discountPercentage: discountPercentage,
            expiryDate: expiryDate,
        });
        console.log("newOffer:", newOffer);

        if (offerType === "product") {
            newOffer.product = product;
            const productDetails = await Products.findOne({ _id: product });
            await Products.findByIdAndUpdate(
                { _id: product },
                {
                    $set: {
                        productOfferId: newOffer._id,
                        productDiscount: discountPercentage,
                        price: productDetails.price - (productDetails.price * discountPercentage) / 100,
                    },
                }
            );
        } else if (offerType === "category") {
            newOffer.category = category;
            const categoryProducts = await Products.find({ categoryId: category });
            categoryProducts.map(async (product) => {
                await Products.findOneAndUpdate(
                    { _id: product._id },
                    {
                        $set: {
                            categoryOfferId: newOffer._id,
                            categoryDiscount: discountPercentage,
                            price: product.price - (product.price * discountPercentage) / 100,
                        },
                    }
                );
            });
        }

        const savedOffer = await newOffer.save();
        if (savedOffer) {
            res.status(200).json({ saved: true });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500);
    }
};

const removeOffer = async (req, res) => {
    try {
        const { offerId } = req.body;
        const updatedOffer = await Offer.findOneAndUpdate({ _id: offerId }, { $set: { isActive: false } }, { new: true });
        if (updatedOffer.offerType === "product") {
            const offerApplied = await Products.find({ productOfferId: offerId });

            offerApplied.map(async (product) => {
                await Products.findOneAndUpdate(
                    { _id: product._id },
                    {
                        $set: {
                            price: product.orgPrice,
                            productOfferId: null,
                            productDiscount: null,
                        },
                    }
                );
            });
        } else if (updatedOffer.offerType === "category") {
            const offerApplied = await Products.find({ categoryOfferId: offerId });

            await Promise.all(
                offerApplied.map(async (product) => {
                    await Products.findOneAndUpdate(
                        { _id: product._id },
                        {
                            $set: {
                                price: product.orgPrice,
                                categoryOfferId: null,
                                categoryDiscount: null,
                            },
                        }
                    );
                })
            );
        }
        res.json({ updated: true, updatedOffer });
    } catch (error) {
        console.log(error.message);
        res.status(500);
    }
};

const reactivateOffer = async (req, res) => {
    try {
        const { offerId } = req.body;
        const updatedOffer = await Offer.findOneAndUpdate({ _id: offerId }, { $set: { isActive: true } }, { new: true });

        if (updatedOffer.offerType === "product") {
            const productDetails = await Products.findOne({ _id: updatedOffer.product });
            await Products.findByIdAndUpdate(
                { _id: updatedOffer.product },
                {
                    $set: {
                        productOfferId: updatedOffer._id,
                        productDiscount: updatedOffer.discountPercentage,
                        price: productDetails.price - (productDetails.price * updatedOffer.discountPercentage) / 100,
                    },
                }
            );
        } else if (updatedOffer.offerType === "category") {
            const categoryProducts = await Products.find({ categoryId: updatedOffer.category });
            categoryProducts.map(async (product) => {
                await Products.findOneAndUpdate(
                    { _id: product._id },
                    {
                        $set: {
                            categoryOfferId: updatedOffer._id,
                            categoryDiscount: updatedOffer.discountPercentage,
                            price: product.price - (product.price * updatedOffer.discountPercentage) / 100,
                        },
                    }
                );
            });
        }
        res.json({ updated: true, updatedOffer });
    } catch (error) {
        console.log(error.message);
        res.status(500);
    }
};

module.exports = {
    offerLoader,
    addOfferLoader,
    addOffer,
    removeOffer,
    reactivateOffer,
};
