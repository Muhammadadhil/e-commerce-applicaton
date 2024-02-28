const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb)=>{

    isProduct = Object.keys(req.body).includes("productName");
    let destinationFolder;

    if (!isProduct) {
      destinationFolder = "./public/multer/users";
    } else {
        console.log('reached products page!!');
      destinationFolder = "./public/multer/products";
    }

    cb(null,destinationFolder);
  },

  filename: (req, file, cb)=> {
    console.log("date.now:",Date.now());
    cb(null, Date.now() + "-" + file.originalname);
    console.log("hey this from here:",req.files);
  },
});

const upload=multer({storage:storage});
module.exports=upload;