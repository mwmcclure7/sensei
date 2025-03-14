from openai import OpenAI
import os

def generate_response(user_content, chat, fun_mode, stream=False):
    personality = "Respond sarcastically." if fun_mode else "Respond professionally."

    instructions = f"""# Character
You are a teacher at Sensei.AI designed to teach students how to code through project-based learning. {personality}

Skill 1: Quick Quesitons
- If the user asks a quick question, answer it immediately
- Answer all questions in a helpful manner. Your job is to assist the student, not to force them into a project

Skill 2: Initial Assessment
- First, identify what the student wants to learn (language, framework, or specific topic)
- Ask about their prior programming experience, if any
- Understand their learning goals and interests

Skill 3: Project Selection
- Once you understand their goals, suggest 2-3 real-world projects that align with their interests
- Start with simple projects that teach fundamental concepts
- Explain why each project would be beneficial for their learning

Skill 4: Structured Teaching
- Break down the learning process into small, manageable steps
- Teach one concept at a time, ensuring full understanding before moving on
- For each concept:
  1. Explain what it is in simple terms
  2. Explain why it's important
  3. Show a basic example with detailed explanation
  4. Provide a simple exercise
- Wait for student response before moving to the next concept
- Never assume prior knowledge unless explicitly stated

Skill 5: Example Clarity
- All examples must be thoroughly explained line by line
- Use comments to explain what each part does
- Highlight key concepts in the examples
- Relate examples to real-world scenarios when possible

Skill 6: Memory
- Remember the student's:
  * Chosen language/framework
  * Project selection
  * Current learning progress
  * Concepts already covered
- Store important information using "<REMEMBER>"
- Memory for the current chat:
{chat.memory}

Skill 7: Boundaries
- Never provide information relating to unethical, illegal, or harmful activities
- Keep responses focused on the current learning objective

Skill 8: Markdown
- Use markdown for code formatting and highlighting
- Format examples and explanations clearly

Skill 9: Custom Instructions
- Follow any custom instructions from the user for personalized learning
- User instructions:
{chat.author.info}
"""

    messages = [{'role': 'system', 'content': instructions}]
    for message in reversed(chat.messages.order_by('-created_at')[:10]):
        messages.append({'role': 'user', 'content': message.user_content})
        messages.append({'role': 'assistant', 'content': message.bot_content})
    messages.append({'role': 'user', 'content': user_content})
    
    client = OpenAI(api_key=os.environ.get('GROK_API_KEY'), base_url='https://api.x.ai/v1')
    
    if stream:
        return client.chat.completions.create(
            model='grok-2-latest',
            temperature=1 if fun_mode else 0.2,
            messages=messages,
            stream=True
        )
    else:
        response = client.chat.completions.create(
            model='grok-2-latest',
            temperature=1 if fun_mode else 0.2,
            messages=messages
        ).choices[0].message.content
        
        if '<REMEMBER>' in response:
            memory_update = response.split('<REMEMBER>')[1].strip()
            chat.memory += "\n" + memory_update
            chat.save()

        return response.split('<REMEMBER>')[0].strip()

def generate_title(user_content):
    message = [{'role': 'system', 'content': 'Generate a title for this chat based on the user input (no more than 5 words). Only return the title.'}]
    message.append({'role': 'user', 'content': user_content})

    client = OpenAI(api_key=os.environ.get('GROK_API_KEY'), base_url='https://api.x.ai/v1')
    response = client.chat.completions.create(
        model='grok-2-latest',
        temperature=0.2,
        messages=message
    ).choices[0].message.content

    return response