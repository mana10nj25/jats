import type { Response } from 'express';
import Joi from 'joi';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { JobModel } from '../models/job.model';

type JobStatus = 'applied' | 'phone-screen' | 'interview' | 'offer' | 'rejected' | 'wishlist';

interface JobPayload {
  company: string;
  title: string;
  status: JobStatus;
  dateApplied?: Date;
  nextFollowUp?: Date;
  tags?: string[];
  notes?: string | null;
}

const statusSchema = Joi.object<{ status: JobStatus }>({
  status: Joi.string()
    .valid('applied', 'phone-screen', 'interview', 'offer', 'rejected', 'wishlist')
    .required()
});

const jobSchema = Joi.object<JobPayload>({
  company: Joi.string().required(),
  title: Joi.string().required(),
  status: Joi.string()
    .valid('applied', 'phone-screen', 'interview', 'offer', 'rejected', 'wishlist')
    .default('applied'),
  dateApplied: Joi.date().optional(),
  nextFollowUp: Joi.date().optional(),
  tags: Joi.array().items(Joi.string()).default([]),
  notes: Joi.string().allow('', null)
});

function requireUser(req: AuthenticatedRequest, res: Response): string | Response {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return userId;
}

export async function listJobs(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const userId = requireUser(req, res);
  if (typeof userId !== 'string') {
    return userId;
  }

  const jobs = await JobModel.find({ userId }).sort({ createdAt: -1 }).lean();
  return res.json({ jobs });
}

export async function createJob(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const userId = requireUser(req, res);
  if (typeof userId !== 'string') {
    return userId;
  }

  const { value, error } = jobSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    return res.status(400).json({ message: 'Validation failed', details: error.details });
  }

  const job = await JobModel.create({
    ...value,
    userId
  });

  return res.status(201).json({ job });
}

export async function updateJob(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const userId = requireUser(req, res);
  if (typeof userId !== 'string') {
    return userId;
  }

  const { id } = req.params;
  const { value, error } = jobSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    return res.status(400).json({ message: 'Validation failed', details: error.details });
  }

  const job = await JobModel.findOneAndUpdate(
    { _id: id, userId },
    { ...value },
    { new: true, runValidators: true }
  );

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  return res.json({ job });
}

export async function updateJobStatus(
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> {
  const userId = requireUser(req, res);
  if (typeof userId !== 'string') {
    return userId;
  }

  const { id } = req.params;
  const { value, error } = statusSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    return res.status(400).json({ message: 'Validation failed', details: error.details });
  }

  const job = await JobModel.findOneAndUpdate(
    { _id: id, userId },
    { status: value.status },
    { new: true, runValidators: true }
  );

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  return res.json({ job });
}

export async function deleteJob(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const userId = requireUser(req, res);
  if (typeof userId !== 'string') {
    return userId;
  }

  const { id } = req.params;
  const job = await JobModel.findOneAndDelete({ _id: id, userId });

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  return res.status(204).send();
}
