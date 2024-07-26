import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Olympic } from '../models/Olympic';
import { Participation } from '../models/Participation';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  public olympics$: BehaviorSubject<Olympic[]> = new BehaviorSubject<Olympic[]>([]);

  constructor(private http: HttpClient) {}

  loadInitialData() {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((error, caught) => {
        // TODO: improve error handling
        console.error(error);
        // can be useful to end loading state and let the user know something went wrong
        //this.olympics$.next();
        return caught;
      })
    );
  }

  getOlympics() {
    return this.olympics$.asObservable();
  }

  // Le tableau des pays des jeux olympiques
  getCountry(): string[]{
    const olympics = this.olympics$.getValue();
    return olympics.map(olympicItem => olympicItem.country);
  }

  // Le nombre de pays participant aux jeux olympiques
  countCountries(): number{
    return this.olympics$.getValue().length;
  }


// Le tableau des villes des jeux olympiques
  getJOs(): string[]{
    const olympics = this.olympics$.getValue();
    var list: string[] = [];
    var c = 0;
    for(let key in olympics){
      const olympicData = olympics[key];
      for(let key2 in olympicData.participations){
        list[c] = olympics[key].participations[key2].city;
        c++;
      }
    }
    console.log(list);
    return list.filter((elem, index, self)=> {
      return index === self.indexOf(elem);
  })
  }


// Le nombre de médaille pour les participations d'un pays
  countMedalsNumber(participations: Participation[]): number {
    return participations.reduce((total, p) => total + p.medalsCount, 0);
  }
// Le tableaux de toutes les médailles pour tous les pays
  getMedals(): number[]{
    const olympics = this.olympics$.getValue();
    return olympics.map(olympicItem => this.countMedalsNumber(olympicItem.participations));
  }

  // Le nombre d'athlète pour les participations d'un pays
  countAthletesNumber(participations: Participation[]): number {
    return participations.reduce((total, p) => total + p.athleteCount, 0);
  }

  // Le tableaux de tous les athlètes pour tous les pays
  getAthletes(): number[]{
    const olympics = this.olympics$.getValue();
    return olympics.map(olympicItem => this.countAthletesNumber(olympicItem.participations));
  }

  // Les couleurs de la piechart
  getColors(count: number): string[]{
    const colors = [
      '#956065', '#b8cbe7', '#89a1db', '#793d52', '#9780a1', '#bfe0f1' 
    ];
    return colors.slice(0, count);
  }

}
