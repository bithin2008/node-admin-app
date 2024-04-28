import { ApiService } from 'src/app/@core/services/api.service';

export default class Adapter {
  loader;
  reader: any;
  config;
  apiSvc: any;
  constructor(loader: any, config: any,apiSvc:any  ) {
    this.loader = loader;
    this.config = config;
  }


  public async upload(): Promise<any> {
    const value = await this.loader.file;
    
    console.log(value);
    return this.read(value);
  }

  read(file: any) {
   
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function () {
        resolve({ default: reader.result });

        
        console.log(reader.result);
      };

      reader.onerror = function (error) {
        reject(error);
      };

      reader.onabort = function () {
        reject();
      };
      reader.readAsDataURL(file);
    });
  }


  updateBlogImage() {

    const formData = new FormData();
  //  formData.append('blogImage', this.blogImage.blob, 'image.png')
    this.apiSvc.fileupload(`test`, formData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
 
        }
      },
      error: (err:any) => { }, complete: () => { },
    })
  }

  abort() {
    if (this.reader) {
      this.reader.abort();
    }
  }
}

