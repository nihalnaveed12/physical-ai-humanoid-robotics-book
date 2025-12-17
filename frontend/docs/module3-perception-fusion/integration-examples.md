---
sidebar_position: 6
title: "Integration Examples: Complete Perception & Sensor Fusion Workflows"
---

# Integration Examples: Complete Perception & Sensor Fusion Workflows

## Overview

This section demonstrates how to combine all the concepts from this module into complete, reproducible perception and sensor fusion workflows. We'll create comprehensive examples that show the integration of physics simulation, sensor modeling, and sensor fusion techniques that bridge simulation to reality for humanoid robotics applications.

## Example 1: Complete Humanoid Perception Pipeline

### 1. Robot Model (URDF) - Humanoid with Sensors

Let's create a complete humanoid robot model that includes all the sensor configurations:

```xml
<?xml version="1.0"?>
<robot name="complete_humanoid_perception">
  <!-- Main Body -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.2 0.1 0.1"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.2 0.1 0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.01"/>
    </inertial>
  </link>

  <!-- Head with Sensors -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.05"/>
      </geometry>
      <material name="white">
        <color rgba="1 1 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.2"/>
      <inertia ixx="0.0001" ixy="0" ixz="0" iyy="0.0001" iyz="0" izz="0.0001"/>
    </inertial>
  </link>

  <joint name="head_joint" type="fixed">
    <parent link="base_link"/>
    <child link="head"/>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
  </joint>

  <!-- IMU Sensor in Head -->
  <gazebo reference="head">
    <sensor name="imu_sensor" type="imu">
      <always_on>true</always_on>
      <update_rate>100</update_rate>
      <pose>0 0 0 0 0 0</pose>
      <plugin name="imu_plugin" filename="libgazebo_ros_imu.so">
        <ros>
          <namespace>imu</namespace>
          <remapping>~/out:=data</remapping>
        </ros>
        <frame_name>head</frame_name>
        <topic>data</topic>
        <gaussian_noise>0.001</gaussian_noise>
      </plugin>
    </sensor>
  </gazebo>

  <!-- LiDAR on Top of Head -->
  <gazebo reference="head">
    <sensor name="lidar_sensor" type="ray">
      <pose>0.05 0 0.02 0 0 0</pose>
      <ray>
        <scan>
          <horizontal>
            <samples>360</samples>
            <resolution>1.0</resolution>
            <min_angle>-3.14159</min_angle>
            <max_angle>3.14159</max_angle>
          </horizontal>
        </scan>
        <range>
          <min>0.1</min>
          <max>10.0</max>
          <resolution>0.01</resolution>
        </range>
      </ray>
      <plugin name="lidar_controller" filename="libgazebo_ros_ray_sensor.so">
        <ros>
          <namespace>lidar</namespace>
          <remapping>~/out:=scan</remapping>
        </ros>
        <output_type>sensor_msgs/LaserScan</output_type>
      </plugin>
    </sensor>
  </gazebo>

  <!-- Depth Camera in Head -->
  <gazebo reference="head">
    <sensor name="depth_camera" type="depth">
      <pose>0.02 0 0.02 0 0 0</pose>
      <camera name="depth_cam">
        <horizontal_fov>1.047</horizontal_fov> <!-- 60 degrees -->
        <image>
          <width>640</width>
          <height>480</height>
          <format>R8G8B8</format>
        </image>
        <clip>
          <near>0.1</near>
          <far>10.0</far>
        </clip>
      </camera>
      <plugin name="camera_controller" filename="libgazebo_ros_openni_kinect.so">
        <ros>
          <namespace>camera</namespace>
          <remapping>~/rgb/image_raw:=image</remapping>
          <remapping>~/depth/image_raw:=depth</remapping>
          <remapping>~/rgb/camera_info:=camera_info</remapping>
        </ros>
        <camera_name>depth_camera</camera_name>
        <image_topic_name>image</image_topic_name>
        <depth_image_topic_name>depth</depth_image_topic_name>
        <point_cloud_topic_name>points</point_cloud_topic_name>
        <frame_name>head</frame_name>
      </plugin>
    </sensor>
  </gazebo>
</robot>
```

### 2. Physics Configuration for Both Environments

**Gazebo Physics Configuration** (digital_twin_world.sdf):
```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="perception_world">
    <light name="sun" type="directional">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <specular>0.2 0.2 0.2 1</specular>
      <direction>-0.6 -0.4 -0.9</direction>
    </light>

    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
            </plane>
          </geometry>
          <surface>
            <friction>
              <ode>
                <mu>0.5</mu>
                <mu2>0.5</mu2>
              </ode>
            </friction>
          </surface>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
          <material>
            <ambient>0.7 0.7 0.7 1</ambient>
            <diffuse>0.7 0.7 0.7 1</diffuse>
          </material>
        </visual>
      </link>
    </model>

    <!-- Physics Engine Configuration -->
    <physics name="1ms" default="0" type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
      <gravity>0 0 -9.8</gravity>
      <ode>
        <solver>
          <type>quick</type>
          <iters>10</iters>
          <sor>1.3</sor>
        </solver>
        <constraints>
          <cfm>0.0</cfm>
          <erp>0.2</erp>
          <contact_max_correcting_vel>100.0</contact_max_correcting_vel>
          <contact_surface_layer>0.001</contact_surface_layer>
        </constraints>
      </ode>
    </physics>
  </world>
</sdf>
```

### 3. Complete Launch System

Create a launch file that starts the complete perception pipeline:

```python
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, TimerAction
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import PathJoinSubstitution
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os


def generate_launch_description():
    ld = LaunchDescription()

    # Launch Gazebo with our perception world
    gazebo_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            get_package_share_directory('gazebo_ros'),
            '/launch/empty_world.launch.py'
        ]),
        launch_arguments={
            'world': PathJoinSubstitution([
                get_package_share_directory('digital_twin_examples'),
                'worlds',
                'perception_world.sdf'
            ]),
            'gui': 'true',
            'verbose': 'true'
        }.items()
    )
    ld.add_action(gazebo_launch)

    # Spawn the complete humanoid robot with sensors
    spawn_robot = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=[
            '-entity', 'complete_humanoid_perception',
            '-file', PathJoinSubstitution([
                get_package_share_directory('digital_twin_examples'),
                'urdf',
                'complete_humanoid_perception.urdf'
            ])
        ],
        output='screen'
    )
    # Add delay to ensure Gazebo is ready
    delayed_spawn = TimerAction(
        period=5.0,
        actions=[spawn_robot]
    )
    ld.add_action(delayed_spawn)

    # Perception pipeline node
    perception_node = Node(
        package='digital_twin_examples',
        executable='perception_pipeline',
        name='perception_pipeline',
        output='screen',
        parameters=[
            {'lidar_topic': '/lidar/scan'},
            {'camera_topic': '/camera/image'},
            {'imu_topic': '/imu/data'},
            {'fusion_frequency': 30.0}  # Hz
        ]
    )
    ld.add_action(perception_node)

    # Sensor fusion node
    fusion_node = Node(
        package='digital_twin_examples',
        executable='sensor_fusion',
        name='sensor_fusion',
        output='screen',
        parameters=[
            {'lidar_topic': '/lidar/scan'},
            {'imu_topic': '/imu/data'},
            {'fusion_algorithm': 'ekf'},  # Extended Kalman Filter
            {'publish_frequency': 50.0}  # Hz
        ]
    )
    ld.add_action(fusion_node)

    return ld
```

## Example 2: Running the Complete Perception Pipeline

### 1. Perception Pipeline Node

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan, Image, Imu
from nav_msgs.msg import Odometry
from geometry_msgs.msg import Twist
from std_msgs.msg import Float64MultiArray
import numpy as np
from collections import deque
import cv2
from cv_bridge import CvBridge


