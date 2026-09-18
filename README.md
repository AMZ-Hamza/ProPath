# ProPath

ProPath is a role-based student and professional-management platform. It provides separate workspaces for administrators, trainers, and students to organize academic structures, learning resources, attendance, grades, announcements, and timetables.

## Features

- Authentication with Laravel Sanctum and role-aware access control
- Initial platform setup and professional-administrator access
- User, branch, group, subject, and trainer/student profile management
- Trainer access to assigned groups and subjects
- Student access to personal attendance, grades, resources, and timetable information
- Attendance recording and absence reporting
- Grade entry and group grade views
- Lessons, exercises, announcements, timetables, and attached asset management
- Role-specific administration, trainer, and student dashboards

## User Roles

| Role | Access |
| --- | --- |
| Professional Admin | Performs initial platform setup and uses the administration workspace. |
| Admin | Manages users, academic structure, settings, announcements, timetables, and reporting. |
| Trainer | Works with assigned groups and subjects, including attendance and grade entry. |
| Student | Views personal learning resources, timetable, attendance, and grades. |

## Technology Stack

- Backend: Laravel 12, PHP 8.2, Laravel Sanctum, Eloquent ORM, MySQL
- Frontend: React 19, Create React App, React Router, JavaScript, localStorage
- API: RESTful JSON API

## Architecture

`React frontend → Laravel REST API → MySQL`

The frontend sends authenticated requests to the Laravel API. Laravel Sanctum protects the API routes and the frontend stores the active session locally.

## Project Structure

```text
proPath_backEnd/   Laravel API, models, migrations, seeders, and tests
proPath_frontEnd/  Create React App interface and feature modules
README.md          Project documentation
```

## Requirements

- PHP 8.2 or later
- Composer 2
- MySQL
- Node.js and npm compatible with Create React App

## Installation

1. Clone the repository and open two terminals.
2. In the backend terminal:

   ```bash
   cd proPath_backEnd
   composer install
   copy .env.example .env
   php artisan key:generate
   ```

   On macOS or Linux, use `cp .env.example .env` instead of `copy`.

3. Configure the MySQL values in `proPath_backEnd/.env`, then create the database named by `DB_DATABASE`.
4. Run the database setup:

   ```bash
   php artisan migrate --seed
   php artisan serve
   ```

5. In the frontend terminal:

   ```bash
   cd proPath_frontEnd
   copy .env.example .env
   npm ci
   npm start
   ```

   On macOS or Linux, use `cp .env.example .env` instead of `copy`.

The frontend defaults to `http://localhost:8000/api/v1`; set `REACT_APP_API_URL` if the API is served elsewhere.

## Environment Variables

The backend template contains the Laravel defaults plus the database settings below:

```env
APP_KEY=
APP_URL=http://localhost
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
FRONTEND_URL=http://localhost:3000
```

The frontend accepts:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

Never commit a populated `.env` file.

## API

The Laravel API is versioned under `/api/v1`. Public endpoints include platform setup, login, boot information, and asset viewing/downloading. Protected endpoints cover authentication, users, academic data, attendance, grades, resources, announcements, timetables, dashboards, and absence reports.

## Team

ProPath was developed as a two-person team project.

## My Contribution

This repository represents collaborative work. Individual ownership of specific features is not asserted here; contribution details should be added only where they can be verified by the team.

