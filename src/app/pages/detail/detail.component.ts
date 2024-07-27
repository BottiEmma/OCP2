import { Component, ElementRef, Input, numberAttribute, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Olympic } from 'src/app/core/models/Olympic';
import * as Chartist from 'chartist';
import { BehaviorSubject, tap } from 'rxjs';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit {
  sliceIndex: number = 0;
  public olympicsData: BehaviorSubject<Olympic[]> = new BehaviorSubject<Olympic[]>([]);
  countryName: string = '';
  entries: number = 0;
  medals: number = 0;
  athletes: number = 0;
  public lineChartData: Chartist.LineChartData = {
    labels:[],
    series:[]
  }
  public lineChartOptions?: Chartist.LineChartOptions;
  public responsiveOptions?: Chartist.ResponsiveOptions;
  @ViewChild('chartContainer', { static: true }) chartContainer?: ElementRef;

constructor(private olympicService: OlympicService, private route: ActivatedRoute, private router: Router){}

  ngOnInit(): void {
    this.sliceIndex = +this.route.snapshot.paramMap.get('id')!;
    this.olympicService.loadInitialData().pipe(tap(data => this.olympicsData.next(data))).subscribe(() => {
      if(this.sliceIndex>=this.olympicsData.getValue().length || isNaN(this.sliceIndex)){
        this.router.navigate(['notfound', this.sliceIndex]);
      } else{
      this.countryName = this.getCountryName();
      this.medals = this.olympicService.getMedals()[this.sliceIndex];
      this.athletes = this.olympicService.getAthletes()[this.sliceIndex];
      const labels = this.getParticipationsYear();
      const series = this.getParticipationsMedals();
      this.entries = series.length;
      console.log(series);
      console.log(labels);
      this.lineChartData = {
        labels: labels,
        series: [series]
      };
      this.lineChartOptions = {
        low: 0,
        axisY: {
          onlyInteger: true,
        },
        lineSmooth: Chartist.Interpolation.none(),
        showPoint: false,
        fullWidth: true,
      };
      this.responsiveOptions = [
        ['screen and (min-width: 640px)', {
          chartPadding: 30
        }],
        ['screen and (min-width: 1024px)', {
          chartPadding: 20
        }]
      ];
      this.initialiseChart();
    }

    });
  }

  // Initialise la chart
  initialiseChart(): void {
    if (this.lineChartData && this.lineChartOptions) {
      const chart = new Chartist.LineChart(this.chartContainer?.nativeElement, this.lineChartData, this.lineChartOptions);
    }
  }

  // Récupère le nom du pays
  getCountryName(): string{
    const olympics = this.olympicsData.getValue()[this.sliceIndex];
    return olympics.country;
  }

  // Récupère le tableau des années de chaque participation
  getParticipationsYear(): number[]{
    const olympics = this.olympicsData.getValue()[this.sliceIndex].participations;
    return olympics.map(olympicItem => olympicItem.year);
  }

  // Récupère le tableau des médailles de chaque participation
  getParticipationsMedals(): number[]{
    const olympics = this.olympicsData.getValue()[this.sliceIndex].participations;
    return olympics.map(olympicItem => olympicItem.medalsCount);
  }

}
