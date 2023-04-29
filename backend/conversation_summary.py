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

def summarize_conversation(conversation_history):
    decoded_string = conversation_history.decode('utf-8')

    # Load the JSON string as a Python object (dictionary)
    json_data = json.loads(decoded_string)

    # Extract the 'tmpChatHistory' list from the dictionary
    tmpChatHistory = json_data['tmpChatHistory']
    OPENAI_API_KEY = os.environ['OPENAI_API_KEY']
    print(f"Bearer {OPENAI_API_KEY}")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    data = {
        "messages": tmpChatHistory,
        "max_tokens": 128,
        "temperature": 0.9,
        "model": "gpt-3.5-turbo",
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, data=json.dumps(data))

    if response.status_code != 200:
        raise ValueError(f"Error calling ChatGPT API: {response.status_code}")

    response_data = response.json()
    return response_data["choices"][0]["message"]["content"]