const Cart = require("../model/cartModel");
const Products = require("../model/productsModel");

//load cart page
const loadCartPage = async (req, res) => {
    try {
        const user = req.session.userId;
        const populateOption = {
            path: "product.productId",
            model: "products",
        };
        let cartDetails = await Cart.findOne({ userId: user });
        const itemsCount = cartDetails?.product?.length;

        if (!cartDetails) {
            return res.render("cart", { user, itemsCount, cartDetails });
        }

        cartDetails = await Cart.findOne({ userId: user }).populate(populateOption);
        const subTotal = cartDetails.product.reduce((total, current) => {
            return total + current.productId.price * current.quantity;
        }, 0);
        res.render("cart", { user, itemsCount, cartDetails, subTotal });
    } catch (error) {
        console.log("error:", error.message);
        res.status(500).render("Error-500");
    }
};

//addtocart post
const addProductsToCart = async (req, res) => {
    try {
        const { productId, count } = req.body;
        const userId = req.session.userId;

        const populateOption = {
            path: "product.productId",
            model: "products",
        };
        const existingProduct = await Cart.findOne(
            {
                userId: userId,
                "product.productId": productId,
            },
            {
                "product.$": 1,
            }
        ).populate(populateOption);

        //find the total product stock
        const totalProductStock = await Products.findOne({ _id: productId }, { quantity: 1 });
        if (totalProductStock.quantity == 0) {
            return res.json({ addedToCart: "not done" });
        }

        if (existingProduct) {
            //find the quantity of existing product in the cart
            const currentQty = existingProduct.product.find((product) => product).quantity;
            if (count == -1 && count + currentQty < 1) {
                return res.json({ added: false });
            }

            if (count == 1 && count + currentQty > totalProductStock.quantity) {
                return res.json({ added: false, message: "failed to add item: cannot increase" });
            }

            //finding the product price
            const priceOfProduct = existingProduct.product[0].productId.price;

            // increment the product quantity and total price
            const incrementedProduct = await Cart.findOneAndUpdate(
                { userId: userId, "product.productId": productId },
                {
                    $inc: {
                        "product.$.quantity": count,
                        "product.$.totalPrice": count * priceOfProduct,
                    },
                },
                { new: true }
            );

            res.json({ added: true });
        } else {
            const productDetails = await Products.findOne({ _id: productId });

            await Cart.findOneAndUpdate(
                { userId: userId },
                {
                    $set: { userId: userId },
                    $push: {
                        product: {
                            productId: productDetails._id,
                            quantity: 1,
                        },
                    },
                },
                { upsert: true }
            );
            res.json({ addedNew: true });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};
// remove product from the cart
const removeProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = req.session.userId;

        await Cart.findOneAndUpdate({ userId: user }, { $pull: { product: { productId: productId } } });

        res.json({ removed: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};
module.exports = {
    loadCartPage,
    addProductsToCart,
    removeProduct,
};
