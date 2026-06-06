import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// model
import { AssetMetadata, ApiResponse } from '../../models/asset.model';



@Injectable({
  providedIn: 'root',
})
export class AssetService {
  // Endpoint backend
  private apiUrl = 'http://localhost:3000/api';

  private http = inject(HttpClient);

  // call API
  organizeAssets(assetInput: string): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(`${this.apiUrl}/organize-assets`, { assetInput })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Xử lý lỗi
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Lỗi phía client
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Lỗi phía server
      errorMessage = `Server-side error: ${error.status} - ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
