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
from google.cloud import texttospeech

api_key = os.environ["GOOGLE_API_KEY"]
url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={api_key}"

def text_to_speech(message):
    # Instantiates a client
    client = texttospeech.TextToSpeechClient()

    # Set the text input to be synthesized
    synthesis_input = texttospeech.SynthesisInput(text=message)

    # Build the voice request, select the language code ("en-US") and the ssml
    # voice gender ("neutral")
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US", ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    )

    # Select the type of audio file you want returned
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    # Perform the text-to-speech request on the text input with the selected
    # voice parameters and audio file type
    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    # The response's audio_content is binary.
    with open("output.mp3", "wb") as out:
        # Write the response to the output file.
        out.write(response.audio_content)
        print('Audio content written to file "output.mp3"')
    # data = {
    #     "input": {
    #         "text": message,
    #     },
    #     "voice": {
    #         "languageCode": "en-US",
    #         "name": "en-US-Wavenet-A",
    #     },
    #     "audioConfig": {
    #         "audioEncoding": "WAV",
    #     },
    # }

    # response = requests.post(url, headers={"Content-Type": "application/json"}, data=json.dumps(data))

    # if not response.ok:
    #     raise Exception(f"Error: {response.status_code} {response.reason}")

    # response_data = response.json()
    # audio_content = response_data["audioContent"]
    # audio_data = base64.b64decode(audio_content)

    # with open("temp_audio.mp3", "wb") as audio_file:
    #     audio_file.write(audio_data)

    playsound("output.mp3")
    os.remove("output.mp3")