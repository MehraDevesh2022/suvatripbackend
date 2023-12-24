const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const admin = require("../model/adminSchema");
const vendor = require("../model/vendorSchema");
const bcrypt = require("bcryptjs");
const config = require("../config/config");
const axios = require("axios");
const GoogleAuth = require("../model/googleAuthSchema");
const FacebookAuth = require("../model/facebookAuth.js");
///SIGN UP USER
const signupUser = async (req, res) => {
  try {
    console.log("trying signup");
    const { userName, email, password, phone } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Check for existing user by email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // If email is unique, proceed with user creation
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: userName,
      password: hashedPassword,
      email,
      phoneNumber: phone,
      role: "user",
    });

    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true });
    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    // Check if the error is due to duplicate key violation
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    console.error("Error creating user:", error);
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// SINGUP GOOGLE AUTH

const signupGoogle = async (req, res) => {
  try {
    const accessToken = req.body.googleAccessToken;
    console.log("accessToken", accessToken);
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Extract relevant information from the response with default values as empty strings
    const firstName = response.data.given_name || "";
    const lastName = response.data.family_name || "";
    const email = response.data.email || "";

    console.log(firstName, lastName, email);

    const isUserExist = await GoogleAuth.findOne({ email });

    if (isUserExist) {
      const user = {
        _id: isUserExist._id,
        email: email,
        username: lastName ? `${firstName} ${lastName}` : firstName,
      };
      console.log(user);
      const token = generateToken(user);
      return res
        .status(200)
        .json({ message: "User already exists", token: token });
    }

    const user = await GoogleAuth.create({
      username: lastName ? `${firstName} ${lastName}` : firstName,
      email,
    });

    const token = generateToken(user);
    res
      .status(201)
      .json({ message: "User Created Successfully", token: token });
  } catch (error) {
    console.error("Error during Google signup:", error);

    if (error.response) {
      // The request was made and the server responded with a status code
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up the request:", error.message);
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};

// singup facebook auth
const signUpFacebookAuth = async (req, res) => {
  try {
    console.log("trying signup with facebook");
    const { userId, accessToken } = req.body;

    if (!userId || userId == "" || !accessToken || accessToken == "") {
      return res
        .status(400)
        .json({ message: "userId and accessToken are required" });
    }

    const { data } = await getUserByFacebookIdAndAccessToken(
      accessToken,
      userId
    );

    let user = await FacebookAuth.findOne({ facebookId: data.id });

    if (user) {
      console.log("user", user);
      const userData = { email: data.email, username: data.name, _id: data.id };
      const token = generateToken(userData);
      return res.status(200).json({ message: "User already exists", token });
    } else {
      user = await FacebookAuth.create({
        username: data.name,
        email: data.email,
        facebookId: data.id,
      });

      const token = generateToken(user);
      res
        .status(201)
        .json({ message: "User Created Successfully", token: token });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

async function getUserByFacebookIdAndAccessToken(accessToken, userId) {
  const urlGraphFacebook = `https://graph.facebook.com/v2.11/${userId}?fields=id,name,email&access_token=${accessToken}`;
  const result = await axios.get(urlGraphFacebook);
  return result;
}

// SIGN UP VENDOR
const signupVendor = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    console.log("req.body", req.body);
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    const isVendor = await vendor.findOne({ email });

    if (isVendor) {
      return res.status(400).json({ message: "Vendor already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const createvendor = await vendor.create({
      username: username,
      password: hashedPassword,
      phoneNumber: phone,
      email,
      role: "vendor",
    });

    const token = generateToken(vendor);

    res
      .status(201)
      .json({ token, message: "Vendor created successfully", createvendor });
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//SIGN UP ADMIN
const signupAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    const isUser = await User.findOne({ email });

    if (isUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: name,
      password: hashedPassword,
      email,
      role: "admin",
    });

    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true });
    res.status(201).json({ message: "Superadmin created successfully" });
  } catch (error) {}
};

//LOGIN IN USER
const loginUser = async (req, res) => {
  try {
    console.log("trying loggin");
    const { email, password, role } = req.body;
    console.log("role", role, email, password);
    if (!role || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    if (role === "user") {
      const user = await User.findOne({ email });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user);

      // Send the token in the response
      res.status(201).json({ token });
    } else if (role === "vendor") {
      const findvendor = await vendor.findOne({ email });

      if (!findvendor || !bcrypt.compareSync(password, findvendor.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(findvendor);

      // Send the token in the response
      res.status(201).json({ token });
    } else if (role === "admin") {
      const findadmin = await admin.findOne({ email });

      if (!findadmin || !bcrypt.compareSync(password, findadmin.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(findadmin);

      // Send the token in the response
      res.status(201).json({ token });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const loginviamobile = async (req, res) => {
  try {
    const number = req.body.contactno;
    const otp = generateOTP();
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);
    await storeOTP(number, otp, expirationTime);

    // Send OTP via Sociair SMS
    const sociairResponse = await sendOtpViaSociair(number, otp);
    res.status(201).json({ message: "OTP sent successfully", sociairResponse });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const sendOtpViaSociair = async (number, otp) => {
  try {
    const user = await User.findOne({ number });

    if (!user) {
      throw new Error("User not found");
    }

    const url = "https://sms.sociair.com/api/sms";
    const headers = {
      Authorization: `Bearer ${config.SOCIAIR_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const payload = {
      message: `Your OTP is: ${otp}`,
      mobile: number,
    };

    const response = await axios.post(url, payload, { headers });
    console.log("Sociair API Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error sending OTP via Sociair SMS:", error);
    throw error;
  }
};

// const verifyOTP = async (email, userEnteredOTP) => {
//   try {
//       const user = await User.findOne({ email });
//        if (!user) {
//           throw new Error('User not found');
//          }
//     if (user.otp.code === userEnteredOTP && user.otp.expirationTime > new Date()) {
//        return true;
//       } else {
//           return false;
//       }
//   } catch (error) {
//       console.error('Error verifying OTP:', error);
//       throw error;
//   }
// };

// genrate jwt token

const generateToken = (user) => {
  const payLoad = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payLoad, config.JWT_SECRET, { expiresIn: "1h" });
};

const storeOTP = async (email, otp, expirationTime) => {
  try {
    // Update the user document with the new OTP information
    await User.updateOne(
      { email },
      {
        $set: {
          "otp.code": otp,
          "otp.expirationTime": expirationTime,
        },
      }
    );
  } catch (error) {
    console.error("Error storing OTP:", error);
    throw error; // Handle the error as per your application's needs
  }
};
const generateOTP = () => {
  // Generate a random six-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

module.exports = {
  signupUser,
  signupAdmin,
  signupVendor,
  loginUser,
  loginviamobile,
  signupGoogle,
  signUpFacebookAuth,
};
