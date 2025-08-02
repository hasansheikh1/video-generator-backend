const Video = require('../models/videoModel');
const VideoUtils = require('../utils/videoUtils');
const path = require('path');
const fs = require('fs').promises;

class VideoController {

  static async initializeUpload(req, res) {
    try {
      const { originalName, fileSize, totalChunks, mimeType } = req.body;
      const userId = req.user.id;

 
      if (fileSize > 2 * 1024 * 1024 * 1024) {
        return res.status(400).json({
          error: 'File size exceeds 2GB limit'
        });
      }

      const uploadId = VideoUtils.generateUploadId();
      const fileName = `${uploadId}_${originalName}`;

      const video = new Video({
        userId,
        originalName,
        fileName,
        fileSize,
        mimeType,
        totalChunks,
        uploadStatus: 'uploading',
        chunks: Array.from({ length: totalChunks }, (_, i) => ({
          chunkNumber: i,
          chunkPath: `uploads/chunks/${uploadId}/chunk_${i}`,
          uploaded: false
        }))
      });

      await video.save();

      res.status(201).json({
        success: true,
        uploadId: video._id,
        message: 'Upload initialized successfully'
      });
    } catch (error) {
      console.error('Initialize upload error:', error);
      res.status(500).json({
        error: 'Failed to initialize upload',
        details: error.message
      });
    }
  }

  static async uploadChunk(req, res) {
    try {
      const { uploadId, chunkNumber } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No chunk file provided' });
      }

      const video = await Video.findById(uploadId);
      if (!video) {
        return res.status(404).json({ error: 'Upload session not found' });
      }


      const chunkIndex = parseInt(chunkNumber);
      if (video.chunks[chunkIndex]) {
        video.chunks[chunkIndex].uploaded = true;
        video.chunks[chunkIndex].chunkPath = req.file.path;
      }


      const uploadedChunks = video.chunks.filter(chunk => chunk.uploaded).length;
      video.uploadProgress = Math.round((uploadedChunks / video.totalChunks) * 100);

      await video.save();

      res.json({
        success: true,
        progress: video.uploadProgress,
        message: `Chunk ${chunkNumber} uploaded successfully`
      });
    } catch (error) {
      console.error('Chunk upload error:', error);
      res.status(500).json({
        error: 'Failed to upload chunk',
        details: error.message
      });
    }
  }

  static async completeUpload(req, res) {
    try {
      const { uploadId } = req.params;
      
      const video = await Video.findById(uploadId);
      if (!video) {
        return res.status(404).json({ error: 'Upload session not found' });
      }

      // Verify all chunks are uploaded
      const allChunksUploaded = video.chunks.every(chunk => chunk.uploaded);
      if (!allChunksUploaded) {
        return res.status(400).json({
          error: 'Not all chunks have been uploaded',
          uploadedChunks: video.chunks.filter(chunk => chunk.uploaded).length,
          totalChunks: video.totalChunks
        });
      }

      // Merge chunks
      const chunkDir = `uploads/chunks/${uploadId}`;
      const outputPath = `uploads/videos/${video.fileName}`;
      
      await VideoUtils.mergeChunks(chunkDir, outputPath, video.totalChunks);

      // Get video metadata
      const metadata = await VideoUtils.getVideoMetadata(outputPath);
      
    
      video.uploadStatus = 'completed';
      video.uploadProgress = 100;
      video.localPath = outputPath;
      video.duration = metadata.duration;
      video.resolution = metadata.resolution;
      video.metadata = metadata;

      await video.save();


      await VideoUtils.cleanupChunks(chunkDir);



      res.json({
        success: true,
        videoId: video._id,
        message: 'Upload completed successfully',
        metadata
      });
    } catch (error) {
      console.error('Complete upload error:', error);
      
    
      await Video.findByIdAndUpdate(req.params.uploadId, {
        uploadStatus: 'failed'
      });

      res.status(500).json({
        error: 'Failed to complete upload',
        details: error.message
      });
    }
  }


  static async getUploadProgress(req, res) {
    try {
      const { uploadId } = req.params;
      
      const video = await Video.findById(uploadId).select('uploadProgress uploadStatus');
      if (!video) {
        return res.status(404).json({ error: 'Upload session not found' });
      }

      res.json({
        uploadId,
        progress: video.uploadProgress,
        status: video.uploadStatus
      });
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({
        error: 'Failed to get upload progress',
        details: error.message
      });
    }
  }

  static async getUserVideos(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const query = { userId };
      if (status) {
        query.uploadStatus = status;
      }

      const videos = await Video.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-chunks'); 

      const total = await Video.countDocuments(query);

      res.json({
        videos,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get user videos error:', error);
      res.status(500).json({
        error: 'Failed to retrieve videos',
        details: error.message
      });
    }
  }


  static async deleteVideo(req, res) {
    try {
      const { videoId } = req.params;
      const userId = req.user.id;

      const video = await Video.findOne({ _id: videoId, userId });
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      if (video.localPath) {
        try {
          await fs.unlink(video.localPath);
        } catch (error) {
          console.error('Error deleting local file:', error);
        }
      }

   
      await Video.findByIdAndDelete(videoId);

      res.json({
        success: true,
        message: 'Video deleted successfully'
      });
    } catch (error) {
      console.error('Delete video error:', error);
      res.status(500).json({
        error: 'Failed to delete video',
        details: error.message
      });
    }
  }
}

module.exports = VideoController;
