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
    const user = await User.findOne({ email: userData.email });
    if (!user) {
      return {
        status: 400,
        message: 'email không tồn tại'
      };
    }
    // bcrypt so sánh password
    const isPasswordValid = await comparePassword(userData.password, user.password);
    if (!isPasswordValid) {
      return {
        status: 400,
        message: 'mật khẩu không chính xác'
      };
    }
    const token = generateToken(user);
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarURL: user.avatarURL,
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
      return {
        status: 400,
        message: 'email đã tồn tại'
      };
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
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarURL: user.avatarURL
    };
  }
  // logout
  async logout(userid) {
    const user = await User.findById(userid);
    user.token = null;
    await user.save();
    return user;
  }
  // forgot password
  async forgotPassword(email) { 
    const user = await User.findOne({ email });
    if (!user) {
      return {
        status: 400,
        message: 'Email không tồn tại'
      };
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
        return { 
          status: 400,
          message: "OTP không hợp lệ hoặc đã hết hạn" 
        };
    }
    return { 
      status: 200,
      message: "OTP chính xác, tiếp tục đặt lại mật khẩu" 
    };
  }
  // reset password
  async resetPassword(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        status: 400,
        message: 'Email không tồn tại'
      };
    } 
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    await user.save();
    return user;
  }
  // change password
  async changePassword(userId, password, newPassword) {
    const user = await User.findById(userId); 
    if (!user) {
      return {
        status: 400,
        message: 'User không tồn tại'
      };
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return {
        status: 400,
        message: 'Mật khẩu không chính xác'
      };
    }
    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();
    return {
      status: 200,
      message: 'Mật khẩu đã được thay đổi thành công'
    };
  }
}


module.exports = new UserService(); 