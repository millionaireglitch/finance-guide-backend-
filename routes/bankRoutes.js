const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/banks/sync:
 *   get:
 *     summary: Integration with bank APIs (sandbox) API
 *     description: Syncs fake transactions from a sandbox bank API environment to the user's account.
 *     tags: [Banks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully synced transactions
 */
router.get('/sync', async (req, res) => {
    try {
        // Mock Sandbox Data
        const sandboxTransactions = [
            { user: req.user._id, amount: 2500, type: 'expense', category: 'Food', description: 'Zomato (Sandbox Sync)', date: new Date() },
            { user: req.user._id, amount: 15000, type: 'income', category: 'Salary', description: 'Stipend (Sandbox Sync)', date: new Date() }
        ];
        
        await Transaction.insertMany(sandboxTransactions);
        
        res.status(200).json({
            success: true,
            message: 'Successfully synced with Sandbox Bank API',
            data: sandboxTransactions
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
