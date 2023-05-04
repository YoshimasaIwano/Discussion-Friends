import os
import openai


def summarize_conversation(conversation_history):
    conversation_history.append({"role": "system", "content":
                                 """
                                 summerize the conversation within 500 words. 
                                 List the main points of the conversation and the conclusion of the conversation. 
                                 You will provide a feedback to improve the discussion.
                                 i.e)
                                    Main points: Big bang theory, evolution, and creationism (end)
                                    Conclusion: The big bang theory is the most plausible theory of the origin of the universe. (end)
                                    Feedback: The user should provide more evidence to support his/her argument. (end)
                                 """
                                 })

    openai.api_key = os.environ["OPENAI_API_KEY"]

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=conversation_history,
        temperature=0.01,
        max_tokens=512
    )

    return response.choices[-1].message.content  # , iteration_count
