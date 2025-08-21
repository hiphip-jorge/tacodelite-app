# Taco Delite App

A simplified, modern React application for Taco Delite restaurant, built with React 18 and React Router v7.

## Features

- **Simple & Clean Design**: Minimalist UI focused on user experience
- **Responsive Layout**: Works perfectly on all devices
- **Modern Tech Stack**: Built with React 18, React Router v7, and Tailwind CSS
- **Smooth Animations**: Framer Motion for engaging user interactions
- **Fast Performance**: Vite build tool for rapid development and optimized builds

## Pages

- **Home**: Hero section with key features and call-to-action
- **Menu**: Interactive menu with category filtering
- **About**: Company story, values, and highlights
- **Contact**: Location, hours, and ordering information

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── assets/          # Images and static files
├── components/      # Reusable UI components
├── pages/          # Page components
├── App.jsx         # Main app component
├── main.jsx        # App entry point
└── index.css       # Global styles and Tailwind
```

## Technologies Used

- **React 18**: Modern React with hooks and concurrent features
- **React Router v7**: Latest routing solution for React
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for React
- **Vite**: Fast build tool and dev server

## Customization

- Update restaurant information in the page components
- Modify colors and styling in `src/index.css`
- Add new pages by creating components and updating routes in `App.jsx`
- Replace placeholder images with actual restaurant photos

## Deployment

This app can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload the `dist` folder to an S3 bucket
- **GitHub Pages**: Use the `dist` folder as your source

## License

This project is for Taco Delite restaurant use only.
