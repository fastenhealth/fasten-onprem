import {Component, Input, OnInit, TemplateRef} from '@angular/core';
import * as dwv from 'dwv';
import {NgbModal, NgbModalModule, NgbPaginationModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import { VERSION } from '@angular/core';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';
import {CommonModule} from "@angular/common";
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
  standalone: true,
  imports: [CommonModule, NgbModalModule, NgbTooltipModule, NgbPaginationModule],
  providers: [NgbModalModule],
  selector: 'fhir-dicom',
  templateUrl: './dicom.component.html',
  styleUrls: ['./dicom.component.scss']
})
export class DicomComponent implements OnInit {
  @Input() displayModel: BinaryModel

  public loadProgress = 0;
  public dataLoaded = false;


  public tools = {
    Scroll: {},
    ZoomAndPan: {},
    WindowLevel: {},
    Draw: {
      options: ['Ruler']
    }
  };
  selectedTool = 'Scroll';

  private dwvApp: any;
  private metaData: any[];
  visibleMetaData: any[] = [] //for pagination usage

  private orientation: string;

  tagsPage = 1;
  tagsPageSize = 10;
  // tagsCollectionSize = this.metadata.length;
  // countries: Country[];

  constructor(private modalService: NgbModal) {}

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
    if(!this.displayModel) {
      return;
    }
    //Load from Input file
    let files = [new File([
      this.dataBase64toBlob(this.displayModel.data, "application/dicom")
    ], "dicom.dcm", {type: "application/dicom"})]

    this.dwvApp.loadFiles(files);

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
  openTagsModal(template: TemplateRef<any>) {
    this.refreshTags();
    this.modalService.open(template, { size: 'lg', ariaLabelledBy: 'modal-basic-title' });
  }

  refreshTags() {
    //TODO: if tag.value is a array, content should be json encoded
    this.visibleMetaData = this.metaData.map((tag, i) => ({ id: i + 1, ...tag })).slice(
      (this.tagsPage - 1) * this.tagsPageSize,
      (this.tagsPage - 1) * this.tagsPageSize + this.tagsPageSize,
    );
  }


  //This function is used to convert base64 binary data to a blob
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
