const organizationService = require('../services/organization.service.js');
const User = require('../models/user.model.js');
const notifyService = require('../services/notify.service.js');
const Organization = require('../models/organization.model.js');

class OrganizationController {
    // Create an organization
    async create(req, res) {
        try {
            const { name, userId } = req.body;

            if (!userId) {
                 return res.status(401).json({ message: 'Authentication required.' });
            }
            const ownerUserId = userId;
            const newOrganization = await organizationService.createOrganization(name, ownerUserId);
            res.status(201).json(newOrganization);
        } catch (error) {
            // Use status from service error if available, otherwise default
            const status = error.status || 400;
            res.status(status).json({ message: error.message });
        }
    }

    // Get organizations for the current user
    async listUserOrganizations(req, res) {
        try {
            if (!req.user._id) {
                 return res.status(401).json({ message: 'Authentication required.' });
            }
            const userId = req.user._id;
            const organizations = await organizationService.getOrganizationsByUser(userId);
            res.status(200).json(organizations);
        } catch (error) {
            const status = error.status || 500; // Default to 500 for listing errors
            res.status(status).json({ message: error.message });
        }
    }

    // Get details of a specific organization
    async getDetails(req, res) {
        try {
            const { orgId } = req.params;
             if (!req.user || !req.user._id) {
                 return res.status(401).json({ message: 'Authentication required.' });
            }
            const requestingUserId = req.user._id;
            // Authorization check happens in the service
            const organization = await organizationService.getOrganizationDetails(orgId, requestingUserId);
            res.status(200).json(organization);
        } catch (error) {
            const status = error.status || 404; // Default to 404 or use service status
            res.status(status).json({ message: error.message });
        }
    }

    // Update organization name
    async updateName(req, res) {
        try {
            const { orgId } = req.params;
            const { name } = req.body;
             if (!req.user || !req.user._id) {
                 return res.status(401).json({ message: 'Authentication required.' });
            }
            const requestingUserId = req.user._id;
            // Authorization check happens in the service
            const updatedOrganization = await organizationService.updateOrganizationName(orgId, name, requestingUserId);
            res.status(200).json(updatedOrganization);
        } catch (error) {
            const status = error.status || 400;
            res.status(status).json({ message: error.message });
        }
    }

    // Delete an organization
    async remove(req, res) {
        try {
            const { orgId } = req.params;
             if (!req.user || !req.user._id) {
                 return res.status(401).json({ message: 'Authentication required.' });
            }
            const requestingUserId = req.user._id;
            // Authorization check happens in the service
            await organizationService.deleteOrganization(orgId, requestingUserId);
            res.status(200).json({ message: 'Organization deleted successfully.' });
        } catch (error) {
            const status = error.status || 403; // Default to 403/404 or use service status
            res.status(status).json({ message: error.message });
        }
    }

    // --- Member Management ---

    // Add a member
    async addMember(req, res) {
        try {
            const { orgId } = req.params;
            const { email, role, requestingUserId } = req.body;        
            // Authorization check happens in the service
            const updatedOrganization = await organizationService.addMemberToOrganization(orgId, email, role, requestingUserId);
            if (updatedOrganization) {
                try {
                    await notifyService.createInviteNotification(email, orgId, requestingUserId);
                } catch (notifyError) {
                    console.error('Error creating invitation notification:', notifyError);
                        // Không throw error, vẫn tiếp tục xử lý API response
                }
            }
            
            res.status(200).json(updatedOrganization);
        } catch (error) {
            const status = error.status || 400; 
            res.status(status).json({ message: error.message });
        }
    }

