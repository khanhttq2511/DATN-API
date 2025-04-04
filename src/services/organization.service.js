const Organization = require('../models/organization.model');
const User = require('../models/user.model'); // Giả sử bạn có model User
const mongoose = require('mongoose');

// --- Helper Functions (Internal) ---
const findOrgById = async (orgId) => {
    const organization = await Organization.findById(orgId);
    if (!organization) {
        throw createError(404, 'Organization not found.');
    }
    return organization;
};

const findUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw createError(404, 'User not found.');
    }
    return user;
};

// Custom error class or simple factory for consistency
const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

// --- Service Class ---
class OrganizationService {

    /**
     * Creates a new organization.
     * Handles adding the owner as the initial member.
     * @param {string} name - The name of the organization.
     * @param {string} ownerUserId - The ID of the user creating the organization.
     * @returns {Promise<object>} The newly created organization document or an error object.
     */
    async createOrganization(name, ownerUserId) {
        if (!name || !ownerUserId) {
            return { status: 400, message: 'Organization name and owner ID are required.' };
        }
        try {
            const owner = await User.findById(ownerUserId);
            if (!owner) {
                return { status: 404, message: 'Owner user not found.' };
            }

            // Explicitly add owner to members array as pre-save hook was removed from model
            const newOrganization = new Organization({
                name,
                ownerId: ownerUserId,
                members: [{ userId: ownerUserId, role: 'owner', status: 'joined' }] // Add owner here
            });

            await newOrganization.save(); // Mongoose validation errors will throw here

            // Update the owner's user document
            await User.findByIdAndUpdate(ownerUserId, {
                $addToSet: { organizations: { organizationId: newOrganization._id, role: 'owner', status: 'joined' } }
            }, { new: true }); // addToSet prevents duplicates

            // Populate owner details before returning
            await newOrganization.populate('ownerId', 'name email');

            return newOrganization; // Return the successful object
        } catch (error) {
            if (error.name === 'ValidationError') {
                // Extract validation messages if needed, or return a generic one
                return { status: 400, message: 'Validation failed: ' + error.message };
            }
            console.error("Error creating organization:", error); // Log unexpected errors
            return { status: 500, message: 'Error creating organization.' };
        }
    }

    /**
     * Finds all organizations a specific user is a member of.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<Array<object>|object>} A list of organizations or an error object.
     */
    async getOrganizationsByUser(userId) {
        if (!userId) {
            return { status: 400, message: 'User ID is required.' };
        }
        try {
            
            const organizations = await Organization.find({ 'members.userId': userId })
                .populate('ownerId', 'name email')
                // .populate('members.userId', 'name email')
                .sort({ createdAt: -1 });
            console.log("organizations", organizations);
            console.log("organizations.members", organizations[0].members);
            return organizations;
        } catch (error) {
             console.error("Error fetching organizations by user:", error);
             return { status: 500, message: 'Error fetching organizations.' };
        }
    }

    /**
     * Gets detailed information for a specific organization.
     * Ensures the requesting user is a member.
     * @param {string} orgId - The ID of the organization.
     * @param {string} requestingUserId - The ID of the user requesting the info.
     * @returns {Promise<object>} The organization document or an error object.
     */
    async getOrganizationDetails(orgId, requestingUserId) {
        if (!orgId || !requestingUserId) {
            return { status: 400, message: 'Organization ID and requesting User ID are required.' };
        }
        try {
            const organization = await Organization.findById(orgId)
                .populate('ownerId', 'name email')
                .populate('members.userId', 'name email');

            if (!organization) {
                return { status: 404, message: 'Organization not found.' };
            }

            // Verify requesting user is a member
            const isMember = organization.members.some(member => member.userId && member.userId._id.equals(requestingUserId));
            if (!isMember) {
                // Important: Use return here, not throw
                return { status: 403, message: 'Forbidden: You are not a member of this organization.' };
            }

            return organization;
        } catch (error) {
             console.error("Error getting organization details:", error);
             return { status: 500, message: 'Error getting organization details.' };
        }
    }

    /**
     * Updates an organization's name. Only the owner can perform this action.
     * @param {string} orgId - The ID of the organization.
     * @param {string} newName - The new name for the organization.
     * @param {string} requestingUserId - The ID of the user attempting the update.
     * @returns {Promise<object>} The updated organization document or an error object.
     */
    async updateOrganizationName(orgId, newName, requestingUserId) {
        if (!orgId || !newName || !requestingUserId) {
            return { status: 400, message: 'Organization ID, new name, and requesting User ID are required.' };
        }
        try {
            const organization = await Organization.findById(orgId);
            if (!organization) {
                return { status: 404, message: 'Organization not found.' };
            }

            // Authorization check: Is the requester the owner?
            if (!organization.ownerId.equals(requestingUserId)) {
                return { status: 403, message: 'Forbidden: Only the owner can update the organization name.' };
            }

            organization.name = newName;
            await organization.save(); // Use save to trigger potential middleware/validation

            await organization.populate('ownerId', 'name email');
            await organization.populate('members.userId', 'name email');

            return organization;
        } catch (error) {
            if (error.name === 'ValidationError') {
                return { status: 400, message: 'Validation failed: ' + error.message };
            }
             console.error("Error updating organization name:", error);
             return { status: 500, message: 'Error updating organization name.' };
        }
    }

