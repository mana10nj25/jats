import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.tokens';
import type { Job, JobInput, JobStatus } from '../models/job.model';

interface JobResponse {
  job: JobDto;
}

interface JobsResponse {
  jobs: JobDto[];
}

type JobDto = {
  _id: string;
  company: string;
  title: string;
  status: JobStatus;
  dateApplied?: string;
  nextFollowUp?: string;
  notes?: string | null;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
};

@Injectable({ providedIn: 'root' })
export class JobApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = this.normalizeBaseUrl(inject(API_BASE_URL));

  list(): Observable<Job[]> {
    return this.http
      .get<JobsResponse>(`${this.apiBaseUrl}/jobs`)
      .pipe(map((response) => response.jobs.map((job) => this.toJob(job))));
  }

  create(payload: JobInput): Observable<Job> {
    return this.http
      .post<JobResponse>(`${this.apiBaseUrl}/jobs`, payload)
      .pipe(map((response) => this.toJob(response.job)));
  }

  update(id: string, payload: JobInput): Observable<Job> {
    return this.http
      .put<JobResponse>(`${this.apiBaseUrl}/jobs/${id}`, payload)
      .pipe(map((response) => this.toJob(response.job)));
  }

  updateStatus(id: string, status: JobStatus): Observable<Job> {
    return this.http
      .patch<JobResponse>(`${this.apiBaseUrl}/jobs/${id}/status`, { status })
      .pipe(map((response) => this.toJob(response.job)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/jobs/${id}`);
  }

  private toJob(job: JobDto): Job {
    return {
      id: job._id,
      company: job.company,
      title: job.title,
      status: job.status,
      dateApplied: job.dateApplied,
      nextFollowUp: job.nextFollowUp,
      notes: job.notes ?? null,
      tags: job.tags ?? [],
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };
  }

  private normalizeBaseUrl(url: string): string {
    if (url.endsWith('/')) {
      return url.replace(/\/+$/, '');
    }
    return url;
  }
}
