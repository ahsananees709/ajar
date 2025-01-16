import multer from "multer"
import path from "path"
import fs from "fs"


const uploadProfilePictureMiddleware = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const dir = "public/profilePicture";
        
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        // Generate unique filename using fieldname + timestamp + file extension
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
      },
    }),
}).single("profile_picture");
  
// Middleware for uploading vehicle pictures
const uploadVehiclePicturesMiddleware = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'public/vehiclePictures'; 

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    },
    filename: (req, file, cb) => {

      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // Optional: Set a file size limit (5MB in this case)
  },
}).array('pictures[]', 10);
 

export { uploadProfilePictureMiddleware, uploadVehiclePicturesMiddleware }

