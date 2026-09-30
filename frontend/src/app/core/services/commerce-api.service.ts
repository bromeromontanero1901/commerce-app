import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProcessResult, QuarantineRecord, UploadResult } from '../models/commerce.model';

@Injectable({ providedIn: 'root' })
export class CommerceApiService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  upload(file: File): Observable<UploadResult> {
    const body = new FormData();
    body.append('file', file, file.name);
    return this.http.post<UploadResult>(`${this.url}/upload`, body);
  }

  process(processDate: string): Observable<ProcessResult> {
    return this.http.post<ProcessResult>(`${this.url}/process`, { processDate });
  }

  getQuarantine(): Observable<QuarantineRecord[]> {
    return this.http.get<QuarantineRecord[]>(`${this.url}/quarantine`);
  }
}
