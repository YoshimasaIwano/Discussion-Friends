import os
import openai
import json

class DebateAI:
    def __init__(self, topic):
        self.topic = topic
        self.system_message = {"role": "system", "content": f"You are a debater. Your topic will be {topic}. You are going to debate this topic with the user. Try to respond shortly as much as you can."}

    def generate_ai_response(self, user_input):
        messages = [self.system_message, {"role": "user", "content": user_input}]
        response = openai.ChatCompletion.create(
            engine="gpt-35-turbo",
            messages=messages,
            temperature=0,
            max_tokens=150,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None,
        )

        ai_response = response.choices[0].message["content"]
        return ai_response

    def save_ai_response_to_json(self, filename, ai_response):
        with open(filename, "w", encoding="utf-8") as f:
            json.dump({"role": "assistant", "content": ai_response}, f, ensure_ascii=False, indent=4)



# Usage example
'''
if __name__ == "__main__":
    openai.api_type = "azure"
    openai.api_base = "https://docs-test-001.openai.azure.com/"
    openai.api_version = "2023-03-15-preview"
    openai.api_key = os.getenv("OPENAI_API_KEY")

    debate_ai = DebateAI(topic="economics")
    user_input = "What are the advantages of a free market economy?"
    ai_response = debate_ai.generate_ai_response(user_input)
    print("AI Agent:", ai_response)

    debate_ai.save_ai_response_to_json("ai_response.json", ai_response)
'''