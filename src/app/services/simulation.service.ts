import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {

  constructor(private http: HttpClient) { }

  runSimulation(request: any): Observable<any> {
    return this.http.post<any>('http://localhost:8080/simulation/run-simulation', request);
  }

}
