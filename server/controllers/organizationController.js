const Organization = require("../models/Organization");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const createOrganization = async (req,res) => {

 try {

   const { name, domain, adminName, adminEmail, password } = req.body;

   if(!name || !domain || !adminName || !adminEmail || !password){
     return res.status(400).json({message:"All fields required"});
   }

   const existingOrg = await Organization.findOne({ domain });

   if(existingOrg){
     return res.status(400).json({message:"Domain already exists"});
   }

   const org = await Organization.create({
     name,
     domain
   });

   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);

   const admin = await User.create({
     name: adminName,
     email: adminEmail,
     password: hashedPassword,
     role: "org_admin",
     organizationId: org._id
   });

   org.owner = admin._id;
   await org.save();

   res.status(201).json({
     message: "Organization created",
     organization: org,
     admin
   });

 } catch(error){
   console.error(error);
   res.status(500).json({message:"Server Error"});
 }

};

module.exports = { createOrganization };