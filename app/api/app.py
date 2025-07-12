from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from groq import Groq
import logging
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001", "https://your-vercel-app.vercel.app"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize APIs
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set")

SYSTEM_PROMPT = """You are an expert software developer and coding assistant for StackIt, a Q&A platform for developers. Your role is to:

1. Provide clear, accurate, and helpful answers to coding questions
2. Explain complex concepts in an understandable way
3. Give practical code examples when relevant
4. Suggest best practices and alternatives
5. Be encouraging and supportive to developers of all skill levels
6. Format your responses with proper markdown when including code
7. Ask clarifying questions if the problem isn't clear

Keep responses concise but comprehensive. Always aim to help the developer learn and understand the solution."""

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Get JSON data from request
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        message = data.get('message', '')
        
        if not message:
            return jsonify({"error": "No input provided"}), 400

        # Get AI response using Groq
        client = Groq(api_key=GROQ_API_KEY)
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message}
            ],
            model="llama3-70b-8192",
            temperature=0.7,
            max_tokens=1024
        )
        
        ai_response = response.choices[0].message.content

        return jsonify({
            "response": ai_response,
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        logging.error(f"Error in /api/chat: {str(e)}")
        return jsonify({"error": "Service temporarily unavailable"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)