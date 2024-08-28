import { Component, inject, signal, WritableSignal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent , InfiniteScrollCustomEvent, IonList, IonItem, IonAvatar, IonSkeletonText, IonAlert, IonLabel, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent, IonSearchbar } from '@ionic/angular/standalone';
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
  imports: [IonSearchbar, IonInfiniteScrollContent, IonInfiniteScroll, IonBadge, 
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
  public searchTerm: string = '';
  public movies : WritableSignal<MovieResult[] | null> = signal(null);
  public filteredMovies: WritableSignal<MovieResult[] | null> = signal(null); // For filtered results

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
          this.movies.set(res.results);
          this.filteredMovies.set(this.filterMovies(res.results)); // Initialize filtered list

          if(event){
            event.target.disabled = res.total_pages === this.currentPage;
          }
        }
      
      }
      )
  }

  filterMovies(movies: MovieResult[] | null): MovieResult[] {
    if (!movies) {
      return [];
    }
    const term = this.searchTerm.toLowerCase();
    return movies.filter(movie => 
      movie.title.toLowerCase().includes(term) ||
      movie.release_date.toLowerCase().includes(term)
    );
  }

  loadMore(event: InfiniteScrollCustomEvent) 
  {
    this.currentPage++;
    this.loadMovies(event);
  }
  onSearchInput(event: any) {
    this.searchTerm = event.target.value;
    this.filteredMovies.set(this.filterMovies(this.movies()));
  }
}