class PerceptionPipelineNode(Node):
    def __init__(self):
        super().__init__('perception_pipeline_node')

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

        # Publisher for fused perception data
        self.perception_publisher = self.create_publisher(
            Float64MultiArray,
            '/perception/fused_state',
            10)

        # Data buffers
        self.lidar_buffer = deque(maxlen=5)
        self.camera_buffer = deque(maxlen=5)
        self.imu_buffer = deque(maxlen=5)

        self.cv_bridge = CvBridge()

        # Timer for perception processing
        self.timer = self.create_timer(0.033, self.process_perception)  # ~30 Hz

        self.get_logger().info('Perception Pipeline Node initialized')

    def lidar_callback(self, msg):
        # Process LiDAR data
        ranges = np.array(msg.ranges)
        ranges = np.nan_to_num(ranges, nan=np.inf)  # Handle NaN values

        # Detect obstacles in forward direction (front 60 degrees)
        front_ranges = np.concatenate([
            ranges[:30],  # Left front
            ranges[-30:]  # Right front
        ])

        min_front_dist = np.min(front_ranges)

        self.lidar_buffer.append({
            'ranges': ranges,
            'min_front_dist': min_front_dist,
            'timestamp': msg.header.stamp
        })

    def camera_callback(self, msg):
        # Process camera image
        try:
            cv_image = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Simple processing: detect contours (objects)
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            _, thresh = cv2.threshold(gray, 127, 255, 0)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            # Count contours as proxy for number of objects detected
            contour_count = len(contours)

            self.camera_buffer.append({
                'image': cv_image,
                'contour_count': contour_count,
                'timestamp': msg.header.stamp
            })
        except Exception as e:
            self.get_logger().warn(f'Error processing camera image: {e}')

    def imu_callback(self, msg):
        # Process IMU data
        orientation = [msg.orientation.x, msg.orientation.y, msg.orientation.z, msg.orientation.w]
        angular_velocity = [msg.angular_velocity.x, msg.angular_velocity.y, msg.angular_velocity.z]
        linear_acceleration = [msg.linear_acceleration.x, msg.linear_acceleration.y, msg.linear_acceleration.z]

        self.imu_buffer.append({
            'orientation': orientation,
            'angular_velocity': angular_velocity,
            'linear_acceleration': linear_acceleration,
            'timestamp': msg.header.stamp
        })

    def process_perception(self):
        if not (self.lidar_buffer and self.imu_buffer):
            return

        # Get latest data
        latest_lidar = self.lidar_buffer[-1]
        latest_imu = self.imu_buffer[-1]

        # Create fused perception state
        perception_state = Float64MultiArray()

        # Combine sensor data into a single state vector
        # [min_front_distance, orientation_x, orientation_y, orientation_z, orientation_w,
        #  angular_vel_x, angular_vel_y, angular_vel_z,
        #  linear_acc_x, linear_acc_y, linear_acc_z]
        fused_data = [
            latest_lidar['min_front_dist'],  # Distance to nearest obstacle in front
            latest_imu['orientation'][0],   # Orientation components
            latest_imu['orientation'][1],
            latest_imu['orientation'][2],
            latest_imu['orientation'][3],
            latest_imu['angular_velocity'][0],  # Angular velocity components
            latest_imu['angular_velocity'][1],
            latest_imu['angular_velocity'][2],
            latest_imu['linear_acceleration'][0],  # Linear acceleration components
            latest_imu['linear_acceleration'][1],
            latest_imu['linear_acceleration'][2]
        ]

        perception_state.data = fused_data
        self.perception_publisher.publish(perception_state)


def main(args=None):
    rclpy.init(args=args)
    perception_node = PerceptionPipelineNode()

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

## Example 3: Sensor Fusion Implementation

### Extended Kalman Filter for State Estimation

For the sensor fusion component, we can implement a simple Extended Kalman Filter (EKF) to combine LiDAR and IMU data:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan, Imu
from geometry_msgs.msg import PoseWithCovarianceStamped
import numpy as np


class SimpleEKFNode(Node):
    def __init__(self):
        super().__init__('simple_ekf_node')

        # Subscriptions for sensor data
        self.lidar_subscription = self.create_subscription(
            LaserScan,
            '/lidar/scan',
            self.lidar_callback,
            10)

        self.imu_subscription = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10)

        # Publisher for fused state
        self.fused_state_publisher = self.create_publisher(
            PoseWithCovarianceStamped,
            '/perception/fused_pose',
            10)

        # EKF state: [x, y, theta, vx, vy, omega]
        self.state = np.zeros(6)
        self.covariance = np.eye(6) * 0.1  # Initial uncertainty

        # Process noise
        self.process_noise = np.diag([0.1, 0.1, 0.05, 0.5, 0.5, 0.1])

        # Timer for prediction/update cycle
        self.timer = self.create_timer(0.02, self.prediction_step)  # 50 Hz

        self.get_logger().info('Simple EKF Node initialized')

    def lidar_callback(self, msg):
        # Extract features from LiDAR data (e.g., closest obstacle position)
        # For simplicity, we'll use this as a position measurement
        if len(msg.ranges) > 0:
            min_range_idx = np.argmin(msg.ranges)
            min_range = msg.ranges[min_range_idx]

            # Calculate approximate x,y position of closest obstacle
            angle = msg.angle_min + min_range_idx * msg.angle_increment
            obstacle_x = min_range * np.cos(angle)
            obstacle_y = min_range * np.sin(angle)

            # Update EKF with position measurement
            self.update_position_measurement(obstacle_x, obstacle_y)

    def imu_callback(self, msg):
        # Extract orientation and angular velocity from IMU
        orientation = msg.orientation
        angular_velocity = msg.angular_velocity
        linear_acceleration = msg.linear_acceleration

        # Update state with IMU measurements
        self.update_orientation_measurement(
            orientation,
            angular_velocity,
            linear_acceleration
        )

    def prediction_step(self):
        # Predict state forward using motion model
        dt = 0.02  # 50 Hz

        # Simple motion model: constant velocity
        F = np.eye(6)
        F[0, 3] = dt  # x += vx * dt
        F[1, 4] = dt  # y += vy * dt
        F[2, 5] = dt  # theta += omega * dt

        # Predict state
        self.state = F @ self.state

        # Predict covariance
        self.covariance = F @ self.covariance @ F.T + self.process_noise

    def update_position_measurement(self, x_meas, y_meas):
        # Measurement model: extract x, y from state
        H = np.zeros((2, 6))
        H[0, 0] = 1.0  # Measure x position
        H[1, 1] = 1.0  # Measure y position

        # Measurement
        z = np.array([x_meas, y_meas])

        # Innovation
        h_x = np.array([self.state[0], self.state[1]])  # Expected measurement
        innovation = z - h_x

        # Innovation covariance
        S = H @ self.covariance @ H.T + np.diag([0.1, 0.1])  # Measurement noise

        # Kalman gain
        K = self.covariance @ H.T @ np.linalg.inv(S)

        # Update state
        self.state = self.state + K @ innovation

        # Update covariance
        self.covariance = (np.eye(6) - K @ H) @ self.covariance

    def update_orientation_measurement(self, orientation, angular_velocity, linear_acceleration):
        # Extract orientation from quaternion
        # Convert to Euler angles for simple update
        import tf_transformations
        euler = tf_transformations.euler_from_quaternion([
            orientation.x,
            orientation.y,
            orientation.z,
            orientation.w
        ])

        # Measurement model: extract theta from state
        H = np.zeros((2, 6))
        H[0, 2] = 1.0  # Measure theta (orientation)
        H[1, 5] = 1.0  # Measure omega (angular velocity z)

        # Measurement
        z = np.array([euler[2], angular_velocity.z])  # theta and angular velocity

        # Innovation
        h_x = np.array([self.state[2], self.state[5]])  # Expected measurement
        innovation = z - h_x

        # Innovation covariance
        S = H @ self.covariance @ H.T + np.diag([0.05, 0.01])  # Measurement noise

        # Kalman gain
        K = self.covariance @ H.T @ np.linalg.inv(S)

        # Update state
        self.state = self.state + K @ innovation

        # Update covariance
        self.covariance = (np.eye(6) - K @ H) @ self.covariance

        # Publish fused state
        self.publish_fused_state()

    def publish_fused_state(self):
        msg = PoseWithCovarianceStamped()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = 'map'

        # Fill pose with state estimate
        msg.pose.pose.position.x = float(self.state[0])
        msg.pose.pose.position.y = float(self.state[1])
        msg.pose.pose.position.z = 0.0  # Assume 2D for simplicity

        # Convert orientation to quaternion
        from tf_transformations import quaternion_from_euler
        quat = quaternion_from_euler(0, 0, self.state[2])
        msg.pose.pose.orientation.x = quat[0]
        msg.pose.pose.orientation.y = quat[1]
        msg.pose.pose.orientation.z = quat[2]
        msg.pose.pose.orientation.w = quat[3]

        # Fill covariance matrix
        for i in range(6):
            for j in range(6):
                msg.pose.covariance[i*6 + j] = float(self.covariance[i, j])

        self.fused_state_publisher.publish(msg)


def main(args=None):
    rclpy.init(args=args)
    ekf_node = SimpleEKFNode()

    try:
        rclpy.spin(ekf_node)
    except KeyboardInterrupt:
        pass
    finally:
        ekf_node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Complete Perception System Architecture

### Multi-Sensor Fusion Node

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, PointCloud2, Imu, LaserScan
from nav_msgs.msg import Odometry
from geometry_msgs.msg import PoseWithCovarianceStamped
from std_msgs.msg import Header, Bool, Float32MultiArray
from cv_bridge import CvBridge
from sensor_msgs_py import point_cloud2
import numpy as np
import cv2
from scipy.spatial.transform import Rotation as R
from collections import deque
import threading
import time


