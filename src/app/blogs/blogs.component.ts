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
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class BlogsComponent {
  modalRef?: BsModalRef | null;
  inputSubject = new Subject<string>();
  duplicateCheckArr: any = [];
  cropperModalRef?: BsModalRef;
  viewModalRef?: BsModalRef | null;
  orgModuleSubmodulePermissionRef?: BsModalRef | null;
  viewObj: any = {};
  postForm: any;
  sortBy: any;
  sortField: string = 'blog_id'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  sortDirection: boolean = false;
  public isImageChanges:boolean=false;
  public submitted!: boolean;
  public events: any[] = [];
  public postList: any;
  public postData = {};
  subscription !: Subscription;
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};
  editObjClone: any = {};
  authorImage: any;
  blogImage: any;
  permissionObj: any;
  minDate: any;
  subModulesgroupByModuleList: any
  selectedModules: boolean[] = [];
  selectedSubmodules: boolean[][] = [];
  productList: any = [];
  blogCategoryList: any = [];

  editorConfig = {
    toolbar: [
      // Your desired toolbar buttons configuration
      { name: 'basicstyles', items: ['Source','Bold', 'Italic', 'Underline'] },
      { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent','list', 'indent', 'blocks', 'align', 'bidi'] },
      { name: 'styles', items: ['Font', 'FontSize', 'TextColor', 'BGColor']},
      { name: 'insert', items: ['Image'] }
      // Add or remove buttons as needed
    ],
    filebrowserUploadMethod: 'post',
    filebrowserUploadUrl: `${AppConfig.apiBaseUrl}${AppConfig.apiUrl.blogs.uploadDescriptionImage}`, // Replace with your server-side image upload endpoint
    fileTools_requestHeaders : {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  };
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
    this.router.navigate(['/blog-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getAllBlogList();
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
  
    this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });
  }
  ngOnInit(): void {
   
    this.getAllBlogList();
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
    this.postForm.get("slug").setValue(this.convertToSlug(ev.target.value));
  }

  getInit() {
    const self = this;
    return {
      menubar: 'file edit view insert format tools table tc help',
      branding: false,
      plugins: 'image lists  code',
      toolbar: "undo redo | aidialog aishortcuts | blocks fontsizeinput | bold italic | align numlist bullist | link image | table media pageembed | lineheight  outdent indent | strikethrough forecolor backcolor formatpainter removeformat | charmap emoticons checklist | code fullscreen preview | save print export | pagebreak anchor codesample footnotes mergetags | addtemplate inserttemplate | addcomment showcomments | ltr rtl casechange | spellcheckdialog a11ycheck", // Note: if a toolbar item requires a plugin, the item will not present in the toolbar if the plugin is not also loaded.
      file_picker_callback: function (cb: any, value: any, meta: any) {
        const input: any = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.onchange = async () => {
          const file = input.files[0];
          console.log('file', file);
          let uploadedDescImage: any = await self.uploadDescriptionImage(file);
          console.log('uploadedDescImage', uploadedDescImage);
          cb(uploadedDescImage.data.image);
        };

        input.click();
      },
    };
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
    if (srcType == 'authorImage') {
      this.authorImage = null;
      // this.initialState.initialState.imageCropperConfig.aspectRatio = 1
      // this.initialState.initialState.imageCropperConfig.resizeToWidth = 1460
    } else if (srcType == 'blogImage') {
      this.blogImage = null
      this.initialState.initialState.imageCropperConfig.aspectRatio = 1460 / 675
      this.initialState.initialState.imageCropperConfig.resizeToWidth = 1460
      this.initialState.initialState.imageCropperConfig.resizeToHeight = 675
    }
    this.cropperModalRef = this.bsMdlSvc.show(ImageCropperWrapperComponent, this.initialState);
    this.cropperModalRef.content.closeBtnName = 'Close';
    this.cropperModalRef.content.saveCroppedImage.subscribe((result: any) => {
      if (result) {
        //  console.log(base64ToFile(result.base64));

        // console.log(base64ToFile(result.base64));

        if (srcType == 'authorImage') {
          this.authorImage = result;
          this.editObj.author_image = null;

        } else if (srcType == 'blogImage') {
          this.isImageChanges=true;
          this.blogImage = result
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
    this.productList = await this.getAllProducts();
    this.blogCategoryList = await this.getAllBlogCategories();
    this.authorImage = {};
    this.blogImage = {};
    this.editObjClone = {};
    this.duplicateCheckArr = [];
    this.postForm = this.fb.group({
      blogTitle: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      // authorName: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      // authorImage: ['', [Validators.required]],
      blogCategoryId: ['', [Validators.required]],
      slug: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      description: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      shortDescription: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      blogImage: ['', [Validators.required]],
      alt: [''],
      productId: [''],
      metaTitle: [''],
     // metaKeyword: [''],
      metaDescription: [''],
      trackingCode: [''],
      publishDate: ['', [Validators.required]],
      activeStatus: ['1', [Validators.required]],
    })
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate());

    this.modalRef = this.bsMdlSvc.show(template, { class: 'modal-lg', backdrop: 'static' });

    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      this.minDate =new Date(obj.publish_date);
      this.postForm.patchValue({
        blogTitle: obj.blog_title,
        authorName: obj.author,
        authorImage: obj.author_image,
        blogCategoryId: obj.blog_category_id,
        slug: obj.slug,
        shortDescription: obj.short_description,
        blogImage: obj.image,
        alt: obj.alt,
        productId: obj.product_id,
        metaTitle: obj.meta_title,
      //  metaKeyword: obj.meta_keyword,
        metaDescription: obj.meta_description,
        trackingCode: obj.tracking_code,
        publishDate: new Date(obj.publish_date),
        activeStatus: obj.active_status.toString()
      });
      setTimeout(() => {
        this.postForm.patchValue({
          description: obj.description,
        });
      }, 300);
      this.editObjClone = { ...this.editObj };
    }
    this.formValidationSvc.forms();
  }

  openViewOrgModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.bsMdlSvc.show(template, { class: 'modal-lg view-modal', backdrop: 'static' });
    this.viewObj = obj
  }

  openEditOrgModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openAddEditPostModal(template, obj);
    }, 200);
  }

  get f() { return this.postForm.controls; }

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
    this.getAllBlogList();
  }

  getAllBlogList() {
    this.apiSvc.get(`${AppConfig.apiUrl.blogs.getAllPosts}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}`).subscribe({
      next: (val: any) => {
        this.paginationObj = val?.pagination;
        this.postList = val?.data;
        this.loading = false;
      }
    });
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str; this.resetPagination();
    this.getAllBlogList();
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

  getAllProducts() {
    return new Promise((resolve, reject) => {
      this.apiSvc.get(`${AppConfig.apiUrl.products.getAllProducts}?active_status=1`).subscribe({
        next: (res: any) => {
          if (res.status == 1) {
            resolve(res.data);
          } else {
            reject();
          }
        },
        error: () => { this.loading = false; },
        complete: () => { this.loading = false; }
      });
    });

  }

  getAllBlogCategories() {
    return new Promise((resolve, reject) => {
      this.apiSvc.get(`${AppConfig.apiUrl.blogs.getAllBlogCategories}`).subscribe({
        next: (res: any) => {
          if (res.status == 1) {
            resolve(res.data);
          } else {
            reject();
          }
        },
        error: () => { this.loading = false; },
        complete: () => { this.loading = false; }
      });
    });

  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.postForm.valid) {
      if (this.isEdit) {       
        this.apiSvc.put(`${AppConfig.apiUrl.blogs.updatePost}/${this.editObj.blog_id}`, this.postForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.modalRef?.hide();
              this.alertSvc.success(response.message);
              // this.updateAuthorImage(this.editObj.blog_id);
              if (this.isImageChanges) {
                this.updateBlogImage(this.editObj.blog_id);
              } else {
                setTimeout(() => {
                  this.getAllBlogList();
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
        this.apiSvc.post(AppConfig.apiUrl.blogs.createPost, this.postForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              // this.updateAuthorImage(response.data.blog_id)
              this.updateBlogImage(response.data.blog_id)
              this.submitted = false;
              this.postForm.reset();
              this.modalRef?.hide();
              this.alertSvc.success(response.message);
              setTimeout(() => {
                // this.getAllBlogList();
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
      this.formValidationSvc.validateAllFormFields(this.postForm);
    }
  }

  // async updateAuthorImage(blog_id: any) {
  //   if (!this.authorImage) {
  //     return
  //   }
  //   const formData = new FormData();
  //   formData.append('authorImage', this.authorImage.blob, 'author.jpg');
  //   if (this.editObjClone?.author_image) {
  //     let fileName = this.editObjClone?.author_image.substring(this.editObjClone?.author_image.lastIndexOf("/") + 1);
  //     if (fileName !== 'null') {
  //       let deleteImage = await this.deleteExistingImage(fileName, blog_id, 'authorImage');
  //     }
  //     this.uploadNewAuthorImage(blog_id, formData);
  //   } else {
  //     this.uploadNewAuthorImage(blog_id, formData);
  //   }

  // }

  // uploadNewAuthorImage(blog_id: string, formData: any) {
  //   this.apiSvc.fileupload(`${AppConfig.apiUrl.blogs.updateAuthorImage}/${blog_id}`, formData).subscribe({
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



  async updateBlogImage(blog_id: any) {
    if (!this.blogImage) {
      return
    }
    const formData = new FormData();
    formData.append('blogImage', this.blogImage.blob, 'image.jpg');
    if (this.editObjClone?.image) {
      let fileName = this.editObjClone?.image.substring(this.editObjClone?.image.lastIndexOf("/") + 1);
      if (fileName !== 'null') {
        let deleteImage = await this.deleteExistingImage(fileName, blog_id, 'blogImage');
      }
      this.uploadNewBlogImage(blog_id, formData);
    } else {
      this.uploadNewBlogImage(blog_id, formData);
    }

  }

  uploadNewBlogImage(blog_id: string, formData: any) {
    this.apiSvc.fileupload(`${AppConfig.apiUrl.blogs.updateBlogImage}/${blog_id}`, formData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          // this.alertSvc.success(response.message);
          var el: any = document.getElementById('blogImage');
          if (el)
            el.value = '';
          this.blogImage = {};
          this.isImageChanges=false;
          this.getAllBlogList();
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
      this.apiSvc.post(`${AppConfig.apiUrl.blogs.deleteExistingImage}/${blogId}`, data).subscribe({
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
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} ${obj.blog_title} post ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.put(`${AppConfig.apiUrl.blogs.toggleActiveStatus}/${obj.blog_id}`, { 'activeStatus': obj.active_status ? 0 : 1 }).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertSvc.success(response.message);
              setTimeout(() => {
                this.getAllBlogList();
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
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete ${obj.blog_title} ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.blogs.deletePost}/${obj.blog_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertSvc.success(response.message);
              this.getAllBlogList();
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
    this.postForm.reset();
    this.modalRef?.hide();
    this.blogImage = null
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
        this.getAllBlogList();
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getAllBlogList();
    }
  }
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/blog-management');
    this.getAllBlogList();
  }
  changePublishDate(ev: any) {
    if (ev) {
      this.postForm.patchValue({
        publishDate: new Date(ev),
      })
      this.formValidationSvc.forms();
    }
  }

}
