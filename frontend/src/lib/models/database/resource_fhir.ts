import {DocType} from '../../database/constants';
import {IResourceRaw} from '../../conduit/interface';
import {Base64} from '../../utils/base64';

export class ResourceFhir {
  _id?: string
  _rev?: string
  doc_type: DocType = DocType.ResourceFhir

  created_at?: Date
  updated_at?: Date
  source_id: string = ""
  source_resource_type: string = ""
  source_resource_id: string = ""

  resource_raw?: IResourceRaw

  constructor(object?: any) {
    if(object){
      object.doc_type = DocType.ResourceFhir
      return Object.assign(this, object)
    } else{
      this.doc_type = DocType.ResourceFhir
      return this
    }
  }

  populateId(){
    //TODO: source_id should be base64 encoded (otherwise we get nested : chars)
    this._id = `${this.doc_type}:${Base64.Encode(this.source_id)}:${this.source_resource_type}:${this.source_resource_id}`
  }
}
