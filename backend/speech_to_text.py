#receive it as wav file
import openai
import os
import requests
import json
import requests
import json
import whisper

def audio_to_text(audio_data):

    # Set your API key
    print(os.environ["OPENAI_API_KEY"])
    whisper.api_key = os.environ["OPENAI_API_KEY"]

    # Transcribe the audio data using the Whisper API
    response = requests.post(
        "https://api.openai.com/v1/speech-to-text/transcriptions",
        headers={
            "Content-Type": "audio/wav",
            "Authorization": f"Bearer {whisper.api_key}"
        },
        data=audio_data
    )

    # Check for errors and parse the response
    if response.status_code == 200:
        transcription_data = response.json()
        return json.dumps(transcription_data, indent=2)
    else:
        raise Exception(f"Error in transcription: {response.status_code}")