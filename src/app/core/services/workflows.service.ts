import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Workflow, WorkflowActionType, WorkflowRun, WorkflowTriggerType } from '../models';

export interface WorkflowActionInput {
  type: WorkflowActionType;
  config: Record<string, unknown>;
}

export interface CreateWorkflowPayload {
  name: string;
  isActive?: boolean;
  trigger: { type: WorkflowTriggerType; conditions?: Record<string, unknown> };
  actions: WorkflowActionInput[];
}

@Injectable({ providedIn: 'root' })
export class WorkflowsService {
  private readonly http = inject(HttpClient);

  findAll(businessId: string): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(`${environment.apiUrl}/businesses/${businessId}/workflows`);
  }

  create(businessId: string, payload: CreateWorkflowPayload): Observable<Workflow> {
    return this.http.post<Workflow>(`${environment.apiUrl}/businesses/${businessId}/workflows`, payload);
  }

  update(businessId: string, workflowId: string, payload: Partial<CreateWorkflowPayload>): Observable<Workflow> {
    return this.http.patch<Workflow>(`${environment.apiUrl}/businesses/${businessId}/workflows/${workflowId}`, payload);
  }

  setActive(businessId: string, workflowId: string, active: boolean): Observable<Workflow> {
    const action = active ? 'activate' : 'deactivate';
    return this.http.patch<Workflow>(`${environment.apiUrl}/businesses/${businessId}/workflows/${workflowId}/${action}`, {});
  }

  remove(businessId: string, workflowId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/businesses/${businessId}/workflows/${workflowId}`);
  }

  findRuns(businessId: string, workflowId: string): Observable<WorkflowRun[]> {
    return this.http.get<WorkflowRun[]>(`${environment.apiUrl}/businesses/${businessId}/workflows/${workflowId}/runs`);
  }
}
