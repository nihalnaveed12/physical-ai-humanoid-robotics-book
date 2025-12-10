---
sidebar_position: 2
---

# Python-ROS Bridge Exercises

This section provides hands-on exercises to reinforce your understanding of bridging Python agents to ROS controllers using rclpy.

## Exercise 1: Simple Robot Controller

**Objective**: Create a Python node that controls a simulated robot based on sensor input.

### Steps:
1. Create a subscriber to a laser scan topic (`/scan`)
2. Create a publisher for velocity commands (`/cmd_vel`)
3. Implement a simple obstacle avoidance algorithm
4. Test the controller in simulation

### Solution Template:
```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan
from geometry_msgs.msg import Twist

class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')

        # TODO: Create subscriber to '/scan' topic
        # TODO: Create publisher to '/cmd_vel' topic
        # TODO: Initialize any necessary variables

    def scan_callback(self, msg):
        # TODO: Process laser scan data
        # Implement logic to detect obstacles
        # Publish appropriate velocity commands
        pass

    def move_robot(self, linear_speed, angular_speed):
        # TODO: Create and publish Twist message
        pass

def main(args=None):
    # TODO: Initialize rclpy, create controller, and spin
    pass
```

### Expected Behavior:
- Robot moves forward when no obstacles are detected
- Robot turns when obstacles are detected in front
- Robot stops when obstacles are too close

## Exercise 2: Data Processing Node

**Objective**: Create a node that processes sensor data and publishes processed results.

### Steps:
1. Subscribe to a raw sensor data topic (e.g., IMU or camera)
2. Process the data (filtering, transformation, etc.)
3. Publish the processed data to a new topic
4. Add parameter configuration for processing options

### Solution Template:
```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Imu  # or other sensor message
from std_msgs.msg import Float32  # or custom processed message

class DataProcessor(Node):
    def __init__(self):
        super().__init__('data_processor')

        # TODO: Declare parameters for processing options
        # TODO: Create subscriber to raw sensor topic
        # TODO: Create publisher for processed data
        # TODO: Initialize processing variables

    def sensor_callback(self, msg):
        # TODO: Process the incoming sensor data
        # TODO: Publish the processed result
        pass

    def filter_data(self, raw_data):
        # TODO: Implement data filtering algorithm
        # (e.g., moving average, Kalman filter, etc.)
        pass

def main(args=None):
    # TODO: Initialize and run data processor node
    pass
```

## Exercise 3: Service-Based Action Manager

**Objective**: Create a service server that manages complex robot actions.

### Steps:
1. Create a custom service interface for robot actions
2. Implement a service server that executes robot actions
3. Create a client that requests actions from the server
4. Handle action completion and error states

### Custom Service Definition (save as `.srv` file):
```
# Request: action name and parameters
string action_name
float64[] parameters
---
# Response: success status and result
bool success
string message
float64[] result
```

### Server Solution Template:
```python
import rclpy
from rclpy.node import Node
# TODO: Import your custom service type
# from your_package.srv import RobotAction

class ActionServer(Node):
    def __init__(self):
        super().__init__('action_server')

        # TODO: Create service server
        # TODO: Initialize action execution variables

    def execute_action(self, request, response):
        # TODO: Implement action execution logic
        # Handle different action types
        # Execute the requested action
        # Return success/failure response
        pass

    def move_to_position(self, x, y, theta):
        # TODO: Implement position movement action
        pass

    def grip_object(self, object_id):
        # TODO: Implement object gripping action
        pass

def main(args=None):
    # TODO: Initialize and run action server
    pass
```

## Exercise 4: Parameter-Based Behavior Control

**Objective**: Create a node that changes behavior based on runtime parameters.

### Steps:
1. Create a node with multiple operational modes
2. Use parameters to switch between modes
3. Implement a parameter callback to handle changes
4. Test mode switching during runtime

### Solution Template:
```python
import rclpy
from rclpy.node import Node
from rclpy.parameter import Parameter
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan

class AdaptiveController(Node):
    def __init__(self):
        super().__init__('adaptive_controller')

        # TODO: Declare parameters for different modes
        # e.g., 'control_mode' (wander, follow, avoid)
        # e.g., 'safety_distance', 'preferred_speed'

        # TODO: Create parameter callback
        # TODO: Create publishers/subscribers as needed

        self.control_mode = 'wander'  # default mode

    def parameter_callback(self, params):
        # TODO: Handle parameter changes
        # Update control mode when parameter changes
        pass

    def execute_wander_behavior(self):
        # TODO: Implement wandering behavior
        pass

    def execute_follow_behavior(self):
        # TODO: Implement wall-following behavior
        pass

    def execute_avoid_behavior(self):
        # TODO: Implement obstacle avoidance behavior
        pass

def main(args=None):
    # TODO: Initialize and run adaptive controller
    pass
```

## Exercise 5: Multi-Node Coordination

**Objective**: Create multiple coordinated nodes that work together.

### Steps:
1. Create a sensor node that publishes sensor data
2. Create a decision node that processes sensor data and makes decisions
3. Create an actuator node that executes commands
4. Coordinate the nodes using topics and services

