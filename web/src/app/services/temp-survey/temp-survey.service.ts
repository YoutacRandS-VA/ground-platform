import {Injectable} from '@angular/core';
import {Survey} from 'app/models/survey.model';
import {DataStoreService} from '../data-store/data-store.service';
import {BehaviorSubject, Observable, firstValueFrom} from 'rxjs';
import {LocationOfInterest} from 'app/models/loi.model';
import {List} from 'immutable';
import {Job} from 'app/models/job.model';
import { Task } from 'app/models/task/task.model';
import { LocationOfInterestService } from '../loi/loi.service';

@Injectable({
  providedIn: 'root',
})
export class TempSurveyService {
  private tempSurvey$$!: BehaviorSubject<Survey>;
  private tempLois$$!: BehaviorSubject<List<LocationOfInterest>>;

  private tempSurvey!: Survey;
  private tempLois!: List<LocationOfInterest>;

  constructor(private dataStore: DataStoreService) {}

  async init(id: string) {
    this.tempSurvey = await firstValueFrom(this.dataStore.loadSurvey$(id));
    this.tempSurvey$$ = new BehaviorSubject<Survey>(this.tempSurvey);

    this.tempLois = await firstValueFrom(this.dataStore.lois$({id} as Survey));
    this.tempLois$$ = new BehaviorSubject<List<LocationOfInterest>>(
      this.tempLois
    );
  }

  getTempSurvey(): Survey {
    return this.tempSurvey$$.getValue();
  }

  getTempSurvey$(): Observable<Survey> {
    return this.tempSurvey$$.asObservable();
  }

  getTempLois(): List<LocationOfInterest> {
    return this.tempLois$$.getValue();
  }

  getTempLoisByJobId(jobId: string): List<LocationOfInterest> {
    const lois = this.getTempLois().filter(loi => loi.jobId === jobId);

    return LocationOfInterestService.getLoisWithNames(lois);
  }

  getTempLois$(): Observable<List<LocationOfInterest>> {
    return this.tempLois$$.asObservable();
  }

  addOrUpdateJob(job: Job): void {
    const currentSurvey = this.tempSurvey$$.getValue();

    if (job.index === -1) {
      const index = currentSurvey.jobs.size;
      job = job.copyWith({index});
    }

    this.tempSurvey$$.next(
      new Survey(
        currentSurvey.id,
        currentSurvey.title,
        currentSurvey.description,
        currentSurvey.jobs.set(job.id, job),
        currentSurvey.acl
      )
    );
  }

  deleteJob(job: Job): void {
    const currentSurvey = this.tempSurvey$$.getValue();

    this.tempSurvey$$.next(
      new Survey(
        currentSurvey.id,
        currentSurvey.title,
        currentSurvey.description,
        currentSurvey.jobs.remove(job.id),
        currentSurvey.acl
      )
    );
  }

  addOrUpdateTasks(
    jobId: string,
    tasks: List<Task>
  ): void {
    const currentSurvey = this.tempSurvey$$.getValue();
    const currentJob = currentSurvey.jobs.get(jobId)

    if (currentJob) {
      const job = currentJob?.copyWith({tasks: this.dataStore.convertTasksListToMap(tasks)})

      this.tempSurvey$$.next(
        new Survey(
          currentSurvey.id,
          currentSurvey.title,
          currentSurvey.description,
          currentSurvey.jobs.set(job.id, job),
          currentSurvey.acl
        )
      );
    }
  }
}