class CompletePerceptionSystem(Node):
    """
    Complete perception system integrating visual, LiDAR, and IMU data
    """
    def __init__(self):
        super().__init__('complete_perception_system')

        # Initialize components
        self.bridge = CvBridge()

        # Declare parameters
        self.declare_parameter('processing_rate', 10.0)  # Hz
        self.declare_parameter('enable_visual_perception', True)
        self.declare_parameter('enable_lidar_perception', True)
        self.declare_parameter('enable_sensor_fusion', True)
        self.declare_parameter('confidence_threshold', 0.7)

        # Get parameters
        self.processing_rate = self.get_parameter('processing_rate').value
        self.enable_visual_perception = self.get_parameter('enable_visual_perception').value
        self.enable_lidar_perception = self.get_parameter('enable_lidar_perception').value
        self.enable_sensor_fusion = self.get_parameter('enable_sensor_fusion').value
        self.confidence_threshold = self.get_parameter('confidence_threshold').value

        # Initialize perception modules
        self.visual_perception = VisualPerceptionModule(self) if self.enable_visual_perception else None
        self.lidar_perception = LiDARPerceptionModule(self) if self.enable_lidar_perception else None
        self.fusion_module = SensorFusionModule(self) if self.enable_sensor_fusion else None

        # Initialize data buffers
        self.data_buffers = {
            'camera': deque(maxlen=10),
            'lidar': deque(maxlen=10),
            'imu': deque(maxlen=10)
        }

        # Initialize state estimator
        self.state_estimator = ExtendedKalmanFilter(state_dim=16)

        # Create publishers
        self.environment_map_pub = self.create_publisher(
            PointCloud2,
            '/perception/environment_map',
            10
        )

        self.object_detection_pub = self.create_publisher(
            MarkerArray,
            '/perception/object_detections',
            10
        )

        self.state_estimate_pub = self.create_publisher(
            PoseWithCovarianceStamped,
            '/perception/state_estimate',
            10
        )

        self.system_status_pub = self.create_publisher(
            Bool,
            '/perception/system_active',
            10
        )

        # Create subscriptions
        self.camera_sub = self.create_subscription(
            Image,
            '/camera/image',
            self.camera_callback,
            10
        )

        self.lidar_sub = self.create_subscription(
            PointCloud2,
            '/lidar_3d/points',
            self.lidar_callback,
            10
        )

        self.imu_sub = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10
        )

        # Timer for perception processing
        self.perception_timer = self.create_timer(
            1.0 / self.processing_rate,
            self.perception_processing_callback
        )

        # Initialize perception state
        self.is_active = True
        self.last_perception_time = time.time()

        # Publish initial system status
        status_msg = Bool()
        status_msg.data = self.is_active
        self.system_status_pub.publish(status_msg)

        self.get_logger().info('Complete Perception System initialized')

    def camera_callback(self, msg):
        """
        Process camera image through visual perception pipeline
        """
        try:
            if self.visual_perception:
                # Convert ROS Image to OpenCV
                cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

                # Process visual perception
                visual_results = self.visual_perception.process_image(cv_image)

                # Add to data buffer
                with self.data_buffers['camera_lock']:
                    self.data_buffers['camera'].append({
                        'timestamp': msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9,
                        'data': visual_results,
                        'header': msg.header
                    })

                # Publish visual results if available
                if 'detections' in visual_results:
                    self.publish_visual_detections(visual_results['detections'], msg.header)

        except Exception as e:
            self.get_logger().error(f'Error in camera callback: {e}')

    def lidar_callback(self, msg):
        """
        Process LiDAR point cloud through LiDAR perception pipeline
        """
        try:
            if self.lidar_perception:
                # Extract point cloud data
                points_list = []
                for point in point_cloud2.read_points(msg, field_names=['x', 'y', 'z'], skip_nans=True):
                    points_list.append([point[0], point[1], point[2]])

                if len(points_list) > 0:
                    points = np.array(points_list)

                    # Process LiDAR perception
                    lidar_results = self.lidar_perception.process_point_cloud(points)

                    # Add to data buffer
                    with self.data_buffers['lidar_lock']:
                        self.data_buffers['lidar'].append({
                            'timestamp': msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9,
                            'data': lidar_results,
                            'header': msg.header
                        })

                    # Publish LiDAR results if available
                    if 'environment_map' in lidar_results:
                        self.publish_environment_map(lidar_results['environment_map'], msg.header)

        except Exception as e:
            self.get_logger().error(f'Error in LiDAR callback: {e}')

    def imu_callback(self, msg):
        """
        Process IMU data for state estimation
        """
        try:
            # Extract IMU measurements
            accel = np.array([msg.linear_acceleration.x, msg.linear_acceleration.y, msg.linear_acceleration.z])
            gyro = np.array([msg.angular_velocity.x, msg.angular_velocity.y, msg.angular_velocity.z])
            orient = np.array([msg.orientation.x, msg.orientation.y, msg.orientation.z, msg.orientation.w])

            # Add to data buffer
            with self.data_buffers['imu_lock']:
                self.data_buffers['imu'].append({
                    'timestamp': msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9,
                    'data': {'accel': accel, 'gyro': gyro, 'orient': orient},
                    'header': msg.header
                })

        except Exception as e:
            self.get_logger().error(f'Error in IMU callback: {e}')

    def perception_processing_callback(self):
        """
        Main perception processing callback
        """
        try:
            # Get synchronized data
            synchronized_data = self.get_synchronized_data()

            if synchronized_data:
                # Process visual perception
                if self.visual_perception and 'camera' in synchronized_data:
                    visual_results = self.visual_perception.process_image(
                        synchronized_data['camera']['data']['image']
                    )
                    synchronized_data['camera']['data'].update(visual_results)

                # Process LiDAR perception
                if self.lidar_perception and 'lidar' in synchronized_data:
                    lidar_results = self.lidar_perception.process_point_cloud(
                        synchronized_data['lidar']['data']['points']
                    )
                    synchronized_data['lidar']['data'].update(lidar_results)

                # Perform sensor fusion
                if self.fusion_module:
                    fusion_results = self.fusion_module.fuse_data(synchronized_data)
                    if fusion_results['valid']:
                        self.publish_state_estimate(fusion_results, synchronized_data['header'])

                # Update state estimator
                if 'imu' in synchronized_data:
                    imu_data = synchronized_data['imu']['data']
                    self.state_estimator.predict(
                        imu_data['accel'],
                        imu_data['gyro'],
                        0.1  # dt = 0.1s (10Hz)
                    )

                # Publish environment map if available
                self.publish_environment_map_if_available(synchronized_data)

                # Update last processing time
                self.last_perception_time = time.time()

            # Check system health
            self.check_system_health()

        except Exception as e:
            self.get_logger().error(f'Error in perception processing: {e}')

    def get_synchronized_data(self):
        """
        Get synchronized data from all sensors within time threshold
        """
        with threading.Lock():  # Use a shared lock for all buffers
            # Check if we have data from all required sensors
            if (len(self.data_buffers['camera']) == 0 or
                len(self.data_buffers['lidar']) == 0 or
                len(self.data_buffers['imu']) == 0):
                return None

            # Get latest data from each sensor
            camera_data = self.data_buffers['camera'][-1]
            lidar_data = self.data_buffers['lidar'][-1]
            imu_data = self.data_buffers['imu'][-1]

            # Check time synchronization (within 100ms)
            time_diff = max(
                abs(camera_data['timestamp'] - lidar_data['timestamp']),
                abs(camera_data['timestamp'] - imu_data['timestamp']),
                abs(lidar_data['timestamp'] - imu_data['timestamp'])
            )

            if time_diff <= 0.1:  # 100ms threshold
                return {
                    'camera': camera_data,
                    'lidar': lidar_data,
                    'imu': imu_data,
                    'header': camera_data['header']  # Use camera header as reference
                }

        return None

    def publish_visual_detections(self, detections, header):
        """
        Publish visual detection results
        """
        if not detections:
            return

        marker_array = MarkerArray()
        marker_id = 0

        for detection in detections:
            if detection.get('confidence', 0) > self.confidence_threshold:
                marker = Marker()
                marker.header = header
                marker.ns = "visual_detections"
                marker.id = marker_id
                marker.type = Marker.CUBE
                marker.action = Marker.ADD

                # Set position based on detection
                marker.pose.position.x = float(detection.get('x', 0))
                marker.pose.position.y = float(detection.get('y', 0))
                marker.pose.position.z = float(detection.get('z', 0))
                marker.pose.orientation.w = 1.0

                # Set size
                marker.scale.x = float(detection.get('width', 0.5))
                marker.scale.y = float(detection.get('height', 0.5))
                marker.scale.z = float(detection.get('depth', 0.5))

                # Set color based on class
                class_name = detection.get('class', 'unknown')
                marker.color.r, marker.color.g, marker.color.b = self.get_color_for_class(class_name)
                marker.color.a = 0.7

                # Set lifetime
                marker.lifetime.sec = 1  # 1 second

                marker_array.markers.append(marker)
                marker_id += 1

        if marker_array.markers:
            self.object_detection_pub.publish(marker_array)

    def publish_environment_map(self, points, header):
        """
        Publish environment map as point cloud
        """
        if len(points) == 0:
            return

        from sensor_msgs.msg import PointField

        fields = [
            PointField(name='x', offset=0, datatype=PointField.FLOAT32, count=1),
            PointField(name='y', offset=4, datatype=PointField.FLOAT32, count=1),
            PointField(name='z', offset=8, datatype=PointField.FLOAT32, count=1),
        ]

        pc_msg = point_cloud2.create_cloud(header, fields, points)
        self.environment_map_pub.publish(pc_msg)

    def publish_state_estimate(self, fusion_results, header):
        """
        Publish fused state estimate
        """
        try:
            pose_msg = PoseWithCovarianceStamped()
            pose_msg.header = header
            pose_msg.header.frame_id = 'map'

            # Set position
            pose_msg.pose.pose.position.x = float(fusion_results['position'][0])
            pose_msg.pose.pose.position.y = float(fusion_results['position'][1])
            pose_msg.pose.pose.position.z = float(fusion_results['position'][2])

            # Set orientation
            pose_msg.pose.pose.orientation.x = float(fusion_results['orientation'][0])
            pose_msg.pose.pose.orientation.y = float(fusion_results['orientation'][1])
            pose_msg.pose.pose.orientation.z = float(fusion_results['orientation'][2])
            pose_msg.pose.pose.orientation.w = float(fusion_results['orientation'][3])

            # Set covariance from fusion results
            if 'covariance' in fusion_results:
                for i, cov_val in enumerate(fusion_results['covariance']):
                    if i < len(pose_msg.pose.covariance):
                        pose_msg.pose.covariance[i] = float(cov_val)

            self.state_estimate_pub.publish(pose_msg)

        except Exception as e:
            self.get_logger().error(f'Error publishing state estimate: {e}')

    def get_color_for_class(self, class_name):
        """
        Get color for visualization based on object class
        """
        class_colors = {
            'person': (1.0, 0.0, 0.0),      # Red
            'car': (0.0, 1.0, 0.0),         # Green
            'bicycle': (0.0, 0.0, 1.0),     # Blue
            'chair': (1.0, 1.0, 0.0),       # Yellow
            'table': (1.0, 0.0, 1.0),       # Magenta
            'unknown': (0.5, 0.5, 0.5)      # Gray
        }

        return class_colors.get(class_name, class_colors['unknown'])

    def publish_environment_map_if_available(self, synchronized_data):
        """
        Publish environment map if LiDAR data is available
        """
        if 'lidar' in synchronized_data:
            lidar_data = synchronized_data['lidar']['data']
            if 'environment_map' in lidar_data:
                self.publish_environment_map(lidar_data['environment_map'], synchronized_data['header'])

    def check_system_health(self):
        """
        Check perception system health and performance
        """
        current_time = time.time()

        # Check if perception is running
        time_since_last = current_time - self.last_perception_time

        if time_since_last > 5.0:  # 5 seconds without processing
            self.get_logger().warn(f'Perception system inactive for {time_since_last:.2f}s')

            # Update system status
            self.is_active = False
            status_msg = Bool()
            status_msg.data = self.is_active
            self.system_status_pub.publish(status_msg)
        elif not self.is_active:
            # System recovered
            self.is_active = True
            status_msg = Bool()
            status_msg.data = self.is_active
            self.system_status_pub.publish(status_msg)


