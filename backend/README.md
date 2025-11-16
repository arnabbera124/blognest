# BlogNest Backend - Quick Start

## Setup locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill values:
   ```
   cp .env.example .env
   ```
3. Run in development:
   ```
   npm run dev
   ```

## Deploy to Render
1. Push this repo to GitHub.
2. Create a new Web Service on Render linked to the repo.
3. Set the environment variables on Render: `MONGODB_URI`, `JWT_SECRET`.
4. Deploy.

## API
- `POST /api/auth/signup` - create user
- `POST /api/auth/login` - login
- `GET /api/blogs` - list blogs
- `POST /api/blogs` - create blog (auth)
- `GET /api/blogs/:id` - get blog
- `PUT /api/blogs/:id` - update (auth/owner)
- `DELETE /api/blogs/:id` - delete (auth/owner)
