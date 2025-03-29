const User = require('../models/user.model.js');
const { generateToken, comparePassword, hashPassword } = require('../utils');
const crypto = require('crypto');
const dotenv = require("dotenv");  
const axios = require('axios');
const { sendMail } = require('../email');
const { forgotPasswordTemplate } = require('../lib/email-template/forgot-password');
dotenv.config();
class UserService {
  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async getAllUsers() {
    return await User.find();
  }

  async getUserById(id) {
    return await User.findById(id);
  }

  async updateUser(id, userData) {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }
  // tạo hàm login return token
  async login(userData) {
    console.log(userData);
    const user = await User.findOne({ email: userData.email });
    if (!user) {
      throw new Error('User not found');
    }
    // bcrypt so sánh password
    const isPasswordValid = await comparePassword(userData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    console.log(user);
    const token = generateToken(user);
    return {
      username: user.username,
      email: user.email,
      role: user.role,
      token: token  
    };
    
  }
  // tạo hàm register
  async checkEmailExists(email) {
    const existingUser = await User.findOne({ email });
    return existingUser !== null;
  }

  async register(userData) {
    // Kiểm tra email tồn tại
    const emailExists = await this.checkEmailExists(userData.email);
    if (emailExists) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Tiếp tục quá trình đăng ký nếu email chưa tồn tại
    const hashedPassword = await hashPassword(userData.password);    
    userData.password = hashedPassword;
    const user = await User.create(userData);
    const token = generateToken(user);
    
    return {
      username: user.username,
      email: user.email,
      role: user.role,
      token: token
    };
  }
  // me
  async me(userid) {
    const user = await User.findById(userid);
    return user;
  }
  // forgot password
  async forgotPassword(email) { 
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Email không tồn tại');
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    const result = await sendMail({to: email, subject: 'Quên mật khẩu', html: forgotPasswordTemplate(otp, user.username)}); 
    return result;
  }
  
  // send OTP to email
  async verifyOTP(email, otp) {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || new Date() > user.otpExpires) {
        return { message: "OTP không hợp lệ hoặc đã hết hạn" };
    }

    return { message: "OTP chính xác, tiếp tục đặt lại mật khẩu" };
  }
  // reset password
  async resetPassword(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Email không tồn tại');
    } 
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    await user.save();
    return user;
  }
}


module.exports = new UserService(); 