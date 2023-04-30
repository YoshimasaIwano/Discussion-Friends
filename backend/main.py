from speech_to_text import audio_to_text, record_audio
from chat import chat_gpt_debater
from text_to_speech import text_to_speech
from google.cloud import texttospeech

# {"role": "assistant", "content": "Why do you think economic is boring?"},
# {"role": "assistant", "content": "I think economic is interesting because it is about money"},

topic = "science"
messages = [
    {"role": "system", "content": f"You are going to have a debate with the user. Your topic is about {topic}. Take a side and start an argument with the user. The purpose of this conversation is to improve the user's logical and critical thinking. After having 15 conversation with the user, end the conversation. Remember, the purpose of this conversation is to improve the user's logical thinking and critical thinking."},
]
for i in range(10):
    audio_filename = record_audio()
    transcription = audio_to_text(audio_filename, "language", topic, "level")

    messages.append({"role": "user", "content": transcription})

    response = chat_gpt_debater(messages, "language", topic, "level")
    text_to_speech(response)
    messages.append({"role":"assistant", "content": response})
    print("Response", response)