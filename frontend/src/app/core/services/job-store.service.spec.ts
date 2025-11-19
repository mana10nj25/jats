import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Job } from '../models/job.model';
import { JobApiService } from './job-api.service';
import { JobStoreService } from './job-store.service';

describe('JobStoreService', () => {
  let service: JobStoreService;
  let api: jasmine.SpyObj<JobApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<JobApiService>('JobApiService', [
      'list',
      'create',
      'update',
      'updateStatus',
      'delete'
    ]);
    api.list.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [{ provide: JobApiService, useValue: api }]
    });

    service = TestBed.inject(JobStoreService);
  });

  it('hydrates the store with API jobs during refresh', () => {
    const job: Job = {
      id: 'abc123',
      company: 'Acme',
      title: 'Engineer',
      status: 'applied',
      tags: []
    };
    api.list.and.returnValue(of([job]));

    let latest: Job[] = [];
    service.jobs$.subscribe((value) => (latest = value));

    service.refresh();

    expect(api.list).toHaveBeenCalled();
    expect(latest).toEqual([job]);
  });

  it('surfaces API failures via the error stream', () => {
    api.list.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server error' }))
    );

    let errorMessage: string | null = null;
    service.error$.subscribe((value) => (errorMessage = value));

    service.refresh();

    expect(errorMessage).toContain('Request failed');
  });

  it('stores newly created jobs at the top of the list', () => {
    const job: Job = {
      id: 'job-1',
      company: 'Northwind',
      title: 'Fullstack Developer',
      status: 'applied',
      tags: []
    };
    api.create.and.returnValue(of(job));

    let latest: Job[] = [];
    service.jobs$.subscribe((value) => (latest = value));

    service
      .addJob({
        company: job.company,
        title: job.title,
        status: job.status,
        tags: []
      })
      .subscribe();

    expect(api.create).toHaveBeenCalled();
    expect(latest[0]).toEqual(job);
  });

  it('updates job status and mutates store', () => {
    const job: Job = {
      id: 'job-1',
      company: 'Northwind',
      title: 'Fullstack Developer',
      status: 'applied',
      tags: []
    };
    api.list.and.returnValue(of([job]));
    service.refresh();

    api.updateStatus.and.returnValue(of({ ...job, status: 'offer' }));

    let latest: Job[] = [];
    service.jobs$.subscribe((value) => (latest = value));

    service.updateJobStatus(job.id, 'offer').subscribe();

    expect(api.updateStatus).toHaveBeenCalledWith('job-1', 'offer');
    expect(latest[0].status).toBe('offer');
  });
});
