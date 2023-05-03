import os
# from dotenv import load_dotenv
import openai


def feedback(conversation_history):
  # load_dotenv()
  # OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
  conversation_history.append({"role": "assistant", "content": "Critically read through the conversation and provide a feedback to improve the discussion"})

  openai.api_key = os.environ["OPENAI_API_KEY"]

  response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=conversation_history,
        temperature=0.9,
        max_tokens=128
  )

  return response.choices[-1].message.content


# if __name__ == "__main__":
#     tmpChatHistory = [
#         {
#             "role": "user",
#             "content": "Hello, how are you?",
#         },
#         {
#             "role": "assistant",
#             "content": "Hi! I'm doing great, thank you. How can I help you today?",
#         },
#         {
#             "role": "user",
#             "content": "What's the weather like today?",
#         },
#         {
#             "role": "assistant",
#             "content":
#             "Today's weather is sunny with a high of 75°F and a low of 55°F.",
#         },
#     ]

#     response = feedback(conversation_history=tmpChatHistory)

#     if response:
#         print(response)
#     else:
#         print("reponse: none")
