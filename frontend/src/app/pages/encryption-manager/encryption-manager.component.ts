import { Component, OnInit } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import {PouchdbCryptConfig, PouchdbCrypto} from '../../../lib/database/plugins/crypto';
import {FastenDbService} from '../../services/fasten-db.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {ToastService} from '../../services/toast.service';
import {ToastNotification, ToastType} from '../../models/fasten/toast';

export enum CryptoPanelType {
  Loading,
  Import,
  Generate,
}


@Component({
  selector: 'app-encryption-manager',
  templateUrl: './encryption-manager.component.html',
  styleUrls: ['./encryption-manager.component.scss']
})
export class EncryptionManagerComponent implements OnInit {
  CryptoPanelType = CryptoPanelType
  cryptoPanel: CryptoPanelType = CryptoPanelType.Loading
  currentCryptoConfig: PouchdbCryptConfig = null

  generateCryptoConfigUrl: SafeResourceUrl = ""
  generateCryptoConfigFilename: string = ""
  generateCustomFileError: string = ""

  importCustomFileError: string = ""

  currentStep: number
  lastStep: number


  constructor(private fastenDbService: FastenDbService, private sanitizer: DomSanitizer, private router: Router, private toastService: ToastService) { }

  ngOnInit(): void {

    this.fastenDbService.IsDatabasePopulated()
      .then((isPopulated) => {
        if(isPopulated){
          return this.showImportCryptoConfig()
        } else {
          return this.showGenerateCryptoConfig()
        }
      })

  }

  nextHandler() {
    this.currentStep += 1
    // if (!this.stepsService.isLastStep()) {
    //   this.stepsService.moveToNextStep();
    // } else {
    //   this.onSubmit();
    // }
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Generate Wizard Methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  async showGenerateCryptoConfig(): Promise<PouchdbCryptConfig> {
    this.cryptoPanel = CryptoPanelType.Generate
    this.currentStep = 1
    this.lastStep = 2
    if(!this.currentCryptoConfig){
      this.currentCryptoConfig = await PouchdbCrypto.CryptConfig(uuidv4(), this.fastenDbService.current_user)
      await PouchdbCrypto.StoreCryptConfig(this.currentCryptoConfig) //store in indexdb


      //generate URL for downloading.
      let currentCryptoConfigBlob = new Blob([JSON.stringify(this.currentCryptoConfig)], { type: 'application/json' });
      this.generateCryptoConfigUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(currentCryptoConfigBlob));
      this.generateCryptoConfigFilename = `fasten-${this.fastenDbService.current_user}.key.json`
    }

    return this.currentCryptoConfig
  }

  generateOpenFileHandler(fileList: FileList) {
    this.generateCustomFileError = ""
    let file = fileList[0];
    this.readFileContent(file)
      .then((content) => {
        let parsedCryptoConfig = JSON.parse(content) as PouchdbCryptConfig

        //check if the parsed encryption key matches the currently set encryption key

        if(parsedCryptoConfig.key == this.currentCryptoConfig.key &&
          parsedCryptoConfig.username == this.currentCryptoConfig.username &&
          parsedCryptoConfig.config == this.currentCryptoConfig.config){
          return true
        } else {
          //throw an error & notify user
          this.generateCustomFileError = "Crypto configuration file does not match"
          throw new Error(this.generateCustomFileError)
        }
      })
      .then(() => {

        const toastNotification = new ToastNotification()
        toastNotification.type = ToastType.Success
        toastNotification.message = "Successfully validated & stored encryption key."
        toastNotification.autohide = true
        this.toastService.show(toastNotification)

        //redirect user to dashboard
        return this.router.navigate(['/dashboard']);
      })
      .catch((err) => {
        // delete invalid encryption key
        this.currentStep = 1
        return PouchdbCrypto.DeleteCryptConfig(this.fastenDbService.current_user)
          .then(() => {
            //an error occurred while importing credential
            const toastNotification = new ToastNotification()
            toastNotification.type = ToastType.Error
            toastNotification.message = "Provided encryption key does not match. Generating new encryption key, please store it and try again."
            toastNotification.autohide = false
            this.toastService.show(toastNotification)
          })
      })
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Import Wizard Methods
  /////////////////////////////////////////////////////////////////////////////////////////////////

  async showImportCryptoConfig(): Promise<any> {
    this.cryptoPanel = CryptoPanelType.Import
    this.currentStep = 1
    this.lastStep = 2
  }

  importOpenFileHandler(fileList: FileList) {
    this.importCustomFileError = ""
    let file = fileList[0];
    this.readFileContent(file)
      .then((content) => {
        let cryptoConfig = JSON.parse(content) as PouchdbCryptConfig

        if(!cryptoConfig.key || !cryptoConfig.config){
          this.importCustomFileError = "Invalid crypto configuration file"
          throw new Error(this.importCustomFileError)
        }

        return PouchdbCrypto.StoreCryptConfig(cryptoConfig)
      })
      .then(() => {
        //go to step 2
        this.currentStep = 2
        //attempt to initialize pouchdb with specified crypto
        this.fastenDbService.ResetDB()
        return this.fastenDbService.GetSources()

      })
      .then(() => {
        const toastNotification = new ToastNotification()
        toastNotification.type = ToastType.Success
        toastNotification.message = "Successfully validated & imported encryption key."
        toastNotification.autohide = true
        this.toastService.show(toastNotification)

        return this.router.navigate(['/dashboard']);
      })
      .catch((err) => {
        console.error(err)
        // delete invalid encryption key
        this.currentStep = 1
        return PouchdbCrypto.DeleteCryptConfig(this.fastenDbService.current_user)
          .then(() => {
            //an error occurred while importing credential
            const toastNotification = new ToastNotification()
            toastNotification.type = ToastType.Error
            toastNotification.message = "Provided encryption key does not match. Please try a different key"
            toastNotification.autohide = false
            this.toastService.show(toastNotification)
          })
      })
  }


  private readFileContent(file: File): Promise<string>{
    return new Promise<string>((resolve, reject) => {
      if (!file) {
        resolve('');
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = reader.result.toString();
        resolve(text);
      };
      reader.readAsText(file);
    });
  }
}
