import openai
import os

def translate_text(text, target_language):
    messages = [
        {"role": "system", "content": f"Translate the following English text to {target_language}:"},
        {"role": "user", "content": text},
    ]
    
    openai.api_key = os.environ["OPENAI_API_KEY"]
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.01,
        max_tokens=256
    )
    
    return response.choices[-1].message.content
