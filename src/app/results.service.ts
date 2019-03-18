import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Result, FileInfo, ChartData } from './result'
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  // storage for bigger and smaller file 
  private dataSmaller: Result[] = [];
  private dataBigger: Result[] = [];

  // general information on each file
  private fileInfo: FileInfo[] = [];

  // content stored differently for rendering chart //todo: figure out how to refactor.. shouldnt need both dataSmaller/dataBigger AND chartData... 
  private chartData: ChartData = { chartNames: [], chartPercentBigger: [], chartPercentSmaller: [], chartPercentDif: [] };

  constructor(private router: Router) { }

  // load and parse file information
  public uploadFiles(files: File[]): void {
    // keep track of file1 vs file2
    var obj1 = { etfName: '', bigger: false, file: <any>[], date: '', size: 0 };
    var obj2 = { etfName: '', bigger: false, file: <any>[], date: '', size: 0 };

    // load/read file content
    let promises = [];
    for (let file of files) {
      let filePromise = new Promise(resolve => {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result);
      });
      promises.push(filePromise);
    }
    Promise.all(promises).then(fileContents => {
      // extract lines for file1 and file2
      let linesF1 = fileContents[0].split('\n');
      let linesF2 = fileContents[1].split('\n');

      // save bigger/smaller status
      obj1.bigger = linesF1.length > linesF2.length ? true : false;
      obj2.bigger = linesF2.length > linesF1.length ? true : false;

      // save file names
      obj1.etfName = linesF1[0];
      obj2.etfName = linesF2[0];

      // save file date
      obj1.date = linesF1[3];
      obj2.date = linesF2[3];

      // save file content (as text) // remove .file property?
      obj1.file = fileContents[0];
      obj2.file = fileContents[1];

      // store file information
      this.fileInfo.push(Object.assign({}, obj1));
      this.fileInfo.push(Object.assign({}, obj2));

      // extract row columns from each line. takes in a location to store each files row and columns
      this.parseLines(linesF1, obj1.bigger ? this.dataBigger : this.dataSmaller);
      this.parseLines(linesF2, obj2.bigger ? this.dataBigger : this.dataSmaller);
    }).then(() => {
      // get % market value differences for intersecting holdings 
      this.getDifferences();

      // render results page
      this.router.navigate(['/results']);
    });
  }

  // assumes particular csv parsing. iterate through lines of the file and store columns in respective fileData location
  private parseLines(lines: any, fileData: Result[]): void {
    var obj = { name: '', percent: 0, intersection: false, smallerElem: -1, difPercent: 0.00 };

    for (var i = 6; i < lines.length; i++) {
      if (lines[i] !== "") {
        var currentline = lines[i].split(",");

        obj.name = currentline[0];
        obj.percent = parseFloat(currentline[1].slice(4));

        // check for duplicate holdings
        let exists = fileData.findIndex(item => item.name === currentline[0]);
        if (exists != -1) {
          obj.percent = fileData[exists].percent + obj.percent;
          fileData.splice(exists, 1);
        }
        fileData.push(Object.assign({}, obj));
      }
    }
  }

  // get % market value differences for intersecting holdings
  private getDifferences() {
    // identify intersecting holdings and update Result properties
    for (var i = 0; i < this.dataBigger.length; i++) {
      var elem = this.dataSmaller.findIndex(item => item.name === this.dataBigger[i].name);

      if (elem != -1) {
        var dif = Math.abs(this.dataSmaller[elem].percent - this.dataBigger[i].percent).toPrecision(6);

        this.dataBigger[i].intersection = true;
        this.dataSmaller[elem].intersection = true;

        this.dataBigger[i].smallerElem = elem;
        this.dataSmaller[elem].smallerElem = elem;
        this.dataBigger[i].difPercent = parseFloat(Number(dif).toFixed(6));
        this.dataSmaller[elem].difPercent = parseFloat(Number(dif).toFixed(6));
      }
      else {
        this.dataBigger[i].difPercent = this.dataBigger[i].percent;
      }
    }
  }

  // store data for rendering chart in chartData in separate arrays
  public getIntersectingData(): any {
    for (var i = 0; i < this.dataBigger.length; i++) {
      if (this.dataBigger[i].smallerElem != -1) {
        this.chartData.chartPercentSmaller.push(this.dataSmaller[this.dataBigger[i].smallerElem].percent);
        this.chartData.chartPercentDif.push(this.dataBigger[i].difPercent);
      }
      else {
        this.chartData.chartPercentSmaller.push(0);
        this.chartData.chartPercentDif.push(this.dataBigger[i].percent);
      }

      this.chartData.chartNames.push(this.dataBigger[i].name);
      this.chartData.chartPercentBigger.push(this.dataBigger[i].percent);
    }

    for (var i = 0; i < this.dataSmaller.length; i++) {
      if (this.dataSmaller[i].smallerElem == -1) {
        this.chartData.chartNames.push(this.dataSmaller[i].name);
        this.chartData.chartPercentBigger.push(0);
        this.chartData.chartPercentSmaller.push(this.dataSmaller[i].percent);
        this.chartData.chartPercentDif.push(this.dataSmaller[i].percent);
      }
    }

    return this.chartData;
  }

  public getNameBigger(): string {
    return this.fileInfo[0].bigger ? this.fileInfo[0].etfName : this.fileInfo[1].etfName;
  }

  public getNameSmaller(): string {
    return this.fileInfo[0].bigger ? this.fileInfo[1].etfName : this.fileInfo[0].etfName;
  }

  public getFileDate(): string {
    return this.fileInfo[1].date;
  }

  // return smaller files data
  public getSmall(): any {
    const smallObs = new Observable(observer => {
      observer.next(this.dataSmaller);
    });

    return smallObs;
  }

  // return larger files data
  public getBig(): any {
    const bigObs = new Observable(observer => {
      observer.next(this.dataBigger);
    });

    return bigObs;
  }

}
