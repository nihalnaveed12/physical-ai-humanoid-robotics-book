---
sidebar_position: 4
title: "Vision-Language Integration: Contextualizing Language with Perception"
---

# Vision-Language Integration: Contextualizing Language with Perception

## Overview

Vision-language integration is the cornerstone of contextual intelligence in Vision-Language-Action (VLA) systems. While cognitive planning with LLMs provides high-level reasoning capabilities, vision-language integration grounds this reasoning in the real world by connecting language to specific visual perceptions. This chapter explores how to use visual information to disambiguate language commands and enable precise robot behavior.

## The Importance of Visual Context

Language is inherently ambiguous. Consider these commands:

- "Pick up the red cup" - Which red cup among potentially many?
- "Go to the table" - Which table in a room with multiple tables?
- "Move the book to the left" - Left relative to what reference point?

Visual context resolves these ambiguities by connecting language to specific objects, locations, and spatial relationships in the environment. This connection enables robots to execute commands with precision and reliability.

## Architecture of Vision-Language Integration

Our vision-language integration system comprises several key components:

1. **Perception Pipeline**: Processing visual input to identify objects and their properties
2. **Language Grounding**: Connecting language references to visual entities
3. **Spatial Reasoning**: Understanding spatial relationships and positions
4. **Context Integration**: Combining visual and linguistic information for decision-making

### Perception Pipeline Integration

