import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// component
import { AssetOrganizerComponent } from './asset-organizer/asset-organizer';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AssetOrganizerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = '3D Asset Organizer';
}
