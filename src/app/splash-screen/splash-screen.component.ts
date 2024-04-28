import { Component, OnInit } from '@angular/core';
import { CommonService } from '../@core/services/common.service';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {

  constructor(private commonService: CommonService,) { 
    this.commonService.setTitle('Project');
  }
  public splashStepper={
    step1:true,
    step2:false,
    step3:false,
    step4:false,
    step5:false
  }as any
  ngOnInit(): void {
    //this.ekUpload()
  }
  splashNext(key: any) {
    this.splashStepper[key] = false; // Set the current step to false
    const nextKey = `step${Number(key.slice(4)) + 1}`; // Get the key for the next step
    this.splashStepper[nextKey] = true; // Set the next step to true
  }
  
  splashPrev(key: any) {
    this.splashStepper[key] = false; // Set the current step to false
    const prevKey = `step${Number(key.slice(4)) - 1}`; // Get the key for the previous step
    this.splashStepper[prevKey] = true; // Set the previous step to true
  }

 /*   ekUpload() {
    console.log('ekUpload');
    
    var fileSelect:any = document.getElementById('file-upload'),
    fileDrag:any = document.getElementById('file-drag'),
    submitButton:any = document.getElementById('submit-button');

    function Init() {
     
      fileSelect.addEventListener('change', fileSelectHandler, false);
  
      // Is XHR2 available?
      var xhr = new XMLHttpRequest();
      if (xhr.upload) {
        // File Drop
        fileDrag.addEventListener('dragover', fileDragHover, false);
        fileDrag.addEventListener('dragleave', fileDragHover, false);
        fileDrag.addEventListener('drop', fileSelectHandler, false);
      }
    }
  
    function fileDragHover(e:any) {
      var fileDrag:any = document.getElementById('file-drag');
  
      e.stopPropagation();
      e.preventDefault();
  
      fileDrag.className = (e.type === 'dragover' ? 'hover' : 'modal-body file-upload');
    }
  
    function fileSelectHandler(e:any) {
      // Fetch FileList object
      var files = e.target.files || e.dataTransfer.files;
  
      // Cancel event and hover styling
      fileDragHover(e);
  
      // Process all File objects
      for (var i = 0, f; f = files[i]; i++) {
        parseFile(f);
        uploadFile(f);
      }
    }
  
    // Output
    function output(msg:any) {
      // Response
      var m:any = document.getElementById('messages');
      m.innerHTML = msg;
    }
  
    function parseFile(file:any) {
  
      console.log(file.name);
      output(
        '<strong>' + encodeURI(file.name) + '</strong>'
      );
  
      // var fileType = file.type;
      // console.log(fileType);
      var imageName = file.name;
  
      var isGood = (/\.(?=gif|jpg|png|jpeg|webp)/gi).test(imageName);
       const fileImage:any= document.getElementById('file-image')
       const notimage:any= document.getElementById('notimage')
       const start:any=  document.getElementById('start')
       const response:any=  document.getElementById('response')
       const fileUploadForm:any=  document.getElementById("file-upload-form")
      if (isGood) {
        start.classList.add("hidden");
        response.classList.remove("hidden");
        notimage.classList.add("hidden");
        // Thumbnail Preview
        fileImage.classList.remove("hidden");
        fileImage.src = URL.createObjectURL(file);
      }
      else {
        fileImage.classList.add("hidden");
        notimage.classList.remove("hidden");
        start.classList.remove("hidden");
        response.classList.add("hidden");
        fileUploadForm.reset();
      }
    }
  
    function setProgressMaxValue(e:any) {
      var pBar:any = document.getElementById('file-progress');
  
      if (e.lengthComputable) {
        pBar.max = e.total;
      }
    }
  
    function updateFileProgress(e:any) {
      var pBar:any = document.getElementById('file-progress');
  
      if (e.lengthComputable) {
        pBar.value = e.loaded;
      }
    }
  
    function uploadFile(file:any) {
  
      var xhr = new XMLHttpRequest(),
        fileInput = document.getElementById('class-roster-file'),
        pBar:any = document.getElementById('file-progress'),
        fileSizeLimit = 1024; // In MB
      if (xhr.upload) {
        // Check if file is less than x MB
        if (file.size <= fileSizeLimit * 1024 * 1024) {
          // Progress bar
          pBar.style.display = 'inline';
          xhr.upload.addEventListener('loadstart', setProgressMaxValue, false);
          xhr.upload.addEventListener('progress', updateFileProgress, false);
  
          // File received / failed
          xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4) {
              // Everything is good!
  
              // progress.className = (xhr.status == 200 ? "success" : "failure");
              // document.location.reload(true);
            }
          };
  
          // Start upload
          const fileUploadForm:any=  document.getElementById("file-upload-form")
          xhr.open('POST', fileUploadForm.action, true);
          xhr.setRequestHeader('X-File-Name', file.name);
          xhr.setRequestHeader('X-File-Size', file.size);
          xhr.setRequestHeader('Content-Type', 'multipart/form-data');
          xhr.send(file);
        } else {
          output('Please upload a smaller file (< ' + fileSizeLimit + ' MB).');
        }
      }
    }
  
    // Check for the various File API support.
    if (window.File && window.FileList && window.FileReader) {
      Init();
    } else {
      const fileDrag:any = document.getElementById('file-drag')
      fileDrag.style.display = 'none';
    }
  }
 */
}