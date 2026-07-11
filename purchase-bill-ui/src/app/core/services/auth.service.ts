import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7105/api/auth/login';
  private _isLoggedIn = new BehaviorSubject<boolean>(this.hasSession());
  public isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      tap((response) => {
        if (response?.success) {
          sessionStorage.setItem('pb_session', '1');
          this._isLoggedIn.next(true);
        }
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('pb_session');
    this._isLoggedIn.next(false);
    this.router.navigate(['/login']);
  }

  private hasSession(): boolean {
    return sessionStorage.getItem('pb_session') === '1';
  }

  getToken(): string | null {
    return sessionStorage.getItem('pb_session');
  }
}
