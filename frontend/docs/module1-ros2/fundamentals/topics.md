---
sidebar_position: 2
---

# ROS 2 Topics

**Topics** in ROS 2 enable asynchronous communication between nodes through a publish-subscribe pattern. This is one of the most common ways nodes exchange data in ROS systems.

## What is a Topic?

A Topic is a named bus over which nodes exchange messages. The communication is:
- **Asynchronous**: Publishers and subscribers don't need to be active simultaneously
- **Many-to-many**: Multiple publishers can publish to the same topic, and multiple subscribers can listen to the same topic
- **Typed**: Each topic has a specific message type that determines the structure of data that can be published

## Publisher-Subscriber Pattern

The publish-subscribe pattern works as follows:
1. A node creates a **publisher** for a specific topic
2. Another node creates a **subscriber** for the same topic
3. The publisher sends messages to the topic
4. The middleware delivers messages to all subscribers of that topic

## Creating a Publisher

Here's how to create a publisher in Python using rclpy:

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {self.i}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    minimal_publisher = MinimalPublisher()
    rclpy.spin(minimal_publisher)
    minimal_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Creating a Subscriber

And here's how to create a subscriber:

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalSubscriber(Node):
    def __init__(self):
        super().__init__('minimal_subscriber')
        self.subscription = self.create_subscription(
            String,
            'topic',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)
    minimal_subscriber = MinimalSubscriber()
    rclpy.spin(minimal_subscriber)
    minimal_subscriber.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Quality of Service (QoS)

ROS 2 provides Quality of Service profiles that allow you to tune communication characteristics:

- **Reliability**: Best effort vs reliable delivery
- **Durability**: Volatile vs transient local (for late-joining subscribers)
- **History**: Keep all messages vs keep last N messages
- **Depth**: Size of the message queue

## Best Practices

- Use descriptive topic names following ROS naming conventions
- Choose appropriate QoS settings based on your application requirements
- Be mindful of message frequency to avoid network congestion
- Use standard message types when possible to improve interoperability

Topics form the backbone of most ROS systems, enabling decoupled, asynchronous communication between nodes.