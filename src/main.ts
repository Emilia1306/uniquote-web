// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppRoot } from './app/app.root';
import { AuthService } from './app/core/auth/auth.service';
import {
  LucideAngularModule, Search, ChevronDown, Pencil, Trash2, User,
  Settings, LogOut, Menu, House,
  FileText,
  Users,
  Ticket,
  History,
  BarChart,
  Building2,
  FolderOpen,
  Library,
  Check, ArrowLeft,
  ArrowRight,
  Activity, Star, CheckCircle2,
  List, LayoutGrid, Plus, X
} from 'lucide-angular';

bootstrapApplication(AppRoot, {
  // conserva tu appConfig
  ...appConfig,
  // añade (sin pisar) los providers que ya tuviera appConfig
  providers: [
    ...(appConfig.providers ?? []),
    // registra SOLO los íconos que vas a usar
    importProvidersFrom(
      LucideAngularModule.pick({
        Search, ChevronDown, Pencil, Trash2, User, Settings, LogOut, Menu, House,
        FileText,
        Users,
        Ticket,
        History,
        BarChart,
        Building2,
        FolderOpen,
        Library,
        Check, ArrowLeft, ArrowRight, Activity, Star, CheckCircle2,
        List, LayoutGrid, Plus, X
      })
    ),
  ],
})
  .then(ref => {
    (window as any).injector = ref.injector;
    (window as any).AuthService = AuthService;
  })
  .catch(err => console.error(err));
