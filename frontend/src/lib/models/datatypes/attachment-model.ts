import fhirpath from 'fhirpath';

export class AttachmentModel {
  contentType: string
  language: string
  data: string
  url: string
  size: number
  hash: string
  title: string
  creation: string

  constructor(fhirData: any) {
    this.contentType = fhirData.contentType
    this.language = fhirData.language
    this.data = fhirData.data
    this.url = fhirData.url
    this.size = fhirData.size
    this.hash = fhirData.hash
    this.title = fhirData.title
    this.creation = fhirData.creation
  }

}
