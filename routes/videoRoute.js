
const express = require('express');
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const VideoController = require("../controller/videoController");
const {uploadChunk} = require("../middlewares/upload");


const router = express.Router();

// Initialize chunked upload
router.post('/initialize',  VideoController.initializeUpload);

// Upload chunk
router.post('/upload-chunk', uploadChunk.single('chunk'), VideoController.uploadChunk);

// Complete upload
router.post('/complete/:uploadId', VideoController.completeUpload);

// Get upload progress
router.get('/progress/:uploadId', VideoController.getUploadProgress);

// Get user videos
router.get('/my-videos', VideoController.getUserVideos);

// Delete video
router.delete('/:videoId', VideoController.deleteVideo);

module.exports = router;