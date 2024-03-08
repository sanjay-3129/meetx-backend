const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const login = async (req, res) => {
  const { verificationId, phoneNumber } = req.body;
  console.log("verificationId: ", verificationId, phoneNumber);
  try {
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      user = new User({
        verificationId,
        phoneNumber,
      });
    }

    await user.save();

    const token = jwt.sign({ userId: user._id }, "your_secret_key", {
      expiresIn: "7d",
    });

    console.log("login: ", {
      status: "Success",
      token: token,
    });

    res.status(200).json({
      status: "Success",
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  login,
};
