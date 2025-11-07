const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')

const app = express()

// Enable CORS with specific options
const allowedOrigins = [
  'http://localhost:3000',
  'https://mini-excalidraw.vercel.app',  // Add your Vercel frontend URL here
  'https://mini-excalidraw-client.vercel.app'  // Common Vercel URL pattern
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.warn(`CORS blocked: ${origin}`);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(bodyParser.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

const DATA_FILE = path.join(__dirname, 'data', 'drawings.json')

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
}

// Load data from file or initialize with default
function loadData() {
  try {
    console.log('Loading data from:', DATA_FILE);
    
    // Ensure directory exists
    if (!fs.existsSync(path.dirname(DATA_FILE))) {
      console.log('Creating data directory...');
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    }
    
    // Check if file exists and has content
    if (fs.existsSync(DATA_FILE)) {
      const stats = fs.statSync(DATA_FILE);
      if (stats.size > 0) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        if (fileContent && fileContent.trim()) {
          console.log('Loaded existing data');
          return JSON.parse(fileContent);
        }
      }
    }
    
    // If we get here, initialize with default data
    console.log('Initializing with default data');
    const defaultData = {
      pages: [{ id: 'page1', name: 'Page 1', shapes: [] }]
    };
    
    // Save the default data
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
    console.log('Created new data file with default data');
    return defaultData;
    
  } catch (error) {
    console.error('Error in loadData:', error);
    // Return minimal default data in case of any error
    return { pages: [{ id: 'page1', name: 'Page 1', shapes: [] }] };
  }
}

