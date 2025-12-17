# Quickstart Guide: Module 3: Perception & Sensor Fusion

## Overview
This quickstart guide provides the essential steps to begin working with perception and sensor fusion in digital twin environments. You'll learn how to set up simulation environments, process sensor data, and implement basic fusion techniques for Physical AI applications.

## Prerequisites
Before starting with the perception and sensor fusion module, ensure you have:

- ROS 2 Humble Hawksbill installed
- Gazebo (Fortress or Garden) installed
- Unity 2022.3 LTS or newer
- Basic understanding of ROS 2 concepts (covered in Module 1)
- Completion of Module 2: Digital Twin setup (Gazebo and Unity environments)

## Environment Setup

### Gazebo Perception Setup
1. Install perception-related Gazebo packages:
```bash
sudo apt update
sudo apt install ros-humble-gazebo-ros-pkgs ros-humble-gazebo-plugins ros-humble-perception
```

2. Verify perception plugins are available:
```bash
# Check for LiDAR plugins
dpkg -l | grep gazebo-plugin

# Check for camera plugins
dpkg -l | grep camera
```

### Unity Perception Setup
1. Install Perception package in Unity:
   - Open Unity Package Manager (Window → Package Manager)
   - Install "Computer Vision" package for perception examples
   - Install "ROS# (ROS Sharp)" for ROS integration

2. Verify ROS TCP Connector is properly configured for sensor data exchange

## Basic Perception Pipeline Example

### Step 1: Create a Simple Perception Node
Create a basic perception node that processes sensor data:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan, Image, Imu
from std_msgs.msg import String

class PerceptionNode(Node):
    def __init__(self):
        super().__init__('basic_perception_node')

        # Subscriptions for sensor data
        self.lidar_subscription = self.create_subscription(
            LaserScan,
            '/lidar/scan',
            self.lidar_callback,
            10)

        self.camera_subscription = self.create_subscription(
            Image,
            '/camera/image',
            self.camera_callback,
            10)

        self.imu_subscription = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10)

        # Publisher for perception results
        self.perception_publisher = self.create_publisher(
            String,
            '/perception/results',
            10)

        self.get_logger().info('Basic Perception Node initialized')

    def lidar_callback(self, msg):
        # Process LiDAR data (simplified example)
        self.get_logger().info(f'Received LiDAR scan with {len(msg.ranges)} points')
        # In practice: perform obstacle detection, mapping, etc.

    def camera_callback(self, msg):
        # Process camera image (simplified example)
        self.get_logger().info(f'Received camera image: {msg.width}x{msg.height}')
        # In practice: perform object detection, segmentation, etc.

    def imu_callback(self, msg):
        # Process IMU data (simplified example)
        self.get_logger().info(f'Received IMU data with orientation: ({msg.orientation.x}, {msg.orientation.y}, {msg.orientation.z}, {msg.orientation.w})')
        # In practice: perform state estimation, stabilization, etc.

def main(args=None):
    rclpy.init(args=args)
    perception_node = PerceptionNode()

    try:
        rclpy.spin(perception_node)
    except KeyboardInterrupt:
        pass
    finally:
        perception_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 2: Launch Perception Pipeline
1. Make sure your simulation environments are running:
```bash
# Terminal 1: Launch Gazebo with a robot that has sensors
source /opt/ros/humble/setup.bash
ros2 launch gazebo_ros empty_world.launch.py
```

2. In a new terminal, spawn a robot with sensors:
```bash
# Terminal 2: Spawn robot with LiDAR, camera, and IMU
source /opt/ros/humble/setup.bash
ros2 run gazebo_ros spawn_entity.py -entity perception_robot -file://path/to/robot_with_sensors.urdf
```

3. In a third terminal, run your perception node:
```bash
# Terminal 3: Run the perception node
source /opt/ros/humble/setup.bash
ros2 run your_package basic_perception_node
```

## Sensor Fusion Example

### Basic Kalman Filter Implementation
For a simple sensor fusion example combining IMU and odometry data:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Imu
from nav_msgs.msg import Odometry
from geometry_msgs.msg import PoseWithCovarianceStamped
import numpy as np

class SimpleFusionNode(Node):
    def __init__(self):
        super().__init__('simple_fusion_node')

        # Subscriptions for sensor data
        self.imu_subscription = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10)

        self.odom_subscription = self.create_subscription(
            Odometry,
            '/odom',
            self.odom_callback,
            10)

        # Publisher for fused state
        self.fused_state_publisher = self.create_publisher(
            PoseWithCovarianceStamped,
            '/fused_state',
            10)

        # Simple state estimate (position and orientation)
        self.state_estimate = np.zeros(6)  # [x, y, z, roll, pitch, yaw]
        self.covariance = np.eye(6) * 0.1  # Initial uncertainty

        self.get_logger().info('Simple Fusion Node initialized')

    def imu_callback(self, msg):
        # Extract orientation from IMU
        # Convert quaternion to euler angles
        import tf_transformations
        orientation_q = msg.orientation
        euler = tf_transformations.euler_from_quaternion([
            orientation_q.x,
            orientation_q.y,
            orientation_q.z,
            orientation_q.w
        ])

        # Update state estimate with IMU data (simplified)
        self.state_estimate[3:6] = euler  # Update orientation

        # Update covariance based on IMU characteristics
        imu_uncertainty = 0.01  # Simplified uncertainty value
        self.covariance[3:, 3:] += imu_uncertainty * np.eye(3)

    def odom_callback(self, msg):
        # Extract position from odometry
        position = msg.pose.pose.position

        # Update state estimate with odometry data (simplified)
        self.state_estimate[:3] = [position.x, position.y, position.z]

        # Update covariance based on odometry characteristics
        odom_uncertainty = 0.05  # Simplified uncertainty value
        self.covariance[:3, :3] += odom_uncertainty * np.eye(3)

def main(args=None):
    rclpy.init(args=args)
    fusion_node = SimpleFusionNode()

    try:
        rclpy.spin(fusion_node)
    except KeyboardInterrupt:
        pass
    finally:
        fusion_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Running the Examples

1. Ensure both Gazebo and Unity simulation environments are properly configured
2. Launch the perception node to start processing sensor data
3. Observe the sensor data being processed in the console
4. Experiment with different sensor configurations and fusion parameters

## Troubleshooting Common Issues

### Perception Node Not Receiving Data
1. Verify that the simulation is running and publishing sensor data:
```bash
ros2 topic list | grep sensor
ros2 topic echo /lidar/scan  # Test if LiDAR data is available
```

2. Check that topic names match between simulation and perception node

### Sensor Fusion Inaccuracies
1. Verify that all sensors are calibrated properly
2. Check timing synchronization between different sensor streams
3. Validate that coordinate frames are consistent across all sensors

### Performance Issues
1. Reduce sensor update rates if processing is too slow
2. Optimize algorithms for real-time performance
3. Use appropriate data structures for sensor processing

## Next Steps

After completing this quickstart:
1. Proceed to detailed perception pipeline tutorials
2. Explore advanced sensor fusion techniques (EKF, UKF)
3. Implement perception for specific humanoid robotics tasks
4. Validate perception results in both simulation and real-world scenarios

This quickstart provides the foundation for building more sophisticated perception and sensor fusion systems in Physical AI applications.