import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ImageCroppedEvent, Dimensions, ImageTransform, base64ToFile } from 'ngx-image-cropper';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-image-cropper-wrapper',
  templateUrl: './image-cropper-wrapper.component.html',
  styleUrls: ['./image-cropper-wrapper.component.scss']
})
export class ImageCropperWrapperComponent implements OnInit {
  @ViewChild('customFileInput') customFileInput!: ElementRef<HTMLInputElement>;
  @Output() cropperReady = new EventEmitter<any>();
  @Input() imageChangedEvent: any;
  @Input() croppedImageEvent: any;
  @Input() resizeToWidth: any;
  @Input() aspectRatio: any
  @Input() imageCropperConfig: any
  public saveCroppedImage: Subject<any> | any;
  showCropper = false;
  croppedImage: any = '';

  constructor(public imgCroppermodalRef: BsModalRef) { }

  ngOnInit(): void {
   // console.log(this.imageCropperConfig);
    this.saveCroppedImage = new Subject();
  }

  imageLoaded() {
    // Do something when the image is loaded.
    this.imageChangedEvent.showCropper = true;
    console.log('image loaded');
    
  }

  loadImageFailed() {
    // Handle the failure case when the image loading fails.
  }
 
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.croppedImageEvent = event;
    if (event.base64) {
      console.log(event, base64ToFile(event.base64));
    }
  }
  // imageCropped(event: ImageCroppedEvent) {
  //   this.croppedImage = event.blob

  //   var reader = new FileReader();
  //   reader.readAsDataURL( this.croppedImage);
  //   reader.onloadend = function () {
  //     var base64data = reader.result;
  //     console.log(base64data);
  //   }
  //   console.log('Image====base64====', event.base64)
  //   this.croppedImageEvent = event;
  //   if (event.base64) {
  //     console.log(event, base64ToFile(event.base64));
  //   }
  // }
   // cropperReady(sourceImageDimensions: Dimensions) {
  //     console.log('Cropper ready', sourceImageDimensions);
  // }

  save() {
    this.saveCroppedImage.next(this.croppedImageEvent)
    this.imgCroppermodalRef.hide()
  }
  closeCropper() {    
      this.imgCroppermodalRef.hide();
  }

}
