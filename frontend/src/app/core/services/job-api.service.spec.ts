import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.tokens';
import type { Job } from '../models/job.model';
import { JobApiService } from './job-api.service';

describe('JobApiService', () => {
  let service: JobApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:4000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: API_BASE_URL, useValue: baseUrl }]
    });
    service = TestBed.inject(JobApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists jobs from the API and normalizes documents', () => {
    let result: Job[] = [];
    service.list().subscribe((jobs) => (result = jobs));

    const req = httpMock.expectOne(`${baseUrl}/jobs`);
    expect(req.request.method).toBe('GET');
    req.flush({
      jobs: [
        {
          _id: 'abc123',
          company: 'Acme',
          title: 'Engineer',
          status: 'applied',
          tags: ['angular']
        }
      ]
    });

    expect(result[0]).toEqual(
      jasmine.objectContaining({
        id: 'abc123',
        company: 'Acme',
        title: 'Engineer',
        status: 'applied',
        tags: ['angular']
      })
    );
  });

  it('creates a job and returns the normalized document', () => {
    let created: Job | undefined;
    service.create({
      company: 'Northwind',
      title: 'Fullstack Developer',
      status: 'applied',
      tags: []
    }).subscribe((job) => (created = job));

    const req = httpMock.expectOne(`${baseUrl}/jobs`);
    expect(req.request.method).toBe('POST');
    req.flush({
      job: {
        _id: 'job-1',
        company: 'Northwind',
        title: 'Fullstack Developer',
        status: 'applied',
        tags: []
      }
    });

    expect(created).toEqual(
      jasmine.objectContaining({
        id: 'job-1',
        company: 'Northwind',
        title: 'Fullstack Developer',
        status: 'applied',
        tags: []
      })
    );
  });

  it('updates job status', () => {
    let updated: Job | undefined;
    service.updateStatus('job-1', 'offer').subscribe((job) => (updated = job));

    const req = httpMock.expectOne(`${baseUrl}/jobs/job-1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'offer' });

    req.flush({
      job: {
        _id: 'job-1',
        company: 'Acme',
        title: 'Engineer',
        status: 'offer',
        tags: []
      }
    });

    expect(updated?.status).toBe('offer');
  });
});
