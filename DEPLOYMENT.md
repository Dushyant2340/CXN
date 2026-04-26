# Deployment Guide for Bhai AI

This app is built with Vite and React. Here are the best free deployment options:

## 1. Cloudflare Pages (Recommended)
Cloudflare Pages is extremely fast and has a very generous free tier.

- **Build command:** `npm run build`
- **Build output directory:** `build`
- **Note:** We have already added a `public/_redirects` file to handle SPA routing.

## 2. Netlify
Very popular and easy to use.

- **Build command:** `npm run build`
- **Publish directory:** `build`
- **Redirects:** Netlify also uses the `_redirects` file we created.

## 3. Vercel
Great for React/Next.js apps.

- **Build command:** `npm run build`
- **Output directory:** `build` (Usually Vercel detects Vite automatically)

## 4. GitHub Pages
Good for static sites, but requires some extra setup for SPA routing (like a 404.html hack).

---

### Why Cloudflare Pages is "Best":
- **Unlimited bandwidth** on free tier.
- **Fast global network**.
- **No sleeper mode** (unlike Render free tier which goes to sleep).
- **Unlimited sites**.