    // Lấy danh sách lời mời đang chờ
    async getPendingInvitations(req, res) {
        try {
            if (!req.user || !req.user._id) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Authentication required.' 
                });
            }
            
            const userId = req.user._id;
            const pendingInvitations = await organizationService.getPendingInvitations(userId);
            
            res.status(200).json({
                success: true,
                data: pendingInvitations
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ 
                success: false,
                message: error.message 
            });
        }
    }

    // Remove a member
    async removeMember(req, res) {
        try {
            const { orgId, userIdToDelete } = req.params; 
            if (!req.user || !req.user._id) {
                return res.status(401).json({ message: 'Authentication required.' });
            }
            const requestingUserId = req.user._id;

            // Authorization check happens in the service
            const updatedOrganization = await organizationService.removeMemberFromOrganization(orgId, userIdToDelete, requestingUserId);
            // Kiểm tra nếu updatedOrganization là một error object
            if (updatedOrganization && updatedOrganization.status) {
                return res.status(updatedOrganization.status).json({ message: updatedOrganization.message });
            }
            
            res.status(200).json(updatedOrganization);
        } catch (error) {
            console.error("Error removing member:", error);
            const status = error.status || 400;
            res.status(status).json({ message: error.message });
        }
    }

    // Update a member's role
    async updateMemberRole(req, res) {
        try {
            const { orgId, userIdToUpdate } = req.params;
            const { role } = req.body;
             if (!req.user || !req.user._id) {
                 return res.status(401).json({ message: 'Authentication required.' });
            }
            const requestingUserId = req.user._id;
            // Authorization check happens in the service
            const updatedOrganization = await organizationService.updateMemberRole(orgId, userIdToUpdate, role, requestingUserId);
            res.status(200).json(updatedOrganization);
        } catch (error) {
            const status = error.status || 400;
            res.status(status).json({ message: error.message });
        }
    }

    // Chấp nhận lời mời tham gia tổ chức
    async acceptInvitation(req, res) {
        try {
            const { organizationId } = req.body;
            
            if (!req.user || !req.user._id) {
                return res.status(401).json({ message: 'Authentication required.' });
            }
            const inviteeId = req.user._id;
            const inviterId = req.body.inviterId;
            
            // Cập nhật trạng thái thành viên trong tổ chức
            const updatedOrganization = await organizationService.acceptInvitation(organizationId, inviteeId);
            
            // Gửi thông báo cho người mời
            try {
                await notifyService.createInviteResponseNotification(
                    organizationId,
                    inviteeId,
                    inviterId,
                    true // accepted = true
                );
            } catch (notifyError) {
                console.error('Error creating invitation acceptance notification:', notifyError);
                // Không throw error, vẫn tiếp tục xử lý API response
            }
            
            res.status(200).json({
                success: true,
                message: 'Lời mời đã được chấp nhận',
                data: updatedOrganization
            });
        } catch (error) {
            const status = error.status || 400;
            res.status(status).json({ 
                success: false,
                message: error.message 
            });
        }
    }
    
    // Từ chối lời mời tham gia tổ chức
    async rejectInvitation(req, res) {
        try {
            const { organizationId } = req.body;
            if (!req.user || !req.user._id) {
                return res.status(401).json({ message: 'Authentication required.' });
            }

            const inviteeId = req.user._id;
            const inviterId = req.body.inviterId;
            
            // Cập nhật trạng thái thành viên trong tổ chức
            await organizationService.rejectInvitation(organizationId, inviteeId);
            
            // Gửi thông báo cho người mời
            try {
                await notifyService.createInviteResponseNotification(
                    organizationId,
                    inviteeId,
                    inviterId,
                    false // accepted = false
                );
            } catch (notifyError) {
                console.error('Error creating invitation rejection notification:', notifyError);
                }
            
            res.status(200).json({
                success: true,
                message: 'Lời mời đã bị từ chối'
            });
        } catch (error) {
            const status = error.status || 400;
            res.status(status).json({ 
                success: false,
                message: error.message 
            });
        }
    }

    // Lấy thông tin chủ sở hữu tổ chức
    async getOrganizationOwner(req, res) {
        try {
            const { orgId } = req.params;
            
            const organization = await Organization.findById(orgId).select('ownerId');
            
            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy tổ chức'
                });
            }
            
            res.status(200).json({
                success: true,
                ownerId: organization.ownerId
            });
        } catch (error) {
            console.error('Error getting organization owner:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thông tin chủ sở hữu tổ chức'
            });
        }
    }
}

module.exports = new OrganizationController();