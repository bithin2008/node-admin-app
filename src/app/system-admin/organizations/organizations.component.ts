import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as _ from "lodash";
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { base64ToFile } from 'ngx-image-cropper';
import { Subject, Subscription, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs';
import { AlertService } from 'src/app/@core/services/alert.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { ImageCropperWrapperComponent } from 'src/app/@shared/components/image-cropper-wrapper/image-cropper-wrapper.component';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { ChangeDetectorRef } from '@angular/core';
import { SystemAdminApiService } from 'src/app/@core/services/system-admin-api.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss']
})
export class OrganizationsComponent implements OnInit {
  modalRef?: BsModalRef | null;
  inputSubject = new Subject<string>(); 
  duplicateCheckArr: any = [];
  cropperModalRef?: BsModalRef;
  viewModalRef?: BsModalRef | null;
  orgModuleSubmodulePermissionRef?: BsModalRef | null;
  viewObj: any = {};
  orgForm: any;
  sortBy: any;
  sortDirection: boolean = false;
  public submitted!: boolean;
  public events: any[] = [];
  public orgList: any;
  public postData = {};
  subscription !: Subscription;
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};
  orgLogo: any;
  orgTinylogo: any;
  subModulesgroupByModuleList: any
  selectedModules: boolean[] = [];
  selectedSubmodules: boolean[][] = [];
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
  currentPageIndex: number = 0;
  first: number = 1;
  totalRecords: number = 0;
  itemPerPage: number = 10;
  itemPerPageDropdown = [10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';
  subject: any;
  paginate(event: any) {
    this.first = event.page + 1;
  }
  constructor(
    private apiSvc: SystemAdminApiService,
    private fb: UntypedFormBuilder,
    public formBuilder: UntypedFormBuilder,
    private commonSvc: CommonService,
    private alertSvc: AlertService,
    private router: Router,
    private bsMdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private cdRef: ChangeDetectorRef
  ) {
    this.commonSvc.setTitle('Organizations');
  }
  ngOnInit(): void {
    this.getOrganizationList();
    this.uniqueValueCheckObservable();
    this.getAllModuleSubModulelistGroupByModule()
  }


  openImageCropperComponent(srcType: string) {
    if (srcType == 'orgLogo') {
      this.orgLogo = null
      this.initialState.initialState.imageCropperConfig.aspectRatio = 165 / 35
      this.initialState.initialState.imageCropperConfig.resizeToWidth = 165
    } else if (srcType == 'orgTinylogo') {
      this.orgTinylogo = null
      this.initialState.initialState.imageCropperConfig.aspectRatio = 100 / 100
      this.initialState.initialState.imageCropperConfig.resizeToWidth = 100
    }
    this.cropperModalRef = this.bsMdlSvc.show(ImageCropperWrapperComponent, this.initialState);
    this.cropperModalRef.content.closeBtnName = 'Close';
    this.cropperModalRef.content.saveCroppedImage.subscribe((result: any) => {
      if (result) {
        //  console.log(base64ToFile(result.base64));

        // console.log(base64ToFile(result.base64));

        if (srcType == 'orgLogo') {
          this.orgLogo = result
        } else if (srcType == 'orgTinylogo') {
          this.orgTinylogo = result
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


  openaddEditOrgModal(template: TemplateRef<any>, obj: any) {
    this.duplicateCheckArr = [];
    this.orgForm = this.fb.group({
      orgName: ['', [Validators.required, this.formValidationSvc.notEmpty,]],
      orgTitle: [''],
      descriptions: [''],
      contactEmail: ['', [Validators.required, this.formValidationSvc.notEmpty, this.formValidationSvc.validEmail]],
      contactPhone: ['', [Validators.required, this.formValidationSvc.phoneNumberUS]],
      supportEmail: ['', [this.formValidationSvc.validEmail]],
      supportPhone: ['', [this.formValidationSvc.phoneNumberUS]],
      copyrightText: [null],
      colorScheme: [null],
      fbLink: [null, [this.formValidationSvc.validFbLink]],
      twitterLink: [null, [this.formValidationSvc.validTwitterLink]],
      linkedinLink: [null, [this.formValidationSvc.validLinkedinLink]],
      instagramLink: [null, [this.formValidationSvc.validInstaLink]],
      youtubeLink: [null, [this.formValidationSvc.validYoutubeLink]],
      whatsappLink: [null, [this.formValidationSvc.validWhatsappink]],
      pinterestLink: [null, [this.formValidationSvc.validPinterestLink]],
      logo: [null],
      tiny_logo: [null],
      favicon: [null],
      activeStatus: ['1', [Validators.required]],
    })
    this.modalRef = this.bsMdlSvc.show(template, { class: 'modal-lg', backdrop: 'static' });

    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      this.orgForm.patchValue({
        orgName: obj.org_name,
        orgTitle: obj.org_title,
        descriptions: obj.description,
        contactEmail: obj.contact_email,
        contactPhone: obj.contact_phone ? this.commonSvc.setUSFormatPhoneNumber(obj.contact_phone) : null,
        supportEmail: obj.support_email,
        supportPhone: obj.support_phone ? this.commonSvc.setUSFormatPhoneNumber(obj.support_phone) : null,
        copyrightText: obj.copyright_text,
        colorScheme: obj.color_scheme,
        fbLink: obj.fb_link,
        twitterLink: obj.twitter_link,
        linkedinLink: obj.linkedin_link,
        instagramLink: obj.instagram_link,
        youtubeLink: obj.youtube_link,
        whatsappLink: obj.whatsapp_link,
        pinterestLink: obj.pinterest_link,
        activeStatus: obj.active_status.toString()
      });

    }

  }

  openViewOrgModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.bsMdlSvc.show(template, { class: 'modal-lg view-modal',backdrop: 'static' });
    this.viewObj = obj
  }


  openEditOrgModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openaddEditOrgModal(template, obj);
    }, 200);
  }

  uniqueValueCheckObservable() {
    this.inputSubject
      .pipe(
        debounceTime(500), // Adjust the debounce time as per your requirement (milliseconds)
        distinctUntilChanged(),
        switchMap((inputObj: any) => this.formValidationSvc.uniqueValue(inputObj))
      )
      .subscribe(
        (res: any) => {
          if (res.hasRecord) {
            this.duplicateCheckArr.push(res);
          } else {
            this.duplicateCheckArr = this.duplicateCheckArr.filter((obj: any) => {
              return obj.field !== res.field;
            });
          }
          this.duplicateCheckArr = _.uniqBy(this.duplicateCheckArr, 'field');
        },
        (error) => {
          console.error('Error calling API:', error);
        }
      );
  }

  async duplicateValueCheck(control: any, model: any, field: any) {
    if (control.status == "VALID" && control.value.length > 2) {
      let obj: any = {
        control: control.value,
        model: model,
        field: field
      }
      this.inputSubject.next(obj);
    }
  }


  get f() { return this.orgForm.controls; }

  sort(column: string) {
    if (column === this.sortBy) {
      this.sortDirection = !this.sortDirection;
    } else {
      this.sortBy = column;
      this.sortDirection = false;
    }
  }



  getOrganizationList() {
    this.apiSvc.post(`${AppConfig.apiUrl.systemAdmin.getAllOrg}?page=${this.first}&limit=${this.itemPerPage}`, '').subscribe({
      next: (val: any) => {
        this.totalRecords = val?.pagination?.total;
        this.orgList = val?.data;
        this.loading = false;
      }
    });
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getOrganizationList();
  }

  resetPagination() {
    this.currentPageIndex = 0;
    this.totalRecords = 0;
    this.itemPerPage = 10;
    this.first = 1;
  }



  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.orgForm.valid) {
      if (this.duplicateCheckArr.length == 0) {
        if (this.isEdit) {
          let payload = {
            ...this.orgForm.value
          }
          payload.contactPhone = this.commonSvc.convertToNormalPhoneNumber(payload.contactPhone)
          payload.supportPhone = this.commonSvc.convertToNormalPhoneNumber(payload.supportPhone)
          this.apiSvc.put(`${AppConfig.apiUrl.systemAdmin.updateOrg}/${this.editObj.org_id}`, payload).subscribe({
            next: (response: any) => {
              if (response.status == 1) {
                this.updateOrgLogo(this.editObj.org_id)
                this.updateOrgTinyLogo(this.editObj.org_id)
                this.closeOrgAddEditModal()
                this.getOrganizationList();
                this.alertSvc.success(response.message);
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
        } else {
          let payload = {
            ...this.orgForm.value,
            selectedModuleSubModules: []
          }
          payload.contactPhone = this.commonSvc.convertToNormalPhoneNumber(payload.contactPhone)
          payload.supportPhone = this.commonSvc.convertToNormalPhoneNumber(payload.supportPhone);
          if(this.subModulesgroupByModuleList.length>0){
            this.subModulesgroupByModuleList.forEach((element: any) => {
              let selectedSubModules = [] as any
              element.sub_modules.forEach((el: any) => {
                if (el.selected) {
                  selectedSubModules.push(el)
                  payload.selectedModuleSubModules.push({
                    module_id: element.module_id,
                    module_name: element.module_name,
                    module_slug: element.module_slug,
                    module_descriptions: element.module_descriptions,
                    module_icon: element.module_icon,
                    module_sequence: element.module_sequence,
                    sub_modules: selectedSubModules
  
                  })
                }
              });
  
            });
          }
         

          payload.selectedModuleSubModules = _.unionBy(payload.selectedModuleSubModules, 'module_id')
          this.apiSvc.post(AppConfig.apiUrl.systemAdmin.createOrg, payload).subscribe({
            next: (response: any) => {
              if (response.status == 1) {
                this.updateOrgLogo(response.key)
                this.updateOrgTinyLogo(response.key)
                this.loading = false;
                this.alertSvc.success(response.message);
                setTimeout(() => {
                  this.getOrganizationList();
                  this.closeOrgAddEditModal()
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
      }
    } else {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.orgForm);
    }

  }

  updateOrgLogo(org_id: any) {
    if (!this.orgLogo) {
      return
    }
    const formData = new FormData();
    formData.append('orgLogo', this.orgLogo.blob, 'image.png')
    this.apiSvc.fileupload(`${AppConfig.apiUrl.common.updateOrgLogo}/${org_id}`, formData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          // this.alertSvc.success(response.message);
          var el: any = document.getElementById('orgLogo');
          el.value = '';
          this.orgLogo = {}
        }
      },
      error: (err) => { }, complete: () => { },
    })
  }
  updateOrgTinyLogo(org_id: any) {
    if (!this.orgTinylogo) {
      return
    }
    const formData = new FormData();
    formData.append('orgTinyLogo', this.orgTinylogo.blob, 'image.png')
    this.apiSvc.fileupload(`${AppConfig.apiUrl.common.updateOrgTinyLogo}/${org_id}`, formData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          // this.alertSvc.success(response.message);
          var el: any = document.getElementById('orgTinylogo');
          el.value = '';
          this.orgTinylogo = {}
        }
      },
      error: (err) => { }, complete: () => { },
    })
  }
  changeActivationStatus(ev: any, obj: any) {
    ev.preventDefault();
    const previousActiveStatus = obj.active_status;
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} ${obj.org_name} Organaization ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.put(`${AppConfig.apiUrl.systemAdmin.orgToggleActiveStatus}/${obj.org_id}`, { 'activeStatus': obj.active_status ? 0 : 1 }).subscribe({
          next: (response: any) => {
            if (response.status == 1) {

              this.alertSvc.success(response.message);
              this.getOrganizationList();
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
  deleteModule(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete ${obj.module_name} module ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.systemAdmin.deleteSystemAdminModule}/${obj.module_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertSvc.success(response.message);
              this.getOrganizationList();
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
  changeOrgContactPhoneFormat(e: any) {
    this.orgForm.controls['contactPhone'].setValue(this.commonSvc.setUSFormatPhoneNumber(e.target.value.toString()));
  }
  changeOrgSupportPhoneFormat(e: any) {
    this.orgForm.controls['supportPhone'].setValue(this.commonSvc.setUSFormatPhoneNumber(e.target.value.toString()));
  }

  fileChangeEvent(event: any, srcType: string): void {
    const fileSize = event.target.files[0].size / 1024 / 1024; // in MB
    if (fileSize > 2) {
      this.alertSvc.warning('File size exceeds 2MB',);
      var el: any = document.getElementById(srcType);
      el.value = '';
      return
    }
    let validation: any = this.commonSvc.validatePhotoUpload(event.target.files[0].name, ['png','webp']);
    if (validation) {
      if (this.initialState.initialState) {
        this.initialState.initialState['imageChangedEvent'] = event;
        this.openImageCropperComponent(srcType)
      }
    } else {
      var el: any = document.getElementById(srcType);
      el.value = '';
      this.alertSvc.warning('Only suported png format',);
      return
    }
  }
  imageCropped(event: any) {
    if (this.initialState.initialState)
      this.initialState.initialState['croppedImage'] = event.base64;
  }
  closeOrgAddEditModal() {
    this.submitted = false;
    this.orgForm.reset();
    this.modalRef?.hide();
    this.orgTinylogo = null
    this.orgLogo = null
    this.editObj = {}
    this.loading = false;
    this.isEdit = false;
  }

  async openModuleSubmodulePermissionModal(template: TemplateRef<any>, obj: any) {
    this.selectedOrgId = obj.org_id
    let previuosModuleSubmodulePermission = [] as any
    previuosModuleSubmodulePermission = await this.getOrgBySubModulesList(obj.org_id)
    this.subModulesgroupByModuleList.forEach((element: any) => {
      element.selected = false
      element.sub_modules.forEach((el: any) => {
        el.selected = false;
        if (previuosModuleSubmodulePermission.length > 0) {
          const exists = !!_.find(previuosModuleSubmodulePermission, { sub_module_id: el.sub_module_id });
          el.selected = exists;
        }
      });
      const allSubmodulesSelected = element.sub_modules.every((submodule: any) => submodule.selected);
      element.selected = allSubmodulesSelected
    });
    this.orgModuleSubmodulePermissionRef = this.bsMdlSvc.show(template, { class: 'modal-lg', backdrop: 'static' });

  }
  closeModuleSubmodulePermissionModal() {
    this.orgModuleSubmodulePermissionRef?.hide()
    setTimeout(() => {
      this.loading = false;
      this.selectedOrgId = null
      this.subModulesgroupByModuleList.forEach((element: any) => {
        element.selected = false
        element.sub_modules.forEach((el: any) => {
          el.selected = false;
        });
      });
    }, 500);

  }
  getAllModuleSubModulelistGroupByModule() {
    this.apiSvc.get(`${AppConfig.apiUrl.systemAdmin.getAllSubModuleGroupByModule}`).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.subModulesgroupByModuleList = response.data
          this.subModulesgroupByModuleList.forEach((element: any) => {
            element.selected = false
            element.sub_modules.forEach((el: any) => {
              el.selected = false;
            });
          });
        }
      }, error: (response: any) => { }, complete: () => { }
    })
  }
  getOrgBySubModulesList(org_id: any) {
    return new Promise((resolve, reject) => {
      this.apiSvc.post(`${AppConfig.apiUrl.systemAdmin.getOrgBySubModulesList}/${org_id}`, '').subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            resolve(response.data)
          }
          reject()
        }, error: (response: any) => { reject() }, complete: () => { }
      })
    })

  }

  toggleModule(moduleIndex: number) {
    this.subModulesgroupByModuleList[moduleIndex].selected = !this.subModulesgroupByModuleList[moduleIndex].selected
    this.subModulesgroupByModuleList[moduleIndex].sub_modules
      .forEach((el: any) => {
        el.selected = this.subModulesgroupByModuleList[moduleIndex].selected;
      });
  }

  toggleSubmodule(ev: any, moduleIndex: number, subModuleIndex: number) {
    this.subModulesgroupByModuleList[moduleIndex].sub_modules[subModuleIndex].selected = ev.target.checked
    const allSubmodulesSelected = this.subModulesgroupByModuleList[moduleIndex].sub_modules.every((submodule: any) => submodule.selected);
    this.subModulesgroupByModuleList[moduleIndex].selected = allSubmodulesSelected
  }
  saveOrgModuleSubModulePermission() {
    // this.loading=true;
    let payload = [] as any
    this.subModulesgroupByModuleList.forEach((element: any) => {
      if (this.selectedOrgId) {
        let selectedSubModules = [] as any

        element.sub_modules.forEach((el: any) => {
          if (el.selected) {
            selectedSubModules.push(el)
            payload.push({
              org_id: this.selectedOrgId,
              module_id: element.module_id,
              module_name: element.module_name,
              module_slug: element.module_slug,
              route_path: element.route_path,
              module_descriptions: element.module_descriptions,
              module_icon: element.module_icon,
              module_sequence: element.module_sequence,
              sub_modules: selectedSubModules

            })
          }
        });
      }
    });
    payload = _.unionBy(payload, 'module_id')
    this.apiSvc.post(`${AppConfig.apiUrl.systemAdmin.setOrgModuleSubModulePermission}`, { selectedModuleSubModules: payload }).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.closeModuleSubmodulePermissionModal();
          this.alertSvc.success(response.message);

        } else {
          this.alertSvc.error(response.message);
        }
      },
      error: (err) => {

      }, complete: () => { this.loading = false, this.getAllModuleSubModulelistGroupByModule(); }
    })
  }

  isModuleChecked(module: any) {

    return module.selected
  }
}
