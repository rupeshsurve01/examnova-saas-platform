const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect =  async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];
            //Extract Token
            // const token = authHeader.split(" ")[1];

            // Authorization header looks like:

            // Bearer abc123xyz

            // split(" ") creates:

            // ["Bearer", "abc123xyz"]

            // Then [1] picks:

            // abc123xyz

            // So token = abc123xyz.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
            // .select("-password")
            // means:
            // ❌ Don't include password
            // ✔ Only send safe data to the client

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }   

        req.user = user;
        next();

    } catch (error) {
        console.error("Auth Error:", error.message);
        return res.status(401).json({ message: "Unauthorized" });
    }
}

module.exports = protect;