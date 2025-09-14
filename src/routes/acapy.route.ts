import express from 'express';
import axiosInstance from '../utils/axios';

const router = express.Router();


router.get('/status', async (req, res) => {
    try {
        const response = await axiosInstance.get('/status');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch status from ACA-Py' });
    }
})




export default router;