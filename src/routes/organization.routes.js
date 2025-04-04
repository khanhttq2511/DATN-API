const express = require('express');
const organizationController = require('../controllers/organization.controller.js');
const { protect } = require('../middleware');
// Import middleware xác thực và quyền (bạn cần tự tạo các file này)
// import { isAuthenticated } from '../middleware/middleware.js';
// Middleware kiểm tra quyền không còn cần thiết ở đây nếu service tự kiểm tra
// import { isOrganizationOwner } from '../middleware/organizationAuth.middleware.js';

const router = express.Router();

// Tất cả các route dưới đây yêu cầu người dùng phải đăng nhập
// router.use(isAuthenticated);

// --- Organization CRUD ---
router.post('/', protect, organizationController.create); // Tạo tổ chức mới
router.get('/', protect, organizationController.listUserOrganizations); // Lấy các tổ chức của tôi
router.get('/:orgId', organizationController.getDetails); // Lấy chi tiết tổ chức (service sẽ kiểm tra quyền thành viên)
router.put('/:orgId', organizationController.updateName); // Cập nhật tên (service kiểm tra owner)
router.delete('/:orgId', organizationController.remove); // Xóa tổ chức (service kiểm tra owner)

// --- Member Management ---
router.post('/:orgId/members', organizationController.addMember); // Thêm thành viên (service kiểm tra owner)
router.delete('/:orgId/members/:userIdToDelete', organizationController.removeMember); // Xóa thành viên (service kiểm tra owner)
router.put('/:orgId/members/:userIdToUpdate', organizationController.updateMemberRole); // Cập nhật vai trò (service kiểm tra owner)

module.exports = router; 