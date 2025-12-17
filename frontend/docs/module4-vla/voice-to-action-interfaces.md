---
sidebar_position: 2
title: "Voice-to-Action Interfaces: From Speech to Robot Commands"
---

# Voice-to-Action Interfaces: From Speech to Robot Commands

## Overview

Voice-to-action interfaces transform spoken language into executable robot commands, forming the foundation of natural human-robot interaction. This chapter explores how to capture, process, and interpret voice commands for robotic systems using state-of-the-art speech recognition technology.

## The Voice Command Pipeline

The voice-to-action pipeline consists of several stages that transform human speech into robot actions:

1. **Audio Capture**: Recording voice commands from the user
2. **Speech-to-Text Conversion**: Converting audio to textual representation
3. **Intent Recognition**: Understanding the underlying purpose of the command
4. **Action Mapping**: Converting interpreted intent to executable robot commands

Let's examine each stage in detail.

## Audio Capture and Preprocessing

The first step in any voice-to-action system is capturing high-quality audio input. While this might seem straightforward, several challenges arise in real-world scenarios:

- Background noise can interfere with speech recognition
- Microphone quality affects audio clarity
- Distance between speaker and microphone impacts signal strength
- Acoustic properties of the environment (echo, reverberation)

### Audio Preprocessing Techniques

Before sending audio to the speech recognition system, we typically apply preprocessing to improve quality:

```python
#!/usr/bin/env python3
import numpy as np
import sounddevice as sd
from scipy import signal
import librosa

class AudioPreprocessor:
    """
    Preprocess audio input for improved speech recognition
    """
    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate
        self.noise_floor = 0.01  # Minimum amplitude threshold

    def denoise_audio(self, audio_data):
        """
        Apply spectral subtraction to reduce background noise
        """
        # Convert to frequency domain
        stft = librosa.stft(audio_data)
        magnitude = np.abs(stft)
        phase = np.angle(stft)

        # Estimate noise floor in low-amplitude regions
        noise_mask = magnitude < self.noise_floor
        noise_profile = np.mean(magnitude[noise_mask]) if np.any(noise_mask) else 0

        # Subtract noise profile from magnitude
        magnitude_denoised = np.maximum(magnitude - noise_profile, 0)

        # Convert back to time domain
        stft_denoised = magnitude_denoised * np.exp(1j * phase)
        audio_denoised = librosa.istft(stft_denoised)

        return audio_denoised

    def normalize_audio(self, audio_data):
        """
        Normalize audio amplitude to optimal range for speech recognition
        """
        # Calculate RMS (Root Mean Square) amplitude
        rms = np.sqrt(np.mean(audio_data**2))

        # Target RMS for optimal speech recognition
        target_rms = 0.1

        if rms > 0:
            gain = target_rms / rms
            # Prevent clipping
            gain = min(gain, 0.9 / np.max(np.abs(audio_data)))
            return audio_data * gain
        else:
            return audio_data

    def preprocess(self, audio_data):
        """
        Complete preprocessing pipeline
        """
        # Denoise
        audio_processed = self.denoise_audio(audio_data)
        # Normalize
        audio_processed = self.normalize_audio(audio_processed)
        return audio_processed
```

## Speech-to-Text with OpenAI Whisper

OpenAI Whisper is currently the state-of-the-art in speech recognition, offering exceptional accuracy across multiple languages and accents. For our VLA system, we'll use Whisper to convert spoken commands into text.

### Whisper API Integration