```python
#!/usr/bin/env python3
import numpy as np
import cv2
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class DetectedObject:
    """
    Information about a detected object in the environment
    """
    id: str
    name: str  # Object classification (e.g., "red cup", "blue book")
    position: Tuple[float, float, float]  # 3D position (x, y, z)
    orientation: Tuple[float, float, float, float]  # Quaternion (x, y, z, w)
    confidence: float  # Detection confidence (0.0-1.0)
    bounding_box: Tuple[int, int, int, int]  # (x, y, width, height)
    properties: Dict[str, any]  # Additional properties like color, size, etc.

@dataclass
class PerceptionContext:
    """
    Context from visual perception for language grounding
    """
    timestamp: float
    detected_objects: List[DetectedObject]
    environment_map: Dict  # Spatial map of environment
    robot_pose: Tuple[float, float, float, float, float, float]  # (x, y, z, roll, pitch, yaw)
    camera_parameters: Dict  # Camera intrinsics and extrinsics

class PerceptionProcessor:
    """
    Process visual input to extract object and spatial information
    """
    def __init__(self):
        # Initialize perception models (object detection, segmentation, pose estimation)
        self.object_detector = self._initialize_object_detector()
        self.segmentation_model = self._initialize_segmentation_model()
        self.pose_estimator = self._initialize_pose_estimator()

    def process_visual_input(self, rgb_image: np.ndarray, depth_image: Optional[np.ndarray] = None) -> PerceptionContext:
        """
        Process visual input to extract perception context

        Args:
            rgb_image: RGB image from camera
            depth_image: Optional depth image for 3D positioning

        Returns:
            PerceptionContext with detected objects and spatial information
        """
        # Detect objects in the image
        detections = self.object_detector.detect(rgb_image)

        # Extract object properties and 3D positions
        detected_objects = []
        for detection in detections:
            obj_3d_pos = None

            # If depth information is available, compute 3D position
            if depth_image is not None:
                bbox = detection['bbox']
                center_x = (bbox[0] + bbox[2]) // 2
                center_y = (bbox[1] + bbox[3]) // 2
                depth_value = depth_image[center_y, center_x]

                # Convert 2D pixel coordinates + depth to 3D world coordinates
                obj_3d_pos = self._pixel_to_world(center_x, center_y, depth_value)

            # Create DetectedObject
            detected_obj = DetectedObject(
                id=detection['id'],
                name=detection['class'],
                position=obj_3d_pos if obj_3d_pos else (0.0, 0.0, 0.0),
                orientation=(0.0, 0.0, 0.0, 1.0),  # Default identity quaternion
                confidence=detection['confidence'],
                bounding_box=detection['bbox'],
                properties=detection.get('properties', {})
            )
            detected_objects.append(detected_obj)

        # Create perception context
        context = PerceptionContext(
            timestamp=self._get_current_timestamp(),
            detected_objects=detected_objects,
            environment_map=self._build_environment_map(detected_objects),
            robot_pose=self._get_robot_pose(),
            camera_parameters=self._get_camera_parameters()
        )

        return context

    def _initialize_object_detector(self):
        """
        Initialize object detection model
        In practice, this would load a model like YOLO, Detectron2, etc.
        """
        class MockObjectDetector:
            def detect(self, image):
                # Mock implementation for documentation
                # In practice, this would call a real object detection model
                return [
                    {
                        'id': 'obj_001',
                        'class': 'red cup',
                        'bbox': (100, 150, 150, 180),
                        'confidence': 0.92,
                        'properties': {'color': 'red', 'material': 'ceramic'}
                    },
                    {
                        'id': 'obj_002',
                        'class': 'blue book',
                        'bbox': (200, 100, 280, 160),
                        'confidence': 0.87,
                        'properties': {'color': 'blue', 'type': 'book', 'thickness': 'thin'}
                    },
                    {
                        'id': 'obj_003',
                        'class': 'wooden table',
                        'bbox': (50, 300, 400, 450),
                        'confidence': 0.95,
                        'properties': {'color': 'brown', 'material': 'wood', 'shape': 'rectangular'}
                    }
                ]
        return MockObjectDetector()

    def _initialize_segmentation_model(self):
        """
        Initialize semantic/instance segmentation model
        """
        class MockSegmentationModel:
            def segment(self, image):
                # Mock segmentation implementation
                return np.zeros_like(image[:, :, 0])  # Placeholder
        return MockSegmentationModel()

    def _initialize_pose_estimator(self):
        """
        Initialize 6D pose estimation model
        """
        class MockPoseEstimator:
            def estimate_pose(self, image, object_mask):
                # Mock pose estimation
                return (0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0)  # (x, y, z, qx, qy, qz, qw)
        return MockPoseEstimator()

    def _pixel_to_world(self, x: int, y: int, depth: float) -> Tuple[float, float, float]:
        """
        Convert pixel coordinates + depth to world coordinates
        """
        # This would use camera intrinsics to convert to 3D
        # Mock implementation
        return (float(x) / 100.0, float(y) / 100.0, depth)

    def _build_environment_map(self, detected_objects: List[DetectedObject]) -> Dict:
        """
        Build spatial map of environment from detected objects
        """
        env_map = {
            'objects_by_class': {},
            'spatial_relationships': [],
            'reachable_areas': []  # Areas robot can navigate to
        }

        # Group objects by class
        for obj in detected_objects:
            if obj.name not in env_map['objects_by_class']:
                env_map['objects_by_class'][obj.name] = []
            env_map['objects_by_class'][obj.name].append(obj.id)

        # Calculate spatial relationships
        for i, obj1 in enumerate(detected_objects):
            for j, obj2 in enumerate(detected_objects):
                if i != j:
                    distance = np.linalg.norm(
                        np.array(obj1.position) - np.array(obj2.position)
                    )
                    # Calculate direction and spatial relationship
                    direction_vector = np.array(obj2.position) - np.array(obj1.position)
                    relationship = {
                        'from': obj1.id,
                        'to': obj2.id,
                        'distance': distance,
                        'direction': direction_vector.tolist()
                    }
                    env_map['spatial_relationships'].append(relationship)

        return env_map

    def _get_robot_pose(self) -> Tuple[float, float, float, float, float, float]:
        """
        Get current robot pose (x, y, z, roll, pitch, yaw)
        """
        # In practice, this would come from robot localization system
        return (0.0, 0.0, 0.0, 0.0, 0.0, 0.0)

    def _get_camera_parameters(self) -> Dict:
        """
        Get camera intrinsic and extrinsic parameters
        """
        return {
            'intrinsics': {
                'fx': 525.0,  # Focal length x
                'fy': 525.0,  # Focal length y
                'cx': 319.5,  # Principal point x
                'cy': 239.5   # Principal point y
            },
            'extrinsics': {
                'position': [0.0, 0.0, 1.0],  # Camera position relative to robot base
                'orientation': [0.0, 0.0, 0.0, 1.0]  # Quaternion
            }
        }

    def _get_current_timestamp(self) -> float:
        """
        Get current timestamp
        """
        import time
        return time.time()

# Example usage
def example_perception_processing():
    """
    Example of perception processing
    """
    processor = PerceptionProcessor()

    # In a real implementation, you would get these from robot cameras
    # For this example, we'll use mock images
    mock_rgb_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    mock_depth_image = np.random.uniform(0.5, 3.0, (480, 640)).astype(np.float32)

    context = processor.process_visual_input(mock_rgb_image, mock_depth_image)

    print(f"Detected {len(context.detected_objects)} objects:")
    for obj in context.detected_objects:
        print(f"  - {obj.name} at {obj.position} (conf: {obj.confidence:.2f})")

    print(f"\nEnvironment map contains {len(context.environment_map['spatial_relationships'])} spatial relationships")
    print(f"Object classes detected: {list(context.environment_map['objects_by_class'].keys())}")
```

