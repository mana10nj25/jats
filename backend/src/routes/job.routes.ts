import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createJob,
  deleteJob,
  listJobs,
  updateJob,
  updateJobStatus
} from '../controllers/job.controller';

const router = Router();

router.use(authenticate);
router.get('/', listJobs);
router.post('/', createJob);
router.put('/:id', updateJob);
router.patch('/:id/status', updateJobStatus);
router.delete('/:id', deleteJob);

export default router;
