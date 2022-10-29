///////////////////////////////////////////////////////////////////////////////////////
// Helper methods
///////////////////////////////////////////////////////////////////////////////////////

//Fasten may be served behind a reverse proxy with a subpath, so lets try to find that component if it exists.
// if no subpath is found, just use the current url information to generate a path
export function GetEndpointAbsolutePath(currentUrl: {pathname: string, protocol: string, host: string}, relativePath: string): string {

  //if its absolute, we should pass it in, as-is
  if (relativePath.indexOf('http://') === 0 || relativePath.indexOf('https://') === 0){
    //absolute
    return relativePath
  } else {
    //relative, we need to retrive the absolutePath from base
    //no `/web` path to strip out, lets just use the relative path
    let absolutePath = relativePath

    if(currentUrl.pathname.includes('/web')){
      // probably running locally, and *may* include a subpath
      let subPath = currentUrl.pathname.split('/web').slice(0, 1)[0]
      if(subPath != "/"){
        //subpath, so we need to update the absolutePath with the subpath before adding the relative path to the end
        absolutePath = subPath + relativePath
      }
    }
    return `${currentUrl.protocol}//${currentUrl.host}${absolutePath}`
  }
}
