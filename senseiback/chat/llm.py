from openai import OpenAI

def generate_response(user_content, chat):
    openai = OpenAI()
    messages = [{'role': 'system', 'content': 'You are a helpful assistant.'}]
    for message in chat.messages.all():
        messages.append({'role': 'user', 'content': message.user_content})
        messages.append({'role': 'assistant', 'content': message.bot_content})
    messages.append({'role': 'user', 'content': user_content})
    
    response = openai.chat.completions.create(
        model='gpt-4o-mini',
        messages=messages
    )

    return response.choices[0].message.content.strip()