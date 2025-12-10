---
sidebar_position: 1
---

# Fundamentals Exercises

This section provides hands-on exercises to reinforce your understanding of ROS 2 fundamentals: Nodes, Topics, and Services.

## Exercise 1: Basic Node Creation

**Objective**: Create a simple ROS 2 node that prints a message periodically.

### Steps:
1. Create a new Python file called `hello_node.py`
2. Create a node that inherits from `rclpy.node.Node`
3. Add a timer that prints "Hello ROS 2!" every 2 seconds
4. Properly initialize and shutdown the node

### Solution Template:
```python
import rclpy
from rclpy.node import Node

class HelloNode(Node):
    def __init__(self):
        super().__init__('hello_node')
        # TODO: Create a timer that calls a callback every 2 seconds

    def timer_callback(self):
        # TODO: Print "Hello ROS 2!" with the node's logger

def main(args=None):
    # TODO: Initialize rclpy, create node, spin, and cleanup
    pass

if __name__ == '__main__':
    main()
```

### Expected Output:
```
[INFO] [1234567890.123456789] [hello_node]: Hello ROS 2!
[INFO] [1234567892.123456789] [hello_node]: Hello ROS 2!
[INFO] [1234567894.123456789] [hello_node]: Hello ROS 2!
```

## Exercise 2: Publisher-Subscriber Pair

**Objective**: Create a publisher that sends messages and a subscriber that receives them.

### Steps:
1. Create a publisher node that sends increasing integer values
2. Create a subscriber node that receives and logs these values
3. Use the `std_msgs.msg.Int32` message type
4. Test that messages are properly transmitted

### Publisher Solution Template:
```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Int32

class NumberPublisher(Node):
    def __init__(self):
        super().__init__('number_publisher')
        # TODO: Create publisher for 'number_topic'
        # TODO: Create timer to publish increasing numbers

    def publish_number(self):
        # TODO: Create and publish Int32 message with increasing value
        pass

def main(args=None):
    # TODO: Initialize and run publisher node
    pass
```

### Subscriber Solution Template:
```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Int32

class NumberSubscriber(Node):
    def __init__(self):
        super().__init__('number_subscriber')
        # TODO: Create subscription to 'number_topic'

    def number_callback(self, msg):
        # TODO: Log the received number
        pass

def main(args=None):
    # TODO: Initialize and run subscriber node
    pass
```

## Exercise 3: Simple Service Server and Client

**Objective**: Create a service that performs a simple calculation and a client that uses it.

### Steps:
1. Create a service server that adds two numbers
2. Create a client that sends requests to the server
3. Use the `example_interfaces.srv.AddTwoInts` service type
4. Test the request-response cycle

### Server Solution Template:
```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AddServer(Node):
    def __init__(self):
        super().__init__('add_server')
        # TODO: Create service for 'add_two_ints'

    def add_callback(self, request, response):
        # TODO: Calculate and return sum
        pass

def main(args=None):
    # TODO: Initialize and run server node
    pass
```

### Client Solution Template:
```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AddClient(Node):
    def __init__(self):
        super().__init__('add_client')
        # TODO: Create client for 'add_two_ints'
        # TODO: Wait for service to be available

    def send_request(self, a, b):
        # TODO: Send request and return future
        pass

def main(args=None):
    # TODO: Initialize client, send request, and handle response
    pass
```

## Exercise 4: Parameter Server

**Objective**: Create a node that uses parameters for configuration.

### Steps:
1. Create a node that declares parameters with default values
2. Use parameter values to control node behavior
3. Allow parameters to be changed at runtime

### Solution Template:
```python
import rclpy
from rclpy.node import Node

class ParameterNode(Node):
    def __init__(self):
        super().__init__('parameter_node')

        # TODO: Declare parameters with defaults
        # - 'publish_rate' (default: 1.0)
        # - 'message_prefix' (default: 'Hello')

        # TODO: Create timer using the parameter value
        # TODO: Update timer period when parameter changes

    def timer_callback(self):
        # TODO: Use parameter values in the callback
        pass

def main(args=None):
    # TODO: Initialize and run parameter node
    pass
```

## Exercise 5: Complex Publisher with Custom Message

**Objective**: Create a publisher that sends more complex data structures.

### Steps:
1. Create a publisher that sends robot pose information
2. Use `geometry_msgs.msg.Pose` message type
3. Send periodically changing pose values
4. Include both position and orientation

### Solution Template:
```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Pose
import math

class PosePublisher(Node):
    def __init__(self):
        super().__init__('pose_publisher')
        # TODO: Create publisher for 'robot_pose' topic
        # TODO: Create timer for publishing poses
        self.time = 0.0

    def publish_pose(self):
        # TODO: Create Pose message with changing position/rotation
        # Use sine/cosine functions for smooth movement
        pass

def main(args=None):
    # TODO: Initialize and run pose publisher
    pass
```

## Exercise 6: Quality of Service (QoS) Experiment

**Objective**: Experiment with different QoS profiles to understand their effects.

### Steps:
1. Create a publisher with specific QoS settings
2. Create a subscriber with compatible QoS settings
3. Try different combinations (reliable vs best effort, etc.)
4. Observe the differences in message delivery

### Solution Template:
```python
import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy
from std_msgs.msg import String

class QoSPublisher(Node):
    def __init__(self):
        super().__init__('qos_publisher')

        # TODO: Create QoS profile with specific settings
        # Try different reliability and durability options
        qos_profile = QoSProfile(depth=10)

        # TODO: Create publisher with the QoS profile

def main(args=None):
    # TODO: Initialize and run QoS experiment
    pass
```

## Exercise 7: Node Composition

**Objective**: Create a single process with multiple nodes working together.

### Steps:
1. Create a main class that contains multiple node instances
2. Set up communication between the nodes
3. Run all nodes in a single process using MultiThreadedExecutor

### Solution Template:
```python
import rclpy
from rclpy.node import Node
from rclpy.executors import MultiThreadedExecutor
from std_msgs.msg import String

class DataProcessor(Node):
    def __init__(self):
        super().__init__('data_processor')
        # TODO: Create subscriber and publisher
        # Process incoming data and publish result

class DataGenerator(Node):
    def __init__(self):
        super().__init__('data_generator')
        # TODO: Create publisher and timer
        # Generate and publish test data

def main(args=None):
    # TODO: Initialize rclpy and create both nodes
    # Use MultiThreadedExecutor to run both nodes
    pass
```

## Self-Assessment Questions

After completing these exercises, answer these questions:

1. What are the three main communication patterns in ROS 2?
2. How do you properly clean up resources when shutting down a node?
3. What is the difference between a topic and a service?
4. Why is it important to handle exceptions in callbacks?
5. What are Quality of Service (QoS) profiles and why are they important?
6. How do parameters make nodes more configurable?
7. What is the purpose of the `rclpy.spin()` function?
8. How can you visualize the ROS 2 graph of your nodes?

## Solutions and Further Learning

After attempting these exercises, compare your solutions with best practices and consider:

- Error handling in all callback functions
- Proper resource management and cleanup
- Appropriate logging levels
- Efficient message handling
- Appropriate QoS settings for your use case

These exercises provide hands-on experience with the fundamental concepts of ROS 2, preparing you for more complex robotics applications in the following sections.