import { Component, OnInit } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import {PouchdbCryptConfig, PouchdbCrypto} from '../../../lib/database/plugins/crypto';
import {FastenDbService} from '../../services/fasten-db.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Router} from '@angular/router';

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
  constructor(private fastenDbService: FastenDbService, private sanitizer: DomSanitizer, private router: Router) { }

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

  async showGenerateCryptoConfig(): Promise<PouchdbCryptConfig> {
    this.cryptoPanel = CryptoPanelType.Generate
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

  async showImportCryptoConfig(): Promise<any> {
    this.cryptoPanel = CryptoPanelType.Import
  }

  openFileHandler(fileList: FileList) {
    let file = fileList[0];
    this.readFileContent(file)
      .then((content) => {
        let cryptoConfig = JSON.parse(content) as PouchdbCryptConfig

        if(cryptoConfig.key && cryptoConfig.config){
          return PouchdbCrypto.StoreCryptConfig(cryptoConfig)
        } else {
          //throw an error & notify user
          console.error("Invalid crypto configuration file")
        }
      })
      .then(() => {
        //redirect user to dashboard
        return this.router.navigate(['/dashboard']);
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
