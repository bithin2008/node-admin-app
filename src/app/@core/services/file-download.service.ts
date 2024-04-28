import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
  export class FileDownloadService {
    constructor(private http: HttpClient) {}
  
    downloadFile(fileUrl: string): Observable<Blob> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });
  
      // Make an HTTP GET request to the absolute file URL.
      return this.http.get(fileUrl, {
        headers,
        responseType: 'blob' // This specifies that the response should be treated as a binary blob.
      });
    }
  }
  