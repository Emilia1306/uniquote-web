import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { NgFor, NgIf, DecimalPipe, CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis,
  ApexDataLabels, ApexStroke, ApexMarkers, ApexGrid, ApexLegend,
  ApexTooltip, ApexPlotOptions, ApexFill
} from 'ng-apexcharts';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideFileText, lucideClock, lucideCheckCheck, lucideXCircle
} from '@ng-icons/lucide';
import { CotizacionesApi } from '../../../../features/cotizaciones/data/cotizaciones.api';
import { firstValueFrom } from 'rxjs';

type Kpi = { label: string; value: number; icon: string; bgClass: string; iconClass: string };
type Serie = { mes: string; totales: number; aprobadas: number };
type Semana = { dia: string; valor: number };

import { UiSkeletonComponent } from '../../../../shared/ui/ui-skeleton/ui-skeleton.component';

@Component({
  selector: 'gerente-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgApexchartsModule, DecimalPipe, NgIcon, UiSkeletonComponent],
  providers: [provideIcons({ lucideFileText, lucideClock, lucideCheckCheck, lucideXCircle })],
  templateUrl: './gerente-dashboard.html',
})
export class GerenteDashboardComponent {
  private cotizacionesApi = inject(CotizacionesApi);

  // ===== Encabezado =====
  titulo = 'Inicio';
  subtitulo = 'Resumen general de cotizaciones y aprobaciones';

  loading = signal<boolean>(true);

  // ===== KPIs =====
  kpis = signal<Kpi[]>([
    { label: 'Cotizaciones Totales', value: 0, icon: 'lucideFileText', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
    { label: 'Aprobaciones Pendientes', value: 0, icon: 'lucideClock', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
    { label: 'Cotizaciones Aprobadas', value: 0, icon: 'lucideCheckCheck', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
    { label: 'Cotizaciones Rechazadas', value: 0, icon: 'lucideXCircle', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
  ]);

  // ===== Datos de gráficas =====
  serieMeses = signal<Serie[]>([]);
  actividad = signal<Semana[]>([]);

  totalAprobadas = computed(() =>
    this.serieMeses().reduce((acc, s) => acc + s.aprobadas, 0)
  );

  async ngOnInit() {
    // Guard: Avoid redundant loading
    if (this.serieMeses().length > 0) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    try {
      const [total, pend, aprob, noApp, sixMonths, weekly] = await Promise.all([
        firstValueFrom(this.cotizacionesApi.getStatsTotal()),
        firstValueFrom(this.cotizacionesApi.getStatsPendientes()),
        firstValueFrom(this.cotizacionesApi.getStatsAprobadas()),
        firstValueFrom(this.cotizacionesApi.getStatsNoAprobadas()),
        firstValueFrom(this.cotizacionesApi.getStatsUltimos6Meses()),
        firstValueFrom(this.cotizacionesApi.getStatsActividadSemanal())
      ]);

      this.kpis.set([
        { label: 'Cotizaciones Totales', value: total.total, icon: 'lucideFileText', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
        { label: 'Aprobaciones Pendientes', value: pend.total, icon: 'lucideClock', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
        { label: 'Cotizaciones Aprobadas', value: aprob.total, icon: 'lucideCheckCheck', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
        { label: 'Cotizaciones No Aprobadas', value: noApp.total, icon: 'lucideXCircle', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
      ]);

      const monthMap = sixMonths.map((m: any) => ({
        mes: m.month,
        totales: m.total,
        aprobadas: m.aprobadas
      }));
      this.serieMeses.set(monthMap);

      const weekMap = weekly.days.map((d: any) => ({
        dia: d.day,
        valor: d.total
      }));
      this.actividad.set(weekMap);

    } catch (e) {
      console.error('Error loading gerente dashboard stats', e);
    } finally {
      this.loading.set(false);
    }
  }

  // ===== Line chart (con datalabels) =====
  lineSeries = computed<ApexAxisChartSeries>(() => [
    { name: 'Totales', data: this.serieMeses().map(s => s.totales) },
    { name: 'Aprobadas', data: this.serieMeses().map(s => s.aprobadas) },
  ]);
  lineChart: ApexChart = { type: 'line', height: 260, toolbar: { show: false } };
  lineXAxis = computed<ApexXAxis>(() => ({
    categories: this.serieMeses().map(s => s.mes),
    axisBorder: { show: false }, axisTicks: { show: false },
    labels: { style: { colors: '#6b7280' } },
  }));
  lineYAxis: ApexYAxis = { labels: { style: { colors: '#6b7280' } }, decimalsInFloat: 0 };
  lineStroke: ApexStroke = { curve: 'smooth', width: 3 };
  lineMarkers: ApexMarkers = { size: 3, strokeWidth: 0 };
  lineGrid: ApexGrid = { borderColor: '#e5e7eb', strokeDashArray: 4 };
  lineLegend: ApexLegend = { show: true, position: 'top' };
  lineTooltip: ApexTooltip = { theme: 'light' };
  lineDataLabels: ApexDataLabels = {
    enabled: false, // User requested removing "black shadow", keeping lines clean. Data labels off for line chart is usually cleaner unless asked.
    background: { enabled: false },
    style: { colors: ['#111827'] },
    offsetY: -6,
    formatter: (val: number) => `${val}`
  };
  lineFill: ApexFill = { type: 'solid', opacity: 1 };
  lineColors = ['#000000', '#F05546']; // Black & Brand

  // ===== Barras (con datalabels) =====
  barSeries = computed<ApexAxisChartSeries>(() => [
    { name: 'Cotizaciones', data: this.actividad().map(a => a.valor) },
  ]);
  barChart: ApexChart = { type: 'bar', height: 260, toolbar: { show: false } };
  barXAxis = computed<ApexXAxis>(() => ({
    categories: this.actividad().map(a => a.dia),
    axisBorder: { show: false }, axisTicks: { show: false },
    labels: { style: { colors: '#6b7280' } },
  }));
  barYAxis: ApexYAxis = { labels: { style: { colors: '#6b7280' } }, decimalsInFloat: 0 };
  barPlot: ApexPlotOptions = {
    bar: {
      borderRadius: 4,
      columnWidth: '45%',
      dataLabels: { position: 'top' } // Move labels to top
    }
  };
  barGrid: ApexGrid = { borderColor: '#e5e7eb', strokeDashArray: 4, padding: { top: 20 } }; // Add padding for labels
  barDataLabels: ApexDataLabels = {
    enabled: true,
    offsetY: -20, // Move up relative to top of bar (outside)
    style: { colors: ['#333'] }, // Dark color for visibility on white background
    formatter: (val: number) => `${val}`
  };
  barFill: ApexFill = { opacity: 1 };
  barColors = ['#F05546']; // Brand
  barTooltip: ApexTooltip = { theme: 'light' };
}
