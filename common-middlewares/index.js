const jwt = require("jsonwebtoken");
const multer = require("multer");
// const Post =require('../models/post')
let {connection}=require('mongoose')
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "posts",
  allowedFormats: ["jpg", "png"],
  transformation: [{ width: 500, height: 500, crop: "limit" }],
});

/**
 * 
 * @description this is for single image upload 
 */
const parser = multer({ storage: storage }).single("file");
exports.parser = parser;

/**
 * 
 * @description this is for image upload 
 */
 const parserMany = multer({ storage: storage }).array("image");
 exports.parserMany = parserMany;

exports.requireSignin = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, process.env.APP_SECRET);
    req.user = user;
  } else {
    return res.status(400).json({ message: "Authorization required" });
  }
  next();
  //jwt.decode()
};
/**
 * 
 * @description this middleware ensure only user role can access it 
 */
exports.userMiddleware = (req, res, next) => {
  if (req.user.data.role !== "user") {
    return res.status(400).json({ message: "User access denied" });
  }
  next();
};


/**
 * 
 * @description this middleware ensure only admin role can access it 
 */
exports.adminMiddleware = (req, res, next) => {
  if (req.user.data.role !== "admin") {
    if (req.user.data.role !== "super-admin") {
      return res.status(400).json({ message: "Admin access denied" });
    }
  }
  next();
};


/**
 * 
 * @description this middleware ensure only super admin role
 *  can access it 
 */
exports.superAdminMiddleware = (req, res, next) => {
  if (req.user.data.role !== "super-admin") {
    return res.status(200).json({ message: "Super Admin access denied" });
  }
  next();
};

// function paginatedResults(model,name) {
//   return async (req,res,next) =>{

//       let page =parseInt(req.query.page)
//       let limit =parseInt(req.query.limit)
  
//       const startIndex = (page - 1) * limit
//       const endIndex = page * limit
  
//       let results ={}
//     let counts=0
//     console.log('endIndex',endIndex)
//     getNumOfDocs(name,function(err, count) {
//       if (err) {
//           return console.log(err.message);
//       }
//       counts= count
//       return
//    });
//       if (endIndex < counts) {
//           results.next={
//               page:page+1,
//               limit:limit
//           }
//       }
      
//       if (startIndex > 0) {   
//           results.previous={
//               page:page - 1,
//               limit:limit
//           }
//       }
      
  
//       try{
//           results.results= await model.find().select('author title description image date category').sort({ date: "descending" }).limit(limit).skip(startIndex)
//           res.paginatedResults=results
//           next()
//       }
//       catch(e){
//           res.status(500).json({message:e.message})
//       }
//   }
// }

// function getNumOfDocs (collectionName,callback) {
//   let db=connection
//   db.collection(collectionName).countDocuments({}, function(error, numOfDocs){
//       if(error) return callback(error);

//       callback(null, numOfDocs);
//   });
// } 

// exports.paginatedResults=paginatedResults