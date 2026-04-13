const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateWorkspaceCode = () =>
  `TCH-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const createUniqueWorkspaceCode = async () => {
  let workspaceCode = generateWorkspaceCode();
  let existingTeacher = await User.findOne({ workspaceCode });

  while (existingTeacher) {
    workspaceCode = generateWorkspaceCode();
    existingTeacher = await User.findOne({ workspaceCode });
  }

  return workspaceCode;
};

const ensureTeacherWorkspaceCode = async (user) => {
  if (user.role !== "teacher" || user.workspaceCode) {
    return user;
  }

  user.workspaceCode = await createUniqueWorkspaceCode();
  await user.save();
  return user;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      organizationId: user.organizationId || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
};

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1️⃣ Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Normalize email
    const normalizedEmail = email.toLowerCase();

    // 3️⃣ Check if user already exists
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 4️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5️⃣ Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      workspaceCode: role === "teacher" ? await createUniqueWorkspaceCode() : undefined,
    });

    const token = generateToken(user);

    res.status(200).json({
      message: "Registration successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspaceCode: user.workspaceCode || null,
      },
    });

  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase();

    // 2️⃣ Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const userWithWorkspace = await ensureTeacherWorkspaceCode(user);
    const token = generateToken(userWithWorkspace);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: userWithWorkspace._id,
        name: userWithWorkspace.name,
        email: userWithWorkspace.email,
        role: userWithWorkspace.role,
        workspaceCode: userWithWorkspace.workspaceCode || null,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { register, login };

// const User = require("../models/User");

// const register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const exists = await User.findOne({ email });

//     if (exists) {
//       return res.status(400).json({ message: "User Already Exist" });
//     }
//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: user,
//     });

//     res.status(201).json({ message: "User Created Successfuly" });
//   } catch (error) {
//     console.log("Error:", error.message);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       res.status(400).json({ message: "User Not Found" });
//     }

//     res.status(200).json({ message: "Login Successfully" });
//   } catch (error) {
//     console.error("Error: ", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// module.exports = { register, login }