## Language Grounding and Object Disambiguation

The core challenge in vision-language integration is grounding language references to specific visual entities. This requires sophisticated reasoning about spatial relationships, appearance properties, and contextual information.

### Language Grounding System

```python
#!/usr/bin/env python3
import re
from typing import Dict, List, Tuple, Optional
from scipy.spatial.distance import cdist
import numpy as np

class LanguageGrounding:
    """
    Ground language references to visual entities
    """
    def __init__(self):
        self.spatial_keywords = {
            'relative_positions': ['left', 'right', 'front', 'back', 'behind', 'beside', 'next to'],
            'distances': ['near', 'close', 'far', 'next', 'adjacent'],
            'directions': ['above', 'below', 'on', 'under', 'top', 'bottom']
        }

    def ground_references(self, command: str, perception_context: PerceptionContext) -> Dict[str, List[DetectedObject]]:
        """
        Ground language references in command to detected objects

        Args:
            command: Natural language command (e.g., "pick up the red cup on the left")
            perception_context: Current perception context with detected objects

        Returns:
            Dictionary mapping noun phrases to candidate objects
        """
        # Extract noun phrases from command
        noun_phrases = self._extract_noun_phrases(command)

        # For each noun phrase, find matching objects
        grounded_references = {}
        for phrase in noun_phrases:
            candidates = self._find_candidate_objects(phrase, perception_context)

            # Apply spatial and contextual filters
            filtered_candidates = self._apply_spatial_filters(
                phrase, candidates, command, perception_context
            )

            grounded_references[phrase] = filtered_candidates

        return grounded_references

    def _extract_noun_phrases(self, command: str) -> List[str]:
        """
        Extract noun phrases that likely refer to objects
        In practice, you'd use NLP libraries like spaCy or NLTK
        """
        # Simple pattern-based extraction for demonstration
        # In practice, use proper NLP parsing
        patterns = [
            r'\b(a|an|the)\s+(\w+\s+)*\w+\b',  # "the red cup", "a book", etc.
            r'\b(\w+)\s+(\w+)\b'  # "red cup", "blue book" (without determiners)
        ]

        noun_phrases = []
        command_lower = command.lower()

        for pattern in patterns:
            matches = re.findall(pattern, command_lower)
            for match in matches:
                if isinstance(match, tuple):
                    phrase = ' '.join([word for word in match if word.strip()])
                else:
                    phrase = match
                phrase = phrase.strip()
                if phrase and phrase not in noun_phrases:
                    noun_phrases.append(phrase)

        return noun_phrases

    def _find_candidate_objects(self, noun_phrase: str, context: PerceptionContext) -> List[DetectedObject]:
        """
        Find objects that match the noun phrase description
        """
        candidates = []

        for obj in context.detected_objects:
            # Check if object name matches the noun phrase
            if self._object_matches_phrase(obj, noun_phrase):
                candidates.append(obj)

        return candidates

    def _object_matches_phrase(self, obj: DetectedObject, phrase: str) -> bool:
        """
        Check if object matches the noun phrase
        """
        phrase_lower = phrase.lower()
        obj_name_lower = obj.name.lower()

        # Direct name match
        if phrase_lower == obj_name_lower:
            return True

        # Check if phrase is contained in object name
        if phrase_lower in obj_name_lower:
            return True

        # Check properties
        for prop_value in obj.properties.values():
            if str(prop_value).lower() in phrase_lower:
                return True

        # Check if individual words in phrase match object attributes
        phrase_words = phrase_lower.split()
        for word in phrase_words:
            if word in obj_name_lower:
                return True
            if word in [str(v).lower() for v in obj.properties.values()]:
                return True

        return False

    def _apply_spatial_filters(self, phrase: str, candidates: List[DetectedObject],
                              command: str, context: PerceptionContext) -> List[DetectedObject]:
        """
        Apply spatial filters based on spatial language in command
        """
        if not candidates:
            return candidates

        command_lower = command.lower()

        # Check for spatial qualifiers in the command
        spatial_qualifiers = []
        for keyword in self.spatial_keywords['relative_positions']:
            if keyword in command_lower:
                spatial_qualifiers.append(keyword)

        for keyword in self.spatial_keywords['distances']:
            if keyword in command_lower:
                spatial_qualifiers.append(keyword)

        for keyword in self.spatial_keywords['directions']:
            if keyword in command_lower:
                spatial_qualifiers.append(keyword)

        if not spatial_qualifiers:
            return candidates

        # Apply spatial reasoning to filter candidates
        filtered_candidates = []
        for qualifier in spatial_qualifiers:
            filtered = self._apply_qualifier(qualifier, candidates, context)
            if filtered:
                # If we get specific results from spatial filtering, use them
                filtered_candidates = filtered
                break
            else:
                # If spatial filtering is inconclusive, fall back to original candidates
                filtered_candidates = candidates

        return filtered_candidates

    def _apply_qualifier(self, qualifier: str, candidates: List[DetectedObject],
                         context: PerceptionContext) -> List[DetectedObject]:
        """
        Apply a specific spatial qualifier to filter candidates
        """
        if not candidates:
            return candidates

        # Get robot position for spatial reasoning
        robot_pos = np.array(context.robot_pose[:3])  # x, y, z

        if qualifier in ['left', 'right']:
            # Determine left/right relative to robot's heading
            # For simplicity, assume robot heading is along positive x-axis
            robot_heading = np.array([1.0, 0.0, 0.0])  # In practice, get from robot pose

            filtered = []
            for obj in candidates:
                obj_vec = np.array(obj.position) - robot_pos
                # Cross product to determine left/right
                cross_product = np.cross(robot_heading[:2], obj_vec[:2])  # 2D cross product
                if (qualifier == 'left' and cross_product > 0) or \
                   (qualifier == 'right' and cross_product < 0):
                    filtered.append(obj)
            return filtered

        elif qualifier in ['front', 'back']:
            # Determine front/back relative to robot's heading
            robot_heading = np.array([1.0, 0.0, 0.0])  # Simplified

            filtered = []
            for obj in candidates:
                obj_vec = np.array(obj.position) - robot_pos
                # Dot product to determine front/back
                dot_product = np.dot(robot_heading, obj_vec)
                if (qualifier == 'front' and dot_product > 0) or \
                   (qualifier == 'back' and dot_product < 0):
                    filtered.append(obj)
            return filtered

        elif qualifier in ['near', 'close']:
            # Filter by proximity to robot
            filtered = []
            for obj in candidates:
                distance = np.linalg.norm(np.array(obj.position) - robot_pos)
                # Threshold for "near" (adjust based on context)
                if distance < 2.0:  # Within 2 meters
                    filtered.append(obj)
            return filtered

        elif qualifier in ['far']:
            # Filter by distance from robot
            filtered = []
            for obj in candidates:
                distance = np.linalg.norm(np.array(obj.position) - robot_pos)
                if distance > 3.0:  # Beyond 3 meters
                    filtered.append(obj)
            return filtered

        elif qualifier in ['above', 'below']:
            # Filter by vertical position relative to robot
            robot_height = robot_pos[2]
            filtered = []
            for obj in candidates:
                obj_height = obj.position[2]
                if (qualifier == 'above' and obj_height > robot_height) or \
                   (qualifier == 'below' and obj_height < robot_height):
                    filtered.append(obj)
            return filtered

        else:
            # For other qualifiers, return original candidates
            return candidates

# Example usage
def example_language_grounding():
    """
    Example of language grounding
    """
    grounding = LanguageGrounding()

    # Create mock perception context
    processor = PerceptionProcessor()
    mock_rgb_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    mock_depth_image = np.random.uniform(0.5, 3.0, (480, 640)).astype(np.float32)
    context = processor.process_visual_input(mock_rgb_image, mock_depth_image)

    test_commands = [
        "Pick up the red cup",
        "Move to the table on the left",
        "Find the blue book near the robot"
    ]

    for command in test_commands:
        print(f"\nCommand: '{command}'")
        grounded_refs = grounding.ground_references(command, context)

        for phrase, candidates in grounded_refs.items():
            print(f"  '{phrase}' -> {len(candidates)} candidate(s)")
            for candidate in candidates:
                print(f"    - {candidate.name} at {candidate.position}")
```