```python
#!/usr/bin/env python3
import openai
import os
from pathlib import Path
import tempfile
import numpy as np
import soundfile as sf
from typing import Dict, Tuple, Optional

class WhisperSTT:
    """
    Speech-to-text using OpenAI Whisper API
    """
    def __init__(self, api_key: str = None):
        # Use API key from environment if not provided
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key must be provided or set as OPENAI_API_KEY environment variable")

        openai.api_key = self.api_key

    def transcribe_audio(self, audio_data: np.ndarray, sample_rate: int = 16000) -> Tuple[str, float]:
        """
        Transcribe audio data to text using Whisper

        Args:
            audio_data: Audio samples as numpy array
            sample_rate: Sample rate of the audio (default 16000Hz)

        Returns:
            Tuple of (transcribed_text, confidence_score)
        """
        # Save audio to temporary file in WAV format
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            # Ensure audio is in correct format
            audio_float32 = audio_data.astype(np.float32)

            # Save using soundfile
            sf.write(temp_file.name, audio_float32, sample_rate)

            try:
                # Transcribe using Whisper API
                with open(temp_file.name, 'rb') as audio_file:
                    response = openai.Audio.transcribe(
                        model="whisper-1",
                        file=audio_file,
                        response_format="verbose_json",  # Get detailed response including confidence
                        temperature=0.0  # More deterministic output
                    )

                # Extract text and confidence
                text = response.get('text', '')

                # Calculate confidence based on the segments if available
                confidence = self._calculate_confidence(response)

                return text.strip(), confidence

            finally:
                # Clean up temporary file
                Path(temp_file.name).unlink()

    def _calculate_confidence(self, response: Dict) -> float:
        """
        Calculate confidence score from Whisper response
        """
        # If the response contains detailed segment information with probabilities
        segments = response.get('segments', [])
        if segments:
            # Average the logprob values to get a confidence estimate
            avg_logprob = np.mean([seg.get('avg_logprob', -1.0) for seg in segments])
            # Convert logprob to confidence (0-1 scale)
            # Logprob of 0 is perfect confidence, negative values indicate uncertainty
            confidence = min(max(0.0, 1.0 + avg_logprob), 1.0)  # Clamp between 0 and 1
        else:
            # Fallback confidence based on other metrics if available
            confidence = response.get('confidence', 0.8)  # Default confidence

        return confidence

# Example usage
def example_voice_transcription():
    """
    Example of using Whisper for voice command transcription
    """
    # This would typically be called after audio capture and preprocessing
    print("Voice-to-Action: Setting up Whisper STT...")

    try:
        stt = WhisperSTT()
        print("Whisper STT initialized successfully")

        # In a real implementation, you would capture audio here
        # For example: audio_data = capture_audio_from_microphone()

        # Then preprocess and transcribe
        # text, confidence = stt.transcribe_audio(audio_data)
        # print(f"Transcribed: '{text}' (Confidence: {confidence:.2f})")

    except Exception as e:
        print(f"Error initializing Whisper STT: {e}")
        print("Please ensure OPENAI_API_KEY is set in your environment")
```

## Intent Recognition and Command Parsing

Once we have the transcribed text, the next step is to understand the user's intent and extract relevant parameters. This involves natural language understanding (NLU) to identify:

- The action to perform (move, pick up, place, etc.)
- The objects involved (red cup, table, door, etc.)
- Spatial relationships (near, behind, on top of, etc.)
- Quantities and other parameters

### Intent Classification System