    /**
     * Deletes an organization. Only the owner can perform this action.
     * @param {string} orgId - The ID of the organization to delete.
     * @param {string} requestingUserId - The ID of the user attempting the deletion.
     * @returns {Promise<object>} Success or error object.
     */
    async deleteOrganization(orgId, requestingUserId) {
        if (!orgId || !requestingUserId) {
            return { status: 400, message: 'Organization ID and requesting User ID are required.' };
        }
        try {
            const organization = await Organization.findById(orgId);
            if (!organization) {
                return { status: 404, message: 'Organization not found.' };
            }

            // Authorization check
            if (!organization.ownerId.equals(requestingUserId)) {
                return { status: 403, message: 'Forbidden: Only the owner can delete the organization.' };
            }

            // Remove the organization document
            await Organization.findByIdAndDelete(orgId);

            // Remove references from all members' user documents
            const memberIds = organization.members.map(member => member.userId).filter(id => id); // Filter out potential nulls if populate failed
             if (memberIds.length > 0) {
                await User.updateMany(
                    { _id: { $in: memberIds } },
                    { $pull: { organizations: { organizationId: orgId } } }
                );
             }
            return { status: 200, message: 'Organization deleted successfully.' }; // Return success object
        } catch(error) {
            console.error("Error deleting organization:", error);
            return { status: 500, message: 'Error deleting organization.' };
        }
    }


    /**
     * Adds a new member to an organization. Only the owner can add members.
     * @param {string} orgId - The ID of the organization.
     * @param {string} userIdToAdd - The ID of the user to add.
     * @param {string} role - The role to assign ('member').
     * @param {string} requestingUserId - The ID of the user attempting to add the member.
     * @returns {Promise<object>} The updated organization document or an error object.
     */
    async addMemberToOrganization(orgId, email, role = 'member', requestingUserId) {
        if (!orgId || !email || !requestingUserId) {
           return { status: 400, message: 'Organization ID, User ID to add, and requesting User ID are required.' };
       }
       try {
            const organization = await Organization.findById(orgId);
            if (!organization) {
                return { status: 404, message: 'Organization not found.' };
            }

            if (!organization.ownerId.equals(requestingUserId)) {
                return { status: 403, message: 'Forbidden: Only the owner can add members.' };
            }
            if (role === 'owner') {
                return { status: 400, message: 'Cannot assign "owner" role directly. Use a transfer ownership function.' };
            }
            if (!['member'].includes(role)) { // Only allow 'member' for now
                return { status: 400, message: 'Invalid role specified.' };
            }

            const userToAdd = await User.findOne({ email: email }); // Check if user to add exists
            if (!userToAdd) {
                 return { status: 404, message: 'User to add not found.' };
            }

            const isAlreadyMember = organization.members.some(member => member.userId && member.userId.equals(userToAdd._id));
            if (isAlreadyMember) {
                return { status: 409, message: 'User is already a member of this organization.' };
            }

            // Add the member
            organization.members.push({ userId: userToAdd._id, role , email: userToAdd.email, status: 'pending' });
            await organization.save(); // Use save to run schema validations on members array

            // Update the added user's document
            await User.findByIdAndUpdate(userToAdd._id, {
                $addToSet: { organizations: { organizationId: orgId, role: role, email: userToAdd.email, status: 'pending' } }
            }, { new: true });

            // Return updated org with populated members
            await organization.populate('members.userId', 'name email');
            await organization.populate('ownerId', 'name email');
            return organization;
        } catch (error) {
            if (error.name === 'ValidationError') {
                 return { status: 400, message: 'Validation failed: ' + error.message };
             }
             console.error("Error adding member:", error);
             return { status: 500, message: 'Error adding member to organization.' };
        }
    }

