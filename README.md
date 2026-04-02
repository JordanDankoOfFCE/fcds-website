# FC Design Services — Static Website

Static website for [FC Design Services LLC](https://fcdesignservices.com), a contract electronics design and manufacturing company in Mason, OH.

## Local Development

No build step required. Open `index.html` in any browser.

For live reload during development, use any simple HTTP server:
```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .
```

## Deployment (Cloudflare Pages)

1. Push this repository to GitHub
2. In Cloudflare Pages dashboard, create a new project and connect the GitHub repo
3. Configure build settings:
   - **Build command**: _(leave empty)_
   - **Build output directory**: `/`
4. Set custom domain to `fcdesignservices.com`

Cloudflare Pages will auto-deploy on every push to the main branch.

## Updating Content

### Placeholders to fill in

Search for `<!-- PLACEHOLDER` across all HTML files to find content that needs to be replaced:

- **Phone number and email**: Update in the footer of all 4 HTML pages and in `contact.html`
- **Testimonials**: Replace quote text and add client names/companies in `index.html`
- **Team members**: Add names, titles, bios, and photos in `about.html`
- **Formspree form ID**: Replace `FORM_ID` in `contact.html` with your actual endpoint from [formspree.io](https://formspree.io)

### Editing pages

All pages are standalone HTML files. To make changes:

1. Edit the HTML file directly
2. **Important**: The header and footer are duplicated across all 4 pages. If you change the nav or footer, update it in all files:
   - `index.html`
   - `about.html`
   - `services.html`
   - `contact.html`

Look for the `<!-- HEADER START/END -->` and `<!-- FOOTER START/END -->` comment markers.

## File Structure

```
index.html          Home page
about.html          About page
services.html       Services page
contact.html        Contact page
css/styles.css      All styles
js/main.js          Mobile nav, form handling
images/             Logo and images
robots.txt          Search engine crawling rules
_headers            Security headers (Cloudflare Pages)
```
