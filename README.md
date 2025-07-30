# Kanji Search App 🍜

A beautiful React application for searching and learning Japanese kanji characters. Built with TypeScript, Vite, and Tailwind CSS.

## Features

- 🔍 **Kanji Search**: Search for any kanji character and get detailed information
- 📚 **Comprehensive Data**: Meanings, readings (onyomi/kunyomi), stroke count, JLPT level, and more
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations
- ⚡ **Fast Performance**: Built with Vite for optimal development and production builds
- 📱 **Mobile Friendly**: Responsive design that works on all devices

## API Integration

This app connects to the Kanji API at: `https://kanji-api-09daa91fbd9b.herokuapp.com/`

### Example API Endpoints:
- Search by character: `/api/v1/kanjis?character=家`
- Get all kanji: `/api/v1/kanjis`

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Push your code to GitHub/GitLab/Bitbucket
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will automatically detect it's a Vite project
   - Deploy!

3. **Deploy via CLI**:
   ```bash
   vercel
   ```

### Environment Variables

No environment variables are required for this deployment as the API URL is hardcoded.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with DaisyUI
- **Deployment**: Vercel-ready configuration

## Project Structure

```
src/
├── components/
│   ├── Kanji/
│   │   └── Kanji.tsx          # Kanji display component
│   └── Searchbar/
│       ├── Searchbar.tsx      # Search functionality
│       └── Searchbar.css      # Custom styles
├── App.tsx                    # Main app component
└── main.tsx                   # App entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own kanji learning apps!
