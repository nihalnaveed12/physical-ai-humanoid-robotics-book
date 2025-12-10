---
sidebar_position: 3
---

# rclpy Best Practices

This section outlines the best practices for using rclpy effectively in humanoid robotics applications. Following these practices will ensure your code is robust, maintainable, and performs well.

## Node Design Principles

### Single Responsibility
Each node should have a single, well-defined purpose:

```python
# Good: Focused on sensor data processing
class SensorProcessor(Node):
    def __init__(self):
        super().__init__('sensor_processor')
        # Only sensor-related publishers/subscribers

# Avoid: Multiple unrelated responsibilities
class MultiPurposeNode(Node):
    def __init__(self):
        super().__init__('multi_purpose')
        # Too many different types of publishers/subscribers
```

### Descriptive Naming
Use clear, descriptive names for nodes, topics, and services:

```python
# Good: Clear and descriptive
self.cmd_vel_pub = self.create_publisher(Twist, '/robot1/cmd_vel', 10)
self.scan_sub = self.create_subscription(LaserScan, '/robot1/scan', self.scan_callback, 10)

# Avoid: Unclear naming
self.pub = self.create_publisher(Twist, '/topic1', 10)
```

## Error Handling and Robustness

### Exception Handling in Callbacks
Always handle exceptions in callbacks to prevent node crashes:

```python
def sensor_callback(self, msg):
    try:
        # Process sensor data
        processed_data = self.process_sensor_data(msg)
        self.publish_processed_data(processed_data)
    except Exception as e:
        self.get_logger().error(f'Error in sensor callback: {e}')
        # Node continues running despite the error
```

### Service Client Error Handling
Handle service unavailability gracefully:

```python
def call_service_with_retry(self, client, request, max_retries=3):
    for attempt in range(max_retries):
        if not client.wait_for_service(timeout_sec=1.0):
            self.get_logger().warn(f'Service not available, attempt {attempt + 1}/{max_retries}')
            if attempt == max_retries - 1:
                raise RuntimeError('Service not available after retries')
            continue

        try:
            future = client.call_async(request)
            rclpy.spin_until_future_complete(self, future, timeout_sec=5.0)

            if future.result() is not None:
                return future.result()
            else:
                raise RuntimeError('Service call failed')
        except Exception as e:
            self.get_logger().error(f'Service call failed: {e}')
            if attempt == max_retries - 1:
                raise
```

## Performance Considerations

### Efficient Message Handling
Minimize processing time in callbacks to avoid blocking:

```python
# Good: Store data and process elsewhere
def sensor_callback(self, msg):
    # Store message for processing
    self.latest_sensor_data = msg
    # Don't do heavy processing here

def process_data_in_timer(self):
    # Process stored data in timer callback
    if self.latest_sensor_data is not None:
        # Heavy processing here
        result = self.heavy_computation(self.latest_sensor_data)
        self.publish_result(result)

# Avoid: Heavy processing in callbacks
def sensor_callback(self, msg):
    # Heavy computation blocks other callbacks
    result = self.heavy_computation(msg)
    self.publish_result(result)
```

### Appropriate QoS Settings
Choose Quality of Service settings based on your application requirements:

```python
# For critical control commands
self.cmd_pub = self.create_publisher(Twist, 'cmd_vel',
    qos_profile=QoSProfile(
        depth=1,
        reliability=ReliabilityPolicy.RELIABLE,
        durability=DurabilityPolicy.VOLATILE
    ))

# For sensor data where some loss is acceptable
self.scan_sub = self.create_subscription(
    LaserScan, 'scan', self.scan_callback,
    qos_profile=QoSProfile(
        depth=5,
        reliability=ReliabilityPolicy.BEST_EFFORT,
        durability=DurabilityPolicy.VOLATILE
    ))
```

## Resource Management

### Proper Cleanup
Always clean up resources when the node is destroyed:

