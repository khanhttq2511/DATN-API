const express = require('express');
const router = express.Router();
const addmemberController = require('../controllers/addmember.controller');
const { protect } = require('../middleware');


router.post('/', protect, addmemberController.addMember);
router.get('/', addmemberController.getMembers);
router.put('/:id', addmemberController.updateMember);
router.delete('/:id', addmemberController.deleteMember);
router.post('/:id', addmemberController.setAdmin);

module.exports = router;
