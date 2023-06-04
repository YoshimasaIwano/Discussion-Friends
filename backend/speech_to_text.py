# #receive it as wav file
# import openai
# import os
# import whisper

# # get the audio data from the frontend and convert it to mp3
# def audio_to_text(audio_url, language):
#     whisper.api_key = os.environ["OPENAI_API_KEY"]

#     # Transcribe the audio data using the Whisper API
#     audio_file= open(audio_url, "rb")
#     transcript = openai.Audio.transcribe("whisper-1", audio_file, language=language)
#     return transcript.text

import json
import requests
import os

def audio_to_text(audio_url, language_code):
    """Transcribe the given audio file."""

    # Construct the JSON request body
    body = {
        "config": {
            "encoding": "LINEAR16",
            # "sampleRateHertz": 48000,
            "languageCode": language_code,
            "enableWordTimeOffsets": False
        },
        "audio": {
            "uri": audio_url
        }
    }
    # print(body)

    api_key = os.environ["GOOGLE_API_KEY"]
    # Construct the URL for the Speech-to-Text API
    url = "https://speech.googleapis.com/v1/speech:recognize?key={}".format(api_key)

    # Send the POST request to the Speech-to-Text API
    response = requests.post(url, headers={"Content-Type": "application/json"}, json=body)
    
    # Handle the response
    if response.status_code == 200:
        print("Got response from Google Cloud Speech API!")
        response_body = response.json()
        print(response_body)

        # Each result is for a consecutive portion of the audio. Iterate through
        # them to get the transcripts for the entire audio file.
        transcript = ""
        for result in response_body['results']:
            # The first alternative is the most likely one for this portion.
            transcript += result['alternatives'][0]['transcript']

        print(transcript)
        return transcript
    else:
        print(f"Received error response from Google Cloud Speech API: {response.status_code}")
        print(response.text)
        return None