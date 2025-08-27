# Swagat Odisha 🚀

A modern, futuristic web application built with **React 18**, **Vite 6**, and **Tailwind CSS 3**, featuring beautiful animations and a responsive design system.

## ✨ Features

- ⚡ **Lightning Fast** - Built with Vite for instant HMR and blazing fast builds
- 🎨 **Beautiful UI** - Custom futuristic design system with Tailwind CSS
- 📱 **Responsive** - Mobile-first design that works on all devices
- 🎭 **Smooth Animations** - Framer Motion powered animations and transitions
- 🔧 **Modern Tooling** - ESLint, PostCSS, and optimized build configuration
- 🎯 **Type Safe** - Full TypeScript support ready
- 🚀 **Production Ready** - Optimized builds with code splitting and minification

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion
- **Icons**: React Icons
- **Development**: ESLint, PostCSS, Autoprefixer

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd swagat-odisha
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Custom button component
│   └── Card.jsx        # Card component with animations
├── utils/              # Utility functions and constants
│   ├── constants.js    # App configuration and constants
│   └── helpers.js      # Common helper functions
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#0073e6` - Main brand color
- **Cyan**: `#00e6e6` - Accent color
- **Purple**: `#7d00e6` - Secondary accent
- **Background**: Dark theme with gradients

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300-900
- **Responsive**: Scales from mobile to desktop

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Cards**: Glassmorphism effect with hover animations
- **Layout**: Responsive grid system with Tailwind

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Customization

### Tailwind Configuration
The project includes a custom Tailwind configuration with:
- Extended color palette
- Custom animations and keyframes
- Responsive breakpoints
- Custom shadows and gradients

### Adding New Components
1. Create component in `src/components/`
2. Import and use in `App.jsx`
3. Style with Tailwind classes
4. Add animations with Framer Motion

## 📱 Responsive Design

The application is built with a mobile-first approach:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🎭 Animation System

Built with Framer Motion for smooth, performant animations:
- **Entrance**: Fade in, slide up, scale in
- **Hover**: Scale, glow effects, color transitions
- **Page Transitions**: Smooth navigation animations

## 🔧 Build Optimization

The Vite configuration includes:
- **Code Splitting**: Automatic chunk optimization
- **Tree Shaking**: Remove unused code
- **Minification**: Terser for production builds
- **Source Maps**: Development debugging support

## 🌟 Performance Features

- **Lazy Loading**: Components load on demand
- **Optimized Images**: WebP support and compression
- **CSS Optimization**: Purged unused styles
- **Bundle Analysis**: Visual bundle size monitoring

## 📈 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Drag and drop dist/ folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Vite Team** for the amazing build tool
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **React Team** for the incredible framework

---

**Made with ❤️ using React + Vite + Tailwind CSS**

For questions or support, please open an issue or contact the development team.