## Spatial Reasoning and Relationship Processing

Beyond simple object grounding, VLA systems need sophisticated spatial reasoning to understand complex relationships and execute precise actions.

### Spatial Reasoning Engine

```python
#!/usr/bin/env python3
from typing import Dict, List, Tuple, Optional
import numpy as np
from scipy.spatial.distance import pdist, squareform

class SpatialReasoningEngine:
    """
    Perform spatial reasoning and relationship processing
    """
    def __init__(self):
        self.spatial_relationships = {
            'adjacent': self._check_adjacent,
            'between': self._check_between,
            'inside': self._check_inside,
            'supporting': self._check_supporting,
            'aligned': self._check_aligned
        }

    def analyze_scene_geometry(self, perception_context: PerceptionContext) -> Dict:
        """
        Analyze geometric relationships in the scene
        """
        objects = perception_context.detected_objects

        analysis = {
            'object_distances': self._compute_object_distances(objects),
            'spatial_groups': self._identify_spatial_groups(objects),
            'support_relations': self._identify_support_relations(objects),
            'alignment_patterns': self._identify_alignment_patterns(objects)
        }

        return analysis

    def _compute_object_distances(self, objects: List[DetectedObject]) -> np.ndarray:
        """
        Compute pairwise distances between objects
        """
        if not objects:
            return np.array([])

        positions = np.array([obj.position for obj in objects])
        distances = squareform(pdist(positions))
        return distances

    def _identify_spatial_groups(self, objects: List[DetectedObject]) -> List[List[DetectedObject]]:
        """
        Identify groups of objects that are spatially related
        """
        if len(objects) < 2:
            return [[obj] for obj in objects]

        distances = self._compute_object_distances(objects)
        groups = []

        # Simple clustering based on distance threshold
        distance_threshold = 0.5  # 50cm threshold
        visited = set()

        for i, obj in enumerate(objects):
            if i in visited:
                continue

            group = [obj]
            visited.add(i)

            # Find nearby objects
            for j, other_obj in enumerate(objects):
                if j in visited:
                    continue

                if distances[i, j] < distance_threshold:
                    group.append(other_obj)
                    visited.add(j)

            groups.append(group)

        return groups

    def _identify_support_relations(self, objects: List[DetectedObject]) -> List[Dict]:
        """
        Identify which objects are supporting others
        """
        relations = []

        for i, obj1 in enumerate(objects):
            for j, obj2 in enumerate(objects):
                if i == j:
                    continue

                # Check if obj2 is likely on top of obj1
                # Simplified check: obj2 is above obj1 and horizontally close
                height_diff = obj2.position[2] - obj1.position[2]
                horizontal_dist = np.linalg.norm(
                    np.array(obj2.position[:2]) - np.array(obj1.position[:2])
                )

                if height_diff > 0 and height_diff < 0.2 and horizontal_dist < 0.3:
                    relation = {
                        'supported': obj2.id,
                        'supporter': obj1.id,
                        'relationship': 'on_top_of',
                        'confidence': 0.8  # Simplified confidence
                    }
                    relations.append(relation)

        return relations

    def _identify_alignment_patterns(self, objects: List[DetectedObject]) -> List[Dict]:
        """
        Identify alignment patterns (e.g., objects in a row)
        """
        patterns = []

        if len(objects) < 3:
            return patterns

        # Check for linear alignment
        for i in range(len(objects)):
            for j in range(i+1, len(objects)):
                for k in range(j+1, len(objects)):
                    obj1, obj2, obj3 = objects[i], objects[j], objects[k]

                    # Check if three points are approximately collinear
                    vec1 = np.array(obj2.position[:2]) - np.array(obj1.position[:2])
                    vec2 = np.array(obj3.position[:2]) - np.array(obj2.position[:2])

                    # Normalize vectors
                    vec1_norm = vec1 / (np.linalg.norm(vec1) + 1e-8)
                    vec2_norm = vec2 / (np.linalg.norm(vec2) + 1e-8)

                    # Check if vectors are approximately parallel
                    dot_product = abs(np.dot(vec1_norm, vec2_norm))
                    if dot_product > 0.9:  # High alignment
                        pattern = {
                            'objects': [obj1.id, obj2.id, obj3.id],
                            'type': 'linear_alignment',
                            'direction': vec1_norm.tolist(),
                            'confidence': dot_product
                        }
                        patterns.append(pattern)

        return patterns

    def resolve_spatial_reference(self, reference: str, objects: List[DetectedObject],
                                  scene_analysis: Dict) -> Optional[DetectedObject]:
        """
        Resolve a spatial reference to a specific object
        """
        # Parse the spatial reference
        if 'between' in reference.lower():
            return self._resolve_between_reference(reference, objects, scene_analysis)
        elif 'closest to' in reference.lower():
            return self._resolve_closest_reference(reference, objects, scene_analysis)
        elif 'furthest from' in reference.lower():
            return self._resolve_furthest_reference(reference, objects, scene_analysis)
        else:
            # Default: return first matching object
            for obj in objects:
                if reference.lower() in obj.name.lower():
                    return obj
            return None

    def _resolve_between_reference(self, reference: str, objects: List[DetectedObject],
                                   scene_analysis: Dict) -> Optional[DetectedObject]:
        """
        Resolve "between X and Y" type references
        """
        # Extract referenced objects from the reference string
        # This is a simplified implementation
        import re
        matches = re.findall(r'between\s+(.*?)\s+and\s+(.*)', reference.lower())
        if not matches:
            return None

        obj1_desc, obj2_desc = matches[0]
        obj1_desc = obj1_desc.strip()
        obj2_desc = obj2_desc.strip()

        # Find the two referenced objects
        obj1 = self._find_object_by_description(obj1_desc, objects)
        obj2 = self._find_object_by_description(obj2_desc, objects)

        if not obj1 or not obj2:
            return None

        # Find objects that are spatially between obj1 and obj2
        obj1_pos = np.array(obj1.position)
        obj2_pos = np.array(obj2.position)
        midpoint = (obj1_pos + obj2_pos) / 2

        closest_obj = None
        min_distance = float('inf')

        for obj in objects:
            if obj.id in [obj1.id, obj2.id]:
                continue

            obj_pos = np.array(obj.position)
            # Distance from the midpoint between obj1 and obj2
            distance = np.linalg.norm(obj_pos - midpoint)

            # Also consider if the object is actually along the line between obj1 and obj2
            line_vec = obj2_pos - obj1_pos
            obj_vec = obj_pos - obj1_pos
            proj_length = np.dot(obj_vec, line_vec) / np.linalg.norm(line_vec)
            proj_ratio = proj_length / np.linalg.norm(line_vec)

            # Prefer objects that are along the line segment between obj1 and obj2
            if 0 <= proj_ratio <= 1:  # Between the two points
                adjusted_distance = distance
                if distance < min_distance:
                    min_distance = distance
                    closest_obj = obj

        return closest_obj

    def _resolve_closest_reference(self, reference: str, objects: List[DetectedObject],
                                   scene_analysis: Dict) -> Optional[DetectedObject]:
        """
        Resolve "closest to X" type references
        """
        # Extract the reference object
        import re
        matches = re.findall(r'closest to\s+(.*)', reference.lower())
        if not matches:
            return None

        ref_desc = matches[0].strip()
        ref_obj = self._find_object_by_description(ref_desc, objects)

        if not ref_obj:
            return None

        ref_pos = np.array(ref_obj.position)

        closest_obj = None
        min_distance = float('inf')

        for obj in objects:
            if obj.id == ref_obj.id:
                continue

            obj_pos = np.array(obj.position)
            distance = np.linalg.norm(obj_pos - ref_pos)

            if distance < min_distance:
                min_distance = distance
                closest_obj = obj

        return closest_obj

    def _resolve_furthest_reference(self, reference: str, objects: List[DetectedObject],
                                    scene_analysis: Dict) -> Optional[DetectedObject]:
        """
        Resolve "furthest from X" type references
        """
        # Extract the reference object
        import re
        matches = re.findall(r'furthest from\s+(.*)', reference.lower())
        if not matches:
            return None

        ref_desc = matches[0].strip()
        ref_obj = self._find_object_by_description(ref_desc, objects)

        if not ref_obj:
            return None

        ref_pos = np.array(ref_obj.position)

        furthest_obj = None
        max_distance = 0

        for obj in objects:
            if obj.id == ref_obj.id:
                continue

            obj_pos = np.array(obj.position)
            distance = np.linalg.norm(obj_pos - ref_pos)

            if distance > max_distance:
                max_distance = distance
                furthest_obj = obj

        return furthest_obj

    def _find_object_by_description(self, description: str, objects: List[DetectedObject]) -> Optional[DetectedObject]:
        """
        Find an object by description
        """
        for obj in objects:
            if description.lower() in obj.name.lower():
                return obj
            for prop_value in obj.properties.values():
                if description.lower() in str(prop_value).lower():
                    return obj
        return None

# Example usage
def example_spatial_reasoning():
    """
    Example of spatial reasoning
    """
    engine = SpatialReasoningEngine()

    # Create mock perception context
    processor = PerceptionProcessor()
    mock_rgb_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    mock_depth_image = np.random.uniform(0.5, 3.0, (480, 640)).astype(np.float32)
    context = processor.process_visual_input(mock_rgb_image, mock_depth_image)

    # Analyze scene geometry
    analysis = engine.analyze_scene_geometry(context)

    print(f"Found {len(analysis['spatial_groups'])} spatial groups")
    print(f"Identified {len(analysis['support_relations'])} support relations")
    print(f"Found {len(analysis['alignment_patterns'])} alignment patterns")

    # Example spatial resolutions
    if len(context.detected_objects) >= 2:
        obj1, obj2 = context.detected_objects[0], context.detected_objects[1]
        print(f"\nObjects: {obj1.name} at {obj1.position}, {obj2.name} at {obj2.position}")

        # Find object between these two
        between_obj = engine.resolve_spatial_reference(
            f"object between {obj1.name} and {obj2.name}",
            context.detected_objects,
            analysis
        )
        if between_obj:
            print(f"Object between them: {between_obj.name}")
```

