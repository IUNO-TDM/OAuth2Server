import {Component, OnInit, ViewChild} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  navigationButtonsVisible = true;
  tdmLogoVisible = true;
  menuVisible = false;
  
  title = 'app';
  constructor(
    private router: Router    
  ) {
  }

  ngOnInit() {
  }

  startClicked() {
    this.router.navigateByUrl('/landingpage');
  }

  tdmClicked() {
    window.location.href = "/console";
    // this.router.navigateByUrl('/console/dashboard');
  }


  statisticsClicked() {
    this.router.navigateByUrl('/statistics');
  }

  newsClicked() {
    this.router.navigateByUrl('/news');
  }
}
