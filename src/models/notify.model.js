const { toolresults } = require('googleapis/build/src/apis/toolresults');
const mongoose = require('mongoose');

const notifySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    inviteDetails: {
        organizationName: String,
        inviterId: String,
        inviterName: String,
        role: String,
    },
    type: {
        type: String,
        enum: ["warning", "info", "success", "update", "invite"],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    sensorType: {
        type: String,
        required: false
    },
    sensorId: {
        type: String,
        required: false
    },
    sensorName: {
        type: String,
        required: false
    },
    sensorValue: {
        type: String,
        required: false
    },
    isRead: {
        type: Boolean,
        required: false,
        default: false  
    },
    roomId: {
        type: String,
        required: false
    },
    roomType: {
        type: String,
        required: false
    },
    organizationId: {
        type: String,
        required: true
    },
}, { timestamps: true });

const Notify = mongoose.model('Notify', notifySchema);

module.exports = Notify;
