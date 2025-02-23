from openai import OpenAI
import os
import json

def generate_course(user_content, chat_history):
    """Generate a course structure based on user input and chat history."""
    
    instructions = """You are an expert curriculum designer at Sensei.AI. Your task is to create a personalized learning course based on the student's requirements and interests.

Follow these guidelines:
1. Analyze the student's learning goals and any project requirements
2. Design a comprehensive course structure with:
   - A clear, concise title
   - A brief description (1-2 sentences)
   - A detailed course summary
   - 5-10 units, depending on topic complexity
3. Each unit should have:
   - A descriptive title
   - A clear learning objective
   - A brief description of what will be covered

Return your response in this JSON format:
{
    "title": "Course title",
    "description": "Brief course description",
    "summary": "Detailed course summary",
    "units": [
        {
            "title": "Unit title",
            "description": "Unit description",
            "order": 1
        }
    ]
}"""

    messages = [{'role': 'system', 'content': instructions}]
    for message in chat_history:
        messages.append({'role': 'user' if message['is_user'] else 'assistant', 'content': message['content']})
    messages.append({'role': 'user', 'content': user_content})
    
    client = OpenAI(api_key=os.environ.get('GROK_API_KEY'), base_url='https://api.x.ai/v1')
    response = client.chat.completions.create(
        model='grok-2-latest',
        temperature=0.2,
        messages=messages
    ).choices[0].message.content
    print(response)
    return json.loads(response)

def generate_unit_content(course_title, unit_info):
    """Generate detailed content for a course unit."""
    
    instructions = f"""You are an expert curriculum designer at Sensei.AI. Your task is to generate detailed content for a unit in the course "{course_title}".

Unit Information:
Title: {unit_info['title']}
Description: {unit_info['description']}

Please generate comprehensive content that:
1. Introduces the topic clearly
2. Explains key concepts in detail
3. Provides examples where appropriate
4. Includes practical exercises or discussion points
5. Summarizes the main takeaways

Format the content using Markdown for better readability."""

    messages = [
        {'role': 'system', 'content': instructions},
        {'role': 'user', 'content': 'Please generate the unit content.'}
    ]
    
    client = OpenAI(api_key=os.environ.get('GROK_API_KEY'), base_url='https://api.x.ai/v1')
    response = client.chat.completions.create(
        model='grok-2-latest',
        temperature=0.2,
        messages=messages
    ).choices[0].message.content

    return response
