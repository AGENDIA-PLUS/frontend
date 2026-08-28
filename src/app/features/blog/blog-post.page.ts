import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { getBlogPost, BlogPost } from './blog.data';
import { LandingNavbarComponent } from '../landing/components/navbar/navbar.component';
import { LandingFooterComponent } from '../landing/components/footer/footer.component';
import { LandingFinalCtaComponent } from '../landing/components/final-cta/final-cta.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { BoldMarkdownPipe } from './bold-markdown.pipe';

@Component({
  selector: 'app-blog-post-page',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    LandingNavbarComponent,
    LandingFooterComponent,
    LandingFinalCtaComponent,
    EmptyStateComponent,
    ButtonComponent,
    BoldMarkdownPipe,
  ],
  template: `
    <app-landing-navbar></app-landing-navbar>
    @if (post) {
      <article class="blog-post">
        <a routerLink="/blog" class="blog-post__back">← Volver al blog</a>
        <header class="blog-post__header">
          <span class="blog-post__meta">{{ post.publishedAt | date: 'd MMM yyyy' : '' : 'es' }} · {{ post.readingTimeMin }} min de lectura</span>
          <h1>{{ post.title }}</h1>
        </header>

        <div class="blog-post__body">
          @for (section of post.sections; track $index) {
            @if (section.heading) {
              <h2>{{ section.heading }}</h2>
            }
            @for (paragraph of section.paragraphs; track $index) {
              <p [innerHTML]="paragraph | boldMarkdown"></p>
            }
          }
        </div>
      </article>
      <app-landing-final-cta></app-landing-final-cta>
    } @else {
      <div class="blog-post__not-found">
        <app-empty-state icon="🔍" title="Artículo no encontrado" description="Puede que el enlace esté roto o el artículo se haya movido.">
          <app-button routerLink="/blog">Ver todos los artículos</app-button>
        </app-empty-state>
      </div>
    }
    <app-landing-footer></app-landing-footer>
  `,
  styles: [
    `
      .blog-post {
        max-width: 720px;
        margin: 0 auto;
        padding: var(--space-10) var(--space-6) var(--space-12);
      }
      .blog-post__back {
        display: inline-block;
        margin-bottom: var(--space-6);
        font-size: var(--text-sm);
        color: var(--color-primary-600);
        font-weight: 700;
        text-decoration: none;
      }
      .blog-post__header {
        margin-bottom: var(--space-8);

        h1 {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          margin-top: var(--space-2);
        }
      }
      .blog-post__meta {
        font-size: var(--text-xs);
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
      .blog-post__body {
        font-size: var(--text-base);
        line-height: 1.75;
        color: var(--text-primary);

        h2 {
          font-size: var(--text-xl);
          margin: var(--space-8) 0 var(--space-3);
        }
        p {
          margin-bottom: var(--space-4);
        }
      }
      .blog-post__not-found {
        min-height: 50vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class BlogPostPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  post: BlogPost | undefined;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.post = getBlogPost(slug);

    if (this.post) {
      this.title.setTitle(`${this.post.title} — Agendia`);
      this.meta.updateTag({ name: 'description', content: this.post.metaDescription });
    }
  }
}
