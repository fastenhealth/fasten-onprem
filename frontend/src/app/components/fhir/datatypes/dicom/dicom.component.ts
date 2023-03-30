import {Component, Input, OnInit} from '@angular/core';
import * as dwv from 'dwv';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { VERSION } from '@angular/core';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';
// Copied from https://raw.githubusercontent.com/ivmartel/dwv-angular/master/src/app/dwv/dwv.component.ts

// gui overrides

// Image decoders (for web workers)
dwv.image.decoderScripts = {
  jpeg2000: 'assets/dwv/decoders/pdfjs/decode-jpeg2000.js',
  'jpeg-lossless': 'assets/dwv/decoders/rii-mango/decode-jpegloss.js',
  'jpeg-baseline': 'assets/dwv/decoders/pdfjs/decode-jpegbaseline.js',
  rle: 'assets/dwv/decoders/dwv/decode-rle.js'
};


@Component({
  selector: 'fhir-dicom',
  templateUrl: './dicom.component.html',
  styleUrls: ['./dicom.component.scss']
})
export class DicomComponent implements OnInit {
  @Input() displayModel: BinaryModel

  public versions: any;
  public tools = {
    Scroll: {},
    ZoomAndPan: {},
    WindowLevel: {},
    Draw: {
      options: ['Ruler']
    }
  };
  public toolNames: string[] = Object.keys(this.tools);
  public selectedTool = 'Select Tool';
  public loadProgress = 0;
  public dataLoaded = false;

  private dwvApp: any;
  private metaData: any[];

  private orientation: string;

  // drop box class name
  private dropboxDivId = 'dropBox';
  private dropboxClassName = 'dropBox';
  private borderClassName = 'dropBoxBorder';
  private hoverClassName = 'hover';

  constructor(private modalService: NgbModal) {
    this.versions = {
      dwv: dwv.getVersion(),
      angular: VERSION.full
    };
  }

  ngOnInit() {
    // create app
    this.dwvApp = new dwv.App();
    // initialise app
    this.dwvApp.init({
      dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
      tools: this.tools
    });
    // handle load events
    let nLoadItem = null;
    let nReceivedLoadError = null;
    let nReceivedLoadAbort = null;
    let isFirstRender = null;
    this.dwvApp.addEventListener('loadstart', (/*event*/) => {
      // reset flags
      this.dataLoaded = false;
      nLoadItem = 0;
      nReceivedLoadError = 0;
      nReceivedLoadAbort = 0;
      isFirstRender = true;
      // hide drop box
      //TODO:
      // this.showDropbox(false);
    });
    this.dwvApp.addEventListener('loadprogress', (event) => {
      this.loadProgress = event.loaded;
    });
    this.dwvApp.addEventListener('renderend', (/*event*/) => {
      if (isFirstRender) {
        isFirstRender = false;
        // available tools
        let selectedTool = 'ZoomAndPan';
        if (this.dwvApp.canScroll()) {
          selectedTool = 'Scroll';
        }
        this.onChangeTool(selectedTool);
      }
    });
    this.dwvApp.addEventListener('load', (/*event*/) => {
      // set dicom tags
      this.metaData = dwv.utils.objectToArray(this.dwvApp.getMetaData(0));
      // set data loaded flag
      this.dataLoaded = true;
    });
    this.dwvApp.addEventListener('loadend', (/*event*/) => {
      if (nReceivedLoadError) {
        this.loadProgress = 0;
        alert('Received errors during load. Check log for details.');
        // show drop box if nothing has been loaded
        if (!nLoadItem) {
          //TODO: this.showDropbox(true);
        }
      }
      if (nReceivedLoadAbort) {
        this.loadProgress = 0;
        alert('Load was aborted.');
        //TODO: this.showDropbox(true);
      }
    });
    this.dwvApp.addEventListener('loaditem', (/*event*/) => {
      ++nLoadItem;
    });
    this.dwvApp.addEventListener('loaderror', (event) => {
      console.error(event.error);
      ++nReceivedLoadError;
    });
    this.dwvApp.addEventListener('loadabort', (/*event*/) => {
      ++nReceivedLoadAbort;
    });

    // handle key events
    this.dwvApp.addEventListener('keydown', (event) => {
      this.dwvApp.defaultOnKeydown(event);
    });
    // handle window resize
    window.addEventListener('resize', this.dwvApp.onResize);

    // setup drop box
    //TODO: this.setupDropbox();

    // possible load from location
    // dwv.utils.loadFromUri(window.location.href, this.dwvApp);

    //Load from Input file
    //TODO: THIS IS BROKEN. FIX IT
    let files = [new File([
      this.dataBase64toBlob(this.displayModel.data, "application/dicom")
    ], "dicom.dcm", {type: "application/dicom"})]
    console.log("LOADED FILE FROM RESOURCE", files)

    this.dwvApp.loadFiles(files);

  }

