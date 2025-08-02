const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required:true
    },

    originalName:{
         type: String,
    required: true
    }
    ,

 fileName: String,
  fileSize: Number,
  mimeType: String,
  duration: Number,
  resolution: {
    width: Number,
    height: Number
  },
  uploadStatus: {
    type: String,
    enum: ['uploading', 'completed', 'failed', 'processing'],
    default: 'uploading'
  },
  uploadProgress: {
    type: Number,
    default: 0
  },
  uploadType: {
    type: String,
    enum: ['simple', 'chunked'],
    default: 'simple'
  },
  cloudUrl: String,
  localPath: String,
  // For chunked uploads
  chunks: [{
    chunkNumber: Number,
    chunkPath: String,
    uploaded: { type: Boolean, default: false }
  }],
  totalChunks: Number,
  processingStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});
