import express from 'express';
import { getGuards, assignCheckpoint, recordScan, getReports } from '../controllers/supervisorController.js';
const router = express.Router();

// Guards & assignments
router.get('/guards', getGuards);
router.post('/assignments', assignCheckpoint);

// Scans
router.post('/scans', recordScan);

// Reports
router.get('/reports', getReports);

export default router;
