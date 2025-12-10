---
sidebar_position: 3
---

# ROS 2 Services

**Services** in ROS 2 provide synchronous request-response communication between nodes. Unlike topics which provide asynchronous communication, services establish a direct connection between a client and a server for immediate responses.

## What is a Service?

A Service is a synchronous communication pattern where:
- A **service client** sends a request to a **service server**
- The server processes the request and sends back a response
- The client waits for the response before continuing execution
- This creates a blocking, synchronous communication pattern

## Service Architecture

The service communication pattern consists of:
- **Service Server**: Provides the service functionality and responds to requests
- **Service Client**: Makes requests to the service server
- **Service Interface**: Defines the structure of requests and responses

## Creating a Service Server

Here's how to create a service server in Python using rclpy:

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class MinimalService(Node):
    def __init__(self):
        super().__init__('minimal_service')
        self.srv = self.create_service(AddTwoInts, 'add_two_ints', self.add_two_ints_callback)

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Returning {request.a} + {request.b} = {response.sum}')
        return response

def main(args=None):
    rclpy.init(args=args)
    minimal_service = MinimalService()
    rclpy.spin(minimal_service)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Creating a Service Client

And here's how to create a service client:

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class MinimalClient(Node):
    def __init__(self):
        super().__init__('minimal_client')
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting again...')
        self.req = AddTwoInts.Request()

    def send_request(self, a, b):
        self.req.a = a
        self.req.b = b
        future = self.cli.call_async(self.req)
        return future

def main(args=None):
    rclpy.init(args=args)
    minimal_client = MinimalClient()

    future = minimal_client.send_request(1, 2)
    rclpy.spin_until_future_complete(minimal_client, future)

    response = future.result()
    minimal_client.get_logger().info(f'Result: {response.sum}')

    minimal_client.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Service Interface Definition

Services use `.srv` files to define their interface. A typical service definition looks like this:

```
# Request part
int64 a
int64 b
---
# Response part
int64 sum
```

The part before `---` defines the request message, and the part after defines the response message.

## When to Use Services

Services are appropriate when:
- You need a guaranteed response to a request
- The operation has a clear start and end
- The operation is relatively fast (services are synchronous)
- You need to perform an action that returns a result

## Comparison with Topics

| Feature | Topics | Services |
|---------|--------|----------|
| Communication Type | Asynchronous | Synchronous |
| Pattern | Publish-Subscribe | Request-Response |
| Connection | Many-to-many | One-to-one |
| Blocking | No | Yes |
| Use Case | Streaming data | Requesting specific actions |

## Best Practices

- Use services for operations that have a clear request-response pattern
- Keep service calls relatively fast to avoid blocking the client
- Handle service unavailability gracefully in clients
- Use appropriate service interfaces that match your use case

Services complement topics by providing synchronous communication for operations that require immediate responses.