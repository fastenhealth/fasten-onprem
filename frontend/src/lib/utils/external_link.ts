export function OpenExternalLink(url: string, desktopMode: boolean, windowId?: string){
  //check if url starts with https, and if not, prepend it (external links are never relative)
  if(!url.startsWith("https://") && !url.startsWith("http://")){
    url = "https://" + url;
  }

  //check if wails exists and is defined
  if(typeof wails !== "undefined" && desktopMode){
    wails.CallByName("pkg.AppService.BrowserOpenURL", url, windowId || 'external')
  } else{
    window.open(url, "_blank");
  }

}
