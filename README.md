# Campus Events Planner — React version

This is a React + Vite conversion of the supplied Campus Events Planner project. The original visual design, watercolor backgrounds, colors, assets, page structure, and existing browser-side behavior have been preserved as closely as possible.

## Run locally

1. Install Node.js (LTS).
2. Extract this folder and open a terminal inside it.
3. Run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite.

## Build for deployment

```bash
npm run build
npm run preview
```

The production build is created in `dist/`.

## Pages preserved

- Home (`index.html`)
- Events (`events.html`)
- Planner and working calendar (`planner.html`)
- Clubs (`clubs.html`)
- Gallery (`gallery.html`)
- Contact (`contact.html`)
- Login / Register (`auth.html`)
- Create Event (`create-event.html`)
- Event Details (`event-details.html`)

## Implementation note

React now owns the application mount and page selection. To avoid unintentionally changing the submitted project's appearance or breaking existing interactions, each page's original markup is mounted by React and the original JavaScript is loaded in its original order. The original CSS, images, localStorage keys, and page-specific behavior are retained. This is a conservative migration intended to preserve the project exactly; a next step could be refactoring the page markup and each interaction into fully declarative React components and hooks.
