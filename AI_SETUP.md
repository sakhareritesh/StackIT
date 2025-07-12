# StackIt AI Integration Setup

This document explains how to set up and run the StackIt application with AI integration using Groq API.

## Prerequisites

1. **Python 3.8+** installed on your system
2. **Node.js 18+** and npm/pnpm
3. **Groq API Key** (get one from [Groq Console](https://console.groq.com))

## Setup Instructions

### 1. Environment Setup

Create a `.env` file in the `app/api/` directory with your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Install Dependencies

#### Python Dependencies (Flask API)
```bash
cd app/api
pip install -r requirements.txt
```

#### Node.js Dependencies (Next.js Frontend)
```bash
# From the root directory
npm install
# or
pnpm install
```

### 3. Running the Application

#### Option 1: Manual Startup

1. **Start the Flask API Server:**
   ```bash
   cd app/api
   python app.py
   ```
   This will start the API server on `http://localhost:5000`

2. **Start the Next.js Development Server:**
   ```bash
   # From the root directory
   npm run dev
   # or
   pnpm dev
   ```
   This will start the frontend on `http://localhost:3000` (or 3001 if 3000 is busy)

#### Option 2: Automated Startup (Windows)

Use the provided startup scripts:

- **Batch file:** Double-click `start-dev.bat`
- **PowerShell:** Right-click `start-dev.ps1` and "Run with PowerShell"

## API Endpoints

### Health Check
- **GET** `/health`
- Returns: `{"status": "healthy"}`

### Chat with AI
- **POST** `/api/chat`
- Body: `{"message": "Your coding question here"}`
- Returns: `{"response": "AI response", "timestamp": "ISO timestamp"}`

## Frontend Integration

The Ask AI page (`/ask-ai`) now connects to the Flask API to provide real AI-powered responses. Features include:

- Real-time chat interface
- Suggested coding questions
- Error handling with fallback messages
- User authentication requirement
- Professional coding assistant responses

## Troubleshooting

### Common Issues

1. **Port 3000 already in use:** Next.js will automatically use port 3001
2. **CORS errors:** Ensure the Flask server includes the correct frontend URL in CORS settings
3. **API connection failed:** Verify the Flask server is running on localhost:5000
4. **Groq API errors:** Check your API key in the `.env` file

### Error Messages

- "Please sign in to ask AI" - User needs to authenticate first
- "Failed to get AI response" - Check Flask server status and API key
- "Service temporarily unavailable" - Check Flask server logs for detailed error information

## Development Notes

- The Flask server runs in debug mode for development
- The frontend includes error handling and fallback responses
- All API calls include proper error handling and user feedback
- The AI is configured as a coding assistant specialized for developer questions

## Production Deployment

For production deployment:

1. Set `debug=False` in the Flask app
2. Use a production WSGI server like Gunicorn
3. Configure proper environment variables
4. Update CORS settings for your production domain
5. Implement proper authentication and rate limiting
