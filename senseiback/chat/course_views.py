from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Course, Unit, Message
from .serializers import CourseSerializer, UnitSerializer
from .course_llm import generate_course, generate_unit_content, handle_conversation
import logging
import json

logger = logging.getLogger(__name__)

class CourseListCreate(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Course.objects.filter(author=self.request.user, is_active=True).prefetch_related('units')

    def post(self, request):
        if request.data.get('action') == 'generate':
            if 'user_content' not in request.data:
                return Response(
                    {'error': 'user_content is required'},
                    status=400
                )

            chat_history = []
            if 'messages' in request.data:
                chat_history = request.data['messages']

            try:
                logger.debug(f"Generating course with content: {request.data['user_content']}")
                logger.debug(f"Chat history: {chat_history}")
                
                course_data = generate_course(request.data['user_content'], chat_history)
                
                # Create the course
                course = Course.objects.create(
                    title=course_data['title'],
                    description=course_data['description'],
                    summary=course_data.get('summary', ''),  # Add summary field with default value
                    author=request.user
                )

                # Create the units
                for unit_data in course_data['units']:
                    Unit.objects.create(
                        course=course,
                        title=unit_data['title'],
                        description=unit_data['description'],
                        order=unit_data['order']
                    )

                serializer = self.get_serializer(course)
                return Response(serializer.data, status=201)
            except KeyError as e:
                logger.error(f"KeyError in course generation: {str(e)}")
                return Response(
                    {'error': f'Missing required field in course data: {str(e)}'},
                    status=400
                )
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error in course generation: {str(e)}")
                return Response(
                    {'error': 'Invalid JSON response from course generation'},
                    status=400
                )
            except Exception as e:
                logger.error(f"Error in course generation: {str(e)}")
                return Response(
                    {'error': str(e)},
                    status=400
                )
        elif request.data.get('action') == 'conversation':
            if 'user_content' not in request.data:
                return Response(
                    {'error': 'user_content is required'},
                    status=400
                )

            chat_history = []
            if 'messages' in request.data:
                chat_history = request.data['messages']

            try:
                logger.debug(f"Processing conversation with content: {request.data['user_content']}")
                logger.debug(f"Chat history: {chat_history}")
                
                conversation_result = handle_conversation(request.data['user_content'], chat_history)
                
                # If the AI decides it's time to generate a course
                if conversation_result['should_generate']:
                    logger.debug(f"Generating course with prompt: {conversation_result['generation_prompt']}")
                    
                    # Generate the course using the extracted prompt
                    course_data = generate_course(conversation_result['generation_prompt'])
                    
                    # Create the course
                    course = Course.objects.create(
                        title=course_data['title'],
                        description=course_data['description'],
                        summary=course_data.get('summary', ''),
                        author=request.user
                    )

                    # Create the units
                    for unit_data in course_data['units']:
                        Unit.objects.create(
                            course=course,
                            title=unit_data['title'],
                            description=unit_data['description'],
                            order=unit_data['order']
                        )

                    serializer = self.get_serializer(course)
                    return Response({
                        'response': conversation_result['response'],
                        'should_generate': True,
                        'course': serializer.data
                    }, status=201)
                else:
                    # Just return the conversation response
                    return Response({
                        'response': conversation_result['response'],
                        'should_generate': False
                    }, status=200)
                    
            except Exception as e:
                logger.error(f"Error in conversation handling: {str(e)}")
                return Response(
                    {'error': str(e)},
                    status=400
                )
        
        return super().post(request)


class CourseDetail(generics.RetrieveDestroyAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Course.objects.filter(
            author=self.request.user, 
            is_active=True
        ).prefetch_related('units')
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        response_data = serializer.data
        
        # Check if the first unit exists and needs content generation
        try:
            first_unit = Unit.objects.filter(
                course=instance,
                order=1  # Assuming the first unit has order=1
            ).first()
            
            if first_unit and not first_unit.content:
                # Start a background task to generate content for the first unit
                import threading
                
                def generate_first_unit_content():
                    try:
                        first_unit.content = generate_unit_content(
                            first_unit.course.title,
                            {
                                'title': first_unit.title,
                                'description': first_unit.description
                            }
                        )
                        first_unit.save()
                        logger.info(f"Successfully generated content for first unit {first_unit.id} in background")
                    except Exception as e:
                        logger.error(f"Error generating first unit content in background: {str(e)}")
                
                # Start the background task
                thread = threading.Thread(target=generate_first_unit_content)
                thread.daemon = True
                thread.start()
                logger.info(f"Started background task to generate content for first unit {first_unit.id}")
        except Exception as e:
            # Don't let background generation errors affect the current request
            logger.error(f"Error setting up background generation for first unit: {str(e)}")
        
        return Response(response_data)
    
    def perform_destroy(self, instance):
        # Soft delete by setting is_active to False
        instance.is_active = False
        instance.save()


class UnitList(generics.ListAPIView):
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Unit.objects.filter(course__author=self.request.user)


class UnitDetail(generics.RetrieveAPIView):
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Unit.objects.filter(course__author=self.request.user)


class UnitComplete(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        unit = get_object_or_404(Unit, id=pk, course__author=request.user)
        unit.is_completed = True
        unit.save()
        return Response({'status': 'unit marked as completed'})


class UnitContent(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        unit = get_object_or_404(Unit, id=pk, course__author=request.user)
        
        if not unit.content:
            # Generate content if it doesn't exist
            unit.content = generate_unit_content(
                unit.course.title,
                {
                    'title': unit.title,
                    'description': unit.description
                }
            )
            unit.save()

        # Preload the next unit's content in the background
        try:
            next_unit = Unit.objects.filter(
                course=unit.course,
                order__gt=unit.order
            ).order_by('order').first()
            
            if next_unit and not next_unit.content:
                # Start a background task to generate content for the next unit
                import threading
                
                def generate_next_unit_content():
                    try:
                        next_unit.content = generate_unit_content(
                            next_unit.course.title,
                            {
                                'title': next_unit.title,
                                'description': next_unit.description
                            }
                        )
                        next_unit.save()
                        logger.info(f"Successfully preloaded content for unit {next_unit.id}")
                    except Exception as e:
                        logger.error(f"Error preloading next unit content: {str(e)}")
                
                # Start the background task
                thread = threading.Thread(target=generate_next_unit_content)
                thread.daemon = True
                thread.start()
                logger.info(f"Started background task to preload content for unit {next_unit.id}")
        except Exception as e:
            # Don't let preloading errors affect the current request
            logger.error(f"Error setting up preloading for next unit: {str(e)}")

        return Response({'content': unit.content})
