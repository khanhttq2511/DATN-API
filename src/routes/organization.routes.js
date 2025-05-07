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
router.get('/:orgId', protect, organizationController.getDetails); // Lấy chi tiết tổ chức (service sẽ kiểm tra quyền thành viên)
router.get('/:orgId/owner', protect, organizationController.getOrganizationOwner); // Lấy thông tin chủ sở hữu tổ chức
router.put('/:orgId', protect, organizationController.updateName); // Cập nhật tên (service kiểm tra owner)
router.delete('/:orgId', protect, organizationController.remove); // Xóa tổ chức (service kiểm tra owner)

// --- Member Management ---
router.post('/:orgId/members', protect, organizationController.addMember); // Thêm thành viên (service kiểm tra owner)
router.delete('/:orgId/members/:userIdToDelete', protect, organizationController.removeMember); // Xóa thành viên (service kiểm tra owner)
router.put('/:orgId/members/:userIdToUpdate', protect, organizationController.updateMemberRole); // Cập nhật vai trò (service kiểm tra owner)

// --- Invitation Management ---
router.post('/invitations/accept', protect, organizationController.acceptInvitation); // Chấp nhận lời mời
router.post('/invitations/reject', protect, organizationController.rejectInvitation); // Từ chối lời mời
router.get('/invitations/pending', protect, organizationController.getPendingInvitations); // Lấy danh sách lời mời đang chờ

module.exports = router; 