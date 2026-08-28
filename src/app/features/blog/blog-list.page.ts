import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { BLOG_POSTS } from './blog.data';
import { LandingNavbarComponent } from '../landing/components/navbar/navbar.component';
import { LandingFooterComponent } from '../landing/components/footer/footer.component';

@Component({
  selector: 'app-blog-list-page',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, LandingNavbarComponent, LandingFooterComponent],
  template: `
    <app-landing-navbar></app-landing-navbar>
    <main class="blog-list">
      <header class="blog-list__header">
        <h1>Blog de Agendia</h1>
        <p>Ideas prácticas para gestionar mejor las citas de tu negocio.</p>
      </header>

      <div class="blog-list__grid">
        @for (post of posts; track post.slug) {
          <a class="blog-card" [routerLink]="['/blog', post.slug]">
            <span class="blog-card__date">{{ post.publishedAt | date: 'd MMM yyyy' : '' : 'es' }} · {{ post.readingTimeMin }} min de lectura</span>
            <h2>{{ post.title }}</h2>
            <p>{{ post.excerpt }}</p>
            <span class="blog-card__cta">Leer artículo →</span>
          </a>
        }
      </div>
    </main>
    <app-landing-footer></app-landing-footer>
  `,
  styles: [
    `
      .blog-list {
        max-width: 960px;
        margin: 0 auto;
        padding: var(--space-10) var(--space-6) var(--space-16);
      }
      .blog-list__header {
        text-align: center;
        margin-bottom: var(--space-10);

        h1 {
          font-family: var(--font-display);
          font-size: var(--text-4xl);
          margin-bottom: var(--space-2);
        }
        p {
          color: var(--text-secondary);
          font-size: var(--text-lg);
        }
      }
      .blog-list__grid {
        display: grid;
        gap: var(--space-6);
        grid-template-columns: 1fr;
      }
      @media (min-width: 720px) {
        .blog-list__grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      .blog-card {
        display: block;
        padding: var(--space-6);
        border-radius: var(--radius-xl);
        border: 1px solid var(--border-subtle);
        background: var(--surface-card);
        text-decoration: none;
        color: inherit;
        transition: transform 150ms ease, box-shadow 150ms ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        h2 {
          font-size: var(--text-lg);
          margin: var(--space-2) 0;
        }
        p {
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }
      }
      .blog-card__date {
        font-size: var(--text-xs);
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
      .blog-card__cta {
        display: inline-block;
        margin-top: var(--space-3);
        font-size: var(--text-sm);
        font-weight: 700;
        color: var(--color-primary-600);
      }
    `,
  ],
})
export class BlogListPageComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly posts = [...BLOG_POSTS].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  ngOnInit(): void {
    this.title.setTitle('Blog — Agendia');
    this.meta.updateTag({
      name: 'description',
      content: 'Ideas prácticas para gestionar mejor las citas de tu negocio: reducir ausencias, automatizar WhatsApp, y más.',
    });
  }
}
