const MediaService = require('../services/media.service')


class MediaController {
    uploadFiles = async (req, res) => {
        try {
            const result = await MediaService.uploadFiles(req);
            res.status(200).json({ success: true, url: result });
        } catch (error) {
            const statusCode = error.message.includes('No file uploaded') ? 400 : 500;
            res.status(statusCode).json({ success: false, message: error.message });
        }
    };

    uploadDocument = async (req, res) => {
        try {
            const result = await MediaService.uploadDocument(req);
            res.status(200).json({ success: true, url: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    uploadVideo = async (req, res) => {
        try {
            const result = await MediaService.uploadVideo(req);
            res.status(200).json({ success: true, url: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

}

module.exports = new MediaController();