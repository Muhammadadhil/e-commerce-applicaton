const Address = require("../model/addressModel");

//add address
const addAddress = async (req, res) => {
    try {
        const { name, address, landmark, state, city, pincode, phone, email } = req.body;
        const userId = req.session.userId;
        const newAddress = await Address.findOneAndUpdate(
            { userId: userId },
            {
                $set: { userId: userId },
                $push: {
                    address: {
                        name: name,
                        landmark: landmark,
                        city: city,
                        phone: phone,
                        address: address,
                        state: state,
                        pincode: pincode,
                        email: email,
                    },
                },
            },
            { upsert: true, new: true }
        );

        if (newAddress) {
            res.json({ added: true });
        } else {
            console.log("!!!!error in address saving!!!");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

// get address for edit page
const getAddress = async (req, res) => {
    try {
        const { addressId } = req.body;
        const userId = req.session.userId;
        const userAddresses = await Address.findOne({ userId: userId });
        const currentAddress = userAddresses.address.find((value) => value._id == addressId);

        if (currentAddress) {
            res.status(200).json({ currentAddress });
        } else {
            res.status(500).json({ address: false });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//edit address post:
const editAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { name, address, landmark, state, city, pincode, phone, email, addressId } = req.body;
        const editedAddress = await Address.findOneAndUpdate(
            {
                userId: userId,
                "address._id": addressId,
            },
            {
                $set: {
                    "address.$.name": name,
                    "address.$.landmark": landmark,
                    "address.$city": city,
                    "address.$.phone": phone,
                    "address.$.address": address,
                    "address.$.state": state,
                    "address.$.pincode": pincode,
                    "address.$.email": email,
                },
            },
            { new: true }
        );

        console.log("editedAddress:", editedAddress);

        if (editedAddress) {
            res.status(200).json({ edited: true });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//remove address
const removeAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { addressId } = req.params;

        const deletedAddress = await Address.findOneAndUpdate({ userId: userId, "address._id": addressId }, { $pull: { address: { _id: addressId } } }, { new: true });

        if (deletedAddress) {
            res.status(200).json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

module.exports = {
    addAddress,
    editAddress,
    getAddress,
    removeAddress,
};