// Save data to file
function saveData(data) {
  try {
    console.log('Saving data to:', DATA_FILE);
    const tempFile = DATA_FILE + '.tmp';
    
    // Write to a temporary file first
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    
    // Rename temp file to actual file (atomic operation)
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
    fs.renameSync(tempFile, DATA_FILE);
    
    console.log('Data saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

let db = loadData();
let pages = Array.isArray(db.pages) ? db.pages : [];

// Ensure we have at least one page
if (pages.length === 0) {
  pages = [{ id: 'page1', name: 'Page 1', shapes: [] }];
  saveData({ pages });
}

// Pages
app.get('/api/pages', (req,res)=> res.json(pages.map(p=> ({ id: p.id, name: p.name }))))
app.post('/api/pages', (req,res)=> {
  const { name } = req.body
  if(!name) return res.status(400).json({ error: 'name required' })
  const newPage = { id: 'page_'+Date.now(), name, shapes: [] }
  pages.push(newPage)
  saveData({ pages })
  res.status(201).json(newPage)
})
app.get('/api/pages/:id/shapes', (req,res)=> {
  const p = pages.find(x=>x.id===req.params.id)
  if(!p) return res.status(404).json({ error: 'not found' })
  res.json(p.shapes)
})
app.delete('/api/pages/:id', (req,res)=> {
  pages = pages.filter(x=>x.id!==req.params.id)
  saveData({ pages })
  res.json({ message: 'deleted' })
})

// Shapes
app.get('/api/shapes', (req,res)=> {
  try {
    console.log('GET /api/shapes - Fetching all shapes');
    const allShapes = pages.flatMap(p => Array.isArray(p.shapes) ? p.shapes : []);
    console.log(`Found ${allShapes.length} shapes`);
    res.json(allShapes);
  } catch (error) {
    console.error('Error in GET /api/shapes:', error);
    res.status(500).json({ error: 'Failed to fetch shapes' });
  }
});

// Handle batch updates of shapes for a page
app.post('/api/pages/:pageId/shapes', (req, res) => {
  try {
    const pageId = req.params.pageId;
    const shapes = req.body;
    
    console.log(`POST /api/pages/${pageId}/shapes - Received ${Array.isArray(shapes) ? shapes.length : 0} shapes`);
    
    if (!Array.isArray(shapes)) {
      console.error('Invalid shapes data - expected array');
      return res.status(400).json({ error: 'Invalid shapes data. Expected array of shapes' });
    }
    
    let page = pages.find(p => p.id === pageId);
    if (!page) {
      // Auto-create page if it doesn't exist
      console.log(`Page ${pageId} not found, creating it...`);
      page = { id: pageId, name: `Page ${pages.length + 1}`, shapes: [] };
      pages.push(page);
    }
    
    // Replace all shapes for this page
    page.shapes = [...shapes];
    
    console.log(`Page ${pageId} now has ${page.shapes.length} shapes`);
    
    // Save the updated data
    if (!saveData({ pages })) {
      console.error('Failed to save data to file');
      return res.status(500).json({ error: 'Failed to save shapes' });
    }
    
    // Verify the data was saved
    const savedData = loadData();
    const savedPage = savedData.pages.find(p => p.id === pageId);
    console.log(`Verified save - page ${pageId} has ${savedPage?.shapes?.length || 0} shapes`);
    
    res.status(200).json({ message: 'Shapes saved successfully' });
  } catch (error) {
    console.error('Error in POST /api/pages/:pageId/shapes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get shapes for a specific page
app.get('/api/pages/:pageId/shapes', (req, res) => {
  try {
    const pageId = req.params.pageId;
    console.log(`GET /api/pages/${pageId}/shapes`);
    
    const page = pages.find(p => p.id === pageId);
    if (!page) {
      console.log(`Page ${pageId} not found, returning empty array`);
      return res.json([]);
    }
    
    res.json(Array.isArray(page.shapes) ? page.shapes : []);
  } catch (error) {
    console.error('Error in GET /api/pages/:pageId/shapes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/shapes/:id', (req,res)=> {
  try {
    const shapeId = req.params.id;
    const updates = req.body;
    console.log(`PUT /api/shapes/${shapeId} - Updating shape`);
    
    for (const page of pages) {
      if (!Array.isArray(page.shapes)) continue;
      
      const shapeIndex = page.shapes.findIndex(s => s.id === shapeId);
      if (shapeIndex !== -1) {
        console.log(`Found shape ${shapeId} on page ${page.id}`);
        // Update the shape
        page.shapes[shapeIndex] = { 
          ...page.shapes[shapeIndex], 
          ...updates,
          // Ensure these critical fields are not overwritten
          id: shapeId,
          pageId: page.shapes[shapeIndex].pageId
        };
        
        console.log(`Updated shape ${shapeId} on page ${page.id}`);
        
        // Save the updated data
        if (!saveData({ pages })) {
          console.error('Failed to save updated shape');
          return res.status(500).json({ error: 'Failed to update shape' });
        }
        
        return res.json(page.shapes[shapeIndex]);
      }
    }
    
    res.status(404).json({ error: 'Shape not found' });
  } catch (error) {
    console.error('Error in PUT /api/shapes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/shapes/:id', (req,res)=> {
  try {
    const shapeId = req.params.id;
    console.log(`DELETE /api/shapes/${shapeId} - Deleting shape`);
    
    for (const page of pages) {
      if (!Array.isArray(page.shapes)) continue;
      
      const shapeIndex = page.shapes.findIndex(s => s.id === shapeId);
      if (shapeIndex !== -1) {
        console.log(`Found and removing shape ${shapeId} from page ${page.id}`);
        // Remove the shape
        page.shapes.splice(shapeIndex, 1);
        
        // Save the updated data
        if (!saveData({ pages })) {
          console.error('Failed to save after shape deletion');
          return res.status(500).json({ error: 'Failed to delete shape' });
        }
        
        console.log(`Successfully deleted shape ${shapeId}`);
        return res.json({ message: 'deleted' });
      }
    }
    
    console.warn(`Shape ${shapeId} not found`);
    res.status(404).json({ error: 'Shape not found' });
  } catch (error) {
    console.error('Error in DELETE /api/shapes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=> console.log('Server running on port', PORT))
