import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Result, FileInfo } from './result'
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  // storage for each files rows
  private data1: Result[] = [];
  private data2: Result[] = [];

  // array containing data1 and data2. used to obtain differences between the two files holdings 
  private data = [];

  // differentiate between bigger and smaller file for future html rendering
  private bigger: Result[] = [];
  private smaller: Result[] = [];

  // general information on each file
  private fileInfo: FileInfo[] = [];


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
      
      // save file names
      obj1.etfName = linesF1[0];
      obj2.etfName = linesF2[0];

      // save file date
      obj1.date = linesF1[3];
      obj2.date = linesF2[3];

      // save file content (as text)
      obj1.file = fileContents[0];
      obj2.file = fileContents[1];

      // store file information
      this.fileInfo.push(Object.assign({}, obj1));
      this.fileInfo.push(Object.assign({}, obj2));

      // extract row columns from each line. takes in a location to store each files row and columns
      this.parseLines(linesF1, this.data1); 
      this.parseLines(linesF2, this.data2);
    }).then(() => {
      // get differences 
      this.getDifferences(this.data);
      this.router.navigate(['/results']);
    });
  }

  // assumes particular csv parsing. iterate through lines of the file and store columns in respective fileData location
  private parseLines(lines, fileData): void {
    var obj = { name: '', percent: null, intersection: false, smallerElem: -1, difPercent: 0.00 };

    for (var i = 6; i < lines.length; i++) {
      if (lines[i] !== "") {
        var currentline = lines[i].split(",");

        obj.name = currentline[0];
        obj.percent = parseFloat(currentline[1].slice(4)).toFixed(6);

        fileData.push(Object.assign({}, obj));
      }
    }

    this.data.push(fileData);

  }

  // get % market value differences for intersecting holdings
  private getDifferences(files) {
    // identify smaller file for more efficient looping and for use when rendering final chart
    if (files[0].length <= files[1].length){
      this.smaller = files[0];
      this.fileInfo[0].bigger = false;
      this.bigger = files[1];
      this.fileInfo[1].bigger = true;
    }
    else {
      this.smaller = files[1];
      this.fileInfo[1].bigger = false;
      this.bigger = files[0];
      this.fileInfo[0].bigger = true;
    }

    // identify intersecting holdings and update Result properties
    for (var i = 0; i < this.bigger.length; i++) {
      var elem = this.smaller.findIndex(item => item.name === this.bigger[i].name);

      if (elem != -1) {
        var dif = Math.abs(this.smaller[elem].percent - this.bigger[i].percent).toPrecision(6);

        this.bigger[i].intersection = true;
        this.smaller[elem].intersection = true;

        this.bigger[i].smallerElem = elem;
        this.bigger[i].difPercent = parseFloat(Number(dif).toFixed(6));
        this.smaller[elem].difPercent = parseFloat(Number(dif).toFixed(6));
      }
      else {
        this.bigger[i].difPercent = this.bigger[i].percent;
      }
    }
  }

  // return array with each files information
  public getReuslts():FileInfo[]{
    return this.fileInfo;
  }


  public getFirstFileName(): string {
    return this.fileInfo[0].etfName;
  }
  public getSecondFileName():string {
    return this.fileInfo[1].etfName;
  }

  public getSmall(): any {
    const smallObs = new Observable(observer => {
      observer.next(this.smaller);
    });

    return smallObs;
  }

  public getBig(): any {
    const bigObs = new Observable(observer => {
      observer.next(this.bigger);
    });

    return bigObs;
  }

}
