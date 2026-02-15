const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
require('dotenv').config();

// Configure AWS S3 with v3 SDK
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.S3_BUCKET_NAME;

/**
 * Upload file to S3
 */
const uploadToS3 = async (fileBuffer, fileName, contentType) => {
  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType
      }
    });

    const result = await upload.done();
    return `https://${bucketName}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

/**
 * Download file from S3
 */
const downloadFromS3 = async (fileName) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName
    });

    const result = await s3Client.send(command);
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
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

module.exports = {
  s3Client,
  uploadToS3,
  downloadFromS3,
  deleteFromS3
};
