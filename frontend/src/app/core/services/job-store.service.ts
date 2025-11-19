import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  MonoTypeOperatorFunction,
  Observable,
  tap,
  throwError
} from 'rxjs';
import type { Job, JobInput, JobStatus } from '../models/job.model';
import { JobApiService } from './job-api.service';

export interface JobSummary {
  total: number;
  byStatus: Record<JobStatus, number>;
  upcomingFollowUps: number;
}

@Injectable({ providedIn: 'root' })
export class JobStoreService {
  private readonly jobsSubject = new BehaviorSubject<Job[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly jobApi = inject(JobApiService);

  readonly jobs$ = this.jobsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loadingSubject.next(true);
    this.jobApi
      .list()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (jobs) => {
          this.jobsSubject.next(jobs);
          this.errorSubject.next(null);
        },
        error: (error) => this.errorSubject.next(this.toErrorMessage(error))
      });
  }

  addJob(payload: JobInput): Observable<Job> {
    return this.jobApi.create(payload).pipe(
      tap((created) => {
        this.jobsSubject.next([created, ...this.jobsSubject.value]);
        this.errorSubject.next(null);
      }),
      this.captureError()
    );
  }

  removeJob(jobId: string): Observable<void> {
    return this.jobApi.delete(jobId).pipe(
      tap(() => {
        this.jobsSubject.next(this.jobsSubject.value.filter((job) => job.id !== jobId));
        this.errorSubject.next(null);
      }),
      this.captureError()
    );
  }

  updateJob(jobId: string, payload: JobInput): Observable<Job> {
    return this.jobApi.update(jobId, payload).pipe(
      tap((updatedJob) => {
        this.jobsSubject.next(
          this.jobsSubject.value.map((job) => (job.id === jobId ? updatedJob : job))
        );
        this.errorSubject.next(null);
      }),
      this.captureError()
    );
  }

  updateJobStatus(jobId: string, status: JobStatus): Observable<Job> {
    return this.jobApi.updateStatus(jobId, status).pipe(
      tap((updatedJob) => {
        this.jobsSubject.next(
          this.jobsSubject.value.map((job) => (job.id === jobId ? updatedJob : job))
        );
        this.errorSubject.next(null);
      }),
      this.captureError()
    );
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  summary$ = this.jobs$.pipe(
    map((jobs) => {
      const byStatus = this.emptySummaryBuckets();
      for (const job of jobs) {
        byStatus[job.status] = (byStatus[job.status] ?? 0) + 1;
      }

      const upcomingFollowUps = jobs.filter((job) => {
        if (!job.nextFollowUp) return false;
        return new Date(job.nextFollowUp) >= new Date();
      }).length;

      return {
        total: jobs.length,
        byStatus,
        upcomingFollowUps
      } satisfies JobSummary;
    })
  );

  private emptySummaryBuckets(): Record<JobStatus, number> {
    return {
      applied: 0,
      'phone-screen': 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      wishlist: 0
    };
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? `Request failed (${error.status})`;
    }
    return 'Unexpected error while talking to the API';
  }

  private captureError<T>(): MonoTypeOperatorFunction<T> {
    return catchError((error) => {
      this.errorSubject.next(this.toErrorMessage(error));
      return throwError(() => error);
    });
  }
}
