import openai
import json

def summarize_conversation(conversation_history):
    # Set up the system instruction message
    system_message = {
        "role": "system",
        "content": "You are an AI assistant. Summarize the conversation between the user and another AI agent, and determine who made more good points during the session."
    }

    # Add the system instruction message to the conversation history
    conversation_history.insert(0, system_message)

    # Call the OpenAI API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=conversation_history,
        max_tokens=150,
        n=1,
        stop=None,
        temperature=0.8,
    )

    # Extract the AI agent's response
    ai_response = response.choices[0].message["content"]

    # Convert the response to a JSON object
    ai_response_json = {
        "response": ai_response
    }

    return json.dumps(ai_response_json)

