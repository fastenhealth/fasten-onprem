import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';
import {EMFJS, RTFJS, WMFJS} from 'rtf.js';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'fhir-rtf',
  templateUrl: './rtf.component.html',
  styleUrls: ['./rtf.component.scss']
})
export class RtfComponent implements OnInit {
  @Input() displayModel: BinaryModel

  constructor() { }

  ngOnInit(): void {

    let doc = new RTFJS.Document(this.stringToArrayBuffer(this.displayModel.content), null);
    doc.render().then(function(htmlElements) {
      const parent: HTMLElement = document.getElementById('rtfContent');
      for(let i = 0; i < htmlElements.length; i++){
        parent.appendChild(htmlElements[i])
      }
    }).catch(e => {
      if (e instanceof RTFJS.Error) {
        console.error("Error: " + e.message);
        document.getElementById('rtfContent').innerHTML = e.message;
      }
      else {
        throw e;
      }
    });

  }

  private stringToArrayBuffer(string): ArrayBuffer {
    const buffer = new ArrayBuffer(string.length);
    const bufferView = new Uint8Array(buffer);
    for (let i = 0; i < string.length; i++) {
      bufferView[i] = string.charCodeAt(i);
    }
    return buffer;
  }

}
