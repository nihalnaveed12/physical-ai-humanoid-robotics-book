---
sidebar_position: 3
title: "Cognitive Planning with LLMs: From Natural Language to Action Plans"
---

# Cognitive Planning with LLMs: From Natural Language to Action Plans

## Overview

Cognitive planning represents the intelligence layer of Vision-Language-Action (VLA) systems. While voice-to-action interfaces convert speech to simple commands, cognitive planning translates high-level goals into detailed, executable action plans. Large Language Models (LLMs) excel at this task, leveraging their reasoning capabilities to decompose complex goals into sequences of primitive actions.

## The Challenge of Task Decomposition

Consider the command "Clean the room." This seemingly simple request encompasses numerous sub-tasks:

1. Identify objects that need to be cleaned up
2. Navigate to each object's location
3. Pick up the object
4. Determine where to place each object
5. Navigate to the appropriate location
6. Place the object
7. Repeat until the room is clean

Traditional robotics would require explicit programming for each possible scenario. LLMs, however, can reason about these decompositions dynamically based on the current context.

## LLM-Based Planning Architecture

Our cognitive planning system consists of three main components:

1. **Goal Interpretation**: Understanding the high-level goal from natural language
2. **Task Decomposition**: Breaking the goal into primitive, executable actions
3. **Action Sequencing**: Ordering actions with proper dependencies and constraints

### Goal Interpretation with LLMs

The first step in cognitive planning is interpreting the user's goal. LLMs excel at understanding context and inferring implicit requirements from natural language.

```python
#!/usr/bin/env python3
import openai
import json
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class GoalInterpretation:
    """
    Result of goal interpretation
    """
    goal_type: str  # e.g., "cleaning", "retrieval", "delivery", "navigation"
    primary_objects: List[str]  # Objects central to the goal
    target_locations: List[str]  # Locations involved in the goal
    success_criteria: str  # How to know the goal is achieved
    constraints: List[str]  # Limitations or requirements

class GoalInterpreter:
    """
    Interpret high-level goals from natural language
    """
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)

    def interpret_goal(self, goal_text: str, environment_context: Dict) -> GoalInterpretation:
        """
        Interpret a high-level goal using LLM

        Args:
            goal_text: The natural language goal (e.g., "Clean the room")
            environment_context: Information about the current environment

        Returns:
            GoalInterpretation with structured goal information
        """
        # Construct a prompt that guides the LLM to interpret the goal
        prompt = f"""
        You are a cognitive planning assistant for a humanoid robot. Your task is to interpret high-level goals from natural language and extract structured information.

        Environment context:
        {json.dumps(environment_context, indent=2)}

        Goal: "{goal_text}"

        Please analyze this goal and return the following information in JSON format:
        {{
            "goal_type": "classification of the goal type (e.g., cleaning, retrieval, delivery, navigation)",
            "primary_objects": ["list of objects central to achieving this goal"],
            "target_locations": ["list of locations involved in this goal"],
            "success_criteria": "description of how to know the goal is achieved",
            "constraints": ["list of limitations or requirements for achieving this goal"]
        }}

        Be specific and practical for a robot to understand and execute.
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": "You are a cognitive planning assistant that interprets high-level goals for robots. Extract structured information from natural language goals."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,  # Low temperature for more consistent interpretations
                response_format={"type": "json_object"}
            )

            # Parse the JSON response
            interpretation_data = json.loads(response.choices[0].message.content)

            return GoalInterpretation(
                goal_type=interpretation_data["goal_type"],
                primary_objects=interpretation_data["primary_objects"],
                target_locations=interpretation_data["target_locations"],
                success_criteria=interpretation_data["success_criteria"],
                constraints=interpretation_data["constraints"]
            )

        except Exception as e:
            print(f"Error interpreting goal: {e}")
            # Return a default interpretation if LLM fails
            return GoalInterpretation(
                goal_type="unknown",
                primary_objects=[],
                target_locations=[],
                success_criteria="Goal attempted",
                constraints=[]
            )

# Example usage
def example_goal_interpretation():
    """
    Example of goal interpretation
    """
    # Mock environment context
    env_context = {
        "locations": ["living room", "kitchen", "bedroom", "dining table"],
        "objects": ["red cup", "blue book", "black pen", "white paper", "green plant"],
        "robot_capabilities": ["navigation", "manipulation", "perception"],
        "current_state": {
            "robot_position": "living room",
            "held_object": None
        }
    }

    interpreter = GoalInterpreter(api_key="mock-key-for-documentation")

    test_goals = [
        "Clean the living room",
        "Bring me a cup of water",
        "Organize the books on the table"
    ]

    for goal in test_goals:
        print(f"Goal: '{goal}'")
        interpretation = interpreter.interpret_goal(goal, env_context)
        print(f"  Type: {interpretation.goal_type}")
        print(f"  Objects: {interpretation.primary_objects}")
        print(f"  Locations: {interpretation.target_locations}")
        print(f"  Success: {interpretation.success_criteria}")
        print(f"  Constraints: {interpretation.constraints}")
        print("-" * 40)
```

