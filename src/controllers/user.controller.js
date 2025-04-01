const userService = require('../services/user.service');
const axios = require('axios');

class UserController {
  async createUser(req, res) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user.toSafeObject());
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const user = await userService.deleteUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
    // login
  async login(req, res) {
    try {
      const user = await userService.login(req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  // register
  async register(req, res) {
    try {
      const token = await userService.register(req.body);
      res.status(201).json({
        success: true,
        ...token
      });
    } catch (error) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(400).json({
          success: false,
          message: 'Email này đã được sử dụng, vui lòng chọn email khác'
        });
      }
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }   
  }
  
  // me
  async me(req, res) {
    try {
      const userid = req.user._id;
      const user = await userService.me(userid);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  // logout
  async logout(req, res) {
    const userid = req.user._id;
    const user = await userService.logout(userid);
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  }
  // forgot password
  async forgotPassword(req, res) {
    try {
        const email = req.body.email;
        const result = await userService.forgotPassword(email);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
  // reset password
  async resetPassword(req, res) {
    const { email, password } = req.body;
    const user = await userService.resetPassword(email, password);
    res.json(user);
  }
  //change password
  async changePassword(req, res) {
    const { email, password, newPassword } = req.body;
    const user = await userService.changePassword(email, password, newPassword);
    res.json(user);
  }
  // logout
  async logout(req, res) {
    const userid = req.user._id;
    const user = await userService.logout(userid);
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } 

  // send OTP to email
  async sendOTP(req, res) {
    const { email } = req.body;
    const user = await userService.sendOTP(email);
    res.json(user);
  }
  // verify OTP
  async verifyOTP(req, res) {
    const { email, otp } = req.body;
    const user = await userService.verifyOTP(email, otp);
    res.json(user);
  }
}

module.exports = new UserController(); 