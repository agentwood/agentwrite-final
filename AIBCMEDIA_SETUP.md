# aibcmedia.com Local Development Setup

This workspace is configured to use `aibcmedia.com` instead of `localhost` for local development.

## Quick Setup

Run this command in your terminal (requires sudo password):

```bash
./setup-aibcmedia.sh
```

Or manually add this line to `/etc/hosts`:

```
127.0.0.1 aibcmedia.com
```

## Access URLs

After setup, access your apps at:

- **Main app (Vite)**: http://aibcmedia.com:5173
- **Character chat (Next.js)**: http://aibcmedia.com:3000
- **AI Create redirect**: http://aibcmedia.com:5173/#/create → redirects to http://aibcmedia.com:3000

## Configuration

### Next.js (character-chat)
- Dev server configured to accept `aibcmedia.com` hostname
- Run: `cd character-chat && npm run dev`
- Access at: http://aibcmedia.com:3000

### Vite (main app)
- Dev server configured to accept `aibcmedia.com` hostname
- Run: `npm run dev`
- Access at: http://aibcmedia.com:5173

## Removing the Setup

To remove the hosts entry later:

```bash
sudo nano /etc/hosts
# Remove the line: 127.0.0.1 aibcmedia.com
```

