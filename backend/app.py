from flask import Flask, request, jsonify
from waitress import serve
from google.cloud import storage
import os
from werkzeug.utils import secure_filename
from concurrent.futures import ThreadPoolExecutor
from evaluate import evaluate_conversation

from speech_to_text import audio_to_text
from chat import chat_gpt_debater
from summarize import summarize_conversation
# from feedback import feedback

app = Flask(__name__, static_folder='./build', static_url_path='/')
# app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'images/profile'
app.config['AUDIO_FOLDER'] = '/tmp/audio'
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
    if 'audio' not in request.files:
        return 'No audio file in request', 400

    audio_file = request.files['audio']
    filename = secure_filename(audio_file.filename)
    os.makedirs(app.config['AUDIO_FOLDER'], exist_ok=True)
    save_path = os.path.join(app.config['AUDIO_FOLDER'], filename)
    audio_file.save(save_path)

    # Extract additional information
    language = request.form.get('language')

    # Process the audio file and send it to an API
    try:
        transcribed_text = audio_to_text(save_path, language)
        return jsonify(transcribed_text)
    except Exception as e:
        return str(e), 500

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    try:
        response_text = chat_gpt_debater(data['text'])
        return jsonify(response_text)
    except Exception as e:
        return str(e), 500

@app.route('/summary', methods=['POST'])
def summary():
    data = request.get_json()
    # print(data)
    try:
        # Use a ThreadPoolExecutor to run the functions concurrently
        with ThreadPoolExecutor() as executor:
            future_summary = executor.submit(summarize_conversation, data['messages'], data['language'])
            future_score = executor.submit(evaluate_conversation, data['messages'])

            main_points, conclusion, feedback = future_summary.result()
            score = future_score.result()

        return jsonify({'mainPoints': main_points, 'conclusion': conclusion, 'feedback': feedback, 'score': score})
    except Exception as e:
        return str(e), 500

# @app.route('/summary', methods=['POST'])
# def feedback():
#     data = request.get_json()
#     return feedback(data['data'])

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