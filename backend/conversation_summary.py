# import openai
# import json
# import os

# def summarize_conversation(conversation_history):
#     decoded_string = conversation_history.decode('utf-8')

#     # Load the JSON string as a Python object (dictionary)
#     json_data = json.loads(decoded_string)

#     # Extract the 'tmpChatHistory' list from the dictionary
#     tmpChatHistory = json_data['tmpChatHistory']
#     print(tmpChatHistory)
#     # Set up the system instruction message
#     system_message = {
#         "role": "system",
#         "content": "You are an AI assistant. Summarize the conversation between the user and another AI agent, and determine who made more good points during the session."
#     }

#     # # Add the system instruction message to the conversation history
#     # conversation_history.insert(0, system_message)

#     # Call the OpenAI API
#     response = openai.ChatCompletion.create(
#         model="gpt-3.5-turbo",
#         messages=tmpChatHistory,
#         max_tokens=150,
#         n=1,
#         stop=None,
#         temperature=0.8,
#     )

#     # Extract the AI agent's response
#     ai_response = response.choices[0].message["content"]

#     # Convert the response to a JSON object
#     ai_response_json = {
#         "response": ai_response
#     }

#     return json.dumps(ai_response_json)

import json
import requests
import os
from dotenv import load_dotenv
import openai


def summerize_conversation(conversation_history):

    load_dotenv()

    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

    conversation_history.append({"role": "assistant", "content": "summerize the conversation"})

    openai.api_key = os.getenv("OPENAI_API_KEY")

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=conversation_history,
        temperature=0.9,
        max_tokens=128
    )

    return response.choices[-1].message.content

if __name__ == "__main__":
    tmpChatHistory = [
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

    response = summerize_conversation(conversation_history=tmpChatHistory)

    if response:
        print(response)
    else:
        print("reponse: none")