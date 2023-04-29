#receive it as wav file
import openai
import os
import requests
import json
import requests
import json
import whisper

# get the audio data from the frontend and convert it to mp3


def audio_to_text(audio_url, language, topic, level):
    openai.api_key = os.environ['OPENAI_API_KEY']

    audio_file = open(audio_url, "rb")

    # Transcribe the audio using OpenAI API
    transcript = openai.Audio.transcribe("whisper-1", audio_url)

    return transcript["text"]

# def audio_to_text(audio_url, language, topic, level):
#     whisper.api_key = os.environ["OPENAI_API_KEY"]
#     # Transcribe the audio data using the Whisper API
#     files = {
#         "model": "whisper-1",
#         "file": open(audio_url, "rb"),
#     }
#     response = requests.post(
#         "https://api.openai.com/v1/audio/transcriptions",
#         headers={
#             "Content-Type": "audio/wav",
#             "Authorization": f"Bearer {whisper.api_key}"
#         },
#         files=files
#     )
#     print(response)
#     # Check for errors and parse the response
#     if response.status_code == 200:
#         transcription_data = response.json()
#         print(transcription_data)
#         return json.dumps(transcription_data, indent=2)
#     else:
#         raise Exception(f"Error in transcription: {response.status_code}")