const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const admin = require("../model/adminSchema");
const vendor = require("../model/vendorSchema");
const bcrypt = require("bcryptjs");
const config = require("../config/config");
///SIGN UP USER
const signupUser = async (req, res) => {
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
      role: "user",
    });

    const token = generateToken(user);

    res.cookie("token", token, { httpOnly: true });

    res.status(201).json({ message: "User created successfully"});
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
// SIGN UP VENDOR
const signupVendor = async (req, res) => {
  try {
     const { name, email, password } = req.body;

     if (!name || !email || !password) {
       return res.status(400).json({ message: "Please enter all fields" });
     }
     const isVendor = await vendor.findOne({ email });

     if (isVendor) {
       return res.status(400).json({ message: "Vendor already exists" });
     }
     const hashedPassword = await bcrypt.hash(password, 10);

     const createvendor = await vendor.create({
      username: name,
      password: hashedPassword,
      email,
      role:"vendor"
    });

    const token = generateToken(vendor);
    // Send the token in the response
    res.status(201).json({ token});
  } catch (error) {
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

// genrate jwt token

const generateToken = (user) => {
  const payLoad = {
    id: user._id,
    name: user.name,
    email: user.email,
  };
  return jwt.sign(payLoad, config.JWT_SECRET, { expiresIn: "1h" });
};

module.exports = { signupUser, signupAdmin, signupVendor, loginUser };
