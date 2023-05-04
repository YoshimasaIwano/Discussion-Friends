import openai

def chat_gpt_debater(messages):
    # Call the OpenAI API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=256,
        n=1,
        stop=None,
        temperature=0.2,
    )

    return response.choices[-1].message.content
