const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const admin = require("../model/adminSchema");
const vendor = require("../model/vendorSchema");
const bcrypt = require("bcryptjs");
const config = require("../config/config");
///SIGN UP USER
const signupUser = async (req, res) => {
  try {
    console.log("trying to signup user" , req.body);
    const { username , email, password , phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    const isUser = await User.findOne({ email });

    if (isUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username,
      password: hashedPassword,
      email,
      phoneNumber : phone,
      role: "user",
    });

    const token = generateToken(user);

    res.cookie("token", token, { httpOnly: true });

    res.status(201).json({ message: "User created successfully" , token});
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
// SIGN UP VENDOR
const signupVendor = async (req, res) => {
  try {
    console.log("trying to signup vendor")  
     const { name, email, password } = req.body;
        
     if (!name || !email || !password) {
       return res.status(400).json({ message: "Please enter all fields" });
     }
     const isVendor = await vendor.findOne({ email });

     if (isVendor) {
       return res.status(400).json({ message: "Vendor already exists" });
     }
     const hashedPassword = await bcrypt.hash(password, 10);
        console.log("trying to signup vendor" , hashedPassword)
     const createvendor = await vendor.create({
      username: name,
      password: hashedPassword,
      email,
      role:"vendor"
    });


    const token = generateToken(vendor);
    // Send the token in the response
    res.status(201).json({ token , message: "Vendor created successfully" , createvendor});
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
    res.status(201).json({ message: "Superadmin created successfully"});
  } catch (error) {}
};
//LOGIN IN USER
const loginUser = async (req, res) => {
  try {
    console.log("trying loggin")
    const { email, password ,role} = req.body;
    if (!role || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    if(role==='user'){
      const user = await User.findOne({ email });
    
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const token = generateToken(user);
  
      // Send the token in the response
      res.status(201).json({ token});
    }
    else if(role==='vendor'){
      const findvendor = await vendor.findOne({ email });
    
      if (!findvendor || !bcrypt.compareSync(password, findvendor.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const token = generateToken(findvendor);
  
      // Send the token in the response
      res.status(201).json({token});

    }
    else if(role==="admin"){
      const findadmin = await admin.findOne({ email });
    
      if (!findadmin || !bcrypt.compareSync(password, findadmin.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const token = generateToken(findadmin);
  
      // Send the token in the response
      res.status(201).json({token});

    }


    
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const loginviamobile=async (req,res)=>{
  try {
    const number =req.body.contactno
    const otp = generateOTP();
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);
    await storeOTP(number, otp, expirationTime);


    // Send OTP via Sociair SMS
    const sociairResponse = await sendOtpViaSociair(number, otp);
 res.status(201).json({ message: 'OTP sent successfully', sociairResponse });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}




const sendOtpViaSociair = async (number, otp) => {
  try {
      
      const user = await User.findOne({ number });

      if (!user) {
          throw new Error('User not found');
      }

      const url = 'https://sms.sociair.com/api/sms';
      const headers = {
          Authorization: `Bearer ${config.SOCIAIR_API_KEY}`, 
          'Content-Type': 'application/json',
          Accept: 'application/json',
      };

      
 
      const payload = {
          message: `Your OTP is: ${otp}`,
          mobile: number, 
      };

      const response = await axios.post(url, payload, { headers });
      console.log('Sociair API Response:', response.data);

      return response.data;
  } catch (error) {
      console.error('Error sending OTP via Sociair SMS:', error);
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
                  'otp.code': otp,
                  'otp.expirationTime': expirationTime,
              },
          }
      );
  } catch (error) {
      console.error('Error storing OTP:', error);
      throw error; // Handle the error as per your application's needs
  }
};
const generateOTP = () => {
  // Generate a random six-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};




module.exports = { signupUser, signupAdmin, signupVendor, loginUser,loginviamobile };