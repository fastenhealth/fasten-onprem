import { Component, OnInit } from "@angular/core";

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: "icon-chart-pie-36",
    class: ""
  },
  {
    path: "/providers",
    title: "Medical Providers",
    icon: "icon-cloud-download-93",
    class: ""
  },
  {
    path: "/patient",
    title: "Patient Profile",
    icon: "icon-single-02",
    class: ""
  },
  {
    path: "/allergies",
    title: "Allergies",
    icon: "icon-puzzle-10",
    class: ""
  },
  {
    path: "/encounters",
    title: "Encounters",
    icon: "icon-align-center",
    class: ""
  },
  {
    path: "/immunizations",
    title: "Immunizations",
    icon: "icon-align-center",
    class: ""
  },
  {
    path: "/instructions",
    title: "Instructions",
    icon: "icon-align-center",
    class: ""
  },
  {
    path: "/medications",
    title: "Medications",
    icon: "icon-align-center",
    class: ""
  },
  {
    path: "/organizations",
    title: "Organizations",
    icon: "icon-align-center",
    class: ""
  },
  {
    path: "/problems",
    title: "Problems",
    icon: "icon-align-center",
    class: ""
  },
  {
    path: "/procedures",
    title: "Procedures",
    icon: "icon-align-center",
    class: ""
  },
  {
    path: "/test_results",
    title: "Test Results",
    icon: "icon-align-center",
    class: ""
  },
  {
    path: "/vitals",
    title: "Vitals",
    icon: "icon-align-center",
    class: ""
  },
  {
    path: "/demographics",
    title: "Demographics",
    icon: "icon-align-center",
    class: ""
  }
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"]
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() {}

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
    if (window.innerWidth > 991) {
      return false;
    }
    return true;
  }
}
