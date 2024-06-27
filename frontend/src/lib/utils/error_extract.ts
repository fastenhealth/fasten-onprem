
//https://stackoverflow.com/a/18391400/1157633
export function extractErrorFromResponse(errResp: any): string {
  let errMsg = ""
  if(errResp.name == "HttpErrorResponse" && errResp.error && errResp.error?.error){
    errMsg = errResp.error.error
  } else {
    errMsg = JSON.stringify(errResp, replaceErrors)
  }
  return errMsg
}

//stringify error objects
export function replaceErrors(key, value) {
  if (value instanceof Error) {
    var error = {};

    Object.getOwnPropertyNames(value).forEach(function (propName) {
      error[propName] = value[propName];
    });

    return error;
  }

  return value;
}
