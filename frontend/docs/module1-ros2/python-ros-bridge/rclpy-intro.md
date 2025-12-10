---
sidebar_position: 1
---

# Introduction to rclpy

**rclpy** is the Python client library for ROS 2, providing Python bindings for the ROS 2 ecosystem. It allows Python developers to create ROS 2 nodes, publish and subscribe to topics, provide and use services, and more.

## What is rclpy?

rclpy is the official Python library that enables Python programs to interact with ROS 2. It provides:

- **Node creation and management**: Create and manage ROS 2 nodes in Python
- **Communication primitives**: Publishers, subscribers, services, and clients
- **Parameter system**: Manage node parameters
- **Logging system**: Built-in logging capabilities
- **Timers and callbacks**: Event-driven programming patterns
- **Action support**: Long-running goal-oriented communication

## Installing rclpy

rclpy is part of the ROS 2 installation. To use it in your Python environment, you need to source your ROS 2 installation:

```bash
source /opt/ros/humble/setup.bash  # Replace 'humble' with your ROS 2 distribution
```

## Basic Node Structure

Every rclpy node follows a similar structure:

```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('node_name')
        # Initialize node components here

def main(args=None):
    rclpy.init(args=args)  # Initialize rclpy
    node = MyNode()        # Create node instance
    rclpy.spin(node)       # Keep node running
    node.destroy_node()    # Clean up
    rclpy.shutdown()       # Shutdown rclpy

if __name__ == '__main__':
    main()
```

## Key Components

### The Node Class

The `Node` class is the base class for all ROS 2 nodes in Python. It provides:

- Access to the ROS graph
- Creation of publishers, subscribers, services, etc.
- Parameter management
- Logging capabilities
- Timer creation

### Initialization and Spinning

```python
rclpy.init(args=args)  # Initialize the ROS client library
rclpy.spin(node)       # Block and run the node until shutdown
```

The `spin()` function is crucial - it keeps the node running and processes callbacks for publishers, subscribers, services, etc.

### Logging

Every node has a built-in logger:

```python
class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')
        self.get_logger().info('Node initialized')
        self.get_logger().warn('This is a warning')
        self.get_logger().error('This is an error')
```

## Common Patterns

### Parameter Handling

```python
class ParameterNode(Node):
    def __init__(self):
        super().__init__('parameter_node')

        # Declare parameters with default values
        self.declare_parameter('param_name', 'default_value')

        # Get parameter value
        param_value = self.get_parameter('param_name').value
```

### Timer Usage

```python
class TimerNode(Node):
    def __init__(self):
        super().__init__('timer_node')

        # Create a timer that calls a callback every 0.5 seconds
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.counter = 0

    def timer_callback(self):
        self.get_logger().info(f'Timer callback {self.counter}')
        self.counter += 1
```

## Best Practices

- Always call `rclpy.shutdown()` to properly clean up resources
- Use descriptive node names following ROS naming conventions
- Handle exceptions in callbacks to prevent node crashes
- Use appropriate QoS settings for your use case
- Declare parameters with meaningful default values

rclpy provides a Pythonic interface to the powerful ROS 2 ecosystem, making it accessible for Python developers to create sophisticated robotic applications.