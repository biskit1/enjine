import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';

import { ChartData } from '../result';
import { ResultsService } from '../results.service'


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  chartData: ChartData;

  // properties for making chart
  chart = {
    type: 'bar'
  };
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: {};
  scrollbar: any;

  constructor(private service: ResultsService) {
  }

  ngOnInit() {
    // get data for chart
    this.chartData = this.service.getIntersectingData();

    // set chart properties
    this.chartOptions = {
      chart: {
        type: 'bar',
        height: (12 / 19 * 100) + '%'
      },
      title: {
        text: 'Percent Market Values'
      },
      subtitle: {
        text: this.service.getFileDate()
      },
      xAxis: {
        categories: this.chartData.chartNames,
        min: 0,
        max: 5,
        scrollbar: {
          enabled: true
        },
        title: {
          text: null
        },
        ticklength: 0,
        labels: {
          style: {
            fontSize: 15
          }
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: '% market value',
          style: {
            fontSize: 15
          }
        }
      },
      legend: {
        layout: 'vertical',
        backgroundColor: '#FFFFFF',
        align: 'top',
        verticalAlign: 'top',
        floating: false,
        shadow: true
      },
      tooltip: {
        shared: true,
        valueSuffix: ' %',
        followPointer: true
      },
      plotOptions: {
        grouping: true,
        shadow: false,
      },
      series: [
        {
          name: this.service.getNameBigger(),
          data: this.chartData.chartPercentBigger,
        },
        {
          name: this.service.getNameSmaller(),
          data: this.chartData.chartPercentSmaller,
        },
        {
          name: 'Difference in % martket value',
          data: this.chartData.chartPercentDif,
        }]
    };
  }
}

// implement mouse-scrolling functionality on chart - source: https://www.highcharts.com/forum/viewtopic.php?t=38506 and http://jsfiddle.net/02rnjnkx/
(function (H) {

  //internal functions
  function stopEvent(e) {
    if (e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      if (e.stopPropagation) {
        e.stopPropagation();
      }
      e.cancelBubble = true;
    }
  }

  H.addEvent(H.Chart, 'load', function (e) {
    var chart = e.target;

    // add the mousewheel event
    H.addEvent(chart.container, 'wheel', function (event) {

      var delta, extr, step, newMin, newMax, axis = chart.xAxis[0];
      var dataMax = chart.xAxis[0].dataMax,
        dataMin = chart.xAxis[0].dataMin,
        newExtrMin,
        newExtrMax;

      var e = chart.pointer.normalize(event);
      delta = e.detail || -(e.deltaY / 120);
      delta = delta < 0 ? 1 : -1;

      if (chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop)) {
        extr = axis.getExtremes();
        step = (extr.max - extr.min) / 5 * delta;

        if ((extr.min + step) <= dataMin) {
          newExtrMin = dataMin;
          newExtrMax = dataMin + (extr.max - extr.min);
        } else if ((extr.max + step) >= dataMax) {
          newExtrMin = dataMax - (extr.max - extr.min);
          newExtrMax = dataMax;
        } else {
          newExtrMin = extr.min + step;
          newExtrMax = extr.max + step;
        }

        axis.setExtremes(newExtrMin, newExtrMax, true, false);

      }

      stopEvent(event);
      return false;
    });
  });

}(Highcharts));
