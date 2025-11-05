import { Component, signal, computed } from '@angular/core';
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

type Kpi = { label: string; value: number; icon: string };
type Serie = { mes: string; totales: number; aprobadas: number };
type Semana = { dia: string; valor: number };

@Component({
  selector: 'gerente-dashboard',
  standalone: true,
  imports: [NgApexchartsModule, DecimalPipe, NgApexchartsModule, NgIcon, CommonModule],
  providers: [provideIcons({ lucideFileText, lucideClock, lucideCheckCheck, lucideXCircle })],
  templateUrl: './gerente-dashboard.html',
})
export class GerenteDashboardComponent {
  // ===== Encabezado =====
  titulo = 'Inicio';
  subtitulo = 'Resumen general de cotizaciones y aprobaciones';

  // ===== KPIs =====
  kpis = signal<Kpi[]>([
    { label: 'Cotizaciones Totales',     value: 1200, icon: 'lucideFileText' },
    { label: 'Aprobaciones Pendientes',  value: 10,   icon: 'lucideClock' },
    { label: 'Cotizaciones Aprobadas',   value: 1160, icon: 'lucideCheckCheck' },
    { label: 'Cotizaciones Rechazadas',  value: 30,   icon: 'lucideXCircle' },
  ]);

  // ===== Datos de gráficas (igual que ya tenías) =====
  serieMeses = signal<Serie[]>([
    { mes: 'Ene', totales: 180, aprobadas: 160 },
    { mes: 'Feb', totales: 200, aprobadas: 180 },
    { mes: 'Mar', totales: 210, aprobadas: 190 },
    { mes: 'Abr', totales: 190, aprobadas: 175 },
    { mes: 'May', totales: 220, aprobadas: 205 },
    { mes: 'Jun', totales: 240, aprobadas: 225 },
  ]);
  actividad = signal<Semana[]>([
    { dia: 'Lun', valor: 16 },
    { dia: 'Mar', valor: 18 },
    { dia: 'Mié', valor: 12 },
    { dia: 'Jue', valor: 17 },
    { dia: 'Vie', valor: 22 },
  ]);
  totalAprobadas = computed(() =>
    this.serieMeses().reduce((acc, s) => acc + s.aprobadas, 0)
  );

  // ===== Line chart (con datalabels) =====
  lineSeries = computed<ApexAxisChartSeries>(() => [
    { name: 'Totales',   data: this.serieMeses().map(s => s.totales) },
    { name: 'Aprobadas', data: this.serieMeses().map(s => s.aprobadas) },
  ]);
  lineChart: ApexChart = { type: 'line', height: 260, toolbar: { show: false } };
  lineXAxis: ApexXAxis = {
    categories: this.serieMeses().map(s => s.mes),
    axisBorder: { show: false }, axisTicks: { show: false },
    labels: { style: { colors: '#6b7280' } },
  };
  lineYAxis: ApexYAxis = { labels: { style: { colors: '#6b7280' } }, decimalsInFloat: 0 };
  lineStroke: ApexStroke = { curve: 'smooth', width: 3 };
  lineMarkers: ApexMarkers = { size: 3, strokeWidth: 0 };
  lineGrid: ApexGrid = { borderColor: '#e5e7eb', strokeDashArray: 4 };
  lineLegend: ApexLegend = { show: true, position: 'top' };
  lineTooltip: ApexTooltip = { theme: 'light' };
  lineDataLabels: ApexDataLabels = {
    enabled: true,
    background: { enabled: false },
    style: { colors: ['#111827'] },
    offsetY: -6,
    formatter: (val: number) => `${val}`
  };
  lineFill: ApexFill = { type: 'solid', opacity: 1 };
  lineColors = ['#6366f1', '#6b7280']; 

  // ===== Barras (con datalabels) =====
  barSeries = computed<ApexAxisChartSeries>(() => [
    { name: 'Cotizaciones', data: this.actividad().map(a => a.valor) },
  ]);
  barChart: ApexChart = { type: 'bar', height: 260, toolbar: { show: false } };
  barXAxis: ApexXAxis = {
    categories: this.actividad().map(a => a.dia),
    axisBorder: { show: false }, axisTicks: { show: false },
    labels: { style: { colors: '#6b7280' } },
  };
  barYAxis: ApexYAxis = { labels: { style: { colors: '#6b7280' } }, decimalsInFloat: 0 };
  barPlot: ApexPlotOptions = { bar: { borderRadius: 6, columnWidth: '40%' } };
  barGrid: ApexGrid = { borderColor: '#e5e7eb', strokeDashArray: 4 };
  barDataLabels: ApexDataLabels = {
    enabled: true,
    offsetY: -2,
    style: { colors: ['#111827'] },
    formatter: (val: number) => `${val}`
  };
  barFill: ApexFill = { opacity: 1 };
  barColors = ['#6366f1'];
  barTooltip: ApexTooltip = { theme: 'light' };
}
