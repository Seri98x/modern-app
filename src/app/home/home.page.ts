import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent , InfiniteScrollCustomEvent, IonList, IonItem, IonAvatar, IonSkeletonText, IonAlert, IonLabel, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { MovieService } from '../services/movie.service';
import { catchError, finalize } from 'rxjs';
import { MovieResult } from '../services/interfaces';
import { DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonInfiniteScrollContent, IonInfiniteScroll, IonBadge, 
    IonLabel, 
    IonAlert, 
    IonAvatar, 
    IonItem, 
    IonList, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonList,
    IonSkeletonText,
    DatePipe,
    RouterModule],
})
export class HomePage {
  private movieService = inject(MovieService);
  private currentPage = 1;
  public error = null;
  public isLoading = false;
  public movies : MovieResult [] = [];
  public imageBaseUrl = 'https://image.tmdb.org/t/p'
  public dummyArray = new Array(5);

  constructor() 
  {
    this.loadMovies();
  }

  loadMovies(event?: InfiniteScrollCustomEvent)
  {
      this.error = null;

      if(!event)
      {
         this.isLoading = true;
      }

      this.movieService.getTopRatedMovies(this.currentPage).pipe(
        finalize(()=> {
          this.isLoading = false;
          if(event){
            event.target.complete();
            
          }
        }), catchError((err :any) => {
          console.log(err);
          this.error = err.error.status_message;
          return [];
        })
      ).subscribe({
        next: (res) => {
          this.movies.push(...res.results)
          if(event){
            event.target.disabled = res.total_pages === this.currentPage;
          }
        }
      
      }
      )
  }

  loadMore(event: InfiniteScrollCustomEvent) 
  {
    this.currentPage++;
    this.loadMovies(event);
  }
}
