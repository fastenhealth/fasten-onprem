import { Routes } from "@angular/router";

import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { PatientComponent } from "../../pages/patient/patient.component";
import {MedicalProvidersComponent} from '../../pages/medical-providers/medical-providers.component';

export const AdminLayoutRoutes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  { path: "patient", component: PatientComponent },
  { path: "providers", component: MedicalProvidersComponent },
];
