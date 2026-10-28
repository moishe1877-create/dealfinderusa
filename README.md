# DealFinder USA — MAX STORE + PUBLISHER STUDIO

A complete **GitHub Pages** storefront and product-management workspace. The public catalog starts truly empty. No demo products, fake prices, fake discounts, or fake reviews are published.

## 1. Install it on your existing GitHub website (iPad friendly)

1. Download and extract `DealFinderUSA_MAX_Store_And_Dashboard.zip`.
2. Open your repo: https://github.com/moishe1877-create/dealfinderusa
3. On the `main` branch, choose **Add file → Upload files**.
4. Upload these files **at the root** of the repository: `index.html`, `admin.html`, `styles.css`, `admin.css`, `app.js`, `admin.js`, `CNAME`, and `.nojekyll` (if your Files app shows hidden files). Commit. GitHub may ask to replace existing files.
5. Create/open `assets` in the GitHub repo and upload both `logo.svg` and `favicon.svg` from the ZIP's `assets` folder. (Retaining your old assets is fine.)
6. Create/open the `data` folder and upload `products.json` from the ZIP's `data` folder. **Warning: if you already have real products, back up your existing file before replacing it with the blank catalog.**
7. Wait for the GitHub Pages deployment. Your public site: https://dealfinderusa.com . Your local product editor: https://dealfinderusa.com/admin.html .

**Important:** Upload the _contents_ of the ZIP, preserving the `assets/` and `data/` paths — do not upload the whole ZIP as a file, and don't nest everything under `DealFinderUSA_PRO_MAX/`. GitHub's web interface typically uploads files to the folder you are currently browsing.

The `CNAME` file is `dealfinderusa.com`, matching the custom domain you previously configured. Retain existing DNS records. The old `products.js`, `motion.js`, `motion.css`, and other unused project files may remain; these new HTML pages do not reference them.

## 2. Add your first REAL Amazon affiliate product

1. Sign into https://affiliate-program.amazon.com/ and use Amazon's SiteStripe to generate a permitted affiliate link for a real product.
2. Open https://dealfinderusa.com/admin.html (or use the GitHub Pages URL ending in `/dealfinderusa/admin.html` while the custom domain is connecting).
3. Choose **Add / edit product**, type the product's real name and category, an original description, optionally why you chose it, and paste the affiliate link.
4. You can leave **Product image URL** blank. If you own or are licensed to use an image, upload it to the `assets/products` folder in GitHub and enter a path like `assets/products/product-photo.webp`. Only use images you're allowed to display; don't copy arbitrary Amazon images or scrape them.
5. Set status to **Published** and click **Save product**. This saves locally in your browser, not to GitHub yet.
6. Go to **Publish to GitHub** → **Download products.json**.
7. Open https://github.com/moishe1877-create/dealfinderusa/tree/main/data and use **Add file → Upload files** to replace `data/products.json` (or choose **Edit file directly** from the studio and paste the copied JSON). Click **Commit changes**.
8. Reload DealFinderUSA.com. Your product should appear after deployment.

### Best way to manage products

- **Draft:** stored locally in the editor; excluded from public export.
- **Published:** included in `data/products.json` export, shown on live site after GitHub commit.
- **Featured:** appears first and has an *Editor's pick* label. It does **not** imply a price drop or discount.
- **Remove:** remove it from your workspace, then **export and commit again** to remove it from the public site.
- **Backup:** download a workspace backup regularly, especially before switching devices or clearing browser data.
- **Restore:** restore a saved backup or a published `products.json` file via the Import option.

## 3. Important security limitation

`admin.html` is a public URL because GitHub Pages only serves public static files. **It is not a password-protected private dashboard.** Anyone can open the page on their own browser, but it saves data only on **their device**. They **cannot** change your live public catalog without GitHub write access. No credentials are stored in the HTML, JavaScript, or uploaded files. To add secure one-click publishing later, use a properly authenticated backend/GitHub App, not an embedded personal access token.

## 4. Amazon Associates and accuracy

- The required disclosure is already included: **“As an Amazon Associate I earn from qualifying purchases.”** Keep it visible.
- Manual listings contain **no prices, strikethrough prices, savings percentages, stock claims, review counts, or "live sale" banners**. They link to Amazon where customers see current details.
- Use your original commentary and lawfully licensed images. Amazon's rules limit reuse of Product Advertising Content and prices without an approved API or Amazon-served links.
- Ensure your Associates tracking links are correct; verify your website is added to your Associates account.
- The dashboard does **not** fetch Amazon deals automatically. You can integrate the authorized Creators API later, once eligible, using secure server-side credentials.

Reference: https://affiliate-program.amazon.com/help/operating/policies and https://affiliate-program.amazon.com/help/operating/agreement

## 5. File list

```
index.html           — production storefront
styles.css           — polished, responsive storefront styles
app.js               — catalog loader, filters, favorites and product views
admin.html           — browser-based publisher studio
admin.css            — publisher studio UI
admin.js             — local draft editor / public JSON export / backup
CNAME                — dealfinderusa.com custom domain
.nojekyll            — GitHub Pages compatibility
assets/logo.svg      — scalable brand wordmark
assets/favicon.svg   — browser icon
data/products.json   — actual published products (initially empty)
```

## 6. JSON format (advanced)

```json
{
  "version": 1,
  "updatedAt": null,
  "products": []
}
```

The editor writes the full shape of each product. The storefront only displays complete published products with valid Amazon HTTPS links. For example, a public entry includes `id`, `title`, `category`, `description`, `why`, `affiliateUrl`, `imageUrl`, `status`, `featured`, and `addedAt`.

The frontend expects to be served by GitHub Pages or an HTTP server (`file://` won't fetch JSON correctly). The homepage works under a custom domain or under a GitHub Pages project subdirectory because paths are relative.

## 7. What to expect

This release includes working mobile navigation, responsive category tiles, hero animations, product search, category filtering, saved favorites, sorting, details, a blank/no-match state, editor validation, drafts, image previews, workspace backups, and JSON export. It does not provide automatic product discovery, secure one-click GitHub publication, or Amazon API access.