  /**
   * Get the icon of a tool.
   *
   * @param tool The tool name.
   * @returns The associated icon string.
   */
  getToolIcon = (tool: string) => {
    let res: string;
    if (tool === 'Scroll') {
      res = 'menu';
    } else if (tool === 'ZoomAndPan') {
      res = 'search';
    } else if (tool === 'WindowLevel') {
      res = 'contrast';
    } else if (tool === 'Draw') {
      res = 'straighten';
    }
    return res;
  }

  /**
   * Handle a change tool event.
   * @param tool The new tool name.
   */
  onChangeTool = (tool: string) => {
    if ( this.dwvApp ) {
      this.selectedTool = tool;
      this.dwvApp.setTool(tool);
      if (tool === 'Draw') {
        this.onChangeShape(this.tools.Draw.options[0]);
      }
    }
  }

  /**
   * Check if a tool can be run.
   *
   * @param tool The tool name.
   * @returns True if the tool can be run.
   */
  canRunTool = (tool: string) => {
    let res: boolean;
    if (tool === 'Scroll') {
      res = this.dwvApp.canScroll();
    } else if (tool === 'WindowLevel') {
      res = this.dwvApp.canWindowLevel();
    } else {
      res = true;
    }
    return res;
  }

  /**
   * For toogle button to not get selected.
   *
   * @param event The toogle change.
   */
  onSingleToogleChange = (event) => {
    // unset value -> do not select button
    event.source.buttonToggleGroup.value = '';
  }

  /**
   * Toogle the viewer orientation.
   */
  toggleOrientation = () => {
    if (typeof this.orientation !== 'undefined') {
      if (this.orientation === 'axial') {
        this.orientation = 'coronal';
      } else if (this.orientation === 'coronal') {
        this.orientation = 'sagittal';
      } else if (this.orientation === 'sagittal') {
        this.orientation = 'axial';
      }
    } else {
      // default is most probably axial
      this.orientation = 'coronal';
    }
    // update data view config
    const config = {
      '*': [
        {
          divId: 'layerGroup0',
          orientation: this.orientation
        }
      ]
    };
    this.dwvApp.setDataViewConfig(config);
    // render data
    for (let i = 0; i < this.dwvApp.getNumberOfLoadedData(); ++i) {
      this.dwvApp.render(i);
    }
  }

  /**
   * Handle a change draw shape event.
   * @param shape The new shape name.
   */
  private onChangeShape = (shape: string) => {
    if ( this.dwvApp && this.selectedTool === 'Draw') {
      this.dwvApp.setToolFeatures({shapeName: shape});
    }
  }

  /**
   * Handle a reset event.
   */
  onReset = () => {
    if ( this.dwvApp ) {
      this.dwvApp.resetDisplay();
    }
  }

  /**
   * Open the DICOM tags dialog.
   */
  openTagsDialog = () => {
    console.log("OPEN TAGS DIALOG, NOT IMPLEMENTED YET");
    // this.modalService.open(TagsDialogComponent,
    //   {
    //     width: '80%',
    //     height: '90%',
    //     data: {
    //       title: 'DICOM Tags',
    //       value: this.metaData
    //     }
    //   }
    // );
  }

  // drag and drop [begin] -----------------------------------------------------


  //TODO:
  // /**
  //  * Handle a drop event.
  //  * @param event The event to handle.
  //  */
  // private onDrop = (event: DragEvent) => {
  //   this.defaultHandleDragEvent(event);
  //   // load files
  //   this.dwvApp.loadFiles(event.dataTransfer.files);
  // }

  onFileChange(event) {
    //TODO: This works correctly, but it's not the right way to do it (we should load from resource)
    console.log("onFileChange");
    console.log(event);
    console.log(event.target.files);
    this.dwvApp.loadFiles(event.target.files);
  }

  dataBase64toBlob(base64Data, contentType) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(base64Data);

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: contentType });
  }
}
