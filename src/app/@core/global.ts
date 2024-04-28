import * as _ from "lodash";

export function  checkAccessPermission(currentRoute: any)  {
    //let accessData:any = localStorage.getItem('access_data');
    if(!localStorage.getItem('secret_data')){
      return null
    }
    let secret_data:any = localStorage.getItem('secret_data');
    let  accessData = decodeBase64(secret_data)
    if (!accessData) {
      return null
    }
    accessData=jsonParse(accessData);

   //console.log(atob(accessData));
   if (typeof accessData === 'object' && accessData !== null) {
    let permissionObj={};
      if (accessData.data.accessable_module_submodules) {
        var result: any = _.chain(accessData.data.accessable_module_submodules)
          .map('submodules') // pluck all elements from data
          .flatten() // flatten the elements into a single array
          .filter({ route_path: currentRoute }) // extract elements with a route_path of currentRoute
          .value();
        if (result.length > 0) {
          let combArr = result[0].permission_details.combination.split(',');
           permissionObj = {
            view: combArr[0] === '1',
            add: combArr[1] === '1',
            edit: combArr[2] === '1',
            delete: combArr[3] === '1'
          }
        } 
        return permissionObj;
      } else{
        window.location.reload()

        return permissionObj;
      }
    }else{
      window.location.reload()
      return null
    }
  }
  function decodeBase64(encodedString:any) {
    let decodedString;
    try {
        decodedString = atob(encodedString);
        return decodedString
    } catch (error) {
      return false
      throw new Error('Failed to decode base64: The string to be decoded is not correctly encoded.');
    }
    return decodedString;
}

function jsonParse(obj: any) {
  try {
    let data = obj ? JSON.parse(obj) : {}
    return data ? data : {}
  } catch (error) {
    return {}
  }


}

