const organizationService = require('../services/organization.service.js');
const User = require('../models/user.model.js');
class OrganizationController {
    // Create an organization
    async create(req, res) {
        try {
            const { name, userId } = req.body;
            // Assuming isAuthenticated middleware adds user to req
            console.log("userId", userId);
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
            console.log("req.user", req.user);
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
            const { email, role , requestingUserId} = req.body;
            //  if (!req.user || !req.user._id) {
            //      return res.status(401).json({ message: 'Authentication required.' });
            // }
            // Authorization check happens in the service
            const updatedOrganization = await organizationService.addMemberToOrganization(orgId, email, role, requestingUserId);
            res.status(200).json(updatedOrganization);
        } catch (error) {
            const status = error.status || 400;
            res.status(status).json({ message: error.message });
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
            res.status(200).json(updatedOrganization);
        } catch (error) {
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
}

module.exports = new OrganizationController();