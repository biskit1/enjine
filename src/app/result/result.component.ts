import { Component, OnInit } from '@angular/core';
import { Result } from '../result';
import { ResultsService } from '../results.service'
import { Router } from '@angular/router';


@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  // used to differentiate between bigger and smaller file for rendering
  smaller: Result[] = [];
  bigger: Result[] = [];

  constructor(public service: ResultsService, private router: Router) {
  }

  ngOnInit() {
    // get data for bigger and smaller file
    const smObs = this.service.getSmall();
    smObs.subscribe((small: Result[]) => {
      this.smaller = small;
    });

    const bigObs = this.service.getBig();
    bigObs.subscribe((big: Result[]) => {
      this.bigger = big;
    });
  }
}
