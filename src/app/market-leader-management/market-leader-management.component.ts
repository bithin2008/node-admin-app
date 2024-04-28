import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from "lodash";
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { base64ToFile } from 'ngx-image-cropper';
import { Subject, Subscription, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { ImageCropperWrapperComponent } from 'src/app/@shared/components/image-cropper-wrapper/image-cropper-wrapper.component';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { ChangeDetectorRef } from '@angular/core';
import { SharedService } from '../@core/services/shared.service';
import { checkAccessPermission } from '../@core/global';
declare const tinymce: any;
@Component({
  selector: 'app-market-leader-management',
  templateUrl: './market-leader-management.component.html',
  styleUrls: ['./market-leader-management.component.scss']
})
export class MarketLeaderManagementComponent {
  modalRef?: BsModalRef | null;
  inputSubject = new Subject<string>();
  duplicateCheckArr: any = [];
  cropperModalRef?: BsModalRef;
  viewModalRef?: BsModalRef | null;
  orgModuleSubmodulePermissionRef?: BsModalRef | null;
  viewObj: any = {};
  marketLeaderForm: any;
  sortBy: any;
  sortField: string = 'market_leader_id'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  sortDirection: boolean = false;
  public isImageChanges:boolean=false;
  public submitted!: boolean;
  public events: any[] = [];
  public marketLeadersList: any;
  public postData = {};
  subscription !: Subscription;
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};
  editObjClone: any = {};
  authorImage: any;
  image: any;
  permissionObj: any;
  minDate: any;
  subModulesgroupByModuleList: any
  selectedModules: boolean[] = [];
  selectedSubmodules: boolean[][] = [];
  productList: any = [];
  blogCategoryList: any = [];
  public initialState: any = {
    backdrop: 'static',
    initialState: {
      title: 'Modal with component',
      imageChangedEvent: null,
      croppedImage: null,
      imageCropperConfig: {
        canvasWidth: 400,
        canvasHeight: 300,
        cropperMinWidth: 50,
        cropperMinHeight: 50,
        aspectRatio: 0,
        resizeToWidth: 0,
        maintainAspectRatio: false,
        cropperStaticWidth: false,
        cropperStaticHeight: false,
        onlyScaleDown: false,
        rounded: false,
        showCropper: false,
        format: "png"
      },
    }
  } as any;
  selectedOrgId: any
  // Pagination Config
  paginationObj = {
    first: 0,
    currentPage: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  };
  itemPerPageDropdown = [10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';
  searchingvalue: any = ''
  resetSearchInput = false;

  subject: any;

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/market-leaders-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getAllMarketLeadersList();
  }
  constructor(
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    public formBuilder: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private commonSvc: CommonService,
    private alertSvc: AlertService,
    private router: Router,
    private bsMdlSvc: BsModalService,
    private sharedService: SharedService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private cdRef: ChangeDetectorRef
  ) {
    this.commonSvc.setTitle('Organizations');
    let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }
    // this.activatedRoute.data.subscribe((data: any) => {
    //   const subModuleDetails = data['subModuleDetails'];
    //   if (subModuleDetails) {
    //     this.sharedService.updateSubmoduleDetails(subModuleDetails);
    //     let combArr = subModuleDetails.permission_details.combination.split(',');
    //     this.permissionObj = {
    //       view: combArr[0] === '1',
    //       add: combArr[1] === '1',
    //       edit: combArr[2] === '1',
    //       delete: combArr[3] === '1'
    //     };
    //   }
    //   // Now you can work with the resolved data
    // });
    this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });
  }
  ngOnInit(): void {
    this.getAllMarketLeadersList();
  }

  convertToSlug(string: any) {
    return string.toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 450);
  }

  blogEnter(ev: any) {
    // console.log('ev.target.value',ev.target.value);
    this.marketLeaderForm.get("slug").setValue(this.convertToSlug(ev.target.value));
  }

 
  uploadDescriptionImage(file: any) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('blogDescriptionImage', file, 'description.jpg')
      this.apiSvc.fileupload(`${AppConfig.apiUrl.blogs.uploadDescriptionImage}`, formData).subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: () => { this.loading = false; },
        complete: () => { this.loading = false; }
      });
    });
  }

  openImageCropperComponent(srcType: string) {
    if (srcType == 'image') {
      this.image = null
      this.initialState.initialState.imageCropperConfig.maintainAspectRatio = false
      this.initialState.initialState.imageCropperConfig.aspectRatio = 1
      this.initialState.initialState.imageCropperConfig.resizeToWidth = 200
      this.initialState.initialState.imageCropperConfig.resizeToHeight = 60
    }
    this.cropperModalRef = this.bsMdlSvc.show(ImageCropperWrapperComponent, this.initialState);
    this.cropperModalRef.content.closeBtnName = 'Close';
    this.cropperModalRef.content.saveCroppedImage.subscribe((result: any) => {
      if (result) {
        //  console.log(base64ToFile(result.base64));

        // console.log(base64ToFile(result.base64));

         if (srcType == 'image') {
          this.isImageChanges=true;
          this.image = result
          this.editObj.image = null;
        }
        // console.log('results', result);

      } else {

      }
      const cropImg: any = document.getElementsByClassName('cropImg')
      if (cropImg) {
        [...cropImg].forEach((el: any) => {
          el.value = ''
        });
      }
    })
  }


  async openAddEditPostModal(template: TemplateRef<any>, obj: any) {
    this.isEdit = false;
    this.image = {};
    this.editObjClone = {};
    this.duplicateCheckArr = [];
    this.marketLeaderForm = this.fb.group({
      title: ['', [Validators.required, this.formValidationSvc.notEmpty]],     
      image: ['', [Validators.required]],
      activeStatus: ['1', [Validators.required]],
    })
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate());

    this.modalRef = this.bsMdlSvc.show(template, { class: 'modal-lg', backdrop: 'static' });

    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      this.minDate =new Date(obj.publish_date);
      this.marketLeaderForm.patchValue({
        title: obj.title,
        image: obj.image,
        activeStatus: obj.active_status.toString()
      });
      this.editObjClone = { ...this.editObj };
    }
    this.formValidationSvc.forms();
  }

  openViewOrgModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.bsMdlSvc.show(template, { class: 'modal-md', backdrop: 'static' });
    this.viewObj = obj
  }

  openEditOrgModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openAddEditPostModal(template, obj);
    }, 200);
  }

  get f() { return this.marketLeaderForm.controls; }

  sort(column: string) {
    if (column === this.sortBy) {
      this.sortDirection = !this.sortDirection;
    } else {
      this.sortBy = column;
      this.sortDirection = false;
    }
  }

  updateSorting(columnName: string) {
    // If the same column is clicked again, toggle the sorting order
    if (columnName === this.sortField) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // If a new column is clicked, set the new sorting column and reset the sorting order to 'asc'
      this.sortField = columnName;
      this.sortOrder = 'asc';
    }
    // Call your API endpoint to fetch data with the updated sorting parameters
    this.getAllMarketLeadersList();
  }

  getAllMarketLeadersList() {
    this.apiSvc.get(`${AppConfig.apiUrl.marketLeaders.getAllMarketLeaders}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}`).subscribe({
      next: (val: any) => {
        this.paginationObj = val?.pagination;
        this.marketLeadersList = val?.data;
        this.loading = false;
      }
    });
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str; this.resetPagination();
    this.getAllMarketLeadersList();
  }

  resetPagination() {
    this.paginationObj = {
      first: 0,
      currentPage: 1,
      limit: 50,
      total: 0,
      totalPages: 0
    };
  }




  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.marketLeaderForm.valid) {
      if (this.isEdit) {       
        this.apiSvc.put(`${AppConfig.apiUrl.marketLeaders.updateMarketLeader}/${this.editObj.market_leader_id}`, this.marketLeaderForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.modalRef?.hide();
              this.alertSvc.success(response.message);
              // this.updateAuthorImage(this.editObj.market_leader_id);
              if (this.isImageChanges) {
                this.updateMarketLeaderImage(this.editObj.market_leader_id);
              } else {
                setTimeout(() => {
                  this.getAllMarketLeadersList();
                }, 500);
              }
              this.submitted = false;
            } else {
              this.alertSvc.error(response.message);
            }
          },
          error: () => {
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      } else {
        this.apiSvc.post(AppConfig.apiUrl.marketLeaders.createMarketLeader, this.marketLeaderForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              // this.updateAuthorImage(response.data.market_leader_id)
              this.updateMarketLeaderImage(response.data.market_leader_id)
              this.submitted = false;
              this.marketLeaderForm.reset();
              this.modalRef?.hide();
              this.alertSvc.success(response.message);
              setTimeout(() => {
                // this.getAllMarketLeadersList();
              }, 500);
            } else {
              this.alertSvc.error(response.message);
            }
          },
          error: () => {
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    } else {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.marketLeaderForm);
    }
  }

  // async updateAuthorImage(market_leader_id: any) {
  //   if (!this.authorImage) {
  //     return
  //   }
  //   const formData = new FormData();
  //   formData.append('authorImage', this.authorImage.blob, 'author.jpg');
  //   if (this.editObjClone?.author_image) {
  //     let fileName = this.editObjClone?.author_image.substring(this.editObjClone?.author_image.lastIndexOf("/") + 1);
  //     if (fileName !== 'null') {
  //       let deleteImage = await this.deleteExistingImage(fileName, market_leader_id, 'authorImage');
  //     }
  //     this.uploadNewAuthorImage(market_leader_id, formData);
  //   } else {
  //     this.uploadNewAuthorImage(market_leader_id, formData);
  //   }

  // }

  // uploadNewAuthorImage(market_leader_id: string, formData: any) {
  //   this.apiSvc.fileupload(`${AppConfig.apiUrl.blogs.updateAuthorImage}/${market_leader_id}`, formData).subscribe({
  //     next: (response: any) => {
  //       if (response.status == 1) {
  //         // this.alertSvc.success(response.message);
  //         var el: any = document.getElementById('authorImage');
  //         if (el) {
  //           el.value = null;
  //         }
  //         this.authorImage = {}
  //       }
  //     },
  //     error: (err) => { }, complete: () => { },
  //   })
  // }



  async updateMarketLeaderImage(market_leader_id: any) {
    if (!this.image) {
      return
    }
    const formData = new FormData();
    formData.append('image', this.image.blob, 'image.jpg');
    if (this.editObjClone?.image) {
      let fileName = this.editObjClone?.image.substring(this.editObjClone?.image.lastIndexOf("/") + 1);
      if (fileName !== 'null') {
      //  let deleteImage = await this.deleteExistingImage(fileName, market_leader_id, 'image');
      }
      this.uploadNewMarketLeaderImage(market_leader_id, formData);
    } else {
      this.uploadNewMarketLeaderImage(market_leader_id, formData);
    }

  }

  uploadNewMarketLeaderImage(market_leader_id: string, formData: any) {
    this.apiSvc.fileupload(`${AppConfig.apiUrl.marketLeaders.updateImage}/${market_leader_id}`, formData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          // this.alertSvc.success(response.message);
          var el: any = document.getElementById('image');
          if (el)
            el.value = '';
          this.image = {};
          this.isImageChanges=false;
          this.getAllMarketLeadersList();
        }
      },
      error: (err) => { }, complete: () => { },
    })
  }

  deleteExistingImage(filename: string, blogId: string, imageType: string) {
    return new Promise((resolve, reject) => {
      let data = {
        fileName: filename,
        imageType: imageType
      }
      this.apiSvc.post(`${AppConfig.apiUrl.marketLeaders.deleteExistingImage}/${blogId}`, data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.alertSvc.success(response.message);
            resolve(response?.status);
          } else {
            reject(response?.status);
          }
        },
        error: (err) => { }, complete: () => { },
      })
    });
  }


  changeActivationStatus(ev: any, obj: any) {
    ev.preventDefault();
    const previousActiveStatus = obj.active_status;
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} ${obj.title} post ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.put(`${AppConfig.apiUrl.marketLeaders.toggleActiveStatus}/${obj.market_leader_id}`, { 'activeStatus': obj.active_status ? 0 : 1 }).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertSvc.success(response.message);
              setTimeout(() => {
                this.getAllMarketLeadersList();
              }, 250);
            } else {
              this.alertSvc.error(response.message);
            }
          },
          error: () => {
            this.loading = false;

          },
          complete: () => {
            this.loading = false;
          }
        });
      } else {
        //  obj.active_status=previousActiveStatus
        obj.active_status = previousActiveStatus;
        this.cdRef.detectChanges();
      }
    })
      .catch(() => { obj.active_status = previousActiveStatus; this.cdRef.detectChanges(); });
  }

  deletePost(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete ${obj.title} ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.marketLeaders.deleteMarketLeader}/${obj.market_leader_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertSvc.success(response.message);
              this.getAllMarketLeadersList();
              this.loading = false;
            } else {
              this.alertSvc.error(response.message);
            }
          },
          error: () => {
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    })
      .catch(() => { });
  }


  fileChangeEvent(event: any, srcType: string): void {
    const fileSize = event.target.files[0].size / 1024 / 1024; // in MB
    if (fileSize > 2) {
      this.alertSvc.warning('File size exceeds 2MB',);
      var el: any = document.getElementById(srcType);
      el.value = '';
      return
    }
    let validation: any = this.commonSvc.validatePhotoUpload(event.target.files[0].name, ['jpg', 'jpeg', 'webp', 'png']);
    if (validation) {
      if (this.initialState.initialState) {
        this.initialState.initialState['imageChangedEvent'] = event;
        this.openImageCropperComponent(srcType)
      }
    } else {
      var el: any = document.getElementById(srcType);
      el.value = '';
      this.alertSvc.warning('Only jpg, jpeg, webp, png formats are suported',);
      return
    }
  }

  imageCropped(event: any) {
    if (this.initialState.initialState)
      this.initialState.initialState['croppedImage'] = event.base64;
  }

  closeOrgAddEditModal() {
    this.submitted = false;
    this.marketLeaderForm.reset();
    this.modalRef?.hide();
    this.image = null
    this.authorImage = null
    this.editObj = {}
    this.loading = false;
    this.isEdit = false;
  }

  search(e: any) {
    const inputValue = e.target.value;
    // Define the minimum length required for calling the function
    const minLengthForCall = 3;
    // Check if the input value starts with a date pattern (e.g., "MM-DD-YYYY")
    const startsWithDatePattern = /^\d{2}-/.test(inputValue);
    // Determine the minimum length based on whether it starts with a date pattern
    const minLength = startsWithDatePattern ? 10 : minLengthForCall;
    if (inputValue.length >= minLength) {
      this.searchingvalue = inputValue;
      setTimeout(() => {
        this.getAllMarketLeadersList();
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getAllMarketLeadersList();
    }
  }
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/market-leaders-management');
    this.getAllMarketLeadersList();
  }
  changePublishDate(ev: any) {
    if (ev) {
      this.marketLeaderForm.patchValue({
        publishDate: new Date(ev),
      })
      this.formValidationSvc.forms();
    }
  }
}
