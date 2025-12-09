# Photo Comment App

A web app where you can upload photos and leave comments on them.

## What's in it

* **Frontend:** Next.js 16, TypeScript, Ant Design, Tailwind CSS
* **Backend:** Next.js API Routes
* **Database:** PostgreSQL with Prisma
* **Images:** Cloudinary

## Features

* Upload photos with drag & drop
* Scroll through photos (loads more as you scroll)
* Comment on photos
* Works on phone and desktop

## Setup

### Install stuff
```bash
git clone <your-repo-link>
cd photo-comment-app
npm install
```

### Environment variables

Create a `.env` file in the root directory:
```
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Database
```bash
npx prisma db push
```

### Run it
```bash
npm run dev
```

Go to http://localhost:3000