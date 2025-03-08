from openai import OpenAI
import os
import json
import re

def generate_course(prompt):
    """Generate a course structure based on user input and chat history."""
        
    instructions = """You are an expert curriculum designer at Sensei.AI. Your task is to create a personalized learning course based on the student's requirements and interests.

Follow these guidelines:
1. Design a comprehensive course structure with:
   - A clear, concise title
   - A brief description (1-2 sentences)
   - A detailed course summary
   - 5-10 units, depending on topic complexity
2. Each unit should have:
   - A descriptive title that clearly indicates the content
   - A clear learning objective that states what the learner will accomplish
   - A brief description of what will be covered, including any practical exercises

3. Personalization considerations:
   - Adapt to the learner's stated experience level (beginner, intermediate, advanced)
   - Incorporate any specific projects or applications mentioned by the learner
   - Include any specific technologies, frameworks, or methodologies requested
   - Balance theory and practice according to the learner's preferences

Return the response in the following JSON format:
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
    
    client = OpenAI(api_key=os.environ.get('GROK_API_KEY'), base_url='https://api.x.ai/v1')
    response = client.chat.completions.create(
        model='grok-2-latest',
        temperature=0.2,
        messages=[
            {'role': 'system', 'content': instructions},
            {'role': 'user', 'content': prompt}
        ]
    ).choices[0].message.content
    
    try:
        # Parse the JSON response
        course_data = json.loads(response)
                
        # Ensure all required fields are present
        required_fields = ['title', 'description', 'units']
        for field in required_fields:
            if field not in course_data:
                raise Exception(f"Missing required field: {field}")
        
        # Ensure summary field exists
        if 'summary' not in course_data:
            course_data['summary'] = ''
        
        # Ensure each unit has the required fields
        for i, unit in enumerate(course_data['units']):
            if 'title' not in unit:
                unit['title'] = f"Unit {i+1}"
            if 'description' not in unit:
                unit['description'] = "Content for this unit will be generated later."
            if 'order' not in unit:
                unit['order'] = i+1
        
        return course_data

    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        print(f"Response: {response}")
        # Try to extract JSON from the response if it's embedded in text
        try:
            json_match = re.search(r'```json\s*(.*?)\s*```', response, re.DOTALL)
            if json_match:
                extracted_json = json_match.group(1)
                course_data = json.loads(extracted_json)
                
                # Ensure all required fields are present
                required_fields = ['title', 'description', 'units']
                for field in required_fields:
                    if field not in course_data:
                        raise Exception(f"Missing required field: {field}")
                
                # Ensure summary field exists
                if 'summary' not in course_data:
                    course_data['summary'] = ''
                
                # Ensure each unit has the required fields
                for i, unit in enumerate(course_data['units']):
                    if 'title' not in unit:
                        unit['title'] = f"Unit {i+1}"
                    if 'description' not in unit:
                        unit['description'] = "Content for this unit will be generated later."
                    if 'order' not in unit:
                        unit['order'] = i+1
                
                return course_data
        except:
            pass
        
        raise Exception(f"Failed to parse course data. The AI response was not in the expected JSON format. Error: {str(e)}")
    except Exception as e:
        print(f"Error processing course data: {e}")
        print(f"Response: {response}")
        raise Exception(f"Error processing course data: {str(e)}")

def handle_conversation(user_content, chat_history):
    """Handle the conversation with the user and determine if it's time to generate a course."""
    
    instructions = """You are Sensei.AI, an intelligent course design assistant. Your goal is to have a conversation with the user to understand their learning needs in detail before creating a personalized course.

Follow these conversation guidelines:

1. INITIAL ASSESSMENT: Begin by understanding the user's:
   - Current knowledge level and background
   - Learning goals and objectives
   - Preferred learning style (practical, theoretical, project-based)
   - Available time commitment
   - Any specific technologies, frameworks, or tools they want to learn

2. REFINEMENT PHASE: Ask targeted follow-up questions to clarify:
   - Specific projects or applications they want to build
   - Their motivation for learning this subject
   - How they plan to apply their knowledge
   - Any past learning experiences (what worked/didn't work)
   - Preferred pace and depth of learning

3. CONVERSATION STYLE:
   - Be conversational, friendly, and encouraging
   - Acknowledge and validate the user's responses
   - Provide brief insights or suggestions that demonstrate your expertise
   - Ask one or two focused questions at a time, not overwhelming lists
   - Adapt your questions based on previous responses
   - Keep your responses concise and focused

4. COURSE GENERATION DECISION:
   - When you believe you have enough information to create a truly personalized course, include the tag <GENERATE> followed by a comprehensive prompt
   - The prompt should summarize all the important information you've gathered in a structured way
   - Include specific details about the user's experience level, goals, preferences, and time constraints

Example generation prompt:
"Great! Based on our conversation, I have enough information to create your course. <GENERATE> Create a comprehensive Python web development course for a beginner with basic programming knowledge who wants to build a personal blog. Focus on Flask framework, include practical projects with increasing complexity, and design for someone with 5-10 hours per week to dedicate to learning. Emphasize hands-on coding over theory, and include database integration with SQLite."

IMPORTANT: Only include the <GENERATE> tag when you're confident you have enough information to create a truly personalized course that meets the user's specific needs. Otherwise, continue the conversation to gather more details."""

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
    
    # Check if the response contains the <GENERATE> tag
    should_generate = "<GENERATE>" in response
    generation_prompt = None
    
    if should_generate:
        # Extract the generation prompt
        generation_prompt = response.split("<GENERATE>")[1].strip()
        # Remove the <GENERATE> tag and everything after it from the response
        response = re.sub(r'<GENERATE>.*$', '', response).strip()
    
    return {
        "response": response,
        "should_generate": should_generate,
        "generation_prompt": generation_prompt
    }

def generate_unit_content(course_title, unit_info):
    """Generate detailed content for a course unit."""
    
    instructions = f"""You are an expert programming instructor at Sensei.AI. Your task is to create detailed, engaging content for a unit in the course '{course_title}'.

Unit Information:
Title: {unit_info['title']}
Description: {unit_info['description']}

Generate comprehensive content that includes:
1. A thorough explanation of concepts with clear, accessible language
2. Code examples with detailed explanations of how they work
3. Interactive exercises that reinforce learning
4. Best practices and common pitfalls to avoid
5. Real-world applications and examples
6. Visual explanations where appropriate (described in text)
7. A small project or challenge that applies the unit's concepts

Format the content using markdown with:
- Clear section headings (##, ###)
- Code blocks with appropriate language syntax highlighting
- Bullet points for lists
- Bold/italic for emphasis on key concepts
- Tables where appropriate for comparing options or approaches

Make the content engaging, conversational, and accessible while maintaining technical accuracy.
"""

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
