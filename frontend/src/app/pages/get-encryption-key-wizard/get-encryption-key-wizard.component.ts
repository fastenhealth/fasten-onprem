import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastNotification, ToastType } from 'src/app/models/fasten/toast';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-get-encryption-key-wizard',
  templateUrl: './get-encryption-key-wizard.component.html',
  styleUrls: ['./get-encryption-key-wizard.component.scss'],
})
export class GetEncryptionKeyWizardComponent implements OnInit {
  gridImages: string[] = [
    "f8f9ce28-d79b-4b54-9f7d-3f0aaba88c2c.png",
    "89bb6993-b806-49a2-84e2-6e70705c504a.png",
    "9fcc4529-7dc9-4c66-9198-574f978c8bb7.png",
    "68952002-f17e-4086-aae5-841241b194dd.png",
    "767b97b9-4538-433f-ab7a-14ccb0053323.png",
    "74078880-4084-430e-bc6c-223e5990cef8.png",
    "10668246-1077-4c1d-a6ce-0557c9476e77.png",
    "f7e4fc08-c6f6-426b-be98-d60aa36d3b8b.png",
    "65308856-beaa-46a0-9775-20c6c9322add.png",
    "6e901e85-8f45-4c60-8d1f-12621aad07f1.png",
    "e675376d-03de-4e66-8196-eaccda536ad5.png",
    "a36fd256-2751-464f-b6d7-418279595b1e.png",
    "c623f37e-6399-4a13-909f-3d9886130673.png",
    "467592a3-7f5f-4258-909e-a99ca971ce15.png",
    "5ad8a5ab-6570-4f1e-8002-30a051ec52c2.png",
    "ddbef50d-3940-4411-9dea-6bf759704c6e.png",
    "fc2dcde0-0848-4b09-aeaf-bfef58120de9.png",
    "347c0df7-5817-470e-8b28-2802f90461f6.png",
    "ec5bc181-5466-4ebd-9e42-471593b8d104.png",
    "d3b1eba5-ec53-4e6d-9600-9510afbc4dda.png",
    "16483fad-5c24-4766-ad53-bd78551f0768.png",
    "ae8026ed-e74b-4bf3-9f53-458c250420ba.png",
    "907d39f4-6b30-46cd-b0c8-f525c636c933.png",
    "6b076b97-18f7-452d-9f09-20dffb01729f.png",
    "c7feccc5-ad10-4aeb-91b0-12b6b93feeba.png",
    "c66a7c1e-21f2-44aa-9486-cdfb5ad699ba.png",
    "82af2366-1d27-4665-ba99-e5a60a75205a.png",
    "2289e832-64da-47d9-82ef-1f4e15ccf627.png",
    "26768525-2b04-4715-9159-3679598289a3.png",
    "80af4067-77e9-4c13-b617-4f370dc14d3f.png",
    "ec6c5f06-d7f8-4eac-8e2f-6cda4536d8ab.png",
    "93ee1d70-6eaa-487b-84d1-cc18bcda253f.png",
    "6d5ba4db-4b63-4277-bb80-dc278dbe28bd.png",
    "b22e4e71-1121-4fca-b158-efbb906918e9.png",
    "49fd46d0-05ce-4c7d-923c-3891935f6947.png",
    "19652f82-98b9-44e6-9964-e426192a723d.png",
    "314a06fc-4efc-4e34-8048-565455e4f3e1.png",
    "8123cfc7-53b6-45d6-ace3-b64d4bd3234b.png",
    "35159b16-a1b5-45ba-9d4f-83f471d5f44b.png",
    "d6c0016f-aaec-4764-ac28-7a6eda64b693.png",
    "d09c7811-213b-4c19-9154-48e57174f239.png",
    "2bcdcc4c-0f13-4edb-85f4-2c9f4f948df0.png",
    "4a4720a0-0efc-4b63-a83d-a8cc5b1c15ad.png",
    "98f680b2-15c4-4854-902b-ed6b69425164.png",
    "32283b0a-3c36-4f92-b9c2-dd2edf3a3db1.png",
    "d56e9e82-3f62-4ce8-8a55-27da90fbe183.png",
    "4fc37973-195c-4e25-8751-331a3b88e685.png",
    "fb0bb8fa-8336-4b26-bdc5-7f8a432c1d94.png",
    "7ca2d9d1-d300-479d-ab85-f956b6ef60de.png",
    "4fd8bb55-bb2d-4748-a134-bbab7a22e4db.png",
    "63cde119-f9d8-468d-900a-1976211739f8.png",
    "e8290a84-88a1-4eac-a5b4-b2c63146b2c9.png",
    "13b592f9-5c8b-4f90-aa54-5ab57a29ea89.png",
    "0398ce8e-9200-430c-a654-f2057bc9a2d4.png",
    "92b1d310-99a1-4de2-99b6-975eaf5a3744.png",
    "418d563f-bd82-473f-a738-cd9775db4e56.png",
    "8fb52893-1e93-4fea-adba-838e9b42e4d2.png",
    "acec8466-8b0a-4adc-9929-561b7136fccb.png",
    "3d01addb-1103-49ca-9c74-3027112e4aa8.png",
    "5f5973bf-d11c-4f99-9b86-b1303cea3503.png",
    "1317665c-e5c4-48b8-b3a5-2a90aa0283d7.png",
    "48f2153e-6f4a-4da5-99a5-775a888c218a.png",
    "34451b52-0f65-4e1a-91aa-5f2b1420f4b7.png",
    "d3a10e7c-63c1-4309-b801-e42ce6e575d5.png",
    "4c74937f-c30d-49c8-993e-c5a133f92414.png",
    "5c4c748f-acd5-4fc8-b6cd-a37f629709fb.png",
    "0293e1f1-291e-48ad-a5d0-cc7fcb062603.png",
    "407f63d2-8fc7-42dd-9a46-23c76693789b.png",
    "6d5de058-cc60-4f07-89db-bcc6817bb115.png",
    "a1c9be32-3539-4390-bf01-828d5fb9f57d.png",
    "562c8d0a-e524-49d7-81c2-70b34b4b9a15.png",
    "8023b832-eaca-414a-9a53-c2fe423087d2.png",
    "e8e73128-7722-4514-9684-1c17d43d880e.png",
    "24cb81a7-dd2b-4b07-808b-f6611fea0393.png",
    "5266bc57-58db-4171-8d73-a2a40ff380d2.png",
    "9752c0a1-49f5-4842-8554-bfa3a6a3c3b4.png",
    "df4a6dd3-672f-4547-8ade-609df28dcda9.png",
    "921bb517-fdc9-4ca2-b9fc-a9e17e6cb8fc.png",
    "e3f229a1-8637-49b1-abaa-84d228aff34a.png",
    "53f22687-4635-4bff-99e2-2eacdc402359.png",
    "c7fe32b2-97c6-45f7-90f8-47213c9b85f1.png",
    "a7a87c72-1d8a-42d6-b0a4-c72b7dd8933a.png",
    "2630415e-1871-437a-84de-52ad7ce88f3e.png",
    "b53ff282-4725-45f7-a436-89f77320f062.png",
  ];
  encryptionKey: string | null = null;
  loading = false;
  error: string | null = null;
  encryptionKeyDownloaded = false;
  acknowledged = false;
  showEncryptionKey = false;
  settingUpKey = false;
  countdown: number = 5;
  private countdownInterval: any;

