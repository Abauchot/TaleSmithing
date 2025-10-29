# TaleSmithing

A collaborative companion app for tabletop RPG players and game masters (D&D, Pathfinder, etc.). TaleSmithing helps campaigns come alive by offering shared storytelling tools — where players can upload character sheets, write session notes, and build a timeline of their adventures together.

## Purpose

TaleSmithing exists to make TTRPG sessions more immersive, organized and collaborative.

- Upload your character sheet (PDF)
- Write session notes and ideas
- Build a chronological campaign timeline
- Share and collaborate with your party and game master

"Every campaign deserves its chronicler. TaleSmithing helps you write your legend."

## Tech stack

| Layer | Technology |
|-------|-------------|
| Frontend (Mobile) | Expo (React Native) |
| Backend (API) | Symfony 7 (PHP 8.3) |
| Database | PostgreSQL 16 |
| Containerization | Docker & Docker Compose |
| ORM | Doctrine |

## Repository layout (workspace)

Top-level folders you will work with:

- `Backend/` — Symfony API, Docker config and PHP source
  - `composer.json`, `docker-compose.yml`, `bin/console`, `src/`, `config/`, `migrations/`, `public/`
- `Frontend/` — Expo React Native app
  - `package.json`, `pnpm-lock.yaml`, `app/` (source files)

There are many vendor and supporting files inside each folder — this README focuses on how to run and develop the project locally.

## Prerequisites

- Docker & Docker Compose (for the API and DB)
- Node.js (16+ recommended) and PNPM (the frontend uses pnpm by default)
- Composer (if you need to run PHP tools locally outside Docker)

Note: The project contains Docker configuration for the backend; it's easiest to run the API using Docker.

## Quick start — Backend (API)

1. Open a terminal and change to the `Backend/` directory.

2. Start the services with Docker Compose:

```bash
cd Backend
docker-compose up --build -d
```

3. After containers are running, the API is typically available at:

- API: http://localhost:8080 (check `Backend/docker-compose.yml` for exact ports)
- Adminer (DB UI): http://localhost:8081

4. Common tasks (inside the PHP container)

- Enter the PHP container (service name may vary in the compose file):

```bash
# Example (adjust service name if different):
docker-compose exec php bash
```

- Run migrations (example using Symfony console):

```bash
php bin/console doctrine:migrations:migrate
```

- Clear cache:

```bash
php bin/console cache:clear
```

If you prefer not to use Docker, you can install PHP, Composer and PostgreSQL locally and run the Symfony app following standard Symfony setup steps — but the Docker approach is recommended for consistent dev environment.

## Quick start — Frontend (Mobile)

1. From the project root, change to the `Frontend/` folder.

```bash
cd Frontend
pnpm install
pnpm start
# or: npx expo start
```

2. The Expo dev tools will open in your browser. You can run the app on a simulator or an Expo Go app on a mobile device.

Notes:
- This project uses `pnpm` (see `pnpm-lock.yaml`). If you don't have `pnpm` installed you can install it globally (`npm i -g pnpm`) or use `npm`/`npx` as fallback.

## API surface

Once the backend is running, the API endpoints live under `/api` (for example `http://localhost:8080/api`). The Symfony project uses API Platform (see `Backend/config/packages/api_platform.yaml`) to expose resources.

## Features (MVP)

- User authentication (JWT planned)
- Campaigns (create / join via invite codes)
- Collaborative notes per campaign
- Character sheet upload (PDF)
- Campaign timeline (planned)

## Roadmap & Next steps

- Implement JWT authentication and signup/login flows
- Build campaign invite/join flows
- Character sheet upload with cloud storage (S3) option
- Timeline visualization and timeline editor
- Party chat and notification system

## Contributing

Contributions are welcome. A few suggestions:

- Open issues for bugs and feature requests
- Keep PRs focused and include tests where possible
- Follow existing code style in `Backend/` (Symfony) and `Frontend/` (Expo + TypeScript)

If you'd like help getting started, open an issue describing what you'd like to work on and someone can point you at a good first task.

## License

This project is open source and available under the MIT License.

---

Maintainer: Antoine Bauchot

If you want any specific sections expanded (detailed Docker developer guide, CI details, or example API calls), tell me which one and I will add it to this README.