## Integration with Action Planning

The vision-language integration system feeds into the action planning system, providing the contextual information needed to execute precise commands.

### Vision-Grounded Action Planning

```python
#!/usr/bin/env python3
from typing import Dict, List, Optional

class VisionGroundedPlanner:
    """
    Plan actions using visual context to ground language commands
    """
    def __init__(self):
        self.perception_processor = PerceptionProcessor()
        self.language_grounding = LanguageGrounding()
        self.spatial_reasoning = SpatialReasoningEngine()

    def plan_vision_guided_action(self, command: str, perception_context: PerceptionContext) -> Optional[TaskDecomposition]:
        """
        Plan an action guided by visual context

        Args:
            command: Natural language command
            perception_context: Current visual perception context

        Returns:
            TaskDecomposition with vision-grounded actions, or None if planning fails
        """
        # Ground language references to visual entities
        grounded_refs = self.language_grounding.ground_references(command, perception_context)

        if not grounded_refs:
            print(f"No visual entities matched command: '{command}'")
            return None

        # Analyze scene geometry for spatial reasoning
        scene_analysis = self.spatial_reasoning.analyze_scene_geometry(perception_context)

        # Generate task decomposition based on grounded references
        task_sequence = self._generate_vision_guided_tasks(
            command, grounded_refs, perception_context, scene_analysis
        )

        if not task_sequence:
            print(f"Could not generate tasks for command: '{command}'")
            return None

        # Create task decomposition
        decomposition = TaskDecomposition(
            original_goal=command,
            goal_interpretation=GoalInterpretation(
                goal_type="vision-guided",
                primary_objects=list({obj.name for refs in grounded_refs.values() for obj in refs}),
                target_locations=[],  # Will be determined from visual context
                success_criteria="Command executed successfully",
                constraints=[]
            ),
            task_sequence=task_sequence,
            estimated_total_time=0.0  # Will be calculated
        )

        return decomposition

    def _generate_vision_guided_tasks(self, command: str, grounded_refs: Dict[str, List[DetectedObject]],
                                      perception_context: PerceptionContext, scene_analysis: Dict) -> List[TaskStep]:
        """
        Generate vision-guided tasks based on grounded references
        """
        tasks = []

        # Determine the main action from the command
        if 'pick' in command.lower() or 'grasp' in command.lower() or 'take' in command.lower():
            # Generate pick-up tasks
            for phrase, candidates in grounded_refs.items():
                if candidates:
                    # Select the best candidate (first for now, could be more sophisticated)
                    target_obj = candidates[0]

                    # Navigation task to approach object
                    nav_task = TaskStep(
                        step_id=f"navigate_to_{target_obj.id}",
                        action_type="navigation",
                        description=f"Navigate close to {target_obj.name}",
                        parameters={
                            "target_position": target_obj.position,
                            "approach_distance": 0.5  # 50cm from object
                        },
                        dependencies=[],
                        estimated_duration=10.0
                    )
                    tasks.append(nav_task)

                    # Manipulation task to pick up object
                    pick_task = TaskStep(
                        step_id=f"pickup_{target_obj.id}",
                        action_type="manipulation",
                        description=f"Pick up {target_obj.name}",
                        parameters={
                            "target_object_id": target_obj.id,
                            "target_position": target_obj.position,
                            "grasp_type": "top_grasp"  # Could be determined from object properties
                        },
                        dependencies=[nav_task.step_id],
                        estimated_duration=8.0
                    )
                    tasks.append(pick_task)

        elif 'move' in command.lower() or 'go' in command.lower() or 'navigate' in command.lower():
            # Generate navigation tasks
            for phrase, candidates in grounded_refs.items():
                if candidates:
                    target_obj = candidates[0]

                    nav_task = TaskStep(
                        step_id=f"navigate_to_{target_obj.id}",
                        action_type="navigation",
                        description=f"Navigate to {target_obj.name} at {target_obj.position}",
                        parameters={
                            "target_position": target_obj.position,
                            "orientation": "facing_object"
                        },
                        dependencies=[],
                        estimated_duration=15.0
                    )
                    tasks.append(nav_task)

        elif 'place' in command.lower() or 'put' in command.lower() or 'set' in command.lower():
            # Generate placement tasks
            # This would involve more complex reasoning about placement surfaces
            for phrase, candidates in grounded_refs.items():
                if candidates:
                    target_obj = candidates[0]

                    if 'on' in command.lower():  # "place on the table"
                        # Find a surface object to place on
                        surface_obj = self._find_placement_surface(command, perception_context)
                        if surface_obj:
                            # First, navigate to placement location
                            nav_task = TaskStep(
                                step_id=f"navigate_to_placement_{surface_obj.id}",
                                action_type="navigation",
                                description=f"Navigate to {surface_obj.name} for placement",
                                parameters={
                                    "target_position": surface_obj.position,
                                    "approach_distance": 0.3
                                },
                                dependencies=[],
                                estimated_duration=10.0
                            )
                            tasks.append(nav_task)

                            # Then place the object
                            place_task = TaskStep(
                                step_id=f"place_on_{surface_obj.id}",
                                action_type="manipulation",
                                description=f"Place object on {surface_obj.name}",
                                parameters={
                                    "target_surface_id": surface_obj.id,
                                    "placement_position": self._calculate_placement_position(surface_obj)
                                },
                                dependencies=[nav_task.step_id],
                                estimated_duration=8.0
                            )
                            tasks.append(place_task)

        return tasks

    def _find_placement_surface(self, command: str, perception_context: PerceptionContext) -> Optional[DetectedObject]:
        """
        Find a suitable surface for placement based on command
        """
        # Look for surfaces in the command
        surface_keywords = ['table', 'shelf', 'counter', 'desk', 'floor']
        for keyword in surface_keywords:
            if keyword in command.lower():
                for obj in perception_context.detected_objects:
                    if keyword in obj.name.lower():
                        return obj

        # If no specific surface mentioned, return the first flat surface found
        for obj in perception_context.detected_objects:
            if 'table' in obj.name.lower() or 'surface' in obj.properties.get('shape', '').lower():
                return obj

        return None

    def _calculate_placement_position(self, surface_obj: DetectedObject) -> Tuple[float, float, float]:
        """
        Calculate a suitable placement position on a surface
        """
        # For now, just place slightly above the surface center
        x, y, z = surface_obj.position
        return (x, y, z + 0.1)  # 10cm above surface

# Example usage
def example_vision_guided_planning():
    """
    Example of vision-guided action planning
    """
    planner = VisionGroundedPlanner()

    # Create mock perception context
    mock_rgb_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    mock_depth_image = np.random.uniform(0.5, 3.0, (480, 640)).astype(np.float32)
    perception_context = planner.perception_processor.process_visual_input(mock_rgb_image, mock_depth_image)

    test_commands = [
        "Pick up the red cup",
        "Go to the wooden table",
        "Place the object on the table"
    ]

    for command in test_commands:
        print(f"\nCommand: '{command}'")
        decomposition = planner.plan_vision_guided_action(command, perception_context)

        if decomposition:
            print(f"Generated {len(decomposition.task_sequence)} tasks:")
            for i, task in enumerate(decomposition.task_sequence, 1):
                print(f"  {i}. {task.description}")
                print(f"     Type: {task.action_type}")
                print(f"     Params: {task.parameters}")
                if task.dependencies:
                    print(f"     Depends: {task.dependencies}")
        else:
            print("  Could not generate plan for this command")
```

