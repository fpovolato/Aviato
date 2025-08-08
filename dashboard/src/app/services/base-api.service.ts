import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BaseApiService {
  protected apiUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
      withCredentials: true,
    });
  }

  protected post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, {
      withCredentials: true,
    });
  }

  protected put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, {
      withCredentials: true,
    });
  }

  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, {
      withCredentials: true,
    });
  }

  protected patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, data, {
      withCredentials: true,
    });
  }
}
