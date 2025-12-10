---
sidebar_position: 1
---

# ROS 2 Nodes

In ROS 2, a **Node** is the fundamental unit of execution in the ROS graph. It represents a single process that performs computation and communicates with other nodes in the system.

## What is a Node?

A Node is an entity that performs computation within the ROS 2 framework. In modern ROS 2 terminology, a Node is a class that has access to the ROS 2 client library (rcl) and can perform operations such as:
- Creating publishers and subscribers
- Creating services and clients
- Creating action servers and clients
- Parameter management
- Logging

## Creating a Node

In Python, using the `rclpy` library, you create a Node by inheriting from the `rclpy.node.Node` class:

```python
import rclpy
from rclpy.node import Node

class MinimalNode(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        # Node initialization code here
        self.get_logger().info('Minimal node created')

def main(args=None):
    rclpy.init(args=args)
    minimal_node = MinimalNode()
    rclpy.spin(minimal_node)
    minimal_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Key Characteristics

1. **Isolation**: Each node runs in its own process, providing fault isolation.
2. **Communication**: Nodes communicate with each other through topics, services, and actions.
3. **Parameter Management**: Nodes can manage their own parameters and access global parameters.
4. **Logging**: Nodes have built-in logging capabilities.

## Best Practices

- Keep nodes focused on a single responsibility
- Use descriptive names for your nodes
- Properly handle node cleanup in the destructor
- Use the node's logger for debugging and status information

## Common Patterns

- **Sensor nodes**: Handle data acquisition from sensors
- **Controller nodes**: Implement control algorithms
- **Planner nodes**: Handle path planning and decision making
- **Interface nodes**: Bridge between ROS and external systems

In the next section, we'll explore how nodes communicate through topics.