const express = require('express');
const router = express.Router();
const FormEntry = require('../models/FormEntry');

router.post('/', async (req, res) => {
    try {
        const { fullName, email, phone, company, assistant, userId } = req.body;

        // Basic validation
        if (!fullName || !email || !assistant) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        await FormEntry.create({
            fullName,
            email,
            phone,
            company,
            assistant,
            userId: userId || null
        });

        res.status(201).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({ message: 'Server error processing form' });
    }
});

module.exports = router;
