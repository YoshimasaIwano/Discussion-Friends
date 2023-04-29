#receive it as wav file
import openai
import os
import requests
import json
import requests
import whisper

# get the audio data from the frontend and convert it to mp3

def audio_to_text(audio_url, language, topic, level):
    whisper.api_key = os.environ["OPENAI_API_KEY"]
    # Transcribe the audio data using the Whisper API
    audio_file= open(audio_url, "rb")
    transcript = openai.Audio.transcribe("whisper-1", audio_file)
    print(transcript.text)
    return transcript.text