## Best Practices for Vision-Language Integration

### 1. Robust Object Matching

Implement fuzzy matching to handle variations in object descriptions:

- Use semantic similarity (e.g., "cup" ≈ "mug")
- Consider color and shape descriptors
- Handle synonyms and related terms
- Maintain object tracking across frames

### 2. Spatial Consistency

Ensure spatial reasoning is consistent with the robot's coordinate system:

- Maintain consistent frame of reference
- Account for sensor positions and orientations
- Validate spatial relationships before execution
- Handle coordinate transformations properly

### 3. Uncertainty Management

Acknowledge and handle uncertainty in perception:

- Provide confidence scores for object detections
- Implement verification steps after action execution
- Design graceful fallbacks when visual context is ambiguous
- Use multiple sensors when possible to reduce uncertainty

### 4. Real-time Performance

Optimize for real-time operation:

- Use efficient spatial data structures (KD-trees, octrees)
- Implement perception-action loops with appropriate timing
- Cache spatial relationships when objects are stable
- Prioritize critical objects for detailed processing

## Summary

In this chapter, we explored how vision-language integration enables contextual intelligence in VLA systems. We covered:

1. Perception pipeline integration to extract object and spatial information
2. Language grounding to connect language references to visual entities
3. Spatial reasoning for understanding complex relationships
4. Vision-guided action planning for precise robot behavior

Vision-language integration is crucial for grounding high-level language commands in the physical world, enabling robots to execute commands with precision and contextual awareness. The combination of visual perception and language understanding allows robots to operate effectively in complex, dynamic environments. In the next chapter, we'll bring all these components together in a complete capstone demonstration.