### Sensor Node Template:
```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32MultiArray  # or custom message

class SensorNode(Node):
    def __init__(self):
        super().__init__('sensor_node')
        # TODO: Create publisher for sensor data
        # TODO: Create timer to periodically publish sensor readings
        pass

    def publish_sensor_data(self):
        # TODO: Read sensor and publish data
        pass
```

### Decision Node Template:
```python
import rclpy
from rclpy.node import Node
# TODO: Import message types

class DecisionNode(Node):
    def __init__(self):
        super().__init__('decision_node')
        # TODO: Create subscriber to sensor data
        # TODO: Create publisher for decisions/commands
        pass

    def sensor_callback(self, msg):
        # TODO: Process sensor data and make decisions
        # TODO: Publish commands based on decisions
        pass
```

### Actuator Node Template:
```python
import rclpy
from rclpy.node import Node
# TODO: Import message types

class ActuatorNode(Node):
    def __init__(self):
        super().__init__('actuator_node')
        # TODO: Create subscriber for commands
        # TODO: Interface with actual hardware or simulation
        pass

    def command_callback(self, msg):
        # TODO: Execute commands on hardware/simulation
        pass
```

## Exercise 6: Error Handling and Recovery

**Objective**: Implement robust error handling in a ROS node.

### Steps:
1. Create a node that interfaces with external systems
2. Implement comprehensive error handling
3. Add recovery mechanisms for common failures
4. Log errors appropriately for debugging

### Solution Template:
```python
import rclpy
from rclpy.node import Node
from rclpy.time import Time
import traceback
from std_msgs.msg import String

class RobustNode(Node):
    def __init__(self):
        super().__init__('robust_node')

        # TODO: Create publishers/subscribers
        # TODO: Initialize error tracking variables
        self.error_count = 0
        self.last_error_time = None

    def safe_external_call(self):
        """Safely call external system with error handling"""
        try:
            # TODO: Call external system or API
            result = self.external_system_call()
            self.reset_error_state()
            return result
        except ConnectionError as e:
            self.handle_connection_error(e)
        except TimeoutError as e:
            self.handle_timeout_error(e)
        except Exception as e:
            self.handle_general_error(e)

        return None  # or default value

    def handle_connection_error(self, error):
        # TODO: Handle connection errors
        # Implement retry logic or fallback behavior
        pass

    def handle_timeout_error(self, error):
        # TODO: Handle timeout errors
        # Implement timeout recovery
        pass

    def handle_general_error(self, error):
        # TODO: Handle general errors
        # Log error, increment counter, try recovery
        self.error_count += 1
        self.last_error_time = self.get_clock().now()
        self.get_logger().error(f'General error occurred: {error}')
        traceback.print_exc()

    def reset_error_state(self):
        # TODO: Reset error tracking when successful
        self.error_count = 0
        self.last_error_time = None

def main(args=None):
    # TODO: Initialize and run robust node
    pass
```

## Exercise 7: Performance Optimization

**Objective**: Optimize a ROS node for performance and efficiency.

### Steps:
1. Create a node that processes high-frequency data
2. Profile the node to identify bottlenecks
3. Implement optimizations (caching, efficient algorithms, etc.)
4. Measure performance improvements

### Solution Template:
```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import PointCloud2  # high-frequency data
import time
from collections import deque

class OptimizedProcessor(Node):
    def __init__(self):
        super().__init__('optimized_processor')

        # TODO: Create high-frequency subscriber
        # TODO: Initialize performance tracking
        self.process_times = deque(maxlen=100)

        # TODO: Implement caching for expensive calculations
        self.cache = {}

    def pointcloud_callback(self, msg):
        start_time = time.time()

        # TODO: Process point cloud efficiently
        # Use numpy for vectorized operations
        # Minimize memory allocations

        end_time = time.time()
        self.process_times.append(end_time - start_time)

        # Log performance if needed
        if len(self.process_times) == 100:
            avg_time = sum(self.process_times) / len(self.process_times)
            self.get_logger().info(f'Average processing time: {avg_time:.4f}s')
            self.process_times.clear()

def main(args=None):
    # TODO: Initialize and run optimized processor
    pass
```

## Self-Assessment Questions

After completing these exercises, answer these questions:

1. How do you ensure that your Python-ROS bridge code is robust against network failures?
2. What are the best practices for parameter management in ROS nodes?
3. How do you handle different Quality of Service requirements for various types of data?
4. What strategies do you use for debugging distributed ROS systems?
5. How do you optimize node performance for real-time applications?
6. What is the role of namespaces in organizing ROS systems?
7. How do you handle large data transfers between nodes efficiently?
8. What are the considerations for deploying Python ROS nodes on embedded systems?

## Advanced Challenge: Complete Robot System

As an advanced challenge, combine multiple exercises to create a complete robot system:
- Navigation node with path planning
- Sensor fusion node combining multiple sensor inputs
- Behavior manager coordinating different robot behaviors
- UI node for remote monitoring and control

## Solutions and Further Learning

After completing these exercises, you should be comfortable with:
- Creating complex ROS nodes in Python
- Handling various types of ROS communication
- Implementing robust error handling
- Optimizing node performance
- Coordinating multiple nodes for complex behaviors

These exercises build on the fundamentals to prepare you for advanced humanoid robotics applications.