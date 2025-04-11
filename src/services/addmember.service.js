const Addmember = require('../models/addmember.model');

class AddmemberService {
  async addMember(memberData) {
    const name = memberData.find(member => member.email === memberData.email).name;
    const addmember = await Addmember.create({ name, email, role, parentId });
    return addmember;
  }

  async getMembers() {
    const members = await Addmember.find();
    return members;
  }

  async getMemberById(id) {
    const member = await Addmember.findById(id);
    return member;
  }

  async updateMember(id, memberData) {
    const member = await Addmember.findByIdAndUpdate(id, memberData);
    return member;
  }

  async deleteMember(id) {
    const member = await Addmember.findByIdAndDelete(id);
    return member;
  }

  async setAdmin(id) {
    const member = await Addmember.findByIdAndUpdate(id, { role: 'admin' });
    return member;
  }
}
module.exports = new AddmemberService();
