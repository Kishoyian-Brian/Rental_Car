import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  getPendingAgents(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pending-agents`);
  }

  approveAgent(agentId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/approve-agent/${agentId}`, {});
  }

  createAgent(agent: { name: string; email: string; password: string; phone?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-agent`, agent);
  }
}