## Task Decomposition with LLMs

Once we understand the goal, the next step is decomposing it into executable tasks. This is where LLMs shine, as they can leverage their world knowledge to reason about the steps needed to achieve complex goals.

### Task Decomposition System

```python
#!/usr/bin/env python3
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class TaskStep:
    """
    A single step in a task decomposition
    """
    step_id: str
    action_type: str  # e.g., "navigation", "manipulation", "perception"
    description: str  # Human-readable description
    parameters: Dict[str, Any]  # Action-specific parameters
    dependencies: List[str]  # IDs of tasks that must complete first
    estimated_duration: float  # Estimated time in seconds

@dataclass
class TaskDecomposition:
    """
    Result of task decomposition
    """
    original_goal: str
    goal_interpretation: GoalInterpretation
    task_sequence: List[TaskStep]
    estimated_total_time: float

class TaskDecomposer:
    """
    Decompose high-level goals into sequences of primitive tasks
    """
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)

    def decompose_task(self, goal_text: str, goal_interpretation: GoalInterpretation,
                      environment_context: Dict) -> TaskDecomposition:
        """
        Decompose a goal into a sequence of executable tasks
        """
        # Construct a detailed prompt for task decomposition
        prompt = f"""
        You are a cognitive planning assistant for a humanoid robot. Your task is to decompose high-level goals into sequences of primitive, executable tasks.

        Goal: "{goal_text}"

        Goal Analysis:
        - Type: {goal_interpretation.goal_type}
        - Primary Objects: {goal_interpretation.primary_objects}
        - Target Locations: {goal_interpretation.target_locations}
        - Success Criteria: {goal_interpretation.success_criteria}
        - Constraints: {goal_interpretation.constraints}

        Environment Context:
        {json.dumps(environment_context, indent=2)}

        Please decompose this goal into a sequence of primitive tasks that the robot can execute. Each task should be:
        1. A single, atomic action (navigation, manipulation, perception)
        2. Have clear parameters for execution
        3. Be ordered appropriately with dependencies

        Return the result as JSON in this format:
        {{
            "task_sequence": [
                {{
                    "step_id": "unique identifier for this step",
                    "action_type": "navigation|manipulation|perception|communication",
                    "description": "human-readable description of what to do",
                    "parameters": {{"param1": "value1", "param2": "value2"}},
                    "dependencies": ["list of step_ids that must complete first"],
                    "estimated_duration": number_of_seconds
                }}
            ],
            "estimated_total_time": total_estimated_time_for_all_tasks
        }}

        Be practical and specific. Consider the robot's capabilities and the environment context.
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": "You are a cognitive planning assistant that decomposes high-level goals into sequences of primitive tasks for robots. Each task should be a single, executable action."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )

            # Parse the response
            decomposition_data = json.loads(response.choices[0].message.content)

            # Create task steps
            task_steps = []
            for task_data in decomposition_data["task_sequence"]:
                task_step = TaskStep(
                    step_id=task_data["step_id"],
                    action_type=task_data["action_type"],
                    description=task_data["description"],
                    parameters=task_data["parameters"],
                    dependencies=task_data["dependencies"],
                    estimated_duration=task_data["estimated_duration"]
                )
                task_steps.append(task_step)

            total_time = decomposition_data["estimated_total_time"]

            return TaskDecomposition(
                original_goal=goal_text,
                goal_interpretation=goal_interpretation,
                task_sequence=task_steps,
                estimated_total_time=total_time
            )

        except Exception as e:
            print(f"Error decomposing task: {e}")
            # Return empty decomposition if LLM fails
            return TaskDecomposition(
                original_goal=goal_text,
                goal_interpretation=goal_interpretation,
                task_sequence=[],
                estimated_total_time=0.0
            )

# Example usage
def example_task_decomposition():
    """
    Example of task decomposition
    """
    # Mock environment context
    env_context = {
        "locations": ["living room", "kitchen", "bedroom", "dining table"],
        "objects": ["red cup", "blue book", "black pen", "white paper", "green plant"],
        "robot_capabilities": ["navigation", "manipulation", "perception"],
        "current_state": {
            "robot_position": "living room",
            "held_object": None
        }
    }

    interpreter = GoalInterpreter(api_key="mock-key-for-documentation")
    decomposer = TaskDecomposer(api_key="mock-key-for-documentation")

    goal_text = "Clean the living room"
    interpretation = interpreter.interpret_goal(goal_text, env_context)
    decomposition = decomposer.decompose_task(goal_text, interpretation, env_context)

    print(f"Original Goal: {decomposition.original_goal}")
    print(f"Goal Type: {decomposition.goal_interpretation.goal_type}")
    print(f"Estimated Total Time: {decomposition.estimated_total_time}s")
    print("\nTask Sequence:")

    for i, task in enumerate(decomposition.task_sequence, 1):
        print(f"  {i}. {task.description}")
        print(f"     Action: {task.action_type}")
        print(f"     Params: {task.parameters}")
        print(f"     Duration: ~{task.estimated_duration}s")
        if task.dependencies:
            print(f"     Depends on: {task.dependencies}")
        print()
```

