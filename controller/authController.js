const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const admin = require("../model/adminSchema");
const vendor = require("../model/vendorSchema");
const bcrypt = require("bcryptjs");
const config = require("../config/config");
const axios = require("axios");
// const GoogleAuth = require("../model/googleAuthSchema");
// const FacebookAuth = require("../model/facebookAuth.js");
const Hotel = require("../model/hotelSchema");
const nodemailer = require("nodemailer");

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = require("../config/config");
// const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
// const { SOCIAIR_API_KEY } = ;

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
    const { username, email, password, phoneNumber } = req.body;
    console.log(req.body, "req.body");
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Check for existing user by email
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    console.log(existingUser, "existingUser");
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // If email is unique, proceed with user creation
    const hashedPassword = await bcrypt.hash(password, 10);

    let otp = generateOTP();
    let phoneOtp = generateOTP();

    const user = await User.create({
      username: username,
      password: hashedPassword,
      email,
      phoneNumber: phoneNumber,
      role: "user",
      otp: otp,
      phoneOtp: phoneOtp,
      authType: "local",
      phoneOtpVerify: false,
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

    const numericPhoneNumber = phoneNumber.replace(/\D/g, "");

    //check if country code is from nepal then send otp via sociair else send otp via twilio
    if (phoneNumber.startsWith("977")) {
      const sendOtpResult = await sendOtpViaSociair(
        numericPhoneNumber,
        phoneOtp
      );

      if (sendOtpResult.success) {
        res.status(201).json({
          token,
          message: "User created successfully",
          success: true,
        });
      } else {
        console.log(sendOtpResult.message);

        // Delete the user from the database if user creation fails
        await User.deleteOne({ _id: user._id });

        res.status(500).json({ message: sendOtpResult.message });
      }
    } else {
      console.log("twilio otp");
      client.messages
        .create({
          from: "whatsapp:+14155238886",
          body: `Your SuvaTrip Account OTP is ${phoneOtp}`,
          to: `whatsapp:${numericPhoneNumber}`,
        })
        .then((message) => {
          console.log(message, "message.sid");
          res.status(201).json({
            token,
            message: "User created successfully",
            success: true,
          });
        });

      // for via sms

      // client.messages
      //     .create({
      //         body: 'hi',
      //         from: '+12068662692',
      //         to: '+918171280446'
      //     })
      //     .then(message => console.log(message.sid))
    }
  } catch (error) {
    // Check if the error is due to duplicate key violation
    console.log(error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Delete the user from the database if user creation fails
    if (error.name === "ValidationError") {
      await User.deleteOne({ _id: user._id });
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
    console.log(req.body, "password reset user otp");

    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    const existingVendor = await User.findOne({ email });
    console.log(existingVendor, "existingVendor");

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

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      user: existingVendor,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const userPhoneOtp = async (req, res) => {
  try {
    let { phoneNumber, otp } = req.body;

    console.log(req.body, "password reset");
    if (!phoneNumber || !otp) {
      return res
        .status(400)
        .json({ message: "Please provide phone number and OTP" });
    }

    const numericPhoneNumber = phoneNumber.replace(/\D/g, "");

    const user = await User.findOne({ phoneNumber: numericPhoneNumber });
    console.log(user, "user phone otp");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otpVerify !== true) {
      return res
        .status(400)
        .json({ message: "Email OTP has not been verified" });
    }

    if (user.phoneOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.phoneOtpVerify = true;
    await user.save();
    const token = generateToken(user);
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      user: user,
      token: token,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// isUser exist
const isUserExist = async (req, res) => {
  try {
    const { email, facebook_ID, authType, username } = req.body;

    console.log(req.body, "req.body");
    if (authType === "facebook") {
      if (!facebook_ID || !username) {
        return res.status(400).json({ message: "Please enter all fields" });
      }
      const existingUser = await User.findOne({
        facebookId: facebook_ID,
      });

      console.log(existingUser, "existingUser");

      // Add a console log to check phoneOtpVerify value
      console.log(
        existingUser ? existingUser.phoneOtpVerify : null,
        "phoneOtpVerify"
      );

      // If user exists and phone OTP is verified, generate token and log in
      if (existingUser && existingUser.phoneOtpVerify) {
        const payLoad = {
          id: existingUser._id,
          name: existingUser.username,
          email: existingUser.email,
          facebookId: existingUser.facebookId,
        };
        const token = generateToken(existingUser, payLoad);
        return res.status(200).json({
          message: "User logged in Successfully",
          token,
          user: existingUser,
          success: true,
        });
      } else {
        return res
          .status(201)
          .json({ message: "User not found", success: false });
      }
    } else if (authType === "google") {
      if (!email) {
        return res.status(400).json({ message: "Please enter all fields" });
      }

      const existingUser = await User.findOne({
        $or: [{ email }],
      });

      if (existingUser && existingUser.phoneOtpVerify) {
        const payLoad = {
          id: existingUser._id,
          name: existingUser.username,
          email: existingUser.email,
          authType: "google",
        };
        const token = generateToken(existingUser, payLoad);

        return res.status(200).json({
          message: "User logged in Successfully",
          token,
          user: existingUser,
          success: true,
        });
      } else {
        return res
          .status(201)
          .json({ message: "User not found", success: false });
      }
    } else {
      return res.status(201).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error during login:", error);

    res.status(500).json({ message: "Something went wrong" });
  }
};

// SINGUP GOOGLE AUTH

const signupGoogle = async (req, res) => {
  try {
    const { username, email, password, phoneNumber } = req.body;

    if (!username || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Check for existing user by email
    const isUser = await User.findOne({ email });
    if (isUser && isUser.phoneOtpVerify) {
      const payLoad = {
        id: isUser._id,
        name: isUser?.username,
        email: isUser?.email,
        authType: "google",
      };

      const token = generateToken(isUser, payLoad);
      return res.status(200).json({
        message: "User logged in Successfully",
        token,
        user: isUser,
        isLogged: true,
      });
    } else {
      // If email is unique, proceed with user creation
      const hashedPassword = await bcrypt.hash(password, 10);

      let otp = generateOTP();
      let phoneOtp = generateOTP();

      const user = await User.create({
        username: username,
        password: hashedPassword,
        email,
        phoneNumber: phoneNumber,
        role: "user",
        otp: otp,
        phoneOtp: phoneOtp,
        authType: "google",
        phoneOtpVerify: false,
        otpVerify: true,
      });

      const payLoad = {
        id: user._id,
        name: user?.username,
        email: user?.email,
        authType: "google",
      };

      const token = generateToken(user, payLoad);

      const numericPhoneNumber = phoneNumber.replace(/\D/g, "");
      console.log(numericPhoneNumber, "numericPhoneNumber");
      console.log(phoneNumber, "phoneNumber");

      //check if country code is from nepal then send otp via sociair else send otp via twilio
      if (phoneNumber.startsWith("+977")) {
        console.log(phoneNumber, "suvaTrip");
        const sendOtpResult = await sendOtpViaSociair(
          numericPhoneNumber,
          phoneOtp
        );

        if (sendOtpResult.success) {
          res.status(201).json({
            token,
            message: "User created successfully",
            success: true,
            isLogged: false,
          });
        } else {
          console.log(sendOtpResult.message);

          res.status(500).json({ message: sendOtpResult.message });
        }
      } else {
        // console.log("twilio otp");
        client.messages
          .create({
            from: "whatsapp:+14155238886",
            body: `Your SuvaTrip Account OTP is ${phoneOtp}`,
            to: `whatsapp:${numericPhoneNumber}`,
          })
          .then((message) => {
            // console.log(message, "message.sid");
            res.status(201).json({
              token,
              message: "User created successfully",
              isLogged: false,
            });
          });
      }
    }
  } catch (error) {
    console.error("Error during Google signup:", error);

    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up the request:", error.message);
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};

// singup facebook auth

// const signUpFacebookAuth = async (req, res) => {
//   try {
//     console.log("trying signup with facebook");
//     const { userId, accessToken } = req.body;

//     if (!userId || userId == "" || !accessToken || accessToken == "") {
//       return res
//         .status(400)
//         .json({ message: "userId and accessToken are required" });
//     }

//     const { data } = await getUserByFacebookIdAndAccessToken(
//       accessToken,
//       userId
//     );

//     let user = await FacebookAuth.findOne({ facebookId: data.id });

//     if (user) {
//       const userData = { email: data.email, username: data.name, _id: data.id };
//       const payLoad = {
//         name: user?.username,
//         email: user?.email,
//         facebookId: user?.facebookId,
//         authType: "facebook",
//       };

//       const token = generateToken(userData, payLoad);
//       return res
//         .status(200)
//         .json({ message: "User already exists", token, user: userData });
//     } else {
//       user = await FacebookAuth.create({
//         username: data?.name,
//         email: data?.email,
//         facebookId: data.id,
//       });

//       const payLoad = {
//         name: user?.username,
//         email: user?.email,
//         facebookId: user?.facebookId,
//         authType: "facebook",
//       };

//       const token = generateToken(user, payLoad);
//       res.status(201).json({
//         message: "User Created Successfully",
//         token: token,
//         user: user,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// async function getUserByFacebookIdAndAccessToken(accessToken, userId) {
//   const urlGraphFacebook = `https://graph.facebook.com/v12.0/${userId}?fields=id,name,email&access_token=${accessToken}`;

//   const result = await axios.get(urlGraphFacebook);
//   console.log(result, "result");
//   return result;
// }

// singup facebook auth

const signUpFacebookAuth = async (req, res) => {
  try {
    const { username, email, password, phoneNumber, facebookId } = req.body;

    console.log(req.body, "req.body from facebook");
    if (!username || !email || !password || !facebookId || !phoneNumber) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Check for existing user by email and facebookId
    const existingUser = await User.findOne({
      facebookId: facebookId,
    });

    // If user exists and phone OTP is verified, generate token and log in
    if (existingUser && existingUser.phoneOtpVerify) {
      const payLoad = {
        id: existingUser._id,
        name: existingUser.username,
        email: existingUser.email,
        facebookId: existingUser.facebookId,
      };
      const token = generateToken(existingUser, payLoad);
      return res.status(200).json({
        message: "User logged in Successfully",
        token,
        user: existingUser,
        success: true,
      });
    } else {
      // Create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateOTP();
      const phoneOtp = generateOTP();

      const user = await User.create({
        username,
        password: hashedPassword,
        email,
        phoneNumber,
        role: "user",
        otp,
        phoneOtp,
        authType: "facebook",
        phoneOtpVerify: false,
        otpVerify: true,
        facebookId,
      });

      const payLoad = {
        id: user._id,
        name: user.username,
        email: user.email,
        facebookId: user.facebookId,
      };
      const token = generateToken(user, payLoad);

      // Send OTP via phone number
      const numericPhoneNumber = phoneNumber.replace(/\D/g, "");
      const sendOtpResult = await sendOtpViaSociair(
        numericPhoneNumber,
        phoneOtp
      );

      if (sendOtpResult.success) {
        res.status(201).json({
          token,
          message: "User created successfully",
          success: true,
        });
      } else {
        // Send OTP via Twilio
        client.messages
          .create({
            from: "whatsapp:+14155238886",
            body: `Your SuvaTrip Account OTP is ${phoneOtp}`,
            to: `whatsapp:${numericPhoneNumber}`,
          })
          .then((message) => {
            console.log(message.sid);
            res.status(201).json({
              token,
              message: "User created successfully",
              success: true,
            });
          })
          .catch((error) => {
            console.error("Error sending Twilio OTP:", error);
            res
              .status(500)
              .json({ success: false, message: "Error sending OTP" });
          });
      }
    }
  } catch (error) {
    // Check if the error is due to duplicate key violation
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    console.error("Error during Facebook signup:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

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
    console.log(req.body, "req.body");
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    const isVendor = await vendor.findOne({ email });

    if (isVendor && isVendor.otpVerify === true) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let otp = generateOTP();

    if (isVendor && isVendor.otpVerify === false) {
      const updatedVendor = await vendor.updateOne(
        { email },
        {
          username,
          password: hashedPassword,
          phoneNumber: phone,
          otp,
          otpVerify: false,
        }
      );

      let updatedData = { email: email, username: username, _id: isVendor._id };

      console.log(updatedData, "vvvvvv");

      const token = generateToken(updatedData);

      const mailOptions = {
        from: "suvatrip1@gmail.com",
        to: email,
        subject: "OTP for vendor registration",
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
        .json({ token, message: "Vendor created successfully", updatedVendor });
    }

    if (!isVendor) {
      const createvendor = await vendor.create({
        username: username,
        password: hashedPassword,
        phoneNumber: phone,
        email,
        role: "vendor",
        otp: otp,
        otpVerify: false,
      });

      const token = generateToken(createvendor);

      const mailOptions = {
        from: "suvatrip1@gmail.com",
        to: email,
        subject: "OTP for vendor registration",
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
    }
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const vendorOtp = async (req, res) => {
  try {
    console.log(req.body, "otp vender");
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
    const isUser = await admin.findOne({ email });

    if (isUser) {
      return res.status(400).json({ message: "Admin already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await admin.create({
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
    const { email, password, phoneNumber, role } = req.body;
    console.log(req.body, "req.body");
    if (!email && !phoneNumber || !password || !role ) {
        
      return res.status(400).json({ message: "Please enter valid credentials" });

    }
    

    if (role === "user") {
      let user;

      if (email) {
        user = await User.findOne({ email });
        console.log(user, "user");
      } else if (phoneNumber) {
        user = await User.findOne({ phoneNumber });
      }

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

      res.status(201).json({ token, user: user });
    } else if (role === "vendor") {
      const findvendor = await vendor.findOne({ email });

      if (!findvendor || !bcrypt.compareSync(password, findvendor.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const hotel = await Hotel.findOne({ vendor_id: findvendor._id });

      if (!hotel) {
        return res.status(400).json({ message: "User not registered" });
      }

      if (findvendor.otpVerify === false || hotel.isVerified === false) {
        return res.status(400).json({ message: "User not registered" });
      }

      const token = generateToken(findvendor);

      res.status(201).json({
        token,
        role: "vendor",
        id: findvendor._id,
        hotel_id: hotel._id,
      });
    } else if (role === "vendor-admin") {
      // console.log(req.body, "req.body");

      const findvendor = await vendor.findOne({ email });

      // { email: 'test@gmail.com', password: 'qwert', role: 'vendor-admin' } req.body

      console.log(findvendor, "findvendor");

      if (!findvendor || !bcrypt.compareSync(password, findvendor.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (findvendor.otpVerify === false) {
        return res.status(400).json({ message: "User not registered" });
      }
      // console.log(findvendor._id , "findvendor._id");

      const hotel = await Hotel.findOne({ vendor_id: findvendor._id });
      // console.log(hotel, "hotel");

      if (!hotel) {
        const token = generateToken(findvendor);
        // Send the token in the response
        console.log("hotel not registered");
        res.status(201).json({
          token,
          registration: false,
          message: "Hotel not registered",
        });
      } else {
        const token = generateToken(findvendor);
        res.status(201).json({
          registration: true,
          message: "Hotel already registered",
          token: token,
        });
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
        role: "admin",
      });
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({ message: "Something went wrong" });
  }
};

const loginviamobile = async (req, res) => {
  try {
    const { username, email, password, phoneNumber } = req.body;
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

    if (response.data.message === "Success! SMS has been sent") {
      return { success: true };
    } else {
      return { success: false, message: "Failed to send OTP" };
    }
  } catch (error) {
    console.error("Error sending OTP via Sociair SMS:", error);
    return { success: false, message: "Failed to send OTP" };
  }
};

const SignupViaPhone = async (req, res) => {
  try {
    const { username, email, password, phoneNumber } = req.body;

    if (!phoneNumber || !username || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Extract numeric part from the phone number
    const numericPhoneNumber = phoneNumber.replace(/\D/g, "");

    console.log(typeof numericPhoneNumber, numericPhoneNumber);

    const isUserExist = await User.findOne({ phoneNumber: numericPhoneNumber });
    if (isUserExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let otp = generateOTP();

    const sendOtpResult = await sendOtpViaSociair(numericPhoneNumber, otp);

    if (sendOtpResult.success) {
      const user = await User.create({
        username: username,
        password: hashedPassword,
        email,
        phoneNumber: numericPhoneNumber,
        otp: otp,
        otpVerify: false,
      });

      res.status(200).json({
        message: "OTP sent successfully",
        role: "user",
        success: true,
      });
    } else {
      res.status(500).json({ message: sendOtpResult.message });
    }
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Something went wrong" });
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
    id: user?._id,
    name: user?.username,
    email: user?.email,
  }
) => {
  console.log(payload, "tokenDATA");
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
      user: { name: user.username, email: user.email },
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
  vendorProfile,
  SignupViaPhone,
  userPhoneOtp,
  isUserExist,
};
