
const fs =require("fs").promises;
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");


const createUploadDirs = async()=>{
    const dirs =["upload/temps","upload/videos","upload/chunks"];

for (const dir of dirs){

    try{

        await fs.mkdir(dir, { recursive: true })
    }   
    catch (error) {
        console.error(`Error creating directory ${dir}:`, error);
    }

}

}

createUploadDirs();

const chunkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadId = req.body.uploadId;
    const chunkDir = `uploads/chunks/${uploadId}`;
    
    fs.mkdir(chunkDir, { recursive: true })
      .then(() => cb(null, chunkDir))
      .catch(err => cb(err));
  },
  filename: (req, file, cb) => {
    const chunkNumber = req.body.chunkNumber;
    cb(null, `chunk_${chunkNumber}`);
  }
});

const uploadChunk = multer({
  storage: chunkStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per chunk
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

module.exports = { uploadChunk };

