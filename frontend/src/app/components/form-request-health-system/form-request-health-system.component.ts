import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormRequestHealthSystem } from '../../models/fasten/form-request-health-system';
import { FastenApiService } from '../../services/fasten-api.service';

@Component({
  selector: 'app-form-request-health-system',
  templateUrl: './form-request-health-system.component.html',
  styleUrls: ['./form-request-health-system.component.scss']
})
export class FormRequestHealthSystemComponent implements OnInit {
  formRequestHealthSystem: FormRequestHealthSystem = null

  loading: boolean = false
  submitSuccess: boolean = false
  errorMsg: string = ""

  constructor(
    private fastenApi: FastenApiService,
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.resetForm()
  }

  resetForm() {
    this.submitSuccess = false
    let requestForm = new FormRequestHealthSystem()
    requestForm.email = ''
    requestForm.name = ''
    requestForm.street_address = ''
    requestForm.website = ''

    this.formRequestHealthSystem = requestForm
  }

  submitForm() {
    this.loading = true
    this.fastenApi.requestHealthSystem(this.formRequestHealthSystem).subscribe((resp: any) => {
        this.loading = false
        this.submitSuccess = true
        //show success toast? close modal?
      },
      (err)=>{
        this.loading = false
        console.error("an error occurred during request submission",err)
        this.errorMsg = err || "An error occurred while submitting your request. Please try again later."
      })
  }

}
