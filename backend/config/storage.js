const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

let gfs;
let gridfsBucket;

// Initialize GridFS
const initGridFS = () => {
  const conn = mongoose.connection;
  
  if (conn.readyState === 1) {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'uploads'
    });
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
    console.log('GridFS initialized successfully');
  }
};

/**
 * Upload file to GridFS
 */
const uploadToGridFS = async (fileBuffer, fileName, contentType) => {
  return new Promise((resolve, reject) => {
    if (!gridfsBucket) {
      initGridFS();
    }

    const uploadStream = gridfsBucket.openUploadStream(fileName, {
      contentType: contentType || 'text/plain',
      metadata: {
        uploadDate: new Date()
      }
    });

    uploadStream.on('error', (error) => {
      reject(error);
    });

    uploadStream.on('finish', (file) => {
      resolve(file._id);
    });

    uploadStream.end(fileBuffer);
  });
};

/**
 * Download file from GridFS
 */
const downloadFromGridFS = async (fileId) => {
  return new Promise((resolve, reject) => {
    if (!gridfsBucket) {
      initGridFS();
    }

    const chunks = [];
    const downloadStream = gridfsBucket.openDownloadStream(fileId);

    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    downloadStream.on('error', (error) => {
      reject(error);
    });

    downloadStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
};

/**
 * Delete file from GridFS
 */
const deleteFromGridFS = async (fileId) => {
  try {
    if (!gridfsBucket) {
      initGridFS();
    }
    await gridfsBucket.delete(fileId);
    return true;
  } catch (error) {
    console.error('Error deleting from GridFS:', error);
    throw error;
  }
};

/**
 * Get file info from GridFS
 */
const getFileInfo = async (fileId) => {
  try {
    if (!gfs) {
      initGridFS();
    }
    const files = await gfs.files.findOne({ _id: fileId });
    return files;
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
};

module.exports = {
  initGridFS,
  uploadToGridFS,
  downloadFromGridFS,
  deleteFromGridFS,
  getFileInfo
};
