const Address = require('../model/address');

exports.get_allAddress = async (req, res) => {
    const address = await Address.find().populate('userId', `username email mobileNumber`).select('-__v -updatedAt')
    try {
        res.status(200).json({
            message: 'find address successfully',
            address: address
        });
    } catch (err) {
        res.status(500).json({ message: "Address Not found" });
    }
}
exports.find_AddressById = async (req, res) => {
    const address = await Address.find({ userId: req.params.id }).populate('userId',`username email mobileNumber`).select('-__v -createdAt -updatedAt')
    try {
        res.status(200).json(address[0]);
    } catch (err) {
        res.status(500).json({ message: "Address Not found" });
    }
}

exports.add_Address = async (req, res) => {
    const address = new Address(req.body);
    let user = await Address.findOne({
        "userId": address.userId
    });
    if (user) {
        const updatedAddress = await Address.updateOne({ userId: address.userId },
            {
                $set: {
                    streetAddress: req.body.streetAddress,
                    city: req.body.city,
                    zipcode: req.body.zipcode,
                    state: req.body.state,
                    country: req.body.country,
                }
            })
        return res.status(202).json({
            message: 'Address Updated successfully',
        });
    }
    try {
        const savedAddress = await address.save();
        res.status(201).json({
            message: 'Address Added successfully',
            // savedAddress: savedAddress
        });
    } catch (err) {
        res.status(500).json({ message: "Address Not found" });
    }
}