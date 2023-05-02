#receive it as wav file
import json
import openai
import os
import requests
import whisper
import tempfile
import pyaudio
import wave

# get the audio data from the frontend and convert it to mp3
def audio_to_text(audio_url, language, topic, level):
    whisper.api_key = os.environ["OPENAI_API_KEY"]
    # Transcribe the audio data using the Whisper API
    audio_file= open(audio_url, "rb")
    # file = {
    #     "name": audio_url,
    # }
    transcript = openai.Audio.transcribe("whisper-1", audio_file)
    # print(transcript.text)
    # os.remove(audio_url)
    return transcript.text

def record_audio(duration=5):
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    RATE = 16000
    CHUNK = 1024

    audio = pyaudio.PyAudio()
    stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

    print("Recording...")

    frames = []

    for _ in range(0, int(RATE / CHUNK * duration)):
        data = stream.read(CHUNK)
        frames.append(data)

    print("Finished recording")

    stream.stop_stream()
    stream.close()
    audio.terminate()

    # Save the audio as a WAV file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as wav_file:
        wf = wave.open(wav_file.name, 'wb')
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(audio.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))
        wf.close()

    return wav_file.name


if __name__ == "__main__":
    # audio_to_text("https://storage.googleapis.com/whisper-1.appspot.com/audio/2021-04-24T17:46:08.000Z.wav", "en", "food", "A1")
    audio_url = 'https://storage.googleapis.com/treasure-385205.appspot.com/audio/audio.wav'
    text = audio_to_text(audio_url, "en", "food", "A1")

    print(text)
    # # Download the audio file
    # response = requests.get(audio_url)
    # audio_data = response.content
    # print(response)
    # print(audio_data)