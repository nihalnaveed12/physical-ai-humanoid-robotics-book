# Quickstart Guide: Vision-Language-Action (VLA) Module

## Overview
This guide provides a quick introduction to setting up and running the Vision-Language-Action (VLA) system for the Physical AI & Humanoid Robotics book. The VLA module enables humanoid robots to understand voice commands and execute complex tasks in simulation environments.

## Prerequisites

### System Requirements
- Python 3.11 or higher
- ROS 2 Humble Hawksbill
- Gazebo (Fortress or Classic) or Unity 2022.3 LTS
- OpenAI API key (for Whisper and GPT)
- Docusaurus (for documentation site)

### Environment Setup
```bash
# Clone the repository
git clone <repository-url>
cd physical-ai-humanoid-robotics-book

# Install Python dependencies
pip install rclpy openai speechrecognition numpy matplotlib

# Set up ROS 2 environment
source /opt/ros/humble/setup.bash
source install/setup.bash
```

### Configuration
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
WHISPER_MODEL=base  # Options: tiny, base, small, medium, large
GPT_MODEL=gpt-4-turbo  # Or gpt-3.5-turbo for cost efficiency
SIMULATION_ENV=gazebo  # Options: gazebo, unity
```

## Running the VLA System

### 1. Voice Command Processing
```bash
# Start the voice command node
ros2 run vla_system voice_command_node

# The system will listen for voice commands and convert them to text
# Example: "Move to the table and pick up the red cup"
```

### 2. Cognitive Planning
```bash
# Start the planning node
ros2 run vla_system planning_node

# The system will convert natural language to action plans
# Example: "Clean the room" → [navigate to object, pick up object, place in bin]
```

### 3. Vision-Language Integration
```bash
# Start the perception integration node
ros2 run vla_system perception_integration_node

# The system will use visual context to resolve ambiguous commands
# Example: "pick up the red cup near the window" (vs. other red cups)
```

### 4. Full System Integration
```bash
# Launch the complete VLA system
ros2 launch vla_system vla_system.launch.py

# Or run individual components:
ros2 run vla_system voice_command_node &
ros2 run vla_system planning_node &
ros2 run vla_system perception_integration_node &
ros2 run vla_system action_executor_node
```

## Example Usage

### Basic Command Execution
1. Ensure all nodes are running
2. Speak a command like "Go to the kitchen"
3. Observe the robot navigating in simulation
4. Check the action plan in the console output

### Complex Task Execution
1. Issue a complex command like "Clean the room"
2. Watch as the system:
   - Decomposes the task into sub-actions
   - Uses perception to locate objects
   - Executes navigation and manipulation
   - Provides feedback on progress

### Vision-Guided Execution
1. Ensure perception system is active
2. Issue a spatially-qualified command like "Pick up the blue cube on the left"
3. The system will use visual perception to identify the correct object
4. Observe the robot performing the targeted action

## Simulation Environments

### Gazebo Simulation
```bash
# Launch Gazebo with VLA world
ros2 launch vla_gazebo vla_world.launch.py

# Then run VLA nodes
ros2 run vla_system voice_command_node
```

### Unity Simulation
```bash
# Start Unity simulation with VLA scene
# Configure Unity for ROS 2 communication
# Run VLA nodes with Unity as target
```

## Troubleshooting

### Common Issues
- **API Connection**: Verify OpenAI API key is correctly set
- **Audio Input**: Check microphone permissions and audio settings
- **ROS 2 Communication**: Ensure all nodes are on the same ROS domain
- **Simulation Sync**: Verify simulation and real-time are properly coordinated

### Debugging Commands
```bash
# Check active ROS 2 nodes
ros2 node list

# Check active ROS 2 topics
ros2 topic list

# Monitor voice commands
ros2 topic echo /voice_command text

# Monitor action plans
ros2 topic echo /action_plan json
```

## Development Workflow

### Adding New Command Types
1. Update the intent mapping in `voice_command/intent_mapping.py`
2. Add new task types to the action plan generator
3. Implement the corresponding ROS 2 action handlers

### Extending Perception Integration
1. Modify the perception interface in `vision_language/perception_integration.py`
2. Update the context resolver to handle new object types
3. Test with various environmental conditions

## Next Steps

1. Complete the full VLA tutorial in the documentation
2. Experiment with different LLM models and parameters
3. Try the capstone autonomous humanoid demo
4. Explore advanced features like multi-modal planning

## Resources

- [Full Documentation](https://physical-ai-humanoid-robotics-book.com/module4-vla)
- [API Reference](https://physical-ai-humanoid-robotics-book.com/api/vla)
- [Troubleshooting Guide](https://physical-ai-humanoid-robotics-book.com/troubleshooting)
- [Community Forum](https://physical-ai-humanoid-robotics-book.com/community)