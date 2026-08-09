# YourStore — GitHub Pages Edition

This version is a **100% static ecommerce demo** built with HTML, CSS and Vanilla JavaScript.

## What changed

- No Express
- No Node.js runtime
- No backend folder
- No `.env` or server configuration
- Root-level `index.html` for GitHub Pages
- Products, search, demo accounts, cart, wishlist, newsletter and demo orders work in browser storage
- All asset paths are relative, so the site works from a GitHub Pages project URL such as `https://USERNAME.github.io/REPOSITORY/`

## GitHub Pages deployment

1. Create a GitHub repository.
2. Upload everything in this folder to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your main branch and `/ (root)`, then save.

## Important security note

GitHub Pages is static hosting. It cannot securely keep a JWT secret, validate passwords on a trusted server, process real payments, or persist customer accounts across devices.

The included login/register system is therefore a **frontend demo only** and stores data in the visitor's browser using `localStorage`/`sessionStorage`. For a production store, connect this frontend to a hosted authentication/database service or a separate backend API.
