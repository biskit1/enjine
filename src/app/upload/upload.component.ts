import { Component, OnInit } from '@angular/core';
import { ResultsService } from '../results.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  // final array of user-selected files to be sent to service worker
  selectedFiles: File[] = [];

  constructor(private service: ResultsService, private router: Router) { }

  ngOnInit() {
  }

  // save user-selected files locally to handle file removal/deletion before sending to parse 
  processFile(fileInput: any) {
    for (var i = 0; i < fileInput.files.length; i++) {
      this.selectedFiles.push(fileInput.files[i]);
    }
  }

  // send final selected files to service worker for parsing
  uploadFiles() {
    this.service.uploadFiles(this.selectedFiles);
  }

  // check that uploaded file ends with appropriate file extention 
  goodFile() {
    if (this.selectedFiles[0].name.endsWith(".csv") && this.selectedFiles[1].name.endsWith(".csv")) {
      return true;
    }
    else {
      return false;
    }
  }
}