class VisualPerceptionModule:
    """
    Visual perception module for object detection and recognition
    """
    def __init__(self, node):
        self.node = node
        self.object_detector = self.initialize_object_detector()
        self.feature_extractor = self.initialize_feature_extractor()
        self.tracker = ObjectTracker()

    def initialize_object_detector(self):
        """
        Initialize object detection model
        """
        # This would typically load a pre-trained model like YOLO, SSD, or similar
        # For this example, we'll use a simple placeholder
        return SimpleObjectDetector()

    def initialize_feature_extractor(self):
        """
        Initialize feature extraction model
        """
        # This would typically extract visual features for matching/tracking
        return VisualFeatureExtractor()

    def process_image(self, image):
        """
        Process image and extract visual information
        """
        results = {
            'image': image,
            'detections': [],
            'features': [],
            'processed_image': image.copy()
        }

        # Run object detection
        detections = self.object_detector.detect_objects(image)
        results['detections'] = detections

        # Extract features
        features = self.feature_extractor.extract_features(image)
        results['features'] = features

        # Update tracker
        tracked_objects = self.tracker.update(detections)
        results['tracked_objects'] = tracked_objects

        # Draw detections on processed image
        results['processed_image'] = self.draw_detections(
            results['processed_image'],
            detections
        )

        return results

    def draw_detections(self, image, detections):
        """
        Draw detection results on image
        """
        annotated_image = image.copy()

        for detection in detections:
            if detection.get('confidence', 0) > self.node.confidence_threshold:
                x, y, w, h = detection['bbox']

                # Draw bounding box
                cv2.rectangle(
                    annotated_image,
                    (int(x), int(y)),
                    (int(x + w), int(y + h)),
                    (0, 255, 0),
                    2
                )

                # Draw label
                label = f"{detection['class']}: {detection['confidence']:.2f}"
                cv2.putText(
                    annotated_image,
                    label,
                    (int(x), int(y - 10)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 255, 0),
                    1
                )

        return annotated_image


class LiDARPerceptionModule:
    """
    LiDAR perception module for environment mapping and object detection
    """
    def __init__(self, node):
        self.node = node
        self.ground_segmenter = GroundSegmenter()
        self.clusterer = EuclideanClusterer()
        self.map_builder = OccupancyGridBuilder()

    def process_point_cloud(self, points):
        """
        Process LiDAR point cloud for environment understanding
        """
        results = {
            'points': points,
            'ground_points': [],
            'obstacle_points': [],
            'clusters': [],
            'environment_map': [],
            'objects': []
        }

        if len(points) < 10:
            return results

        # Segment ground plane
        ground_points, obstacle_points = self.ground_segmenter.segment(points)
        results['ground_points'] = ground_points
        results['obstacle_points'] = obstacle_points

        # Cluster obstacle points
        clusters = self.clusterer.cluster(obstacle_points)
        results['clusters'] = clusters

        # Detect objects from clusters
        objects = []
        for cluster in clusters:
            if len(cluster) > 10:  # Minimum cluster size
                object_info = self.detect_object_from_cluster(cluster)
                objects.append(object_info)

        results['objects'] = objects

        # Build environment map
        environment_map = self.map_builder.build_map(points)
        results['environment_map'] = environment_map

        return results

    def detect_object_from_cluster(self, cluster):
        """
        Detect and classify object from point cluster
        """
        # Calculate cluster properties
        centroid = np.mean(cluster, axis=0)
        size = np.max(cluster, axis=0) - np.min(cluster, axis=0)
        volume = np.prod(size)

        # Simple classification based on size
        if volume > 1.0:  # Large object (vehicle)
            object_type = 'large_vehicle'
        elif volume > 0.1:  # Medium object (person)
            object_type = 'person'
        elif volume > 0.01:  # Small object
            object_type = 'small_object'
        else:
            object_type = 'unknown'

        return {
            'centroid': centroid,
            'size': size,
            'volume': volume,
            'type': object_type,
            'points': cluster
        }


