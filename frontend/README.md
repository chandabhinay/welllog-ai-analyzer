# Well Log Analysis System - Frontend

React-based frontend application for visualizing and analyzing well-log data.

## Features

- File upload interface
- Interactive multi-curve visualization with Plotly
- Depth range selection
- AI interpretation interface
- Conversational chatbot
- Responsive Material-UI design

## Tech Stack

- React 18
- Vite (build tool)
- Material-UI (MUI)
- Plotly.js (visualization)
- Axios (API client)
- React Router (navigation)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Application will run on http://localhost:5173

4. For production build:
   ```bash
   npm run build
   npm run preview
   ```

## Environment Variables

Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

Default API URL is `http://localhost:5000/api` if not set.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx           # App layout wrapper
│   │   ├── WellInfo.jsx         # Well metadata display
│   │   ├── Visualization.jsx    # Chart visualization
│   │   ├── AIInterpretation.jsx # AI interpretation UI
│   │   └── Chatbot.jsx          # Chatbot interface
│   ├── pages/
│   │   ├── Home.jsx             # Home page with well list
│   │   └── WellViewer.jsx       # Well detail page
│   ├── services/
│   │   └── api.js               # API client
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## Components

### Home
- Lists all uploaded wells
- Upload button for new LAS files
- Well cards with metadata
- Delete functionality

### WellViewer
- Tabbed interface for different features
- Well information panel
- Three main tabs:
  - Visualization
  - AI Interpretation
  - Chatbot

### Visualization
- Multi-select for curves
- Depth range inputs
- Interactive Plotly chart
- Zoom, pan, hover features
- Multiple x-axes for different curves

### AIInterpretation
- Curve and depth selection
- Statistical summary display
- AI-generated interpretation
- Formatted results with markdown support

### Chatbot
- Conversational interface
- Message history
- Example questions
- Real-time responses
- Clear chat functionality

## User Flow

1. **Upload Well Data**
   - Navigate to home page
   - Click "Upload LAS File"
   - Select LAS file
   - Wait for processing

2. **View Well**
   - Click "View" on any well card
   - See well metadata

3. **Visualize Data**
   - Select curves from dropdown
   - Adjust depth range
   - Click "Visualize"
   - Interact with chart (zoom, pan)

4. **Get AI Interpretation**
   - Switch to "AI Interpretation" tab
   - Select curves and depth range
   - Click "Interpret"
   - Read analysis and statistics

5. **Use Chatbot**
   - Switch to "Chatbot" tab
   - Type questions
   - Get AI responses
   - Use example questions

## Development

### Adding New Components

1. Create component in `src/components/`
2. Import and use in pages
3. Style with Material-UI components

### Adding New API Calls

1. Add method to `src/services/api.js`
2. Use in components with async/await
3. Handle errors appropriately

### Styling Guidelines

- Use Material-UI components
- Follow existing patterns
- Use theme colors
- Ensure responsive design

## Build

Development:
```bash
npm run dev
```

Production build:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Deployment

### Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Set environment variables in Vercel dashboard:
   - `VITE_API_URL` = your backend URL

### Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy `dist` folder to Netlify

3. Configure environment variables

### Other Platforms

The `dist` folder contains static files that can be served by any static hosting service.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

IE11 is not supported.

## Performance

- Code splitting with Vite
- Lazy loading for routes
- Efficient re-renders with React hooks
- Plotly handles large datasets efficiently
- API response caching where appropriate

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Material-UI accessibility features

## Testing

Manual testing checklist:
- [ ] File upload works
- [ ] Well list displays correctly
- [ ] Navigation works
- [ ] Charts render properly
- [ ] Zoom/pan functions work
- [ ] AI interpretation loads
- [ ] Chatbot responds
- [ ] Responsive on mobile
- [ ] Error messages display
- [ ] Loading states show

## Troubleshooting

### API Connection Issues
- Check backend is running
- Verify API URL in console
- Check CORS settings
- Inspect network tab

### Chart Not Displaying
- Check data format
- Verify Plotly is installed
- Check console for errors
- Ensure valid curve selection

### Build Errors
- Clear node_modules and reinstall
- Check Node.js version (16+)
- Verify all dependencies installed

## Known Issues

- Large datasets (>10,000 points) may be slow
- S3 upload requires proper configuration
- OpenAI API required for full AI features

## Future Enhancements

- Export charts as images
- Data export to CSV
- Multiple well comparison
- Custom color schemes
- Advanced filtering
- User authentication
- Saved analysis sessions

## License

Educational/Assignment Project