```python
#!/usr/bin/env python3
import re
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class IntentResult:
    """
    Result of intent recognition
    """
    intent: str  # e.g., "navigate", "manipulate", "perceive"
    entities: Dict[str, str]  # e.g., {"object": "red cup", "location": "table"}
    confidence: float  # Confidence score (0-1)
    raw_command: str  # Original command text

class IntentClassifier:
    """
    Classify voice commands into structured intents
    """
    def __init__(self):
        # Define intent patterns using regex
        self.intent_patterns = {
            'navigate': [
                r'.*\b(go to|move to|navigate to|walk to)\b.*',
                r'.*\b(reach|arrive at)\b.*',
                r'.*\b(travel to|head to|move toward)\b.*'
            ],
            'manipulate_pickup': [
                r'.*\b(pick up|take|grasp|grab|lift|collect)\b.*',
                r'.*\b(get|catch|seize|acquire)\b.*'
            ],
            'manipulate_place': [
                r'.*\b(place|put|set|drop|release)\b.*',
                r'.*\b(position|locate|deposit)\b.*'
            ],
            'perceive': [
                r'.*\b(find|locate|detect|identify|look for)\b.*',
                r'.*\b(see|spot|recognize|observe)\b.*'
            ]
        }

        # Define entity extraction patterns
        self.entity_patterns = {
            'object': [
                r'\b(the\s+)?(\w+\s+)?(cup|glass|mug|bottle|book|box|ball|toy|item|object|block|cube|sphere)\b',
                r'\b(the\s+)?(\w+\s+)?(red|blue|green|yellow|black|white|orange|purple|pink|brown)\s+(cup|glass|mug|bottle|book|box|ball|toy|item|object|block|cube|sphere)\b'
            ],
            'location': [
                r'\b(table|chair|desk|shelf|counter|cabinet|door|window|bed|sofa|kitchen|living room|bedroom|office|hallway|entrance)\b',
                r'\b(near|beside|next to|in front of|behind|on top of|under|below|above)\s+\w+\b'
            ],
            'spatial': [
                r'\b(left|right|center|middle|front|back|top|bottom|near|far|close|distant)\b'
            ]
        }

    def classify_intent(self, command: str) -> IntentResult:
        """
        Classify a command into intent and extract entities
        """
        command_lower = command.lower()

        # Find the best matching intent
        best_intent = None
        best_confidence = 0.0

        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, command_lower):
                    # Simple confidence based on pattern match
                    confidence = 0.8  # Base confidence for regex match

                    # Boost confidence if multiple patterns match
                    matches = sum(1 for p in patterns if re.search(p, command_lower))
                    confidence = min(confidence + (matches - 1) * 0.1, 1.0)

                    if confidence > best_confidence:
                        best_confidence = confidence
                        best_intent = intent

        # Extract entities
        entities = self._extract_entities(command_lower)

        # If no intent matched, return as unknown
        if best_intent is None:
            best_intent = 'unknown'
            best_confidence = 0.1

        return IntentResult(
            intent=best_intent,
            entities=entities,
            confidence=best_confidence,
            raw_command=command
        )

    def _extract_entities(self, command: str) -> Dict[str, str]:
        """
        Extract named entities from command
        """
        entities = {}

        for entity_type, patterns in self.entity_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, command)
                if matches:
                    # Take the last match as it's likely the most specific
                    if isinstance(matches[0], tuple):
                        # Handle groups in regex
                        entity = ' '.join(match for match in matches[0] if match)
                    else:
                        entity = matches[-1]  # Take last match

                    if entity.strip():
                        entities[entity_type] = entity.strip()

        return entities

# Example usage
def example_intent_classification():
    """
    Example of intent classification
    """
    classifier = IntentClassifier()

    test_commands = [
        "Go to the table",
        "Pick up the red cup",
        "Move to the kitchen",
        "Find the blue ball",
        "Place the object on the shelf"
    ]

    for command in test_commands:
        result = classifier.classify_intent(command)
        print(f"Command: '{command}'")
        print(f"  Intent: {result.intent} (Confidence: {result.confidence:.2f})")
        print(f"  Entities: {result.entities}")
        print()
```

## Mapping Intents to Robot Actions

Once we've classified the intent and extracted entities, we need to map these to specific robot actions. This involves translating high-level commands into sequences of low-level robot operations.

### Action Mapping System

