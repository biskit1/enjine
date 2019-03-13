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
  selectedFiles:File[] = [];

  
  constructor(private service: ResultsService, private router: Router) { }

  ngOnInit() {
  }

  // save user-selected files locally to handle file removal/deletion before sending to parse 
  processFile(fileInput: any) {
    for (var i = 0; i < fileInput.files.length; i++){
      this.selectedFiles.push(fileInput.files[i]);
    }
  }

  // send final selected files to service worker for parsing
  uploadFiles(files: File[]) {
    this.service.uploadFiles(this.selectedFiles);
  }
}

