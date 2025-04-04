const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

class MediaService {

    uploadFiles = async (req) => {

        const form = new formidable.IncomingForm();

        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {

                if (err) {
                    return reject(new Error('Error parsing the form: ' + err.message));
                }

                const file = files.file[0]; // `files.file` matches the name of the form field in your client

                if (!file) {
                    return reject(new Error('No file uploaded'));
                }

                try {
                    // Upload file to Cloudinary with standardized options
                    const result = await cloudinary.uploader.upload(file.filepath, {
                        resource_type: 'raw',
                        folder: 'uploads',
                        use_filename: true,
                        unique_filename: true,
                        type: 'private',
                        flags: 'attachment'
                    });

                    // Remove the local file
                    fs.unlinkSync(file.filepath);

                    // Save media metadata to the database
                    resolve(result.secure_url);

                } catch (err) {
                    reject(new Error('Error uploading to Cloudinary: ' + err.message));
                }
            });
        });
    }

    uploadDocument = async (req) => {
        const form = new formidable.IncomingForm();

        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    return reject(new Error('Error parsing the form: ' + err.message));
                }

                const file = files.document[0]; // 'document' là tên field từ form

                if (!file) {
                    return reject(new Error('No document uploaded'));
                }

                // Kiểm tra định dạng file
                const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                if (!allowedTypes.includes(file.mimetype)) {
                    return reject(new Error('Invalid file type. Only PDF and Word documents are allowed'));
                }

                try {
                    const uploadOptions = {
                        resource_type: 'raw',
                        folder: 'documents',
                        use_filename: true,
                        unique_filename: true,
                        type: 'private',
                        flags: 'attachment'
                    };

                    const result = await cloudinary.uploader.upload(file.filepath, uploadOptions);

                    // Không cần thêm fl_attachment vì đã có flags: 'attachment'
                    const downloadUrl = result.secure_url;

                    // Xóa file tạm
                    fs.unlinkSync(file.filepath);

                    resolve({
                        url: downloadUrl,
                        public_id: result.public_id,
                        format: result.format,
                        size: result.bytes,
                        original_filename: file.originalFilename
                    });

                } catch (err) {
                    console.error('Upload error:', err);
                    reject(new Error('Error uploading document: ' + err.message));
                }
            });
        });
    }

    uploadVideo = async (req) => {
        const form = new formidable.IncomingForm();
        // Tăng giới hạn kích thước file
        form.maxFileSize = 100 * 1024 * 1024; // 100MB

        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    console.error('Form parsing error:', err);
                    return reject(new Error('Error parsing the form: ' + err.message));
                }

                const file = files.video?.[0];
                if (!file) {
                    return reject(new Error('No video uploaded'));
                }

                // Kiểm tra kích thước file
                if (file.size > form.maxFileSize) {
                    return reject(new Error(`File size too large. Maximum size is ${form.maxFileSize / (1024 * 1024)}MB`));
                }

                try {
                    // Kiểm tra kết nối Cloudinary
                    if (!cloudinary.config().cloud_name || !cloudinary.config().api_key || !cloudinary.config().api_secret) {
                        throw new Error('Cloudinary configuration is missing');
                    }


                    const uploadOptions = {
                        resource_type: 'video',
                        folder: 'videos',
                        use_filename: true,
                        unique_filename: true,
                        overwrite: false,
                        chunk_size: 6000000, // 6MB chunks
                        timeout: 120000, // 2 minutes
                        eager: [
                            {
                                format: 'mp4',
                                video_codec: 'h264',
                                audio_codec: 'aac',
                                bit_rate: '1m',
                                height: 720,
                                crop: 'scale'
                            }
                        ],
                        eager_async: true,
                        format: 'mp4',
                        video_codec: 'h264',
                        audio_codec: 'aac',
                        transformation: [
                            { quality: 'auto:good' }
                        ]
                    };

                    const result = await cloudinary.uploader.upload(file.filepath, uploadOptions);


                    // Xóa file tạm
                    fs.unlinkSync(file.filepath);

                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                        format: result.format,
                        size: result.bytes,
                        duration: result.duration,
                        width: result.width,
                        height: result.height,
                        original_filename: file.originalFilename
                    });

                } catch (err) {
                    console.error('Detailed upload error:', {
                        message: err.message,
                        name: err.name,
                        stack: err.stack,
                        details: err
                    });

                    // Đảm bảo xóa file tạm trong trường hợp lỗi
                    if (file && file.filepath) {
                        try {
                            fs.unlinkSync(file.filepath);
                        } catch (unlinkErr) {
                            console.error('Error deleting temporary file:', unlinkErr);
                        }
                    }

                    reject(new Error(`Video upload failed: ${err.message}`));
                }
            });
        });
    }
}

module.exports = new MediaService();