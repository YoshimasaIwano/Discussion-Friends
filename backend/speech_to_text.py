#receive it as wav file
import openai
import os
import whisper
import tempfile
import pyaudio
import wave

# get the audio data from the frontend and convert it to mp3
def audio_to_text(audio_url, language, topic, level):
    whisper.api_key = os.environ["OPENAI_API_KEY"]
    # Transcribe the audio data using the Whisper API
    audio_file= open(audio_url, "rb")
    transcript = openai.Audio.transcribe("whisper-1", audio_file)
    print(transcript.text)
    # os.remove(audio_url)
    return transcript.text

def record_audio(duration=10):
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