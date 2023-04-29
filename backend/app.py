from flask import Flask, request, jsonify
from waitress import serve
from google.cloud import storage
import os

from speech_to_text import audio_to_text
from ai_agent_return import chat_gpt_debater
from conversation_summary import summarize_conversation

app = Flask(__name__, static_folder='./build', static_url_path='/')
app.config['UPLOAD_FOLDER'] = 'images/profile'
app.config['GCS_BUCKET_NAME'] = 'treasure-385205.appspot.com'

storage_client = storage.Client()
bucket = storage_client.get_bucket(app.config['GCS_BUCKET_NAME'])

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    # Check if the request contains an image file
    if 'image' not in request.files:
        return jsonify({'error': 'No image file found in request'}), 400

    image = request.files['image']

    # Check if the image filename is not empty
    if image.filename == '':
        return jsonify({'error': 'No selected image file'}), 400

    # Save the image to Google Cloud Storage
    image_path = f"{app.config['UPLOAD_FOLDER']}/{image.filename}"
    blob = bucket.blob(image_path)
    blob.upload_from_string(image.read(), content_type=image.content_type)

    # Generate the image URL
    image_url = f'https://storage.googleapis.com/{app.config["GCS_BUCKET_NAME"]}/{image_path}'

    # Return the image URL
    return jsonify({'photoURL': image_url})

@app.route('/whisper', methods=['POST'])
def whisper():
    return audio_to_text(request.data)

@app.route('/chat', methods=['POST'])
def chat():
    return chat_gpt_debater(request.data)

@app.route('/summary', methods=['POST'])
def summary():
    return summarize_conversation(request.data)

# this is for deployment
if __name__ == "__main__":
    app.debug = False
    PORT = os.environ.get('PORT', '5000')
    serve(app, host='0.0.0.0', port=PORT)

# # this is for your local environment
# if __name__ == "__main__":
#     app.debug = True
#     PORT = os.environ.get('PORT', '5000')
#     app.run()