import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Olympic } from 'src/app/core/models/Olympic';
import { ChartistModule, Configuration } from 'ng-chartist';
import * as Chartist from 'chartist';
import { tap } from 'rxjs';
import { Participation } from 'src/app/core/models/Participation';
import { LineChart } from 'chartist';
import ChartistTooltip from 'chartist-plugin-tooltips-updated';
import { hover } from 'chartist-hover';
import * as $ from 'jquery';
import { Router } from '@angular/router';




@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // public olympics$: Observable<Olympic[]>;

  // J'utilise BehaviorSubject pour gerer l'état des données de Olympic
  public olympics$: BehaviorSubject<Olympic[]> = new BehaviorSubject<Olympic[]>([]);
  public numberCountry: number = 0;
  public numberJOs: number = 0;
  // On initialise la configuration du graphique à vide pour pouvoir le remplir après
  public pieChartData: Chartist.PieChartData = {
    labels: [],
    series: []
  };
  public pieChartOptions?: Chartist.PieChartOptions;
  public responsiveOptions?: Chartist.ResponsiveOptions;
  public pieChartPlugins?: Chartist.Plugin;

  @ViewChild('chartContainer', { static: true }) chartContainer?: ElementRef;
  @ViewChild('tooltip', { static: true }) tooltip?: ElementRef;


  constructor(private olympicService: OlympicService, private router: Router) {
    //this.olympics$ = this.olympicService.getOlympics();
  }

  ngOnInit(): void {
    // this.olympicService.loadInitialData().subscribe();
    this.olympicService.loadInitialData().pipe(tap(data => this.olympics$.next(data))).subscribe(() => {
      const labels = this.olympicService.getCountry();
      const series = this.olympicService.getMedals();
      this.numberCountry = this.olympicService.countCountries();
      this.numberJOs = this.olympicService.getJOs().length;

        this.pieChartData = {
          labels: labels,
          series: series
        };

        this.pieChartOptions = {
          labelOffset: 100,
          labelDirection: 'explode'

        };

        this.responsiveOptions = [
          ['screen and (min-width: 640px)', {
            chartPadding: 30
          }],
          ['screen and (min-width: 1024px)', {
            chartPadding: 20
          }]
        ];
        this.pieChartPlugins = ChartistTooltip();
        this.initialiseChart();
      });
    }

  initialiseChart(): void {
    if (this.pieChartData && this.pieChartOptions && this.responsiveOptions) {
      const chart = new Chartist.PieChart(this.chartContainer?.nativeElement, this.pieChartData, this.pieChartOptions, this.responsiveOptions);
      const tooltip = document.getElementById('tooltip');

      chart.on('draw', (data) => {
        if (data.type === 'slice') {
          const colors = this.olympicService.getColors(this.pieChartData.series.length);
          const value = this.olympicService.getMedals()[data.index];
          const country = this.olympicService.getCountry()[data.index];

          data.element.attr({ 
            style: `fill: ${colors[data.index]}`
        });
        $(data.element.getNode()).on('mouseover', (event) => {
          if (tooltip) {
              const value = $(data.element.getNode()).attr('ct:value');
              tooltip.innerHTML = `${value}`;
              tooltip.style.display = 'block';
              tooltip.style.left = `${event.pageX - 20}px`;
              tooltip.style.top = `${event.pageY - 55}px`;
          }
      });
        $(data.element.getNode()).on('mousemove', (event) => {
          if (tooltip) {
              tooltip.style.left = `${event.pageX - 20}px`;
              tooltip.style.top = `${event.pageY - 55}px`;
          }
      });
      $(data.element.getNode()).on('mouseout', () => {
          if (tooltip) {
              tooltip.style.display = 'none';
          }
      });
        $(data.element.getNode()).on('mouseover',   function() {
        console.log('Mouseover event triggered');
        console.log('Value:', value);
        $('#tooltip').html(country + '<br>' + '' + value).show();
        });
      
        $(data.element.getNode()).on('mouseout', function() {
          $('#tooltip').html('<b>Selected Value:</b>').hide();
        });
        data.element.getNode().addEventListener('click', () => {
          this.router.navigate(['/detail', data.index]);
        });

        }
      }); 

    }
  }

  
}
