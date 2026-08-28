import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StatsService, StatsResponse } from '../../core/services/stats.service';
import { CardComponent } from '../../shared/ui/card/card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink, CardComponent, ButtonComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="stats">
      <header class="stats__header">
        <div>
          <h1>Estadísticas</h1>
          <p>Cómo le está yendo a tu negocio en el periodo seleccionado.</p>
        </div>
        <div class="stats__range">
          <input type="date" [(ngModel)]="fromDate" (change)="load()" />
          <span>—</span>
          <input type="date" [(ngModel)]="toDate" (change)="load()" />
        </div>
      </header>

      @if (loading()) {
        <div class="stats__grid">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <app-card>
              <app-skeleton width="60%" height="14px"></app-skeleton>
              <div style="height:10px"></div>
              <app-skeleton width="40%" height="28px"></app-skeleton>
            </app-card>
          }
        </div>
      } @else if (upgradeNeeded()) {
        <app-card>
          <app-empty-state
            icon="📊"
            title="Las estadísticas no están disponibles en tu plan"
            description="Mejora a Business o superior para ver métricas de tu negocio: citas, ingresos estimados, servicios y profesionales más solicitados."
          >
            <app-button routerLink="/app/configuracion">Ver planes</app-button>
          </app-empty-state>
        </app-card>
      } @else if (error()) {
        <app-card>
          <app-empty-state icon="⚠️" title="No se pudieron cargar las estadísticas" [description]="error()!">
            <app-button variant="secondary" (clicked)="load()">Reintentar</app-button>
          </app-empty-state>
        </app-card>
      } @else {
        @if (stats(); as s){
        <div class="stats__grid">
          <app-card>
            <span class="stats__label">Citas totales</span>
            <strong class="stats__value">{{ s.totals.totalAppointments }}</strong>
          </app-card>
          <app-card>
            <span class="stats__label">Completadas</span>
            <strong class="stats__value stats__value--success">{{ s.totals.completed }}</strong>
          </app-card>
          <app-card>
            <span class="stats__label">Canceladas</span>
            <strong class="stats__value stats__value--danger">{{ s.totals.cancelled }}</strong>
            <small class="stats__rate">{{ s.totals.cancellationRate }}% del total</small>
          </app-card>
          <app-card>
            <span class="stats__label">No-shows</span>
            <strong class="stats__value stats__value--warning">{{ s.totals.noShow }}</strong>
            <small class="stats__rate">{{ s.totals.noShowRate }}% del total</small>
          </app-card>
          <app-card>
            <span class="stats__label">Ingresos estimados</span>
            <strong class="stats__value">{{ s.totals.estimatedRevenue }} €</strong>
            <small class="stats__rate">Solo citas completadas</small>
          </app-card>
          <app-card>
            <span class="stats__label">Clientes nuevos</span>
            <strong class="stats__value">{{ s.totals.newCustomers }}</strong>
          </app-card>
        </div>

        <div class="stats__row">
          <app-card>
            <h2 class="stats__section-title">Servicios más solicitados</h2>
            @if (s.topServices.length === 0) {
              <p class="stats__empty">Sin datos en este periodo.</p>
            } @else {
              @for (item of s.topServices; track item.id) {
                <div class="bar-row">
                  <span class="bar-row__label">{{ item.name }}</span>
                  <div class="bar-row__track">
                    <div class="bar-row__fill" [style.width.%]="percent(item.count, s.topServices[0].count)"></div>
                  </div>
                  <span class="bar-row__count">{{ item.count }}</span>
                </div>
              }
            }
          </app-card>

          <app-card>
            <h2 class="stats__section-title">Profesionales más solicitados</h2>
            @if (s.topStaff.length === 0) {
              <p class="stats__empty">Sin datos en este periodo.</p>
            } @else {
              @for (item of s.topStaff; track item.id) {
                <div class="bar-row">
                  <span class="bar-row__label">{{ item.name }}</span>
                  <div class="bar-row__track">
                    <div class="bar-row__fill bar-row__fill--accent" [style.width.%]="percent(item.count, s.topStaff[0].count)"></div>
                  </div>
                  <span class="bar-row__count">{{ item.count }}</span>
                </div>
              }
            }
          </app-card>
        </div>

        <app-card>
          <h2 class="stats__section-title">Citas por día</h2>
          @if (s.appointmentsByDay.length === 0) {
            <p class="stats__empty">Sin datos en este periodo.</p>
          } @else {
            <div class="trend">
              @for (day of s.appointmentsByDay; track day.date) {
                <div class="trend__col" [title]="day.date + ': ' + day.count + ' citas'">
                  <div class="trend__bar" [style.height.%]="percent(day.count, maxDayCount(s))"></div>
                  <span class="trend__label">{{ day.date | date: 'd/M' }}</span>
                </div>
              }
            </div>
          }
        </app-card>
      }
    }
    </div>
  `,
  styleUrl: './stats.page.scss',
})
export class StatsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly statsService = inject(StatsService);

  readonly business = computed(() => this.auth.activeBusiness());
  readonly loading = signal(false);
  readonly error = signal('');
  readonly upgradeNeeded = signal(false);
  readonly stats = signal<StatsResponse | null>(null);

  fromDate = this.daysFromNow(-30);
  toDate = this.daysFromNow(0);

  constructor() {
    if (this.business()) this.load();
  }

  load(): void {
    const business = this.business();
    if (!business) return;

    this.loading.set(true);
    this.error.set('');
    this.upgradeNeeded.set(false);

    this.statsService.getStats(business.id, this.fromDate, this.toDate).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 403) {
          this.upgradeNeeded.set(true);
        } else {
          this.error.set('Comprueba tu conexión e inténtalo de nuevo.');
        }
      },
    });
  }

  percent(value: number, max: number): number {
    if (max === 0) return 0;
    return Math.max(4, Math.round((value / max) * 100));
  }

  maxDayCount(s: StatsResponse): number {
    return Math.max(1, ...s.appointmentsByDay.map((d) => d.count));
  }

  private daysFromNow(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
}
