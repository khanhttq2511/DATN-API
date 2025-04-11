const Addmember = require('../models/addmember.model');
const User = require('../models/user.model');

class AddmemberController {
  async addMember(req, res) {
    try {
      const { email, role, parentId } = req.body;

      // Check if member with this email already exists
      const existingMember = await Addmember.findOne({ email });
      if (existingMember) {
        return res.status(400).json({ message: 'Member with this email already exists' });
      }
      
      // Find user by email to get the username
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found with this email' });
      }
      
      // Create new member with the username from user
      const addmember = await Addmember.create({ 
        name: user.username, 
        email, 
        role, 
        parentId,
        avatarURL: user.avatarURL 
      });
      
      res.status(201).json(addmember);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getMembers(req, res) {
    const members = await Addmember.find();
    res.status(200).json(members);
  }

  async getMemberById(req, res) {
    const member = await Addmember.findById(req.params.id);
    res.status(200).json(member);
  }

  async updateMember(req, res) {
    const member = await Addmember.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json(member);
  }

  async deleteMember(req, res) {
    const member = await Addmember.findByIdAndDelete(req.params.id);
    res.status(200).json(member);
  }

  async setAdmin(req, res) {
    const member = await Addmember.findByIdAndUpdate(req.params.id, { role: 'admin' });
    res.status(200).json(member);
  }
}
module.exports = new AddmemberController();