class SensorFusionModule:
    """
    Sensor fusion module for combining multi-modal data
    """
    def __init__(self, node):
        self.node = node
        self.fusion_algorithm = ExtendedKalmanFilter(state_dim=16)
        self.data_associator = DataAssociation()
        self.confidence_estimator = ConfidenceEstimator()

    def fuse_data(self, synchronized_data):
        """
        Fuse synchronized sensor data
        """
        results = {
            'valid': True,
            'position': [0, 0, 0],
            'orientation': [0, 0, 0, 1],  # Quaternion
            'velocity': [0, 0, 0],
            'covariance': [],
            'confidence': 1.0,
            'timestamp': 0.0
        }

        try:
            # Extract sensor data
            visual_data = synchronized_data.get('camera', {}).get('data', {})
            lidar_data = synchronized_data.get('lidar', {}).get('data', {})
            imu_data = synchronized_data.get('imu', {}).get('data', {})

            # Predict state using IMU data
            if 'accel' in imu_data and 'gyro' in imu_data:
                dt = 0.1  # 10Hz assumption
                self.fusion_algorithm.predict(
                    imu_data['accel'],
                    imu_data['gyro'],
                    dt
                )

            # Update state using visual data
            if 'detections' in visual_data:
                visual_measurements = self.extract_visual_measurements(visual_data['detections'])
                if visual_measurements:
                    self.fusion_algorithm.update_visual(visual_measurements)

            # Update state using LiDAR data
            if 'objects' in lidar_data:
                lidar_measurements = self.extract_lidar_measurements(lidar_data['objects'])
                if lidar_measurements:
                    self.fusion_algorithm.update_lidar(lidar_measurements)

            # Get fused state
            state = self.fusion_algorithm.get_state()
            covariance = self.fusion_algorithm.get_covariance()

            # Extract position and orientation
            results['position'] = state[0:3].tolist()
            results['orientation'] = state[6:10].tolist()  # Quaternion
            results['velocity'] = state[3:6].tolist()
            results['covariance'] = covariance.flatten().tolist()

            # Calculate confidence
            results['confidence'] = self.confidence_estimator.estimate(
                state, covariance, synchronized_data
            )

            # Validate results
            results['valid'] = self.validate_fusion_results(results)

            results['timestamp'] = synchronized_data['header'].stamp.sec + \
                                  synchronized_data['header'].stamp.nanosec * 1e-9

        except Exception as e:
            self.node.get_logger().error(f'Error in sensor fusion: {e}')
            results['valid'] = False

        return results

    def extract_visual_measurements(self, detections):
        """
        Extract measurements from visual detections
        """
        measurements = []

        for detection in detections:
            if detection.get('confidence', 0) > self.node.confidence_threshold:
                # Convert 2D detection to 3D measurement (simplified)
                # In practice, you'd use depth data or triangulation
                x = detection.get('x', 0)
                y = detection.get('y', 0)
                z = detection.get('z', 1)  # Default distance

                measurements.append([x, y, z])

        return measurements

    def extract_lidar_measurements(self, objects):
        """
        Extract measurements from LiDAR objects
        """
        measurements = []

        for obj in objects:
            if obj.get('volume', 0) > 0.01:  # Minimum size threshold
                centroid = obj['centroid']
                measurements.append(centroid.tolist())

        return measurements

    def validate_fusion_results(self, results):
        """
        Validate fusion results
        """
        # Check if position is finite
        if not all(np.isfinite(pos) for pos in results['position']):
            return False

        # Check if orientation is normalized quaternion
        orient = results['orientation']
        orient_norm = np.linalg.norm(orient)
        if abs(orient_norm - 1.0) > 0.1:  # Not normalized
            return False

        # Check confidence threshold
        if results['confidence'] < self.node.confidence_threshold:
            return False

        return True


class ExtendedKalmanFilter:
    """
    Extended Kalman Filter for sensor fusion
    """
    def __init__(self, state_dim=16):
        self.state_dim = state_dim
        self.x = np.zeros(state_dim)  # State vector [pos, vel, orient, biases]
        self.x[9] = 1.0  # Initialize quaternion to [0,0,0,1]

        # Covariance matrix
        self.P = np.eye(state_dim) * 1000.0
        self.P[6:10, 6:10] = np.eye(4) * 0.1  # Lower for orientation

        # Process noise
        self.Q = np.eye(state_dim) * 0.1
        self.Q[0:3, 0:3] *= 0.1   # Position
        self.Q[3:6, 3:6] *= 0.5   # Velocity
        self.Q[6:10, 6:10] *= 0.01 # Orientation
        self.Q[10:, 10:] *= 0.001 # Biases

        # Gravity vector
        self.gravity = np.array([0, 0, -9.81])

    def predict(self, accel, gyro, dt):
        """
        Prediction step using IMU measurements
        """
        # Extract state components
        pos = self.x[0:3]
        vel = self.x[3:6]
        quat = self.x[6:10]

        # Convert quaternion to rotation matrix
        r = R.from_quat([quat[0], quat[1], quat[2], quat[3]])
        rot_matrix = r.as_matrix()

        # Transform acceleration to world frame
        world_acc = rot_matrix @ accel + self.gravity

        # Predict new velocity and position
        new_vel = vel + world_acc * dt
        new_pos = pos + vel * dt + 0.5 * world_acc * dt**2

        # Predict new orientation (simplified)
        omega_quat = np.array([*gyro, 0])
        Omega_matrix = np.array([
            [0, -gyro[0], -gyro[1], -gyro[2]],
            [gyro[0], 0, gyro[2], -gyro[1]],
            [gyro[1], -gyro[2], 0, gyro[0]],
            [gyro[2], gyro[1], -gyro[0], 0]
        ])

        quat_dot = 0.5 * Omega_matrix @ quat
        new_quat = quat + quat_dot * dt
        new_quat = new_quat / np.linalg.norm(new_quat)

        # Update state vector
        self.x[0:3] = new_pos
        self.x[3:6] = new_vel
        self.x[6:10] = new_quat

        # Jacobian and covariance prediction
        F = self.compute_jacobian(accel, gyro, dt)
        self.P = F @ self.P @ F.T + self.Q

    def update_visual(self, measurements):
        """
        Update step using visual measurements
        """
        if not measurements:
            return

        # Average visual measurements
        avg_measurement = np.mean(measurements, axis=0)

        # Measurement model: [x, y, z] position
        H = np.zeros((3, self.state_dim))
        H[0, 0] = 1.0  # Maps state x to measurement x
        H[1, 1] = 1.0  # Maps state y to measurement y
        H[2, 2] = 1.0  # Maps state z to measurement z

        # Innovation
        h_x = H @ self.x
        y = avg_measurement - h_x[0:3]

        # Innovation covariance
        R_visual = np.diag([0.1, 0.1, 0.2])  # Visual measurement noise
        S = H @ self.P @ H.T + R_visual

        # Kalman gain
        K = self.P @ H.T @ np.linalg.inv(S)

        # Update state
        self.x = self.x + K @ np.concatenate([y, np.zeros(self.state_dim - 3)])

        # Update covariance
        self.P = (np.eye(self.state_dim) - K @ H) @ self.P

    def update_lidar(self, measurements):
        """
        Update step using LiDAR measurements
        """
        if not measurements:
            return

        # Average LiDAR measurements
        avg_measurement = np.mean(measurements, axis=0)

        # Measurement model: [x, y, z] position
        H = np.zeros((3, self.state_dim))
        H[0, 0] = 1.0  # Maps state x to measurement x
        H[1, 1] = 1.0  # Maps state y to measurement y
        H[2, 2] = 1.0  # Maps state z to measurement z

        # Innovation
        h_x = H @ self.x
        y = avg_measurement - h_x[0:3]

        # Innovation covariance
        R_lidar = np.diag([0.05, 0.05, 0.1])  # LiDAR measurement noise
        S = H @ self.P @ H.T + R_lidar

        # Kalman gain
        K = self.P @ H.T @ np.linalg.inv(S)

        # Update state
        self.x = self.x + K @ np.concatenate([y, np.zeros(self.state_dim - 3)])

        # Update covariance
        self.P = (np.eye(self.state_dim) - K @ H) @ self.P

    def compute_jacobian(self, accel, gyro, dt):
        """
        Compute Jacobian of motion model
        """
        F = np.eye(self.state_dim)

        # Position from velocity
        F[0:3, 3:6] = np.eye(3) * dt

        # Velocity from acceleration (simplified)
        F[3:6, 6:9] = self.compute_orientation_jacobian(accel)

        return F

    def compute_orientation_jacobian(self, accel):
        """
        Compute orientation jacobian
        """
        # Simplified Jacobian
        return np.zeros((3, 3))

    def get_state(self):
        """
        Get current state estimate
        """
        return self.x.copy()

    def get_covariance(self):
        """
        Get current covariance estimate
        """
        return self.P.copy()


