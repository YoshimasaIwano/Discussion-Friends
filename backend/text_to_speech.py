# import pyttsx3

# def text_to_speech(message):
#     engine = pyttsx3.init()
#     engine.setProperty('rate', 160)  # Speed of speech, you can adjust this value
#     engine.setProperty('volume', 1.0)  # Volume, can be a value between 0.0 and 1.0
#     engine.say(message)
#     engine.runAndWait()

import base64
import json
import os
import requests
from playsound import playsound
# from google.cloud import texttospeech

api_key = os.environ["GOOGLE_API_KEY"]
url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={api_key}"

def text_to_speech(message):
    data = {
        "input": {
            "text": message,
        },
        "voice": {
            "languageCode": "en-US",
            "name": "en-US-Wavenet-A",
        },
        "audioConfig": {
            "audioEncoding": "MP3",
        },
    }

    response = requests.post(url, headers={"Content-Type": "application/json"}, data=json.dumps(data))

    if not response.ok:
        raise Exception(f"Error: {response.status_code} {response.reason}")

    response_data = response.json()
    audio_content = response_data["audioContent"]
    audio_data = base64.b64decode(audio_content)

    with open("temp_audio.mp3", "wb") as audio_file:
        audio_file.write(audio_data)

    playsound("temp_audio.mp3")
    os.remove("temp_audio.mp3")