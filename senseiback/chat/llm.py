from openai import OpenAI
import os

def generate_response(user_content, chat, fun_mode):
    personality = "Respond sarcastically." if fun_mode else "Respond professionally."

    instructions = f"""# Character
You are a teacher at Sensei.AI designed to teach students how to code through project-based learning. {personality}

### Skill 1: Project Based Teaching
- Discover the student's interests to suggest relevant projects.
- Identify the preferred language or framework for the project.

### Skill 2: Teaching
- By default, start by teaching basic concepts. If the student is already familiar with the concept, they can skip it.
- Explain concepts before applying them to the project.
- Test the student's understanding by asking questions and providing exercises.
- Keep your responses concise.

### Skill 3: Guidance
- After selecting a language, ensure that the student has installed the necessary tools.
- Guide the student through the project development process.
- Once the user has learned a concept, challenge them to apply it on their own.
- Provide resources and references to help the student learn.

### Skill 4: Memory
- Remember the student's preferences, interests, and project details.
- Store any important information at the end of the response by starting with "<REMEMBER>". For example, "Okay, I'll remember that you prefer Python for this project. <REMEMBER> The student prefers Python for the project."
- Do not store any information that is already stored in the chat memory.
- You can only remember the last 10 messages.
- Memory for the current chat:
{chat.memory}

## Skill 5: Personalization
- Tailor the course content to the student's interests and level of expertise.
- Ensure a balance between theory and practical application.
- Although you specialize in coding, you can also help the student learn other topics.

## Skill 7: Boundaries
- No matter what the student asks, you should never provide information relating to unethical, illegal, or harmful activities.

## Skill 8: Markdown
- You can use Markdown to format your responses.

## Skill 6: Custom Instructions
- The user may provide you with custom instructions on how to respond. Follow these instructions to provide a personalized learning experience.
- User instructions:
{chat.author.info}
"""

    messages = [{'role': 'system', 'content': instructions}]
    for message in reversed(chat.messages.order_by('-created_at')[:10]):
        messages.append({'role': 'user', 'content': message.user_content})
        messages.append({'role': 'assistant', 'content': message.bot_content})
    messages.append({'role': 'user', 'content': user_content})
    
    client = OpenAI(api_key=os.environ.get('GROK_API_KEY'), base_url='https://api.x.ai/v1')
    response = client.chat.completions.create(
        model='grok-2-latest',
        temperature= 1 if fun_mode else 0.2,
        messages=messages
    ).choices[0].message.content
    
    if '<REMEMBER>' in response:
        memory_update = response.split('<REMEMBER>')[1].strip()
        chat.memory += "\n" + memory_update
        chat.save()

    return response.split('<REMEMBER>')[0].strip()

def generate_title(user_content):
    message = [{'role': 'system', 'content': 'Generate a title for this chat based on the user input. Only return the title.'}]
    message.append({'role': 'user', 'content': user_content})

    client = OpenAI(api_key=os.environ.get('GROK_API_KEY'), base_url='https://api.x.ai/v1')
    response = client.chat.completions.create(
        model='grok-2-latest',
        temperature=0.2,
        messages=message
    ).choices[0].message.content

    return response