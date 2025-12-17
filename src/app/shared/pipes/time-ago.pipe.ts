import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeAgo',
    standalone: true
})
export class TimeAgoPipe implements PipeTransform {
    transform(value: string | Date | undefined): string {
        if (!value) return '';

        const date = new Date(value);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        // Tiempos futuros o muy recientes
        if (seconds < 5) return 'hace un momento';

        const intervals: { [key: string]: number } = {
            'año': 31536000,
            'mes': 2592000,
            'semana': 604800,
            'día': 86400,
            'hora': 3600,
            'minuto': 60,
            'segundo': 1
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `hace ${interval} ${unit}${interval > 1 ? 's' : ''}`; // plural simple
            }
        }

        return 'hace un momento';
    }
}