## Action Sequencing and Dependency Management

Complex tasks often have dependencies between steps. For example, you must navigate to an object before picking it up, and you must pick up an object before placing it somewhere else. Our system needs to handle these dependencies properly.

### Dependency Resolution and Scheduling

```python
#!/usr/bin/env python3
from typing import Dict, Set
import networkx as nx
from collections import defaultdict

class TaskScheduler:
    """
    Schedule tasks respecting dependencies and optimizing execution order
    """
    def __init__(self):
        pass

    def create_execution_plan(self, task_sequence: List[TaskStep]) -> List[List[TaskStep]]:
        """
        Create an execution plan that respects dependencies.
        Returns a list of task batches that can be executed in parallel.
        """
        # Create a directed graph of task dependencies
        graph = nx.DiGraph()

        # Add nodes (tasks)
        for task in task_sequence:
            graph.add_node(task.step_id, task=task)

        # Add edges (dependencies)
        for task in task_sequence:
            for dep in task.dependencies:
                graph.add_edge(dep, task.step_id)

        # Check for cycles (would make scheduling impossible)
        if not nx.is_directed_acyclic_graph(graph):
            raise ValueError("Dependency cycle detected in task sequence")

        # Topologically sort the tasks to respect dependencies
        sorted_nodes = list(nx.topological_sort(graph))

        # Group tasks by execution level (tasks that can run in parallel)
        levels: Dict[int, List[TaskStep]] = defaultdict(list)
        node_levels: Dict[str, int] = {}

        for node in sorted_nodes:
            task = graph.nodes[node]['task']

            # Calculate the level of this task based on its dependencies
            max_dep_level = -1
            for dep in task.dependencies:
                max_dep_level = max(max_dep_level, node_levels[dep])

            level = max_dep_level + 1
            node_levels[node] = level
            levels[level].append(task)

        # Convert to list of lists ordered by level
        execution_batches = []
        for level in sorted(levels.keys()):
            execution_batches.append(levels[level])

        return execution_batches

    def calculate_critical_path(self, task_sequence: List[TaskStep]) -> List[TaskStep]:
        """
        Calculate the critical path - the sequence of tasks that determines total execution time
        """
        # Create dependency graph
        graph = nx.DiGraph()

        # Add nodes with duration as weight
        for task in task_sequence:
            graph.add_node(task.step_id, task=task, duration=task.estimated_duration)

        # Add edges for dependencies
        for task in task_sequence:
            for dep in task.dependencies:
                graph.add_edge(dep, task.step_id)

        # Calculate earliest start times
        sorted_nodes = list(nx.topological_sort(graph))
        earliest_start = {}

        for node in sorted_nodes:
            deps = list(graph.predecessors(node))
            if not deps:
                earliest_start[node] = 0
            else:
                earliest_start[node] = max(earliest_start[dep] + graph.nodes[dep]['duration'] for dep in deps)

        # Calculate latest start times
        latest_finish = {}
        sorted_nodes_reverse = list(reversed(sorted_nodes))

        for node in sorted_nodes_reverse:
            successors = list(graph.successors(node))
            if not successors:
                latest_finish[node] = earliest_start[node] + graph.nodes[node]['duration']
            else:
                latest_finish[node] = min(latest_finish[succ] - graph.nodes[node]['duration'] for succ in successors)

        # Find critical path (tasks with zero slack)
        critical_path = []
        for node in sorted_nodes:
            slack = latest_finish[node] - (earliest_start[node] + graph.nodes[node]['duration'])
            if abs(slack) < 1e-9:  # Account for floating point precision
                task = graph.nodes[node]['task']
                critical_path.append(task)

        return critical_path

# Example usage
def example_task_scheduling():
    """
    Example of task scheduling with dependencies
    """
    scheduler = TaskScheduler()

    # Create example tasks with dependencies
    tasks = [
        TaskStep("nav_to_book", "navigation", "Navigate to book location", {"destination": "dining table"}, [], 10.0),
        TaskStep("detect_book", "perception", "Detect the blue book", {"target": "blue book"}, ["nav_to_book"], 5.0),
        TaskStep("grasp_book", "manipulation", "Grasp the blue book", {"target": "blue book"}, ["detect_book"], 8.0),
        TaskStep("nav_to_shelf", "navigation", "Navigate to bookshelf", {"destination": "bookshelf"}, ["grasp_book"], 12.0),
        TaskStep("place_book", "manipulation", "Place book on shelf", {"target": "bookshelf"}, ["nav_to_shelf"], 6.0)
    ]

    # Create execution plan
    batches = scheduler.create_execution_plan(tasks)

    print("Execution Plan (batches that can run in parallel):")
    for i, batch in enumerate(batches, 1):
        print(f"  Batch {i}:")
        for task in batch:
            print(f"    - {task.description} (ID: {task.step_id})")
        print()

    # Calculate critical path
    critical_path = scheduler.calculate_critical_path(tasks)
    print("Critical Path (tasks determining total execution time):")
    for task in critical_path:
        print(f"  - {task.description}")
```

