import multer from "multer";

const storage = multer.memoryStorage(); 

export const upload = multer({
    storage,
    limits : {fileSize : 5 * 1024 * 1024}, // fieldSize ki jagah fileSize better hai
    fileFilter : (req, file, cb) => { // 'res' ko hatakar 'file' kar diya
        const allowed = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
        
        if(!allowed.includes(file.mimetype)){
            return cb(new Error("invalid file type")); // 'cd' ko 'cb' kar diya
        }
        cb(null, true); // 'cd' ko 'cb' kar diya
    }
});