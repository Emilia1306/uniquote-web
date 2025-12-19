import { Component, signal, computed, inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-director-dashboard',
  standalone: true,
  imports: [NgApexchartsModule, DecimalPipe, NgApexchartsModule, NgIcon, CommonModule],
  providers: [provideIcons({ lucideFileText, lucideClock, lucideCheckCheck, lucideXCircle })],
  templateUrl: './director-dashboard.html',
  styleUrl: './director-dashboard.scss',
})
export class DirectorDashboard implements OnInit {
  private cotizacionesApi = inject(CotizacionesApi);

  // ===== Encabezado =====
  titulo = 'Inicio';
  subtitulo = 'Resumen de mis cotizaciones';

  loading = signal<boolean>(true);

  // ===== KPIs =====
  kpis = signal<Kpi[]>([
    { label: 'Cotizaciones Totales', value: 0, icon: 'lucideFileText', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
    { label: 'Enviadas', value: 0, icon: 'lucideClock', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
    { label: 'Cotizaciones Aprobadas', value: 0, icon: 'lucideCheckCheck', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
    { label: 'Cotizaciones No Aprobadas', value: 0, icon: 'lucideXCircle', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
  ]);

  // ===== Datos de gráficas =====
  serieMeses = signal<Serie[]>([]);
  actividad = signal<Semana[]>([]);

  totalAprobadas = computed(() =>
    this.serieMeses().reduce((acc, s) => acc + s.aprobadas, 0)
  );

  async ngOnInit() {
    this.loading.set(true);
    try {
      // ✅ Usar endpoints /mine para estadísticas personales
      const [summary, sixMonths, weekly] = await Promise.all([
        firstValueFrom(this.cotizacionesApi.getStatsMineSummary()),
        firstValueFrom(this.cotizacionesApi.getStatsMineUltimos6Meses()),
        firstValueFrom(this.cotizacionesApi.getStatsMineActividadSemanal())
      ]);

      console.log('Director Dashboard Data:', { summary, sixMonths, weekly });

      this.kpis.set([
        { label: 'Cotizaciones Totales', value: summary.total, icon: 'lucideFileText', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
        { label: 'Enviadas', value: summary.enviados, icon: 'lucideClock', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
        { label: 'Cotizaciones Aprobadas', value: summary.aprobadas, icon: 'lucideCheckCheck', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
        { label: 'Cotizaciones No Aprobadas', value: summary.noAprobadas, icon: 'lucideXCircle', bgClass: 'bg-[var(--brand)]', iconClass: 'text-white' },
      ]);

      // Convertir formato de mes YYYY-MM a nombre corto
      const monthMap = sixMonths.map((m: any) => ({
        mes: this.getMonthName(m.month),
        totales: m.total,
        aprobadas: m.aprobadas
      }));
      this.serieMeses.set(monthMap);

      const weekMap = weekly.days.map((d: any) => ({
        dia: d.day,
        valor: d.total
      }));
      this.actividad.set(weekMap);

      console.log('Mapped data:', { monthMap, weekMap });

    } catch (e) {
      console.error('Error loading director dashboard stats', e);
    } finally {
      this.loading.set(false);
    }
  }

  // Helper para convertir YYYY-MM a nombre de mes
  private getMonthName(monthStr: string): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const [, month] = monthStr.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    return months[monthIndex] || monthStr;
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
    enabled: false,
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
      dataLabels: { position: 'top' }
    }
  };
  barGrid: ApexGrid = { borderColor: '#e5e7eb', strokeDashArray: 4, padding: { top: 20 } };
  barDataLabels: ApexDataLabels = {
    enabled: true,
    offsetY: -20,
    style: { colors: ['#333'] },
    formatter: (val: number) => `${val}`
  };
  barFill: ApexFill = { opacity: 1 };
  barColors = ['#F05546']; // Brand
  barTooltip: ApexTooltip = { theme: 'light' };
}
