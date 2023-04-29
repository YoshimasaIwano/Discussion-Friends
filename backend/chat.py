import json
import openai
import json

def chat_gpt_debater(messages, language, topic, level):

    # Call the OpenAI API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=150,
        n=1,
        stop=None,
        temperature=0.8,
    )

    return response.choices[-1].message.content

if __name__ == "__main__":
    messages=[
        {
          "role": "user",
          "content": "Hello, how are you?",
        },
        {
          "role": "assistant",
          "content": "Hi! I'm doing great, thank you. How can I help you today?",
        },
        {
          "role": "user",
          "content": "What's the weather like today?",
        },
        {
          "role": "assistant",
          "content":
            "Today's weather is sunny with a high of 75°F and a low of 55°F.",
        },
      ]
    language="English"
    topic="science"
    level="beginner"
    haha = chat_gpt_debater(messages, language, topic, level)
    print(type(haha), "\n", haha)