  constructor(
    private fastenApiService: FastenApiService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchEncryptionKey();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  fetchEncryptionKey(): void {
    this.loading = true;
    this.error = null;

    this.fastenApiService.getEncryptionKey().subscribe({
      next: (response) => {
        this.encryptionKey = response;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch encryption key.';
        console.error(err);
        this.loading = false;
      },
    });
  }

  toggleEncryptionKeyVisibility(): void {
    this.showEncryptionKey = !this.showEncryptionKey;
  }

  startCountdown(): void {
    this.countdown = 5;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.redirectToSignup();
      }
    }, 1000);
  }

  private showToast(type: ToastType, message: string): void {
    const toastNotification = new ToastNotification();
    toastNotification.type = type;
    toastNotification.message = message;
    this.toastService.show(toastNotification);
  }

  copyToClipboard(): void {
    if (this.encryptionKey) {
      navigator.clipboard.writeText(this.encryptionKey).then(() => {
        this.showToast(ToastType.Success, `Successfully copied encryption key to clipboard!`);
      });
    }
  }

  downloadEncryptionKey(): void {
    if (this.encryptionKey) {
      const blob = new Blob([this.encryptionKey], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'encryption_key.txt';
      a.click();
      URL.revokeObjectURL(url);

      this.encryptionKeyDownloaded = true;
      this.showToast(ToastType.Success, `Successfully downloaded encryption key!`);
    }
  }

  async proceedToSignup(): Promise<void> {
    if (!this.encryptionKey) {
      this.showToast(ToastType.Error, 'Encryption key is not available.');
      return;
    }

    this.settingUpKey = true;
    this.error = null;

    try {
      await this.fastenApiService.setupEncryptionKey(this.encryptionKey).toPromise();
      this.showToast(ToastType.Success, 'Encryption key set up successfully! Redirecting...');
      this.startCountdown();
    } catch (err) {
      this.error = 'Failed to set up encryption key. Please try again.';
      this.showToast(ToastType.Error, this.error);
      console.error(err);
      this.settingUpKey = false; // Ensure settingUpKey is reset on error
    }
  }

  redirectToSignup(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.router.navigate(['/auth/signup/wizard']);
  }
}
