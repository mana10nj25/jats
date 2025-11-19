import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { JobStatus } from '../../core/models/job.model';
import { JobStoreService } from '../../core/services/job-store.service';

const STATUS_LABELS: Record<JobStatus, string> = {
  applied: 'Applied',
  'phone-screen': 'Phone Screen',
  interview: 'Interviews',
  offer: 'Offers',
  rejected: 'Rejected',
  wishlist: 'Wishlist'
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly jobStore = inject(JobStoreService);

  readonly summary$ = this.jobStore.summary$;
  readonly jobs$ = this.jobStore.jobs$;

  readonly statusKeys = Object.keys(STATUS_LABELS) as JobStatus[];

  readonly upcomingFollowUps$ = this.jobs$.pipe(
    map((jobs) =>
      jobs
        .filter((job) => job.nextFollowUp)
        .sort((a, b) => {
          const aDate = a.nextFollowUp ?? '';
          const bDate = b.nextFollowUp ?? '';
          return aDate.localeCompare(bDate);
        })
        .slice(0, 3)
    )
  );

  readonly recentApplications$ = this.jobs$.pipe(
    map((jobs) =>
      jobs
        .sort((a, b) => (b.dateApplied ?? '').localeCompare(a.dateApplied ?? ''))
        .slice(0, 5)
    )
  );

  statusLabel = (status: JobStatus): string => STATUS_LABELS[status];
}
