---
sidebar_position: 2
---

# Python-ROS Communication Examples

This section provides practical examples of how to bridge Python agents to ROS controllers using rclpy. These examples demonstrate common patterns for robot control and interaction.

## Simple Publisher Example

Here's a complete example of a publisher node that sends messages to a topic:

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class TalkerNode(Node):
    def __init__(self):
        super().__init__('talker')

        # Create a publisher for the 'chatter' topic
        self.publisher = self.create_publisher(String, 'chatter', 10)

        # Create a timer to publish messages every 0.5 seconds
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)

        self.i = 0
        self.get_logger().info('Talker node initialized')

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello ROS 2 World: {self.i}'

        self.publisher.publish(msg)
        self.get_logger().info(f'Published: "{msg.data}"')

        self.i += 1

def main(args=None):
    rclpy.init(args=args)

    talker = TalkerNode()

    try:
        rclpy.spin(talker)
    except KeyboardInterrupt:
        pass
    finally:
        talker.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Simple Subscriber Example

Here's a corresponding subscriber that receives messages from the publisher:

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class ListenerNode(Node):
    def __init__(self):
        super().__init__('listener')

        # Create a subscription to the 'chatter' topic
        self.subscription = self.create_subscription(
            String,
            'chatter',
            self.listener_callback,
            10)  # QoS depth
        self.subscription  # prevent unused variable warning

        self.get_logger().info('Listener node initialized')

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)

    listener = ListenerNode()

    try:
        rclpy.spin(listener)
    except KeyboardInterrupt:
        pass
    finally:
        listener.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Service Client Example

Here's an example of a service client that requests data from a service:

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AddClientNode(Node):
    def __init__(self):
        super().__init__('add_client')

        # Create a client for the 'add_two_ints' service
        self.client = self.create_client(AddTwoInts, 'add_two_ints')

        # Wait for the service to be available
        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting again...')

        self.request = AddTwoInts.Request()

    def send_request(self, a, b):
        self.request.a = a
        self.request.b = b

        # Send the request asynchronously
        self.future = self.client.call_async(self.request)
        self.get_logger().info(f'Request sent: {a} + {b}')

def main(args=None):
    rclpy.init(args=args)

    client = AddClientNode()

    # Send a request
    client.send_request(2, 3)

    try:
        # Wait for the response
        while rclpy.ok():
            rclpy.spin_once(client)
            if client.future.done():
                try:
                    response = client.future.result()
                    client.get_logger().info(f'Result: {response.sum}')
                except Exception as e:
                    client.get_logger().error(f'Service call failed: {e}')
                break
    except KeyboardInterrupt:
        pass
    finally:
        client.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Service Server Example

Here's a service server that responds to the client's requests:

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AddServerNode(Node):
    def __init__(self):
        super().__init__('add_server')

        # Create a service that responds to 'add_two_ints' requests
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_callback)

    def add_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Returning {request.a} + {request.b} = {response.sum}')
        return response

def main(args=None):
    rclpy.init(args=args)

    server = AddServerNode()

    try:
        rclpy.spin(server)
    except KeyboardInterrupt:
        pass
    finally:
        server.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Robot Control Example

Here's a more practical example of controlling a robot using a publisher:

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan

class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')

        # Publisher for robot velocity commands
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)

        # Subscriber for laser scan data
        self.scan_sub = self.create_subscription(
            LaserScan,
            '/scan',
            self.scan_callback,
            10)

        # Timer for control loop
        self.timer = self.create_timer(0.1, self.control_loop)  # 10 Hz

        self.obstacle_distance = float('inf')
        self.get_logger().info('Robot controller initialized')

    def scan_callback(self, msg):
        # Check for obstacles in front of the robot
        if len(msg.ranges) > 0:
            # Get the front-facing range (middle of the scan)
            front_idx = len(msg.ranges) // 2
            self.obstacle_distance = msg.ranges[front_idx]

    def control_loop(self):
        cmd = Twist()

        # Simple obstacle avoidance: stop if obstacle is too close
        if self.obstacle_distance < 1.0:  # 1 meter threshold
            cmd.linear.x = 0.0  # Stop moving forward
            cmd.angular.z = 0.5  # Turn right
            self.get_logger().warn('Obstacle detected! Turning right.')
        else:
            cmd.linear.x = 0.5  # Move forward
            cmd.angular.z = 0.0  # No turning
            self.get_logger().info('Moving forward')

        # Publish the command
        self.cmd_vel_pub.publish(cmd)

def main(args=None):
    rclpy.init(args=args)

    controller = RobotController()

    try:
        rclpy.spin(controller)
    except KeyboardInterrupt:
        pass
    finally:
        # Stop the robot before shutting down
        stop_cmd = Twist()
        controller.cmd_vel_pub.publish(stop_cmd)
        controller.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Best Practices in Examples

These examples demonstrate several best practices:

1. **Proper initialization and cleanup**: Always initialize rclpy and properly clean up resources
2. **Error handling**: Use try-catch blocks for robust error handling
3. **Logging**: Use the built-in logger for debugging and status information
4. **Timer-based publishing**: Use timers for consistent message publishing
5. **Asynchronous service calls**: Use async calls to prevent blocking
6. **Graceful shutdown**: Handle keyboard interrupts and clean up properly

These examples provide a foundation for building more complex Python-ROS integration applications for humanoid robotics control.