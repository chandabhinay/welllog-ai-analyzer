const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const bucketName = process.env.S3_BUCKET_NAME;

/**
 * Upload file to S3
 */
const uploadToS3 = async (fileBuffer, fileName, contentType) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

/**
 * Download file from S3
 */
const downloadFromS3 = async (fileName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName
  };

  try {
    const result = await s3.getObject(params).promise();
    return result.Body;
  } catch (error) {
    console.error('Error downloading from S3:', error);
    throw error;
  }
};

/**
 * Delete file from S3
 */
const deleteFromS3 = async (fileName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName
  };

  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

module.exports = {
  s3,
  uploadToS3,
  downloadFromS3,
  deleteFromS3
};