## Integration with ROS 2 and Simulation

The cognitive planning system needs to integrate with ROS 2 for execution in simulation environments. This involves converting high-level task plans into ROS 2 action calls.

### ROS 2 Integration Layer

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from rclpy.action import ActionClient
from geometry_msgs.msg import Pose
from std_msgs.msg import String
from sensor_msgs.msg import JointState
from builtin_interfaces.msg import Duration

# Example ROS 2 action clients for robot operations
class RobotActionExecutor(Node):
    """
    Execute action plans on a ROS 2 robot
    """
    def __init__(self):
        super().__init__('cognitive_planner')

        # Action clients for different robot capabilities
        self.nav_client = ActionClient(self, NavigateToPose, '/navigate_to_pose')
        self.manipulation_client = ActionClient(self, ManipulateObject, '/manipulate_object')
        self.perception_client = ActionClient(self, DetectObject, '/detect_object')

        # Publishers for monitoring and feedback
        self.status_pub = self.create_publisher(String, '/planning_status', 10)
        self.feedback_pub = self.create_publisher(String, '/planning_feedback', 10)

        self.get_logger().info('Cognitive Planner node initialized')

    def execute_task_plan(self, task_decomposition: TaskDecomposition):
        """
        Execute a decomposed task plan
        """
        self.get_logger().info(f'Executing task plan for goal: {task_decomposition.original_goal}')

        # Convert each task to appropriate ROS 2 action call
        for task in task_decomposition.task_sequence:
            self.get_logger().info(f'Executing task: {task.description}')

            # Publish status update
            status_msg = String()
            status_msg.data = f'Executing: {task.description}'
            self.status_pub.publish(status_msg)

            # Execute based on task type
            success = self._execute_single_task(task)

            if not success:
                self.get_logger().error(f'Task failed: {task.description}')
                # Handle failure - could implement recovery strategies
                break

            self.get_logger().info(f'Task completed: {task.description}')

    def _execute_single_task(self, task: TaskStep) -> bool:
        """
        Execute a single task based on its type
        """
        if task.action_type == 'navigation':
            return self._execute_navigation_task(task)
        elif task.action_type == 'manipulation':
            return self._execute_manipulation_task(task)
        elif task.action_type == 'perception':
            return self._execute_perception_task(task)
        else:
            self.get_logger().warn(f'Unknown task type: {task.action_type}')
            return False

    def _execute_navigation_task(self, task: TaskStep) -> bool:
        """
        Execute navigation task
        """
        # Wait for action server
        self.nav_client.wait_for_server()

        # Create goal message
        goal_msg = NavigateToPose.Goal()

        # Set destination from parameters
        destination = task.parameters.get('destination', 'unknown')
        # In a real implementation, we would look up the actual pose for the destination
        # For now, we'll use a placeholder
        goal_msg.pose.pose.position.x = 1.0  # Placeholder coordinates
        goal_msg.pose.pose.position.y = 1.0
        goal_msg.pose.pose.orientation.w = 1.0

        # Send goal
        future = self.nav_client.send_goal_async(goal_msg)

        # Wait for result (in a real implementation, this would be asynchronous)
        rclpy.spin_until_future_complete(self, future)

        # Check result
        goal_handle = future.result()
        if goal_handle.accepted:
            result_future = goal_handle.get_result_async()
            rclpy.spin_until_future_complete(self, result_future)
            result = result_future.result()
            return result.result.success
        else:
            return False

    def _execute_manipulation_task(self, task: TaskStep) -> bool:
        """
        Execute manipulation task
        """
        # Similar pattern to navigation but for manipulation actions
        self.manipulation_client.wait_for_server()

        goal_msg = ManipulateObject.Goal()
        goal_msg.operation = task.parameters.get('operation', 'unknown')
        goal_msg.target_object = task.parameters.get('target', 'unknown')

        future = self.manipulation_client.send_goal_async(goal_msg)
        rclpy.spin_until_future_complete(self, future)

        goal_handle = future.result()
        if goal_handle.accepted:
            result_future = goal_handle.get_result_async()
            rclpy.spin_until_future_complete(self, result_future)
            result = result_future.result()
            return result.result.success
        else:
            return False

    def _execute_perception_task(self, task: TaskStep) -> bool:
        """
        Execute perception task
        """
        # Similar pattern to other tasks
        self.perception_client.wait_for_server()

        goal_msg = DetectObject.Goal()
        goal_msg.target_object = task.parameters.get('target', 'unknown')

        future = self.perception_client.send_goal_async(goal_msg)
        rclpy.spin_until_future_complete(self, future)

        goal_handle = future.result()
        if goal_handle.accepted:
            result_future = goal_handle.get_result_async()
            rclpy.spin_until_future_complete(self, result_future)
            result = result_future.result()
            return result.result.success
        else:
            return False

