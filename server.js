import express from 'express';
import path from 'path';
import cors from 'cors';
import loginRoutes from './routes/loginRoutes.js';
import userRoutes from './routes/userRoutes.js';
import checkpoints from './routes/checkpoints.js';
import scanRoutes from './routes/scan.js';
import supervisorRoutes from './routes/supervisorRoutes.js';
import observations from './routes/observations.js'
import assignmentRoutes from './routes/assignments.js'
import reportsRouter from './routes/reports.js'


const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/assignments', assignmentRoutes);
app.use('/api/checkpoints', checkpoints);
app.use('/api/observations', observations);
app.use('/api/reports', reportsRouter)

app.use('/api/scans', scanRoutes);
app.use('/api', supervisorRoutes);
app.use('/api', loginRoutes);
app.use('/api/users', userRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
