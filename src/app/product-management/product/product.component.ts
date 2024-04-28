import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AlertService } from 'src/app/@core/services/alert.service';
import { IconService } from 'src/app/@core/services/icon.service';
import { of, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ImageCropperWrapperComponent } from 'src/app/@shared/components/image-cropper-wrapper/image-cropper-wrapper.component';
import { CommonService } from 'src/app/@core/services/common.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { checkAccessPermission } from 'src/app/@core/global';



@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  cropperModalRef?: BsModalRef;
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewIconsModalRef?: BsModalRef | null;
  public isImageChanges:boolean=false;
  viewObj: any = {};
  editObjClone: any = {};
  ProductForm: any;
  sortBy: any;
  datePickerConfig: Partial<BsDatepickerConfig>;
  sortDirection: boolean = false;
  public submitted!: boolean;
  public events: any[] = [];
  public productList: any;
  public systemAdminModuleList: any;
  public postData = {};
  public productImage: any;
  subscription !: Subscription;
  loading: boolean = false;
  isEdit: boolean = false;
  editObj: any = {};
  primeIcons: any = {};
  selectedModule: any = '';
  permissionObj: any
  sortField: string = 'sequence'; // Default sorting field
  sortOrder: string = 'ASC'; // Default sorting order
  searchingvalue: any = ''
  resetSearchInput = false;

  // Pagination Config
  paginationObj = {
    first: 0,
    currentPage: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  };
  itemPerPageDropdown = [5, 10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';
  public initialState: any = {
    backdrop: 'static',
    id:2,
    initialState: {
      title: 'Modal with component',
      imageChangedEvent: null,
      croppedImage: null,
      imageCropperConfig: {
        canvasWidth: 400,
        canvasHeight: 300,
        cropperMinWidth: 50,
        cropperMinHeight: 50,
        aspectRatio: NaN,
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
  constructor(
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    public formBuilder: UntypedFormBuilder,
    private modalService: BsModalService,
    private commonSvc: CommonService,
    private IconService: IconService,
    private bsMdlSvc: BsModalService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private sharedService: SharedService,
    private cdRef: ChangeDetectorRef
    
  ) {
    this.datePickerConfig = Object.assign({}, {containerClass : 'theme-dark-blue'});
    this.commonSvc.setTitle('Products & Add On Items');
    this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;

    });
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
  }
  ngOnInit(): void {
    this.getProductsList();
  }

  get f() { return this.ProductForm.controls; }

  sort(column: string) {
    if (column === this.sortBy) {
      this.sortDirection = !this.sortDirection;
    } else {
      this.sortBy = column;
      this.sortDirection = false;
    }
  }

  fileChangeEvent(event: any, srcType: string): void {
    const fileSize = event.target.files[0].size / 1024 / 1024; // in MB
    if (fileSize > 2) {
      this.alertService.warning('File size exceeds 2MB',);
      var el: any = document.getElementById(srcType);
      el.value = '';
      return
    }
    let validation: any = this.commonSvc.validatePhotoUpload(event.target.files[0].name, ['jpg', 'jpeg', 'webp', 'png']);
    if (validation) {
      if (this.initialState.initialState) {
        this.initialState.initialState['imageChangedEvent'] = event;
       // this.openImageCropperComponent(srcType)
       this.isImageChanges=true;
        this.productImage = URL.createObjectURL(event.target.files[0]);
        this.editObj.product_image = null;
        this.ProductForm.patchValue({
          productImage: this.productImage,
        });
      }
    } else {
      var el: any = document.getElementById(srcType);
      el.value = '';
      this.alertService.warning('Only jpg, jpeg, webp, png formats are suported',);
      return
    }
  }

  openImageCropperComponent(srcType: string) {
   if (srcType == 'productImage') {
      this.productImage = null
      this.initialState.initialState.imageCropperConfig.aspectRatio = 1;
      this.initialState.initialState.imageCropperConfig.resizeToWidth = 75
      this.initialState.initialState.imageCropperConfig.resizeToHeight = 75
    }
    this.cropperModalRef = this.bsMdlSvc.show(ImageCropperWrapperComponent, this.initialState);
    this.cropperModalRef.content.closeBtnName = 'Close';
    this.cropperModalRef.content.saveCroppedImage.subscribe((result: any) => {
      if (result) {
        //  console.log(base64ToFile(result.base64));

        // console.log(base64ToFile(result.base64));

         if (srcType == 'productImage') {
          this.isImageChanges=true;
          this.productImage = result
          this.editObj.product_image = null;
          this.ProductForm.patchValue({
            productImage: this.productImage,
          });
        }
        // console.log('results', result);

      }
     
    })
  }

  getProductsList() {
    this.apiSvc.get(`${AppConfig.apiUrl.products.getAllProducts}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}`).subscribe({
      next: (val: any) => {
        this.paginationObj = val?.pagination;
        this.productList = val?.data;
      }
    });
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getProductsList();
  }

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/product-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getProductsList();
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

  openaddEditProductModal(template: TemplateRef<any>, obj: any) {
    this.isEdit = false;
    this.editObjClone={};
    this.modalRef = this.mdlSvc.show(template, { id: 1, class: 'modal-lg', backdrop: 'static' });
    this.ProductForm = this.fb.group({
      productName: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      productType: ['', [Validators.required]],
      productImage: [null, [Validators.required]],
      monthlyPrice: ['', [Validators.required, this.formValidationSvc.numericTwoDecimal]],
      yearlyPrice: ['', [Validators.required, this.formValidationSvc.numericTwoDecimal]],
      sequence: [''],
      activeStatus: ['1', [Validators.required]]
    })
    this.ProductForm.reset();
    this.ProductForm.clearValidators();
    this.submitted = false;
    setTimeout(() => {
      this.ProductForm.patchValue({
        productType: '',
        activeStatus: '1'
      });
    }, 250);
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      setTimeout(() => {
        this.editObjClone = { ...this.editObj };
        const filePath = new URL(obj.product_image);
        const pathname = filePath.pathname;
        const fileName = pathname.substring(pathname.lastIndexOf("/") + 1);
        this.ProductForm.patchValue({
          productName: obj.product_name,
          productType: obj.product_type,
          monthlyPrice: obj.monthly_price,
          yearlyPrice: obj.yearly_price,
          sequence: obj.sequence,
          productImage:fileName,
          activeStatus: obj.active_status.toString()
        });
      }, 250);
   
    }
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 200);

  }

  closeProductAddEditModal(){
    this.submitted = false;
    this.ProductForm.reset();
    this.modalRef?.hide();
    this.productImage = null;
    this.editObj = {}
    this.loading = false;
    this.isEdit = false;
    this.getProductsList();
  }

  openViewProductModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-m view-modal modal-lg', backdrop: 'static' });
    this.viewObj = obj
  }

  openEditProductModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openaddEditProductModal(template, obj);
    }, 200);
  }


  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if(this.f['productImage'].value){
      this.ProductForm.get('productImage').clearValidators();
      this.ProductForm.get('productImage').updateValueAndValidity();
    }
    if(this.f['productName'].value){
      this.ProductForm.value.productName =this.f['productName'].value.trimStart()
    }
    if (this.ProductForm.valid) {
      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.products.updateProduct}/${this.editObj.product_id}`, this.ProductForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.modalRef?.hide();
              if (this.isImageChanges) {
                this.updateProductImage(this.editObj.product_id);
              } else {
                setTimeout(() => {
                  this.getProductsList();
                }, 500);
              }
              this.loading = false;
            } else {
              this.alertService.error(response.message);
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
        this.apiSvc.post(AppConfig.apiUrl.products.createProduct, this.ProductForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.updateProductImage(response.data.product_id)
              this.modalRef?.hide();
              this.loading = false;
            } else {
              this.alertService.error(response.message);
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
      this.formValidationSvc.validateAllFormFields(this.ProductForm);
    }
  }

  async updateProductImage(product_id: any) {
    if (!this.productImage) {
      return;
    }
    const formData = new FormData();
    let blobUrl = null;
    let image: any = new Image();
    image.src = this.productImage;
    image.onload = async () => {
      // Convert image URL to Blob
      const blob = await fetch(image.src).then((response) => response.blob());
  
      formData.append('productImage', blob, 'product-image.jpg');  
      if (this.editObjClone?.product_image) {
        let fileName = this.editObjClone?.product_image.substring(this.editObjClone?.product_image.lastIndexOf("/") + 1);
        if (fileName !== 'null') {
          let deleteImage = await this.deleteExistingImage(fileName, product_id, 'productImage');
        }
        this.uploadNewProductImage(product_id, formData);
      } else {
        this.uploadNewProductImage(product_id, formData);
      }
    };
  }
  

  uploadNewProductImage(product_id: string, formData: any) {
    this.apiSvc.fileupload(`${AppConfig.apiUrl.products.updateProductImage}/${product_id}`, formData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          // this.alertSvc.success(response.message);
          var el: any = document.getElementById('productImage');
          if (el)
            el.value = '';
          this.productImage = {};
          this.isImageChanges=false;
          this.getProductsList();
        }
      },
      error: (err) => { }, complete: () => { },
    })
  }

  deleteExistingImage(filename: string, productId: string, imageType: string) {
    return new Promise((resolve, reject) => {
      let data = {
        fileName: filename,
        imageType: imageType
      }
      this.apiSvc.post(`${AppConfig.apiUrl.products.deleteExistingImage}/${productId}`, data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.alertService.success(response.message);
            resolve(response?.status);
          } else {
            reject(response?.status);
          }
        },
        error: (err) => { }, complete: () => { },
      })
    });
  }

  deleteProduct(obj: any) {
    this.confrmSvc.confirm('', `Do you really want to delete ${obj.product_name} product ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.products.deleteProduct}/${obj.product_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getProductsList();
              this.loading = false;
            } else {
              this.alertService.error(response.message);
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

  changeActivationStatus(ev: any, obj: any) {
    if (this.permissionObj?.edit) {
      ev.preventDefault();
      const previousActiveStatus = obj.active_status;
      this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} ${obj.product_name} product ?`, 'Yes', 'No', 'lg').then((res) => {
        if (res) {
          this.apiSvc.put(`${AppConfig.apiUrl.products.toggleProductStatus}/${obj?.product_id}`, { 'activeStatus': obj.active_status ? '0' : '1' }).subscribe({
            next: (response: any) => {
              if (response.status == 1) {
                this.alertService.success(response.message);

              } else {
                this.alertService.error(response.message);
              }
            },
            error: () => {
            },
            complete: () => {
              this.getProductsList()
            }
          });
        }
      }).catch(() => { obj.active_status = previousActiveStatus; this.cdRef.detectChanges(); });

    } else {
      this.alertService.error(`You are not authorised to do this. `);
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
    this.getProductsList();
  }
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/product-management');
    this.getProductsList();
  }
}
