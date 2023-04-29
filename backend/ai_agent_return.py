import json
import openai

topic = "economic"

messages = [
    {"role": "system", "content": f"You are going to have a debate with the user. Your topic is about {topic}. Take a side and start an argument with the user. The purpose of this conversation is to improve the user's logical and critical thinking. After having 15 conversation with the user, end the conversation. Remember, the purpose of this conversation is to improve the user's logical thinking and critical thinking."}
]
def chat_gpt_debater(user_input_json, messages):
    # Load user input from JSON file
    with open(user_input_json, "r") as json_file:
        user_input = json.load(json_file)

    # Append the user input to the message list
    messages.append({"role": "user", "content": user_input["content"]})

    # Call the OpenAI API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=150,
        n=1,
        stop=None,
        temperature=0.8,
    )

    # Extract the AI agent's first response
    ai_response = response.choices[-1].message["content"]

    # Append the AI response to the message list
    messages.append({"role": "ai", "content": ai_response})

    # Save the response as a JSON file
    ai_response_json = {"content": ai_response}
    with open("ai_response.json", "w") as json_file:
        json.dump(ai_response_json, json_file)

    return "ai_response.json"