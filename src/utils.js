//generate token
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mqttService = require('./services/mqtt.service');

//generate token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

//verify token
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}   

//hash password
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}

//compare password
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}
//send message to mqtt
const sendMessageToTopic = async (topic, message) => {
    mqttService.publish(topic, message);
  };
module.exports = { generateToken, verifyToken, hashPassword, comparePassword, sendMessageToTopic };
