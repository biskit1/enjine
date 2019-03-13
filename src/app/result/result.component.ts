import { Component, OnInit } from '@angular/core';
import { Result, FileInfo } from '../result';
import { ResultsService } from '../results.service'


@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {
  // used to differentiate between bigger and smaller file for rendering
  smaller: Result[] = [];
  bigger: Result[] = [];

  // filenames
  fileName1:string;
  fileName2:string;

  // file information
  fileInfo: FileInfo[];
  fileInfo1: FileInfo;
  fileInfo2:FileInfo;

  constructor(private service: ResultsService) {
  
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

    // get array containing general file inforation
    this.fileInfo = this.service.getReuslts();

    // extract individual file information to store seperately for rendering 
    this.fileInfo1= this.fileInfo[0];
    this.fileInfo2 = this.fileInfo[1]
    this.fileName1 = this.fileInfo1.etfName;
    this.fileName2 = this.fileInfo2.etfName;
  }
}