# Example of how to use the cognitive planning system
def example_cognitive_planning_integration():
    """
    Example integration of cognitive planning with ROS 2
    """
    print("Setting up cognitive planning system...")

    # In a real implementation, you would:
    # 1. Initialize the ROS 2 node
    # 2. Create the LLM-based planner components
    # 3. Connect voice command input to the planning system
    # 4. Execute generated plans on the robot

    print("Cognitive planning system components:")
    print("- Goal interpreter using LLMs")
    print("- Task decomposition engine")
    print("- Dependency-aware scheduler")
    print("- ROS 2 action execution layer")
    print("- Ready to process high-level commands!")
```

## Error Handling and Plan Adaptation

Real-world execution rarely goes exactly as planned. Robots may fail to grasp objects, navigation may be blocked by unexpected obstacles, or objects may not be where expected. A robust cognitive planning system must handle these failures gracefully.

### Plan Adaptation System

```python
#!/usr/bin/env python3
from enum import Enum
from typing import Optional

class TaskOutcome(Enum):
    """
    Possible outcomes of task execution
    """
    SUCCESS = "success"
    FAILURE = "failure"
    PARTIAL_SUCCESS = "partial_success"
    TIMEOUT = "timeout"

class PlanAdapter:
    """
    Adapt plans when tasks fail or conditions change
    """
    def __init__(self):
        self.recovery_strategies = {
            'navigation_failure': self._handle_navigation_failure,
            'manipulation_failure': self._handle_manipulation_failure,
            'perception_failure': self._handle_perception_failure
        }

    def adapt_plan(self, original_plan: TaskDecomposition, failed_task: TaskStep,
                   outcome: TaskOutcome, error_context: Dict) -> Optional[TaskDecomposition]:
        """
        Adapt the plan when a task fails
        """
        if outcome == TaskOutcome.SUCCESS:
            return original_plan  # No adaptation needed

        # Determine the type of failure
        failure_type = self._classify_failure(failed_task, error_context)

        if failure_type in self.recovery_strategies:
            return self.recovery_strategies[failure_type](original_plan, failed_task, error_context)
        else:
            # No known recovery strategy
            return None

    def _classify_failure(self, task: TaskStep, error_context: Dict) -> str:
        """
        Classify the type of failure
        """
        error_msg = error_context.get('error_message', '').lower()

        if 'navigation' in error_msg or 'obstacle' in error_msg or 'blocked' in error_msg:
            return 'navigation_failure'
        elif 'grasp' in error_msg or 'manipulation' in error_msg or 'cannot' in error_msg:
            return 'manipulation_failure'
        elif 'detect' in error_msg or 'find' in error_msg or 'not found' in error_msg:
            return 'perception_failure'
        else:
            return 'unknown_failure'

    def _handle_navigation_failure(self, original_plan: TaskDecomposition,
                                   failed_task: TaskStep, error_context: Dict) -> Optional[TaskDecomposition]:
        """
        Handle navigation failure by finding alternative routes or goals
        """
        print(f"Handling navigation failure: {error_context.get('error_message', 'Unknown error')}")

        # In a real implementation, this might:
        # 1. Check for alternative routes to the same destination
        # 2. Find a nearby alternative location
        # 3. Request human assistance
        # 4. Skip to next relevant task if possible

        # For now, return the original plan to indicate no recovery possible
        return original_plan

    def _handle_manipulation_failure(self, original_plan: TaskDecomposition,
                                     failed_task: TaskStep, error_context: Dict) -> Optional[TaskDecomposition]:
        """
        Handle manipulation failure by trying alternative approaches
        """
        print(f"Handling manipulation failure: {error_context.get('error_message', 'Unknown error')}")

        # In a real implementation, this might:
        # 1. Try different grasp approaches
        # 2. Adjust object pose before trying again
        # 3. Use different manipulation technique
        # 4. Request human assistance

        return original_plan

    def _handle_perception_failure(self, original_plan: TaskDecomposition,
                                   failed_task: TaskStep, error_context: Dict) -> Optional[TaskDecomposition]:
        """
        Handle perception failure by trying alternative sensing approaches
        """
        print(f"Handling perception failure: {error_context.get('error_message', 'Unknown error')}")

        # In a real implementation, this might:
        # 1. Change viewing angle
        # 2. Use different sensors
        # 3. Move closer to object
        # 4. Ask for human confirmation

        return original_plan

