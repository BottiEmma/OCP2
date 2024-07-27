import { Component, OnDestroy, OnInit } from '@angular/core';
import { take, Subscription, merge, fromEvent, map, of } from 'rxjs';
import { OlympicService } from './core/services/olympic.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  networkStatus: boolean = false;
  networkStatus$: Subscription = Subscription.EMPTY;
  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    this.olympicService.loadInitialData().pipe(take(1)).subscribe();
    this.checkNetworkStatus();
  }

  ngOnDestroy(): void {
    this.networkStatus$.unsubscribe();
  }

  // Pour prévenir l'utilisateur qu'il n'est plus connecté à internet
  checkNetworkStatus() {
    this.networkStatus = navigator.onLine;
    this.networkStatus$ = merge(
      of(null),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    )
    .pipe(map(() => navigator.onLine))
    .subscribe(status => {
      console.log('status', status);
      this.networkStatus = status;
    });
  }
}
