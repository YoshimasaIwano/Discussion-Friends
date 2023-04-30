import json
from flask import Flask, request, jsonify
from waitress import serve
from google.cloud import storage
import os

from speech_to_text import audio_to_text
from chat import chat_gpt_debater
from conversation_summary import summarize_conversation
from feedback import feedback

app = Flask(__name__, static_folder='./build', static_url_path='/')
app.config['UPLOAD_FOLDER'] = 'images/profile'
app.config['AUDIO_FOLDER'] = 'audio'
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

# @app.route('/audio', methods=['POST'])
# def save_audio():
#     # Check if the request contains an audio file
#     if 'audio' not in request.files:
#         return jsonify({'error': 'No audio file found in request'}), 400

#     audio = request.files['audio']

#     # Check if the audio filename is not empty
#     if audio.filename == '':
#         return jsonify({'error': 'No selected audio file'}), 400

#     # Check if the file has a valid content type
#     if not audio.content_type.startswith('audio/'):
#         return jsonify({'error': 'Invalid content type'}), 400

#     # Save the audio to Google Cloud Storage
#     audio_path = f"{app.config['AUDIO_FOLDER']}/{audio.filename}"
#     blob = bucket.blob(audio_path)
#     blob.upload_from_string(audio.read(), content_type=audio.content_type)

#     # Generate the audio URL
#     audio_url = f'https://storage.googleapis.com/{app.config["GCS_BUCKET_NAME"]}/{audio_path}'

#     # Return the audio URL
#     return jsonify({'audioURL': audio_url})

@app.route('/whisper', methods=['POST'])
def whisper():
    data = request.get_json()
    return audio_to_text(data['audioURL'], data['language'], data['topic'], data['level'])

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    return chat_gpt_debater(data['text'], data['language'], data['topic'], data['level'])

@app.route('/summary', methods=['POST'])
def summary():
    data = request.get_json()
    return summarize_conversation(data['data'])

@app.route('/summary', methods=['POST'])
def feedback():
    data = request.get_json()
    return feedback(data['data'])

# # this is for deployment
# if __name__ == "__main__":
#     app.debug = False
#     PORT = os.environ.get('PORT', '5000')
#     serve(app, host='0.0.0.0', port=PORT)

# this is for your local environment
if __name__ == "__main__":
    app.debug = True
    PORT = os.environ.get('PORT', '5000')
    app.run()