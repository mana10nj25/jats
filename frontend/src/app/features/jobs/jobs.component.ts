import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { JobStatus } from '../../core/models/job.model';
import { JobStoreService } from '../../core/services/job-store.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf, AsyncPipe, DatePipe],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss'
})
export class JobsComponent {
  private readonly jobStore = inject(JobStoreService);
  private readonly fb = inject(FormBuilder);

  readonly jobs$ = this.jobStore.jobs$;
  readonly loading$ = this.jobStore.loading$;
  readonly error$ = this.jobStore.error$;
  readonly statusOptions: JobStatus[] = [
    'applied',
    'phone-screen',
    'interview',
    'offer',
    'rejected',
    'wishlist'
  ];
  private readonly deletingIds = new Set<string>();
  private readonly updatingStatus = new Set<string>();
  saving = false;

  readonly jobForm = this.fb.nonNullable.group({
    company: ['', [Validators.required]],
    title: ['', [Validators.required]],
    status: ['applied' as JobStatus],
    dateApplied: [''],
    nextFollowUp: ['']
  });

  async submit(): Promise<void> {
    if (this.jobForm.invalid || this.saving) return;

    this.saving = true;
    try {
      await firstValueFrom(
        this.jobStore.addJob({
          ...this.jobForm.getRawValue(),
          dateApplied: this.jobForm.value.dateApplied ?? undefined,
          nextFollowUp: this.jobForm.value.nextFollowUp ?? undefined,
          tags: []
        })
      );
      this.jobForm.reset({ status: 'applied' });
    } catch {
      // Errors are emitted via the shared store observable; no-op here.
    } finally {
      this.saving = false;
    }
  }

  async removeJob(id: string): Promise<void> {
    if (this.deletingIds.has(id)) return;

    this.deletingIds.add(id);
    try {
      await firstValueFrom(this.jobStore.removeJob(id));
    } catch {
      // Errors are emitted via the shared store observable; no-op here.
    } finally {
      this.deletingIds.delete(id);
    }
  }

  async changeStatus(jobId: string, status: JobStatus): Promise<void> {
    if (this.updatingStatus.has(jobId)) return;

    this.updatingStatus.add(jobId);
    try {
      await firstValueFrom(this.jobStore.updateJobStatus(jobId, status));
    } catch {
      // Errors are emitted via the shared store observable; no-op here.
    } finally {
      this.updatingStatus.delete(jobId);
    }
  }

  statusLabel(status: JobStatus): string {
    switch (status) {
      case 'applied':
        return 'Applied';
      case 'phone-screen':
        return 'Phone Screen';
      case 'interview':
        return 'Interviewing';
      case 'offer':
        return 'Offer';
      case 'rejected':
        return 'Rejected';
      case 'wishlist':
        return 'Wishlist';
      default:
        return status;
    }
  }

  retry(): void {
    this.jobStore.clearError();
    this.jobStore.refresh();
  }

  isDeleting(id: string): boolean {
    return this.deletingIds.has(id);
  }

  isStatusUpdating(id: string): boolean {
    return this.updatingStatus.has(id);
  }
}
