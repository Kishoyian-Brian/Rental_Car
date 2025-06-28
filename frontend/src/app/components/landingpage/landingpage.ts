import { Component } from '@angular/core';

interface Vehicle {
  imageUrl: string;
  make: string;
  model: string;
  dailyRate: number;
}

interface BlogPost {
  image: string;
  date: string;
  title: string;
  summary: string;
}

@Component({
  selector: 'app-landingpage',
  imports: [],
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.css'
})
export class Landingpage {
  vehicles: Vehicle[] = [
    {
      imageUrl: 'assets/mclaren-720s.png',
      make: 'Mclaren',
      model: '720s',
      dailyRate: 420
    },
    {
      imageUrl: 'assets/bentley-gt-v8.png',
      make: 'Bentley Continental',
      model: 'GT V8',
      dailyRate: 380
    },
    {
      imageUrl: 'assets/rolls-royce-spectre.png',
      make: 'Rolls-Royce',
      model: 'Spectre',
      dailyRate: 400
    },
    {
      imageUrl: 'assets/ferrari.png',
      make: 'Ferrari',
      model: '',
      dailyRate: 380
    }
  ];

  blogPosts: BlogPost[] = [
    {
      image: 'assets/rolls-royce-blog.png',
      date: '20.08.2023',
      title: 'Lorem Ipsum is simply dummy text of the printing...',
      summary: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
    },
    {
      image: 'assets/lamborghini-blog.png',
      date: '20.10.2022',
      title: 'Lorem Ipsum is simply dummy text of the printing...',
      summary: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
    },
    {
      image: 'assets/interview-blog.png',
      date: '19.10.2022',
      title: 'Lorem Ipsum is simply dummy text of the printing...',
      summary: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
    }
  ];
}