```python
#!/usr/bin/env python3
from typing import Dict, List, Any, Optional
import json

class ActionMapper:
    """
    Map classified intents to executable robot actions
    """
    def __init__(self):
        # Define action templates for different intents
        self.action_templates = {
            'navigate': self._create_navigation_action,
            'manipulate_pickup': self._create_manipulation_pickup_action,
            'manipulate_place': self._create_manipulation_place_action,
            'perceive': self._create_perception_action
        }

    def map_to_actions(self, intent_result: IntentResult) -> List[Dict[str, Any]]:
        """
        Map intent result to a sequence of robot actions
        """
        if intent_result.intent in self.action_templates:
            return self.action_templates[intent_result.intent](intent_result)
        else:
            # For unknown intents, return empty action sequence
            return []

    def _create_navigation_action(self, intent_result: IntentResult) -> List[Dict[str, Any]]:
        """
        Create navigation action sequence
        """
        actions = []

        # Find destination from entities
        destination = intent_result.entities.get('location', 'default_location')

        # Add navigation action
        navigation_action = {
            'action_type': 'navigation',
            'destination': destination,
            'parameters': {
                'speed': 'medium',
                'avoid_obstacles': True
            },
            'description': f'Navigating to {destination}'
        }

        actions.append(navigation_action)
        return actions

    def _create_manipulation_pickup_action(self, intent_result: IntentResult) -> List[Dict[str, Any]]:
        """
        Create pickup manipulation action sequence
        """
        actions = []

        # Find object to pick up
        obj = intent_result.entities.get('object', 'unknown_object')

        # Sequence: navigate to object, perceive object, grasp object
        navigate_action = {
            'action_type': 'navigation',
            'destination': f'near_{obj}',
            'parameters': {
                'approach_distance': 0.5,  # 50cm from object
                'orientation': 'facing_object'
            },
            'description': f'Navigating to {obj}'
        }

        perceive_action = {
            'action_type': 'perception',
            'target': obj,
            'parameters': {
                'precision': 'high',
                'confirm_detection': True
            },
            'description': f'Detecting {obj} for pickup'
        }

        grasp_action = {
            'action_type': 'manipulation',
            'operation': 'grasp',
            'target': obj,
            'parameters': {
                'grasp_type': 'top_grasp',
                'force': 'gentle',
                'confirm_success': True
            },
            'description': f'Grasping {obj}'
        }

        actions.extend([navigate_action, perceive_action, grasp_action])
        return actions

    def _create_manipulation_place_action(self, intent_result: IntentResult) -> List[Dict[str, Any]]:
        """
        Create placement manipulation action sequence
        """
        actions = []

        # Find location to place object
        location = intent_result.entities.get('location', 'default_location')

        # Sequence: navigate to placement location, release object
        navigate_action = {
            'action_type': 'navigation',
            'destination': location,
            'parameters': {
                'approach_distance': 0.3,  # 30cm from placement surface
                'orientation': 'facing_surface'
            },
            'description': f'Navigating to {location} for placement'
        }

        release_action = {
            'action_type': 'manipulation',
            'operation': 'release',
            'parameters': {
                'position': 'on_surface',
                'confirm_success': True
            },
            'description': f'Releasing held object at {location}'
        }

        actions.extend([navigate_action, release_action])
        return actions

    def _create_perception_action(self, intent_result: IntentResult) -> List[Dict[str, Any]]:
        """
        Create perception action sequence
        """
        actions = []

        # Find object to perceive
        obj = intent_result.entities.get('object', 'any_object')

        perception_action = {
            'action_type': 'perception',
            'target': obj,
            'parameters': {
                'search_area': 'surrounding',
                'detection_precision': 'high',
                'return_details': True
            },
            'description': f'Detecting {obj} in environment'
        }

        actions.append(perception_action)
        return actions

# Example usage
def example_action_mapping():
    """
    Example of mapping intents to robot actions
    """
    classifier = IntentClassifier()
    mapper = ActionMapper()

    test_commands = [
        "Go to the table",
        "Pick up the red cup",
        "Place the object on the shelf"
    ]

    for command in test_commands:
        # Classify intent
        intent_result = classifier.classify_intent(command)

        # Map to actions
        actions = mapper.map_to_actions(intent_result)

        print(f"Command: '{command}'")
        print(f"Intent: {intent_result.intent}")
        print(f"Entities: {intent_result.entities}")
        print("Generated Actions:")
        for i, action in enumerate(actions, 1):
            print(f"  {i}. {action['description']}")
            print(f"     Type: {action['action_type']}")
            if 'operation' in action:
                print(f"     Operation: {action['operation']}")
            print(f"     Parameters: {action['parameters']}")
        print("-" * 50)
```