class ObjectTracker:
    """
    Object tracker for maintaining object identities across frames
    """
    def __init__(self):
        self.tracks = {}
        self.next_id = 0
        self.max_displacement = 1.0  # Maximum displacement between frames

    def update(self, detections):
        """
        Update object tracks with new detections
        """
        if not detections:
            return []

        # Convert detections to format suitable for tracking
        current_objects = []
        for det in detections:
            if det.get('confidence', 0) > 0.5:  # Confidence threshold
                current_objects.append({
                    'position': np.array([det['x'], det['y'], det.get('z', 1.0)]),
                    'bbox': det['bbox'],
                    'class': det['class'],
                    'confidence': det['confidence']
                })

        # Update tracks
        updated_tracks = []
        used_detections = set()

        for track_id, track_info in self.tracks.items():
            # Find best matching detection
            best_match_idx = self.find_best_match(track_info, current_objects, used_detections)

            if best_match_idx is not None:
                # Update track
                detection = current_objects[best_match_idx]
                track_info['position'] = detection['position']
                track_info['bbox'] = detection['bbox']
                track_info['class'] = detection['class']
                track_info['confidence'] = detection['confidence']
                track_info['last_seen'] = time.time()
                track_info['age'] += 1

                used_detections.add(best_match_idx)

                updated_tracks.append({
                    'id': track_id,
                    'position': track_info['position'].tolist(),
                    'class': track_info['class'],
                    'confidence': track_info['confidence'],
                    'age': track_info['age']
                })
            else:
                # Check if track should be deleted (too old)
                if time.time() - track_info['last_seen'] > 2.0:  # 2 seconds
                    continue  # Delete track
                else:
                    # Keep track but mark as not seen
                    updated_tracks.append({
                        'id': track_id,
                        'position': track_info['position'].tolist(),
                        'class': track_info['class'],
                        'confidence': track_info['confidence'],
                        'age': track_info['age'],
                        'occluded': True
                    })

        # Create new tracks for unmatched detections
        for i, detection in enumerate(current_objects):
            if i not in used_detections:
                new_track_id = self.next_id
                self.tracks[new_track_id] = {
                    'position': detection['position'],
                    'bbox': detection['bbox'],
                    'class': detection['class'],
                    'confidence': detection['confidence'],
                    'last_seen': time.time(),
                    'age': 0
                }
                self.next_id += 1

                updated_tracks.append({
                    'id': new_track_id,
                    'position': detection['position'].tolist(),
                    'class': detection['class'],
                    'confidence': detection['confidence'],
                    'age': 0
                })

        return updated_tracks

    def find_best_match(self, track_info, detections, used_detections):
        """
        Find best matching detection for a track
        """
        best_match_idx = None
        best_distance = float('inf')

        for i, detection in enumerate(detections):
            if i in used_detections:
                continue

            # Calculate distance between track and detection
            distance = np.linalg.norm(track_info['position'] - detection['position'])

            # Check if distance is within threshold
            if distance < self.max_displacement and distance < best_distance:
                best_distance = distance
                best_match_idx = i

        return best_match_idx


class GroundSegmenter:
    """
    Ground plane segmentation for LiDAR point clouds
    """
    def __init__(self):
        self.max_height = 0.1  # Maximum height for ground points
        self.distance_threshold = 0.2  # Distance threshold for RANSAC

    def segment(self, points):
        """
        Segment ground and obstacle points
        """
        if len(points) < 100:
            return points, np.array([])  # Return all as ground if too few points

        # Simple height-based ground segmentation
        # In practice, you'd use RANSAC or other more sophisticated methods
        ground_mask = points[:, 2] < self.max_height  # Points below threshold
        ground_points = points[ground_mask]
        obstacle_points = points[~ground_mask]

        return ground_points, obstacle_points