    /**
     * Removes a member from an organization. Only the owner can remove members.
     * The owner cannot remove themselves this way.
     * @param {string} orgId - The ID of the organization.
     * @param {string} userIdToRemove - The ID of the user to remove.
     * @param {string} requestingUserId - The ID of the user attempting the removal.
     * @returns {Promise<object>} The updated organization document or an error object.
     */
    async removeMemberFromOrganization(orgId, userIdToRemove, requestingUserId) {
        if (!orgId || !userIdToRemove || !requestingUserId) {
           return { status: 400, message: 'Organization ID, User ID to remove, and requesting User ID are required.' };
       }
       try {
            const organization = await Organization.findById(orgId);
            if (!organization) {
                return { status: 404, message: 'Organization not found.' };
            }

            if (!organization.ownerId.equals(requestingUserId)) {
                return { status: 403, message: 'Forbidden: Only the owner can remove members.' };
            }

            if (organization.ownerId.equals(userIdToRemove)) {
                return { status: 400, message: 'Owner cannot remove themselves. To delete the organization, use the delete endpoint.' };
            }

            const memberIndex = organization.members.findIndex(member => member.userId && member.userId.equals(userIdToRemove));
            if (memberIndex === -1) {
                return { status: 404, message: 'Member not found in this organization.' };
            }

            // Remove the member using $pull update
            await Organization.findByIdAndUpdate(orgId, {
                $pull: { members: { userId: userIdToRemove } }
            });

            // Update the removed user's document
            await User.findByIdAndUpdate(userIdToRemove, {
                $pull: { organizations: { organizationId: orgId } }
            });

            // Return updated org
            const updatedOrg = await Organization.findById(orgId)
                                                .populate('ownerId', 'name email')
                                                .populate('members.userId', 'name email');
            return updatedOrg; // Return the updated document on success
        } catch(error) {
             console.error("Error removing member:", error);
             return { status: 500, message: 'Error removing member from organization.' };
        }
    }

    /**
     * Updates the role of an existing member. Only the owner can change roles.
     * Cannot change the owner's role or assign 'owner' role via this function.
     * @param {string} orgId - The ID of the organization.
     * @param {string} userIdToUpdate - The ID of the member whose role is to be updated.
     * @param {string} newRole - The new role ('member').
     * @param {string} requestingUserId - The ID of the user attempting the update.
     * @returns {Promise<object>} The updated organization document or an error object.
     */
    async updateMemberRole(orgId, userIdToUpdate, newRole, requestingUserId) {
       if (!orgId || !userIdToUpdate || !newRole || !requestingUserId) {
           return { status: 400, message: 'Organization ID, User ID to update, new role, and requesting User ID are required.' };
       }
       try {
            const organization = await Organization.findById(orgId);
             if (!organization) {
                return { status: 404, message: 'Organization not found.' };
            }

            if (!organization.ownerId.equals(requestingUserId)) {
                return { status: 403, message: 'Forbidden: Only the owner can change member roles.' };
            }

            if (organization.ownerId.equals(userIdToUpdate)) {
                return { status: 400, message: 'Cannot change the owner\'s role via this endpoint.' };
            }

            if (newRole === 'owner') {
                return { status: 400, message: 'Cannot assign "owner" role. Use a transfer ownership process.' };
            }
            if (!['member'].includes(newRole)) { // Currently only allowing 'member'
                return { status: 400, message: 'Invalid role specified for update.' };
            }

            // Find the member within the organization members array
            const memberToUpdate = organization.members.find(m => m.userId && m.userId.equals(userIdToUpdate));
            if (!memberToUpdate) {
                return { status: 404, message: 'Member not found in this organization.' };
            }

            let roleUpdated = false;
            // Only update if the role is actually different
            if (memberToUpdate.role !== newRole) {
                // Update role in Organization document using positional operator
                const updateResult = await Organization.updateOne(
                    { _id: orgId, 'members.userId': userIdToUpdate },
                    { $set: { 'members.$.role': newRole } }
                );

                // Check if the update actually modified anything
                 if (updateResult.modifiedCount > 0) {
                    // Update role in User document
                    await User.updateOne(
                        { _id: userIdToUpdate, 'organizations.organizationId': orgId },
                        { $set: { 'organizations.$.role': newRole } }
                    );
                    roleUpdated = true;
                 } else if (updateResult.matchedCount === 0) {
                     // This case might indicate the member was removed concurrently
                      return { status: 404, message: 'Member not found for role update (concurrent modification?).' };
                 }
                // If matchedCount > 0 but modifiedCount = 0, the role was already correct.
            }

            // Return updated org, regardless if roleUpdated was true or false (idempotent)
            const updatedOrg = await Organization.findById(orgId)
                                                .populate('ownerId', 'name email')
                                                .populate('members.userId', 'name email');
            return updatedOrg; // Return the potentially updated document
        } catch (error) {
             console.error("Error updating member role:", error);
             return { status: 500, message: 'Error updating member role.' };
        }
    }
}

// Export một instance của class
module.exports = new OrganizationService(); 