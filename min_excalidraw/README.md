# 🎨 Mini Excalidraw Whiteboard

A feature-rich, collaborative whiteboard application built with React, TypeScript, and Node.js. Draw, save, and export your ideas with ease!

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🖌️ Drawing Tools
- **Pencil** - Freehand drawing with smooth curves
- **Line** - Straight lines (hold Shift for horizontal/vertical snap)
- **Circle** - Perfect circles with adjustable radius
- **Arrow** - Directional arrows for diagrams
- **Text** - Add text with customizable fonts and sizes
- **Color Picker** - Choose any color for your drawings

### 📄 Page Management
- **Multiple Pages** - Create and manage unlimited pages
- **Page Navigation** - Easy switching between pages
- **Rename Pages** - Click edit icon to rename
- **Delete Pages** - Remove unwanted pages with confirmation
- **Clear Page** - Clear current page content without deleting

### 💾 Data Persistence
- **Auto-Save** - Manual save with "Save All" button
- **Backend Storage** - Persistent storage in JSON file
- **LocalStorage** - Page metadata cached locally
- **Reload Safe** - All data persists across page reloads

### 📥 Export Options
- **PNG Export** - High-quality image with white background
- **PDF Export** - A4 format, auto-oriented, professionally formatted
- **Smart Naming** - Files named with page name and date
- **Full Canvas** - Complete content including grid lines

### 🎯 UI/UX Features
- **Responsive Canvas** - Adapts to window size
- **Grid Background** - Visual guide for precise drawing
- **Tool Indicator** - Shows current tool and color
- **Error Handling** - Graceful error messages and recovery
- **Loading States** - Smooth loading experience
- **Confirmation Dialogs** - Prevents accidental data loss

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mini-excalidraw
```

2. **Install Backend Dependencies**
```bash
cd server
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../client
npm install
```

### Running the Application

You need to run both the backend and frontend servers:

#### Terminal 1 - Backend Server
```bash
cd server
npm start
```
Server will start on `http://localhost:5000`

#### Terminal 2 - Frontend Server
```bash
cd client
npm run dev
```
Frontend will start on `http://localhost:3000`

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
mini-excalidraw/
├── client/                      # Frontend Application
│   ├── src/
│   │   ├── components/          # React Components
│   │   │   ├── Toolbar.tsx      # Drawing tools toolbar
│   │   │   ├── Whiteboard.tsx   # Main canvas component
│   │   │   └── PageManager.tsx  # Page management UI
│   │   ├── types/               # TypeScript Definitions
│   │   │   ├── Shape.ts         # Shape type definitions
│   │   │   └── api.ts           # API type definitions
│   │   ├── utils/               # Utility Functions
│   │   │   └── storage.ts       # Storage utilities
│   │   ├── api/                 # API Client
│   │   │   └── api.ts           # API functions
│   │   ├── App.tsx              # Main application component
│   │   ├── main.tsx             # Application entry point
│   │   └── index.css            # Global styles
│   ├── public/                  # Static assets
│   ├── index.html               # HTML template
│   ├── package.json             # Frontend dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   ├── vite.config.ts           # Vite configuration
│   └── tailwind.config.cjs      # Tailwind CSS configuration
│
├── server/                      # Backend Application
│   ├── data/
│   │   └── drawings.json        # Persistent data storage
│   ├── server.js                # Express server
│   └── package.json             # Backend dependencies
│
└── README.md                    # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Icons** - Icon library (Feather Icons)
- **jsPDF** - PDF generation library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing
- **Body Parser** - Request body parsing

## 📖 Usage Guide

### Drawing on Canvas

1. **Select a Tool** - Click on any tool in the toolbar (Pencil, Line, Circle, Arrow, Text)
2. **Choose a Color** - Use the color picker (visible when Text tool is selected)
3. **Draw** - Click and drag on the canvas to draw
4. **Special Keys**:
   - Hold **Shift** while drawing lines for horizontal/vertical snap
   - Hold **Shift** while drawing rectangles for perfect squares

### Managing Pages

1. **Create New Page** - Click "New Page" button
2. **Switch Pages** - Click on page tabs to switch
3. **Rename Page** - Click the edit icon on active page tab
4. **Delete Page** - Click the trash icon on active page tab
5. **Clear Page** - Click "Clear Page" button to remove all content

### Saving Your Work

1. **Save All** - Click "Save All" button in the top right
2. **Confirmation** - Wait for "All changes saved successfully!" alert
3. **Reload Safe** - Your work persists across page reloads

### Exporting

1. **Click Export** - Green "Export" button in top right
2. **Choose Format**:
   - **PNG** - For images, presentations, or web use
   - **PDF** - For documents, printing, or sharing
3. **Download** - File downloads automatically with format: `PageName_YYYY-MM-DD.ext`

## 🔧 Configuration

### Backend Port Configuration

Edit `server/server.js`:
```javascript
const PORT = process.env.PORT || 5000
```

### Frontend API Configuration

Edit `client/src/utils/storage.ts` and `client/src/api/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:5000';
```

### Vite Proxy Configuration

Edit `client/vite.config.ts`:
```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    }
  }
}
```

## 🏗️ Building for Production

### Frontend Build

```bash
cd client
npm run build
```

Build output will be in `client/dist/` directory.

### Deployment

1. **Frontend**: Deploy the `client/dist/` folder to any static hosting service (Netlify, Vercel, etc.)
2. **Backend**: Deploy the `server/` folder to any Node.js hosting service (Heroku, Railway, etc.)
3. **Update API URL**: Change `API_BASE_URL` in frontend to your production backend URL

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 or 5000 is already in use:

**Frontend:**
```bash
# Edit vite.config.ts and change the port
server: {
  port: 3001, // Change to any available port
}
```

**Backend:**
```bash
# Set environment variable
PORT=5001 node server.js
```

### Canvas Not Loading

1. Check if both servers are running
2. Verify the API URL in frontend matches backend port
3. Check browser console for errors
4. Clear browser cache and reload

### Data Not Persisting

1. Ensure you click "Save All" button
2. Check `server/data/drawings.json` exists and is writable
3. Verify backend server is running and responding
4. Check browser console for API errors

### Export Not Working

1. **PNG Export**: Ensure canvas has content
2. **PDF Export**: Check if jsPDF is installed (`npm list jspdf`)
3. Check browser console for errors
4. Try clearing browser cache

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 API Documentation

### Endpoints

#### Pages

- `GET /api/pages` - Get all pages
- `POST /api/pages` - Create a new page
- `DELETE /api/pages/:id` - Delete a page
- `GET /api/pages/:id/shapes` - Get shapes for a page
- `POST /api/pages/:pageId/shapes` - Save shapes for a page (batch)

#### Shapes

- `GET /api/shapes` - Get all shapes
- `PUT /api/shapes/:id` - Update a shape
- `DELETE /api/shapes/:id` - Delete a shape

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

- Inspired by [Excalidraw](https://excalidraw.com/)
- Built with modern web technologies
- Icons by [Feather Icons](https://feathericons.com/)

## 📧 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**Happy Drawing! 🎨✨**
