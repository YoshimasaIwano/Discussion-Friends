import os
import openai
import re

def evaluate_conversation(messages):
    messages.append({"role": "system", "content":
                                 """
                                 Evaluate the user's English covnersation skills rigorously on a scale of 0 to 10 fro each fo the following categories.
                                 Assign a if there is insufficient information for evaluation or if the duscussion is too brief to assess properly. Score strictly, considering each point as high achievement.

                                 Evaluate the user's logical thinking skills rigorously on a scale of 0 to 10 for each of the following categories. 
                                 Assign a 0 if there is insufficient information for evaluation or if the discussion is too brief to assess properly. 
                                 Score strictly, considering each point as high achievement.
                                 1. Vocabulary: Is the user employing a broad range of vocabulary correctly and appropriately in their conversation?
                                 2. Grammar: Does the user demonstrate correct usage of various grammatical structures such as verb tenses, prepositions, conjunctions, etc?
                                 3. Pronunciation: How accurately does the user pronounce words? Do they place the correct emphasis on syllables?
                                 4. Listening Comprehension: Is the user demonstrating an understanding of spoken English, including interpreting various accents and speeds of speech?
                                 5. Speech Fluidity: How smoothly does the user speak? Are there unnecessary pauses or hesitations?
                                 6. Idiomatic Expressions: Is the user understanding and using idiomatic expressions or slang correctly and appropriately?
                                 7. Conversation Management: How well does the user manage the conversation? Can they start, maintain and appropriately conclude a conversation?
                                 8. Cultural Understanding: Is the user aware of and able to incorporate knowledge of cultural references, norms, and expectations that are relevant to the conversation?
                                 9. Contextual Understanding: Is the user able to understand and adjust language use according to the context (i.e., formal vs. informal situations)?
                                 10. Confidence: Does the user appear confident when speaking? Do they convey their ideas assertively and without excessive hesitation?
                                 Return the score of each of these 10 points in this format
                                    i.e)
                                    1. 2
                                    2. 3
                                    3. 2
                                    4. 3
                                    5. 4
                                    6. 3
                                    7. 4
                                    8. 2
                                    9. 4
                                    10. 3
                                 """
                                 })
    openai.api_key = os.environ["OPENAI_API_KEY"]
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.1,
        max_tokens=256
    )
    text = response.choices[-1].message.content

    # print(text)
    scores = []
    for criterion in range(1, 11):
        score_match = re.search(rf"{criterion}\.\s(\d+)", text)
        if score_match:
            score = int(score_match.group(1))
            scores.append(score)
        else:
            scores.append(0)

    return scores