```python
def destroy_node(self):
    # Cancel timers
    if hasattr(self, 'timer') and self.timer is not None:
        self.timer.cancel()

    # Destroy publishers/subscribers
    if hasattr(self, 'publisher') and self.publisher is not None:
        self.destroy_publisher(self.publisher)

    if hasattr(self, 'subscription') and self.subscription is not None:
        self.destroy_subscription(self.subscription)

    # Call parent destroy
    super().destroy_node()
```

### Parameter Management
Use parameters for configurable values:

```python
def __init__(self):
    super().__init__('robot_controller')

    # Declare parameters with default values
    self.declare_parameter('linear_speed', 0.5)
    self.declare_parameter('angular_speed', 1.0)
    self.declare_parameter('safety_distance', 0.5)

    # Access parameters
    self.linear_speed = self.get_parameter('linear_speed').value
    self.angular_speed = self.get_parameter('angular_speed').value
    self.safety_distance = self.get_parameter('safety_distance').value
```

## Threading and Concurrency

### Avoid Threading in Nodes
ROS 2 nodes are not thread-safe by default. Use single-threaded approach:

```python
# Good: Single-threaded approach
def timer_callback(self):
    # Process data synchronously
    self.process_data()

# Avoid: Threading within nodes
def some_method(self):
    thread = threading.Thread(target=self.process_data)
    thread.start()  # This can cause issues
```

### Use Multi-threaded Executor Sparingly
When you need to handle multiple nodes concurrently:

```python
def main():
    rclpy.init()

    node1 = Node1()
    node2 = Node2()

    # Use MultiThreadedExecutor only when necessary
    executor = MultiThreadedExecutor(num_threads=2)
    executor.add_node(node1)
    executor.add_node(node2)

    try:
        executor.spin()
    except KeyboardInterrupt:
        pass
    finally:
        node1.destroy_node()
        node2.destroy_node()
        rclpy.shutdown()
```

## Testing and Debugging

### Logging Best Practices
Use appropriate log levels:

```python
# Info for normal operations
self.get_logger().info('Node initialized successfully')

# Warn for recoverable issues
if sensor_data.quality < 0.5:
    self.get_logger().warn('Sensor data quality is low')

# Error for problems that affect functionality
try:
    result = self.process_data(data)
except ProcessingError as e:
    self.get_logger().error(f'Processing failed: {e}')

# Debug for detailed information during development
self.get_logger().debug(f'Processing data: {data}')
```

### Testing Strategies
Structure nodes to be testable:

```python
class TestableController(Node):
    def __init__(self):
        super().__init__('testable_controller')
        self.cmd_pub = self.create_publisher(Twist, 'cmd_vel', 10)

    def calculate_command(self, sensor_data):
        """Separate the logic from ROS communication for easy testing"""
        cmd = Twist()
        # Calculation logic here
        return cmd

    def sensor_callback(self, msg):
        cmd = self.calculate_command(msg)
        self.cmd_pub.publish(cmd)

# This allows testing the logic without ROS
def test_calculate_command():
    controller = TestableController()
    sensor_data = create_test_data()
    cmd = controller.calculate_command(sensor_data)
    assert cmd.linear.x == expected_value
```

## Common Patterns

### State Machine Pattern
For complex robot behaviors:

```python
from enum import Enum

class RobotState(Enum):
    IDLE = 1
    MOVING = 2
    AVOIDING = 3
    ERROR = 4

class StateMachineController(Node):
    def __init__(self):
        super().__init__('state_machine_controller')
        self.current_state = RobotState.IDLE
        self.timer = self.create_timer(0.1, self.state_machine)

    def state_machine(self):
        if self.current_state == RobotState.IDLE:
            self.handle_idle_state()
        elif self.current_state == RobotState.MOVING:
            self.handle_moving_state()
        # ... other states
```

Following these best practices will help you create robust, maintainable, and efficient Python-ROS integration for humanoid robotics applications.