# Example usage
def example_plan_adaptation():
    """
    Example of plan adaptation when tasks fail
    """
    adapter = PlanAdapter()

    # Simulate a task failure
    mock_task = TaskStep(
        "grasp_book",
        "manipulation",
        "Grasp the blue book",
        {"target": "blue book"},
        ["detect_book"],
        8.0
    )

    error_context = {
        "error_message": "Cannot grasp object - grasp failed",
        "error_code": 101
    }

    outcome = TaskOutcome.FAILURE

    # Attempt to adapt the plan
    adapted_plan = adapter.adapt_plan(None, mock_task, outcome, error_context)

    if adapted_plan:
        print("Plan adaptation successful")
    else:
        print("No recovery strategy available")
```

## Best Practices for LLM-Based Planning

### 1. Prompt Engineering for Consistency

LLM outputs can vary between calls. Use structured prompting and response formatting to ensure consistency:

- Use JSON format responses for structured data
- Provide clear examples in prompts
- Use low temperature settings for more deterministic outputs
- Validate LLM outputs before execution

### 2. Context Window Management

LLMs have limited context windows. For complex environments:

- Summarize environment state before sending to LLM
- Use hierarchical planning (high-level plan from LLM, detailed execution locally)
- Implement memory systems to track long-term state

### 3. Validation and Safety

Always validate LLM-generated plans before execution:

- Check for physically impossible actions
- Verify safety constraints are met
- Implement human-in-the-loop for critical decisions
- Log and audit planning decisions

### 4. Performance Optimization

LLM calls can be slow. Optimize for performance:

- Cache common planning patterns
- Use local models for simple tasks
- Implement asynchronous planning during robot downtime
- Pre-plan common scenarios

## Summary

In this chapter, we explored how LLMs enable cognitive planning in VLA systems. We covered:

1. Goal interpretation to understand high-level commands
2. Task decomposition to break goals into primitive actions
3. Dependency management for proper task ordering
4. Integration with ROS 2 for execution
5. Plan adaptation for handling failures

Cognitive planning transforms simple language commands into detailed action plans, enabling robots to perform complex tasks without explicit programming for each scenario. In the next chapter, we'll explore how to integrate visual perception to contextualize language commands and enable more precise robot behavior.