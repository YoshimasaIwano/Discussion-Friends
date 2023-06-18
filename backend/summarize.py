import openai
import os
import re

from translate import translate_text

def summarize_conversation(messages, language):
    messages.append({"role": "system", "content":
                                 """
                                 summerize the conversation within 500 words in English.
                                 List the main points of the conversation and the conclusion of the conversation. 
                                 You will provide a feedback to improve the user's conversational English skills.
                                 i.e)
                                    Main points: Big bang theory, evolution, and creationism.
                                    Conclusion: The big bang theory is the most plausible theory of the origin of the universe.
                                    Feedback: The user should provide more evidence to support his/her argument.
                                 """
                                 })
    openai.api_key = os.environ["OPENAI_API_KEY"]
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.01,
        max_tokens=512
    )
    text = response.choices[-1].message.content

    main_points_match = re.search(r"Main points:\s(.*?)Conclusion:", text, re.S)
    conclusion_match = re.search(r"Conclusion:\s(.*?)Feedback:", text, re.S)
    feedback_match = re.search(r"Feedback:\s(.*?)(?=\s[a-zA-Z]+:|\s*$)", text, re.S)

    main_points = main_points_match.group(1).strip() if main_points_match else "None"
    conclusion = conclusion_match.group(1).strip() if conclusion_match else "None"
    feedback = feedback_match.group(1).strip() if feedback_match else "None"

    if language != "English":
        main_points = translate_text(text=main_points, target_language=language)
        conclusion = translate_text(text=conclusion, target_language=language)
        feedback = translate_text(text=feedback, target_language=language)

    return main_points, conclusion, feedback

