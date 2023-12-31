const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const admin = require("../model/adminSchema");
const vendor = require("../model/vendorSchema");
const bcrypt = require("bcryptjs");
const config = require("../config/config");
const axios = require("axios");
const GoogleAuth = require("../model/googleAuthSchema");
const FacebookAuth = require("../model/facebookAuth.js");
const Hotel = require("../model/hotelSchema");
const nodemailer = require("nodemailer");

// Create a SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: "587",
  auth: {
    user: "suvatrip1@gmail.com",
    pass: "aHSmbLgWfVqr54Uy",
  },
}); 

///SIGN UP USER
const signupUser = async (req, res) => {
  try {
    console.log("trying signup");
    const { username, email, password, phoneNumber } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Check for existing user by email
    const existingUser = await User.findOne({ email });

    console.log(existingUser, "userLoggedIN"); 

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // If email is unique, proceed with user creation
    const hashedPassword = await bcrypt.hash(password, 10);

    let otp = generateOTP();

    const user = await User.create({
      username: username,
      password: hashedPassword,
      email,
      phoneNumber: phoneNumber,
      role: "user",
      otp: otp,
      otpVerify: false,
    });

    const payLoad = {
      name: user?.username,
      email: user?.email,
      authType: "local",
    };

    const token = generateToken(user, payLoad);

    const mailOptions = {
      from: "suvatrip1@gmail.com",
      to: email,
      subject: "Registration Successful",
      text: `Hello,\n\nHere if you otp for user registration: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error occurred:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    res.cookie("token", token, { httpOnly: true });
    res
      .status(201)
      .json({ message: "User created successfully", token, success: true });
  } catch (error) {
    // Check if the error is due to duplicate key violation
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    console.error("Error creating user:", error);
    console.log(error);
    res.status(500).json({ success: true, message: "Something went wrong" });
  }
};

const userOtp = async (req, res) => {
  try {
    let { email, otp, isReset } = req.body;
    if (isReset == undefined) {
      isReset = false;
    }
    console.log(req.body, "password reset");

    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    const existingVendor = await User.findOne({ email });

    if (!existingVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (!isReset) {
      if (existingVendor.otpVerify) {
        return res
          .status(400)
          .json({ message: "OTP has already been verified" });
      }
    }

    if (existingVendor.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    existingVendor.otpVerify = true;
    await existingVendor.save();

    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
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
    const isUserExist = await GoogleAuth.findOne({ email });
    if (isUserExist) {
      const user = {
        _id: isUserExist._id,
        email: email,
        username: lastName ? `${firstName} ${lastName}` : firstName,
      };

      const payLoad = {
        name: user?.username,
        email: user?.email,
        authType: "google",
      };

      const token = generateToken(user, payLoad);
      return res
        .status(200)
        .json({ message: "User already exists", token: token });
    }

    const user = await GoogleAuth.create({
      username: lastName ? `${firstName} ${lastName}` : firstName,
      email,
    });

    const payLoad = {
      name: user?.username,
      email: user?.email,
      authType: "google",
    };

    const token = generateToken(user, payLoad);
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
      const userData = { email: data.email, username: data.name, _id: data.id };
      const payLoad = {
        name: user?.username,
        email: user?.email,
        facebookId: user?.facebookId,
        authType: "facebook",
      };

      const token = generateToken(userData, payLoad);
      return res.status(200).json({ message: "User already exists", token });
    } else {
      user = await FacebookAuth.create({
        username: data?.name,
        email: data?.email,
        facebookId: data.id,
      });

      const payLoad = {
        name: user?.username,
        email: user?.email,
        facebookId: user?.facebookId,
        authType: "facebook",
      };

      const token = generateToken(user, payLoad);
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
  const urlGraphFacebook = `https://graph.facebook.com/v12.0/${userId}?fields=id,name,email&access_token=${accessToken}`;

  const result = await axios.get(urlGraphFacebook);
  console.log(result, "result");
  return result;
}

const editVendor = async (req, res) => {
  try {
    console.log(req.body, "rrrrr");
    const { name, city, country, areaCode } = req.body;
    const vendorId = req.user.id;

    const existingVendor = await vendor.findById(vendorId);
    if (!existingVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (name) {
      existingVendor.name = name;
    }
    if (city) {
      existingVendor.city = city;
    }
    if (country) {
      existingVendor.country = country;
    }
    if (areaCode) {
      existingVendor.areaCode = areaCode;
    }

    await existingVendor.save();

    res.status(200).json({
      message: "Vendor updated successfully",
      updatedVendor: existingVendor,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

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

    let otp = generateOTP();

    const createvendor = await vendor.create({
      username: username,
      password: hashedPassword,
      phoneNumber: phone,
      email,
      role: "vendor",
      otp: otp,
      otpVerify: false,
    });

    const token = generateToken(vendor);

    const mailOptions = {
      from: "suvatrip1@gmail.com",
      to: email,
      subject: "Registration Successful",
      text: `Hello,\n\nHere if you otp for vendor registration: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error occurred:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res
      .status(201)
      .json({ token, message: "Vendor created successfully", createvendor });
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const vendorOtp = async (req, res) => {
  try {
    console.log(req.body , "otp vender");
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    const existingVendor = await vendor.findOne({ email });

    if (!existingVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (existingVendor.otpVerify) {
      return res.status(400).json({ message: "OTP has already been verified" });
    }

    if (existingVendor.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    existingVendor.otpVerify = true;
    await existingVendor.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
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
    console.log("Trying login user");
    const { email, password, role } = req.body;

    if (!role || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    if (role === "user") {
      const user = await User.findOne({ email });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.otpVerify === false) {
        return res.status(400).json({ message: "User not registered" });
      }

      const payLoad = {
        name: user?.username,
        email: user?.email,
        authType: "local",
      };

      const token = generateToken(user, payLoad);
      console.log("Token:", token);
      res.status(201).json({ token });


    } else if (role === "vendor") {
      const findvendor = await vendor.findOne({ email });

      if (!findvendor || !bcrypt.compareSync(password, findvendor.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (findvendor.otpVerify === false) {
        return res.status(400).json({ message: "User not registered" });
      } 

      const token = generateToken(findvendor);

;

      // Send the token in the response
      res.status(201).json({ token });
    } else if (role === "vendor-admin") {
      const findvendor = await vendor.findOne({ email });

      if (!findvendor || !bcrypt.compareSync(password, findvendor.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (findvendor.otpVerify === false) {
        return res.status(400).json({ message: "User not registered" });
      }
      console.log(findvendor._id , "findvendor._id");

      const hotel = await Hotel.findOne({ vendor_id: findvendor._id });
      console.log(hotel, "hotel");

      if (!hotel) {
        const token = generateToken(findvendor);
        // Send the token in the response
        console.log("hotel not registered");
        res.status(201).json({ token, registration: false  , message : "Hotel not registered"});
      } else {
          res.status(201).json({ registration: true , message : "Hotel already registered" , token : token });
      }
    } else if (role === "admin") {
      const findadmin = await admin.findOne({ email });

      if (!findadmin || !bcrypt.compareSync(password, findadmin.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(findadmin);

      // Send the token in the response
      res.status(201).json({
        message: "Admin logged in successfully",
        token,
        success: true,
      });
    } else {
      res.status(400).json({ message: "User not found" });
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

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

// jwt token generate
const generateToken = (
  user,
  payload = {
    name: user?.username,
    email: user?.email,
  }
) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: "1h" });
};

// Store the OTP in the database
const storeOTP = async (email, otp, expirationTime) => {
  try {
    // Update the user document with the new OTP information
    await User.updateOne(
      { email },
      {
        $set: {
          otp: otp,
          // "otp.expirationTime": expirationTime,
        },
      }
    );
  } catch (error) {
    console.error("Error storing OTP:", error);
    throw error; // Handle the error as per your application's needs
  }
};

// forgot password

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email, "email");
    if (!email) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // generate OTP]
    const otp = generateOTP();
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store the OTP in the database
    await storeOTP(email, otp, expirationTime);

    // send otp via email

    const mailOptions = {
      from: "suvatrip1@gmail.com",
      to: email,
      subject: "Forgot Password OTP",
      text: `Hello,\n\nHere if you otp for forgot password: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error occurred:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;
    console.log(req.body);

    if (!email || !newPassword || !otp) {
      return res
        .status(400)
        .json({ message: "Please provide email and new password" });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!existingUser.otpVerify) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const token = generateToken(existingUser);

    // Update the password and clear OTP-related fields
    existingUser.password = hashedPassword;

    // existingUser.otp = null;
    // existingUser.isOtpExpired = null;

    await existingUser.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      token: token,
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// profile data
const profile = async (req, res) => {
  try {
    const { authType } = req.user;

    if (!authType) {
      return res.status(400).json({ message: "Please provide authType" });
    }

    if (authType === "local") {
      const { email } = req.user;
      const user = await User.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      res.status(200).json({
        message: "User found successfully",
        user: user,
        authType: "local",
        success: true,
      });
    } else if (authType === "google") {
      const { email } = req.user;

      const user = await GoogleAuth.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      res.status(200).json({
        message: "User found successfully",
        user: user,
        authType: "google",
        success: true,
      });
    } else if (authType === "facebook") {
      const { facebookId } = req.user;
      const user = await FacebookAuth.findOne({ facebookId });
      console.log(user, "user");
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      res.status(200).json({
        message: "User found successfully",
        user: user,
        authType: "facebook",
        success: true,
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const vendorProfile = async (req, res) => {
  try {
   
      const { email } = req.user;
      const user = await vendor.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      });

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      res.status(200).json({
        message: "User found successfully",
        user: {name : user.username , email : user.email},
        success: true,
      });
     
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// update password

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const { email } = req.user;
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Please provide userId, currentPassword, and newPassword",
      });
    }
    console.log(req.user, "req.user");
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    console.log(existingUser, "existingUser");

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current password matches the one stored in the database
    const isCurrentPasswordValid = await existingUser.comparePassword(
      currentPassword
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
      
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update the password
    existingUser.password = hashedPassword;

    await existingUser.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  updatePassword,
};

module.exports = {
  signupUser,
  signupAdmin,
  signupVendor,
  loginUser,
  loginviamobile,
  signupGoogle,
  signUpFacebookAuth,
  vendorOtp,
  userOtp,
  editVendor,
  forgotPassword,
  changePassword,
  profile,
  updatePassword,
  vendorProfile
};