class EuclideanClusterer:
    """
    Euclidean clustering for object detection in LiDAR point clouds
    """
    def __init__(self):
        self.cluster_distance = 0.5  # Maximum distance for clustering
        self.min_cluster_size = 10   # Minimum points for valid cluster
        self.max_cluster_size = 1000 # Maximum points for valid cluster

    def cluster(self, points):
        """
        Cluster points using Euclidean distance
        """
        if len(points) < self.min_cluster_size:
            return []

        from sklearn.cluster import DBSCAN

        # Perform DBSCAN clustering
        clustering = DBSCAN(
            eps=self.cluster_distance,
            min_samples=max(1, self.min_cluster_size // 10)
        ).fit(points)

        labels = clustering.labels_
        clusters = []

        # Group points by cluster
        unique_labels = set(labels)
        if -1 in unique_labels:
            unique_labels.remove(-1)  # Remove noise points

        for label in unique_labels:
            cluster_points = points[labels == label]
            if len(cluster_points) >= self.min_cluster_size and \
               len(cluster_points) <= self.max_cluster_size:
                clusters.append(cluster_points)

        return clusters


class OccupancyGridBuilder:
    """
    Build occupancy grid map from point cloud
    """
    def __init__(self):
        self.grid_resolution = 0.1  # 10cm resolution
        self.grid_size = 20.0       # 20m x 20m grid

    def build_map(self, points):
        """
        Build simple occupancy grid from points
        """
        if len(points) == 0:
            return []

        # Create grid
        grid_size_cells = int(self.grid_size / self.grid_resolution)
        half_grid = grid_size_cells // 2

        # Convert points to grid coordinates
        grid_points = []
        for point in points:
            x, y, z = point
            grid_x = int(x / self.grid_resolution) + half_grid
            grid_y = int(y / self.grid_resolution) + half_grid

            # Check bounds
            if 0 <= grid_x < grid_size_cells and 0 <= grid_y < grid_size_cells:
                grid_points.append([grid_x * self.grid_resolution,
                                   grid_y * self.grid_resolution,
                                   z])

        return np.array(grid_points)


class DataAssociation:
    """
    Data association for sensor fusion
    """
    def __init__(self):
        self.association_threshold = 0.5  # Maximum distance for association

    def associate_measurements(self, predicted, measured):
        """
        Associate predicted and measured values
        """
        associations = []

        for pred in predicted:
            best_match = None
            best_distance = float('inf')

            for meas in measured:
                distance = np.linalg.norm(pred - meas)

                if distance < self.association_threshold and distance < best_distance:
                    best_distance = distance
                    best_match = meas

            if best_match is not None:
                associations.append((pred, best_match, best_distance))

        return associations


class ConfidenceEstimator:
    """
    Estimate confidence in fusion results
    """
    def __init__(self):
        self.weights = {
            'position_uncertainty': 0.3,
            'orientation_uncertainty': 0.2,
            'sensor_coverage': 0.3,
            'data_consistency': 0.2
        }

    def estimate(self, state, covariance, synchronized_data):
        """
        Estimate confidence in fusion results
        """
        # Calculate uncertainty-based confidence
        position_uncertainty = np.trace(covariance[0:3, 0:3])
        orientation_uncertainty = np.trace(covariance[6:9, 6:9])

        # Calculate sensor coverage confidence
        sensor_data_available = len(synchronized_data) / 3.0  # 3 sensors expected

        # Calculate data consistency confidence
        data_consistency = self.calculate_data_consistency(synchronized_data)

        # Combine confidences
        position_conf = 1.0 / (1.0 + position_uncertainty)
        orientation_conf = 1.0 / (1.0 + orientation_uncertainty)
        coverage_conf = sensor_data_available
        consistency_conf = data_consistency

        confidence = (
            self.weights['position_uncertainty'] * position_conf +
            self.weights['orientation_uncertainty'] * orientation_conf +
            self.weights['sensor_coverage'] * coverage_conf +
            self.weights['data_consistency'] * consistency_conf
        )

        return min(confidence, 1.0)  # Clamp to [0, 1]

    def calculate_data_consistency(self, synchronized_data):
        """
        Calculate consistency between sensor measurements
        """
        # This would typically compare measurements from different sensors
        # that should measure the same thing
        return 1.0  # Placeholder


class SimpleObjectDetector:
    """
    Simple object detector (placeholder for actual model)
    """
    def detect_objects(self, image):
        """
        Detect objects in image
        """
        # This would use an actual object detection model
        # For this example, we'll simulate detections
        detections = []

        # Convert to grayscale for simple detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Find contours (simple shape detection)
        contours, _ = cv2.findContours(
            cv2.Canny(gray, 50, 150),
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 100:  # Minimum area threshold
                # Get bounding box
                x, y, w, h = cv2.boundingRect(contour)

                # Calculate center and depth (simplified)
                center_x = x + w / 2
                center_y = y + h / 2
                depth = 2.0  # Default depth

                detection = {
                    'bbox': [x, y, w, h],
                    'x': center_x,
                    'y': center_y,
                    'z': depth,
                    'class': 'object',
                    'confidence': min(area / 1000.0, 1.0)  # Normalize confidence
                }

                detections.append(detection)

        return detections


class VisualFeatureExtractor:
    """
    Extract visual features for tracking and matching
    """
    def __init__(self):
        self.feature_detector = cv2.ORB_create(nfeatures=500)

    def extract_features(self, image):
        """
        Extract features from image
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        keypoints, descriptors = self.feature_detector.detectAndCompute(gray, None)

        return {
            'keypoints': keypoints,
            'descriptors': descriptors,
            'count': len(keypoints) if keypoints is not None else 0
        }


def main(args=None):
    rclpy.init(args=args)

    # Create perception system node
    perception_node = CompletePerceptionSystem()

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

## Validation and Testing

### Automated Validation Script

Create a comprehensive validation script that tests all aspects of the perception system:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan, Image, Imu
from geometry_msgs.msg import PoseWithCovarianceStamped
import numpy as np
import time


class PerceptionValidator(Node):
    def __init__(self):
        super().__init__('perception_validator')

        # Track sensor data availability
        self.lidar_received = False
        self.camera_received = False
        self.imu_received = False
        self.fused_received = False

        # Track data quality metrics
        self.lidar_quality_score = 0.0
        self.camera_quality_score = 0.0
        self.imu_quality_score = 0.0
        self.fusion_quality_score = 0.0

        # Subscriptions for validation
        self.lidar_subscription = self.create_subscription(
            LaserScan,
            '/lidar/scan',
            self.validate_lidar_data,
            10)

        self.camera_subscription = self.create_subscription(
            Image,
            '/camera/image',
            self.validate_camera_data,
            10)

        self.imu_subscription = self.create_subscription(
            Imu,
            '/imu/data',
            self.validate_imu_data,
            10)

        self.fused_subscription = self.create_subscription(
            PoseWithCovarianceStamped,
            '/perception/fused_pose',
            self.validate_fusion_data,
            10)

        # Timer for periodic validation reports
        self.validation_timer = self.create_timer(
            5.0,  # Validate every 5 seconds
            self.report_validation_status)

        self.get_logger().info('Perception Validator initialized')

    def validate_lidar_data(self, msg):
        self.lidar_received = True

        # Validate LiDAR data quality
        ranges = np.array(msg.ranges)
        valid_ranges = ranges[np.isfinite(ranges)]

        if len(valid_ranges) > 0:
            # Check for reasonable range values
            if np.min(valid_ranges) >= 0.05 and np.max(valid_ranges) <= 15.0:
                self.lidar_quality_score = 0.9  # High quality
            else:
                self.lidar_quality_score = 0.5  # Moderate quality
        else:
            self.lidar_quality_score = 0.0  # No valid data

    def validate_camera_data(self, msg):
        self.camera_received = True

        # Validate camera data (just check if message is properly formatted)
        if msg.width > 0 and msg.height > 0 and len(msg.data) > 0:
            self.camera_quality_score = 0.9  # High quality
        else:
            self.camera_quality_score = 0.0  # Invalid data

    def validate_imu_data(self, msg):
        self.imu_received = True

        # Validate IMU data (check if values are reasonable)
        lin_acc_mag = np.sqrt(
            msg.linear_acceleration.x**2 +
            msg.linear_acceleration.y**2 +
            msg.linear_acceleration.z**2
        )

        if abs(lin_acc_mag - 9.8) < 5.0:  # Reasonable acceleration values
            self.imu_quality_score = 0.9  # High quality
        else:
            self.imu_quality_score = 0.6  # Might be moving, still reasonable

    def validate_fusion_data(self, msg):
        self.fused_received = True

        # Validate fused data (check if pose is reasonable)
        pose = msg.pose.pose
        if abs(pose.position.x) < 100.0 and abs(pose.position.y) < 100.0:
            self.fusion_quality_score = 0.9  # High quality
        else:
            self.fusion_quality_score = 0.5  # Potentially unreasonable

    def report_validation_status(self):
        self.get_logger().info('=== Perception System Validation Report ===')
        self.get_logger().info(f'LiDAR Data: {"RECEIVED" if self.lidar_received else "MISSING"} (Quality: {self.lidar_quality_score:.1f})')
        self.get_logger().info(f'Camera Data: {"RECEIVED" if self.camera_received else "MISSING"} (Quality: {self.camera_quality_score:.1f})')
        self.get_logger().info(f'IMU Data: {"RECEIVED" if self.imu_received else "MISSING"} (Quality: {self.imu_quality_score:.1f})')
        self.get_logger().info(f'Fused Data: {"RECEIVED" if self.fused_received else "MISSING"} (Quality: {self.fusion_quality_score:.1f})')

        # Overall system health
        all_data_present = all([
            self.lidar_received,
            self.camera_received,
            self.imu_received,
            self.fused_received
        ])

        avg_quality = (self.lidar_quality_score + self.camera_quality_score +
                      self.imu_quality_score + self.fusion_quality_score) / 4.0

        if all_data_present and avg_quality >= 0.7:
            self.get_logger().info('✅ PERCEPTION SYSTEM HEALTHY')
        elif all_data_present and avg_quality >= 0.5:
            self.get_logger().info('⚠️ PERCEPTION SYSTEM OPERATIONAL WITH MODERATE QUALITY')
        else:
            self.get_logger().warn('❌ PERCEPTION SYSTEM HAS ISSUES')


def main(args=None):
    rclpy.init(args=args)
    validator = PerceptionValidator()

    try:
        rclpy.spin(validator)
    except KeyboardInterrupt:
        pass
    finally:
        validator.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Performance Optimization

### Optimized Processing Pipeline

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, PointCloud2
from std_msgs.msg import Header
from cv_bridge import CvBridge
import numpy as np
import cv2
from concurrent.futures import ThreadPoolExecutor
import threading
import time


class OptimizedPerceptionSystem(Node):
    """
    Optimized perception system with multi-threading and performance optimizations
    """
    def __init__(self):
        super().__init__('optimized_perception_system')

        # Initialize components
        self.bridge = CvBridge()

        # Declare parameters
        self.declare_parameter('processing_threads', 4)
        self.declare_parameter('enable_multithreading', True)
        self.declare_parameter('processing_rate', 10.0)

        # Get parameters
        self.num_threads = self.get_parameter('processing_threads').value
        self.enable_multithreading = self.get_parameter('enable_multithreading').value
        self.processing_rate = self.get_parameter('processing_rate').value

        # Initialize thread pool if enabled
        self.executor = ThreadPoolExecutor(max_workers=self.num_threads) if self.enable_multithreading else None

        # Initialize processing modules
        self.visual_processor = OptimizedVisualProcessor()
        self.lidar_processor = OptimizedLiDARProcessor()

        # Data queues for asynchronous processing
        self.camera_queue = queue.Queue(maxsize=5)
        self.lidar_queue = queue.Queue(maxsize=5)

        # Processing locks
        self.processing_lock = threading.Lock()

        # Performance metrics
        self.performance_metrics = {
            'camera_processing_time': [],
            'lidar_processing_time': [],
            'fusion_processing_time': [],
            'average_fps': 0.0
        }

        # Create subscriptions
        self.camera_sub = self.create_subscription(
            Image,
            '/camera/image',
            self.optimized_camera_callback,
            10
        )

        self.lidar_sub = self.create_subscription(
            PointCloud2,
            '/lidar_3d/points',
            self.optimized_lidar_callback,
            10
        )

        # Create publishers
        self.results_pub = self.create_publisher(
            String,
            '/perception/optimized_results',
            10
        )

        # Timer for performance monitoring
        self.performance_timer = self.create_timer(
            1.0,  # Every second
            self.performance_monitoring_callback
        )

        self.get_logger().info(f'Optimized Perception System initialized with {self.num_threads} threads')

    def optimized_camera_callback(self, msg):
        """
        Optimized camera callback with multithreading
        """
        try:
            # Convert ROS Image to OpenCV (do this in main thread to avoid ROS issues)
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Process in thread pool if enabled
            if self.enable_multithreading and self.executor:
                future = self.executor.submit(
                    self.visual_processor.process_image_optimized,
                    cv_image,
                    msg.header
                )
                # Optionally store future for later retrieval
            else:
                # Process in main thread
                results = self.visual_processor.process_image_optimized(cv_image, msg.header)
                self.publish_results(results, msg.header)

        except Exception as e:
            self.get_logger().error(f'Error in optimized camera callback: {e}')

    def optimized_lidar_callback(self, msg):
        """
        Optimized LiDAR callback with multithreading
        """
        try:
            # Extract point cloud data
            points_list = []
            for point in point_cloud2.read_points(msg, field_names=['x', 'y', 'z'], skip_nans=True):
                points_list.append([point[0], point[1], point[2]])

            if len(points_list) > 0:
                points = np.array(points_list)

                # Process in thread pool if enabled
                if self.enable_multithreading and self.executor:
                    future = self.executor.submit(
                        self.lidar_processor.process_point_cloud_optimized,
                        points,
                        msg.header
                    )
                else:
                    # Process in main thread
                    results = self.lidar_processor.process_point_cloud_optimized(points, msg.header)
                    self.publish_results(results, msg.header)

        except Exception as e:
            self.get_logger().error(f'Error in optimized LiDAR callback: {e}')

    def publish_results(self, results, header):
        """
        Publish perception results
        """
        try:
            result_msg = String()
            result_msg.data = json.dumps({
                'timestamp': header.stamp.sec + header.stamp.nanosec * 1e-9,
                'results': results
            })
            self.results_pub.publish(result_msg)

        except Exception as e:
            self.get_logger().error(f'Error publishing results: {e}')

    def performance_monitoring_callback(self):
        """
        Monitor and report performance metrics
        """
        if self.performance_metrics['camera_processing_time']:
            avg_camera_time = np.mean(self.performance_metrics['camera_processing_time'])
            self.get_logger().info(f'Avg camera processing time: {avg_camera_time:.4f}s')

        if self.performance_metrics['lidar_processing_time']:
            avg_lidar_time = np.mean(self.performance_metrics['lidar_processing_time'])
            self.get_logger().info(f'Avg LiDAR processing time: {avg_lidar_time:.4f}s')

        if self.performance_metrics['fusion_processing_time']:
            avg_fusion_time = np.mean(self.performance_metrics['fusion_processing_time'])
            self.get_logger().info(f'Avg fusion processing time: {avg_fusion_time:.4f}s')


class OptimizedVisualProcessor:
    """
    Optimized visual processing with performance enhancements
    """
    def __init__(self):
        # Initialize optimized models and resources
        self.initialize_optimized_models()

    def initialize_optimized_models(self):
        """
        Initialize optimized models with performance enhancements
        """
        # Use optimized OpenCV functions
        self.detector = cv2.ORB_create(nfeatures=200)  # Reduced features for speed
        self.matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)

    def process_image_optimized(self, image, header):
        """
        Optimized image processing with performance enhancements
        """
        start_time = time.time()

        # Resize image if too large (reduce computational load)
        h, w = image.shape[:2]
        if h > 640 or w > 640:
            scale = min(640.0/h, 640.0/w)
            new_w, new_h = int(w * scale), int(h * scale)
            image = cv2.resize(image, (new_w, new_h))

        # Convert to grayscale efficiently
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        # Extract features efficiently
        keypoints, descriptors = self.detector.detectAndCompute(gray, None)

        # Perform detection (optimized version)
        detections = self.fast_object_detection(gray)

        # Calculate processing time
        processing_time = time.time() - start_time

        results = {
            'detections': detections,
            'features': {
                'keypoint_count': len(keypoints) if keypoints else 0,
                'descriptor_shape': descriptors.shape if descriptors is not None else (0, 0)
            },
            'processing_time': processing_time,
            'image_shape': image.shape
        }

        return results

    def fast_object_detection(self, gray_image):
        """
        Fast object detection using optimized methods
        """
        detections = []

        # Use simple but fast detection methods
        # For example, simple shape detection
        edges = cv2.Canny(gray_image, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 50:  # Minimum area threshold
                x, y, w, h = cv2.boundingRect(contour)
                detections.append({
                    'bbox': [x, y, w, h],
                    'area': area,
                    'confidence': min(area / 1000.0, 1.0)  # Normalize confidence
                })

        return detections


class OptimizedLiDARProcessor:
    """
    Optimized LiDAR processing with performance enhancements
    """
    def __init__(self):
        # Initialize optimized processing components
        self.initialize_optimized_components()

    def initialize_optimized_components(self):
        """
        Initialize optimized LiDAR processing components
        """
        # Use efficient algorithms and data structures
        pass

    def process_point_cloud_optimized(self, points, header):
        """
        Optimized point cloud processing with performance enhancements
        """
        start_time = time.time()

        # Perform fast ground segmentation
        ground_points, obstacle_points = self.fast_ground_segmentation(points)

        # Perform efficient clustering
        clusters = self.fast_clustering(obstacle_points)

        # Calculate processing time
        processing_time = time.time() - start_time

        results = {
            'ground_points_count': len(ground_points),
            'obstacle_points_count': len(obstacle_points),
            'cluster_count': len(clusters),
            'clusters': [{'size': len(cluster), 'centroid': np.mean(cluster, axis=0).tolist() if len(cluster) > 0 else [0, 0, 0]} for cluster in clusters],
            'processing_time': processing_time
        }

        return results

    def fast_ground_segmentation(self, points):
        """
        Fast ground segmentation using efficient method
        """
        # Simple height-based segmentation for speed
        # In practice, you might use more sophisticated but still fast methods
        ground_threshold = 0.1
        ground_mask = points[:, 2] < ground_threshold
        ground_points = points[ground_mask]
        obstacle_points = points[~ground_mask]

        return ground_points, obstacle_points

    def fast_clustering(self, points):
        """
        Fast clustering using efficient algorithm
        """
        if len(points) < 10:
            return []

        # Use a fast clustering algorithm
        # For this example, we'll use a simple grid-based approach
        grid_size = 0.5  # 50cm grid
        grid = {}

        for point in points:
            grid_key = (int(point[0] / grid_size), int(point[1] / grid_size))
            if grid_key not in grid:
                grid[grid_key] = []
            grid[grid_key].append(point)

        # Group adjacent grids to form clusters
        clusters = []
        for cluster_points in grid.values():
            if len(cluster_points) >= 5:  # Minimum cluster size
                clusters.append(np.array(cluster_points))

        return clusters


def main(args=None):
    rclpy.init(args=args)

    # Create optimized perception system
    perception_node = OptimizedPerceptionSystem()

    try:
        rclpy.spin(perception_node)
    except KeyboardInterrupt:
        pass
    finally:
        if perception_node.executor:
            perception_node.executor.shutdown(wait=True)
        perception_node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Best Practices for Integration

### 1. Resource Management

```python
#!/usr/bin/env python3
import psutil
import GPUtil
import threading
import time


class ResourceManager:
    """
    Manage system resources for perception system
    """
    def __init__(self, node):
        self.node = node
        self.resource_thresholds = {
            'cpu_usage': 80.0,    # Percentage
            'memory_usage': 80.0, # Percentage
            'gpu_memory': 80.0    # Percentage
        }

        # Start resource monitoring
        self.monitoring_thread = threading.Thread(target=self.monitor_resources, daemon=True)
        self.monitoring_thread.start()

    def monitor_resources(self):
        """
        Monitor system resources and adjust processing accordingly
        """
        while True:
            # Check CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            memory_percent = psutil.virtual_memory().percent

            # Check GPU usage if available
            gpu_memory_percent = 0.0
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu_memory_percent = gpus[0].memoryUtil * 100

            # Log resource usage
            self.node.get_logger().debug(
                f'CPU: {cpu_percent:.1f}%, Memory: {memory_percent:.1f}%, GPU: {gpu_memory_percent:.1f}%'
            )

            # Adjust processing if resources are high
            if (cpu_percent > self.resource_thresholds['cpu_usage'] or
                memory_percent > self.resource_thresholds['memory_usage'] or
                gpu_memory_percent > self.resource_thresholds['gpu_memory']):

                self.node.get_logger().warn('High resource usage detected, considering processing reduction')

            time.sleep(5)  # Check every 5 seconds
```

## Next Steps

After implementing the complete integration examples:

1. Create comprehensive testing suites for all perception modules
2. Implement advanced fusion algorithms like particle filters or neural networks
3. Add more sophisticated validation and error handling
4. Test the complete system in various real-world scenarios
5. Optimize for different computational platforms (embedded, edge, cloud)

## References

1. Thrun, S., Burgard, W., & Fox, D. (2005). *Probabilistic Robotics*. MIT Press. Chapter 4 covers sensor models and perception.

2. Siegwart, R., Nourbakhsh, I. R., & Scaramuzza, D. (2011). *Introduction to Autonomous Mobile Robots*. MIT Press. Chapter 6 covers perception systems.

3. Sibley, G., Mei, C., Baldwin, G., & Mahon, I. (2010). On the performance of camera-inertial calibration. *IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)*, 5441-5446.

4. Huang, A. S., Bachrach, A., Henry, P., Krainin, M., Maturana, D., Ren, X., & Fox, D. (2011). Visual odometry and mapping for autonomous flight using an RGB-D camera. *International Symposium on Experimental Robotics (ISER)*, 235-246.

5. Kelly, J., & Sukhatme, G. S. (2011). Visual-inertial sensor fusion: Localization, mapping and sensor-to-sensor self-calibration. *The International Journal of Robotics Research*, 30(1), 56-79.

---

This guide provides comprehensive integration examples for perception and sensor fusion systems. The examples demonstrate how to combine visual, LiDAR, and IMU data into a cohesive perception pipeline that can be used for humanoid robotics applications.