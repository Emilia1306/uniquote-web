# UniquoteWeb – UNIQUOTE (Angular 20)

Aplicación web para gestión y seguimiento de cotizaciones en UNIMER.
Frontend en Angular 20. Backend previsto: NestJS (AWS).

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.8.

## Project Structure

This project follows a modular structure based on features and a shared UI library.

### 📂 Root Folders
- **`src/`**: Main application source code.
- **`libs/ui/`**: Internal Design System / UI Library (Primitives like Button, Input, Sheet, etc.).
- **`public/`**: Static assets.

### 📂 Core & Layout (`src/app/`)
- **`core/`**: Global singleton services and configurations.
  - `auth`: Authentication logic, guards, and MFA verification.
  - `http`: API client and interceptors.
  - `models`: Global interfaces and types.
- **`layout/`**: Structural components for the shell of the app (App Sidebar, Main Container).
- **`shared/`**: Reusable components, pipes, and utilities used across multiple features.

### 📂 Features (`src/app/features/`)
Each directory encapsulates a business domain with its own stores, components, and logic:
- **`admin/`**: User management and administrative settings.
- **`auth/`**: Authentication pages (Login, Password Reset, MFA).
- **`clientes/`**: Client management (List, Creation, Details).
- **`cotizaciones/`**: Core feature for quote management, including the Quote Wizard.
- **`proyectos/`**: Project lifecycle management.
- **`tarifario/`**: Management of services and rates.
- **`director/` / `gerente/`**: Role-specific dashboards and views.

### 📂 Configuration
- `angular.json`: Angular CLI project configuration.
- `tailwind.config.js`: Tailwind CSS design tokens and theme.
- `tsconfig.json`: TypeScript compiler options and path aliases.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
