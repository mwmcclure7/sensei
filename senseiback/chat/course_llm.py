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

2. REFINEMENT PHASE: Ask targeted follow-up questions to clarify:
   - Specific projects or applications they want to build
   - Preferred pace and depth of learning
   - Do not make your questions too content specific - just enough to create the course

3. CONVERSATION STYLE:
   - Be conversational, friendly, and encouraging
   - Ask one or two focused questions at a time, not overwhelming lists
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

def generate_unit_content(course_title, unit_info, course_summary=None, previous_units_content=None, future_units_info=None):
    """Generate detailed content for a course unit.
    
    Args:
        course_title: The title of the course
        unit_info: Dictionary containing unit title and description
        course_summary: Optional course summary for context
        previous_units_content: Optional list of previous units' content
        future_units_info: Optional list of future units' titles and descriptions
    """
    
    # Build context about the course and previous units
    course_context = f"Course Title: {course_title}\n"
    if course_summary:
        course_context += f"Course Summary: {course_summary}\n\n"
    
    previous_content_context = ""
    if previous_units_content and len(previous_units_content) > 0:
        previous_content_context = "Previous Units:\n"
        for i, prev_unit in enumerate(previous_units_content):
            # Include a summary of previous units to avoid information overlap
            previous_content_context += f"Unit {i+1}: {prev_unit['title']}\n"
            previous_content_context += f"Description: {prev_unit['description']}\n"
            # Include key topics covered to avoid duplication
            if 'content' in prev_unit and prev_unit['content']:
                # Extract headings from markdown to get key topics
                import re
                headings = re.findall(r'##\s+(.*)', prev_unit['content'])
                if headings:
                    previous_content_context += "Key topics covered:\n"
                    for heading in headings[:5]:  # Limit to first 5 headings to keep context manageable
                        previous_content_context += f"- {heading}\n"
            previous_content_context += "\n"
    
    future_content_context = ""
    if future_units_info and len(future_units_info) > 0:
        future_content_context = "Upcoming Units (DO NOT teach this content yet):\n"
        for i, future_unit in enumerate(future_units_info):
            future_content_context += f"Unit {unit_info.get('order', 0) + i + 1}: {future_unit['title']}\n"
            future_content_context += f"Description: {future_unit['description']}\n\n"
    
    instructions = f"""You are an expert programming instructor at Sensei.AI. Your task is to create detailed, engaging content for a unit in the course '{course_title}'.

Course Overview:
{course_context}

{previous_content_context}

Current Unit Information:
Title: {unit_info['title']}
Description: {unit_info['description']}
Order: {unit_info.get('order', 'N/A')}

{future_content_context}

Generate comprehensive content that includes:
1. A thorough explanation of concepts with clear, accessible language
2. Code examples with detailed explanations of how they work
3. Interactive exercises that reinforce learning
4. Best practices and common pitfalls to avoid
5. Real-world applications and examples
6. Visual explanations where appropriate (described in text)
7. A small project or challenge that applies the unit's concepts

Important Guidelines:
- Ensure continuity with previous units - build upon concepts already covered
- Avoid duplicating content from previous units
- Fill any knowledge gaps needed to understand this unit
- Maintain consistent terminology and coding style with previous units
- Focus specifically on this unit's topic without straying into future units' content
- DO NOT teach content that will be covered in upcoming units

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