## Integration Example: Complete Voice-to-Action Pipeline

Now let's put everything together in a complete example:

```python
#!/usr/bin/env python3
import asyncio
from typing import Optional

class VoiceToActionPipeline:
    """
    Complete voice-to-action pipeline
    """
    def __init__(self, api_key: Optional[str] = None):
        self.stt = WhisperSTT(api_key)
        self.intent_classifier = IntentClassifier()
        self.action_mapper = ActionMapper()
        self.preprocessor = AudioPreprocessor()

    async def process_voice_command(self, audio_data, sample_rate=16000) -> List[Dict[str, Any]]:
        """
        Complete pipeline: audio -> text -> intent -> actions
        """
        # Step 1: Preprocess audio
        processed_audio = self.preprocessor.preprocess(audio_data)

        # Step 2: Transcribe to text
        text, confidence = self.stt.transcribe_audio(processed_audio, sample_rate)

        if confidence < 0.5:
            print(f"Warning: Low confidence ({confidence:.2f}) in transcription: '{text}'")

        # Step 3: Classify intent
        intent_result = self.intent_classifier.classify_intent(text)

        if intent_result.confidence < 0.3:
            print(f"Warning: Low confidence ({intent_result.confidence:.2f}) in intent classification")

        # Step 4: Map to actions
        actions = self.action_mapper.map_to_actions(intent_result)

        return actions

def example_complete_pipeline():
    """
    Example of the complete voice-to-action pipeline
    """
    print("Setting up complete voice-to-action pipeline...")

    try:
        # Initialize pipeline (requires OpenAI API key)
        pipeline = VoiceToActionPipeline()
        print("Pipeline initialized successfully")

        # In a real implementation, you would:
        # 1. Capture audio from microphone
        # 2. Process through the pipeline
        # 3. Execute resulting actions on the robot

        print("\nVoice-to-Action pipeline components ready:")
        print("- Audio preprocessing")
        print("- Speech-to-text (Whisper)")
        print("- Intent classification")
        print("- Action mapping")
        print("- Ready to process voice commands!")

    except Exception as e:
        print(f"Error setting up pipeline: {e}")
        print("Ensure OpenAI API key is configured properly")

if __name__ == "__main__":
    example_complete_pipeline()
```

## Best Practices for Voice-to-Action Systems

### 1. Error Handling and Fallbacks

Voice recognition systems are inherently noisy. Always implement robust error handling:

- Provide confidence scores for all recognitions
- Implement fallback strategies for low-confidence results
- Allow users to confirm or correct interpretations
- Design graceful degradation when voice input fails

### 2. Context Awareness

Consider the robot's current state and environment when interpreting commands:

- "Move forward" means different things depending on robot orientation
- "Pick up the cup" requires knowing where cups typically are
- Maintain a context model of the environment and robot state

### 3. Feedback Mechanisms

Provide clear feedback to users about command interpretation:

- Echo back the understood command
- Indicate when the robot is processing
- Report success or failure of actions
- Ask for clarification when uncertain

## Summary

In this chapter, we explored the foundation of VLA systems: converting voice commands to robot actions. We covered:

1. Audio preprocessing to improve recognition quality
2. Speech-to-text conversion using OpenAI Whisper
3. Intent recognition to understand command purpose
4. Action mapping to convert intentions to executable robot commands

The voice-to-action interface is crucial for natural human-robot interaction. In the next chapter, we'll explore how to use large language models to plan complex multi-step tasks from high-level language commands.