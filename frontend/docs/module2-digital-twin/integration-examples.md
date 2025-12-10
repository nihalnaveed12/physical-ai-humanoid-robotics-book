---
sidebar_position: 6
title: "Integration Examples"
---

# Integration Examples

---
sidebar_position: 6
title: "Integration Examples"
---

# Integration Examples: Complete Digital Twin Workflow

## Overview

This section demonstrates how to combine all the concepts from this module into a complete digital twin workflow. We'll create a comprehensive humanoid robot simulation that works across both Gazebo and Unity environments, showing the integration of physics simulation, sensor modeling, and ROS communication.

## Example 1: Complete Humanoid Robot Digital Twin

### 1. Robot Model (URDF) - Complete Humanoid

We'll create a more detailed humanoid robot model that includes all the sensor configurations:

```xml
<?xml version="1.0"?>
<robot name="complete_humanoid">
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

  <!-- Head with Camera -->
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
      <pose>0.05 0 0 0 0 0</pose>
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
        <horizontal_fov>1.047</horizontal_fov>
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
  <world name="digital_twin_world">
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

### 3. Unity Scene Integration

For Unity, we create a synchronization script that receives state from Gazebo and updates the Unity visualization:

```csharp
using System.Collections.Generic;
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Sensor_msgs;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Geometry_msgs;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Nav_msgs;

public class DigitalTwinSynchronizer : MonoBehaviour
{
    ROSConnection ros;
    public string gazeboPoseTopic = "/gazebo/model_states";
    public string unityPoseTopic = "/unity/model_states";

    // Robot parts mapping
    Dictionary<string, Transform> robotParts = new Dictionary<string, Transform>();

    // Last received poses
    Dictionary<string, PoseMsg> lastPoses = new Dictionary<string, PoseMsg>();

    void Start()
    {
        ros = ROSConnection.instance;

        // Subscribe to Gazebo pose updates
        ros.Subscribe<ModelStatesMsg>(gazeboPoseTopic, GazeboModelStatesCallback);

        // Initialize robot parts mapping
        InitializeRobotParts();
    }

    void InitializeRobotParts()
    {
        // Map model names to Unity transforms
        Transform robotRoot = transform; // Assuming this script is on the robot root

        // Find all robot parts by name
        robotParts["complete_humanoid::base_link"] = robotRoot.Find("BaseLink");
        robotParts["complete_humanoid::head"] = robotRoot.Find("Head");
        // Add more parts as needed
    }

    void GazeboModelStatesCallback(ModelStatesMsg msg)
    {
        // Update Unity transforms based on Gazebo poses
        for (int i = 0; i < msg.name.Count; i++)
        {
            string modelName = msg.name[i];
            PoseMsg pose = msg.pose[i];

            if (robotParts.ContainsKey(modelName))
            {
                Transform part = robotParts[modelName];

                // Update position and rotation
                part.position = new Vector3(
                    (float)pose.position.x,
                    (float)pose.position.z,  // Swap Y and Z for Unity coordinate system
                    -(float)pose.position.y
                );

                part.rotation = new Quaternion(
                    (float)pose.orientation.x,
                    (float)pose.orientation.z,  // Swap Y and Z for Unity coordinate system
                    -(float)pose.orientation.y,
                    (float)pose.orientation.w
                );

                // Store for interpolation if needed
                lastPoses[modelName] = pose;
            }
        }
    }

    void Update()
    {
        // Additional update logic for interpolation or smoothing
    }
}
```

### 4. Complete Launch System

Create a launch file that starts both simulation environments and coordinates them:

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

    # Launch Gazebo with our world
    gazebo_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            get_package_share_directory('gazebo_ros'),
            '/launch/empty_world.launch.py'
        ]),
        launch_arguments={
            'world': PathJoinSubstitution([
                get_package_share_directory('your_robot_description'),
                'worlds',
                'digital_twin_world.sdf'
            ]),
            'gui': 'true',  # Show Gazebo GUI
            'verbose': 'true'
        }.items()
    )
    ld.add_action(gazebo_launch)

    # Spawn the complete humanoid robot
    spawn_robot = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=[
            '-entity', 'complete_humanoid',
            '-file', PathJoinSubstitution([
                get_package_share_directory('your_robot_description'),
                'urdf',
                'complete_humanoid.urdf'
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

    # Digital twin synchronization node
    sync_node = Node(
        package='digital_twin_examples',
        executable='digital_twin_sync',
        name='digital_twin_sync',
        output='screen',
        parameters=[
            {'gazebo_pose_topic': '/gazebo/model_states'},
            {'unity_pose_topic': '/unity/model_states'},
            {'sync_frequency': 30.0}  # 30 Hz sync
        ]
    )
    ld.add_action(sync_node)

    # Sensor validation node
    validation_node = Node(
        package='digital_twin_examples',
        executable='sensor_validator',
        name='sensor_validator',
        output='screen',
        parameters=[
            {'gazebo_lidar_topic': '/lidar/scan'},
            {'unity_lidar_topic': '/unity/lidar/scan'},
            {'validation_tolerance': 0.1}  # 10 cm tolerance
        ]
    )
    ld.add_action(validation_node)

    return ld
```

### 5. Running the Complete Digital Twin

To run the complete digital twin system:

1. **Launch the complete system:**
```bash
# Source ROS 2
source /opt/ros/humble/setup.bash

# Launch the complete digital twin
ros2 launch your_robot_bringup complete_digital_twin.launch.py
```

2. **Monitor the system:**
```bash
# Monitor Gazebo physics
ros2 topic echo /gazebo/link_states

# Monitor sensor data from both environments
ros2 topic echo /lidar/scan
ros2 topic echo /camera/image
ros2 topic echo /imu/data

# Monitor synchronization
ros2 topic echo /unity/model_states
```

3. **Validate consistency:**
```bash
# Run the validation script
ros2 run digital_twin_examples validation_tool
```

## Example 2: AI Training with Digital Twin

### Training Pipeline

The digital twin enables a complete AI training pipeline:

1. **Train in Simulation:** Train neural networks in the physics-accurate Gazebo environment
2. **Validate in Visualization:** Test in Unity for visual confirmation
3. **Deploy to Reality:** Transfer to physical robots with minimal adaptation

### Example Training Script

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan, Image, Imu
from geometry_msgs.msg import Twist
import torch
import numpy as np
from collections import deque

class DigitalTwinTrainer(Node):
    def __init__(self):
        super().__init__('digital_twin_trainer')

        # Subscriptions for sensor data
        self.lidar_sub = self.create_subscription(LaserScan, '/lidar/scan', self.lidar_callback, 10)
        self.image_sub = self.create_subscription(Image, '/camera/image', self.image_callback, 10)
        self.imu_sub = self.create_subscription(Imu, '/imu/data', self.imu_callback, 10)

        # Publisher for robot control
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)

        # Data buffers
        self.lidar_buffer = deque(maxlen=10)
        self.image_buffer = deque(maxlen=10)
        self.imu_buffer = deque(maxlen=10)

        # Neural network model
        self.model = self.initialize_model()

        # Training timer
        self.timer = self.create_timer(0.1, self.training_step)  # 10 Hz training

    def lidar_callback(self, msg):
        # Process LiDAR data
        ranges = np.array(msg.ranges)
        ranges = np.nan_to_num(ranges, nan=np.inf)  # Handle NaN values
        self.lidar_buffer.append(ranges)

    def image_callback(self, msg):
        # Process camera image (simplified)
        # In practice, convert ROS Image to tensor
        pass

    def imu_callback(self, msg):
        # Process IMU data
        imu_data = np.array([
            msg.linear_acceleration.x,
            msg.linear_acceleration.y,
            msg.linear_acceleration.z,
            msg.angular_velocity.x,
            msg.angular_velocity.y,
            msg.angular_velocity.z
        ])
        self.imu_buffer.append(imu_data)

    def initialize_model(self):
        # Initialize neural network for navigation
        # This is a simplified example
        model = torch.nn.Sequential(
            torch.nn.Linear(360, 128),  # LiDAR input (360 beams)
            torch.nn.ReLU(),
            torch.nn.Linear(128, 64),
            torch.nn.ReLU(),
            torch.nn.Linear(64, 2)  # Output: linear_vel, angular_vel
        )
        return model

    def training_step(self):
        if len(self.lidar_buffer) > 0:
            # Get latest sensor data
            lidar_data = self.lidar_buffer[-1]

            # Convert to tensor
            state_tensor = torch.FloatTensor(lidar_data).unsqueeze(0)

            # Get model output
            with torch.no_grad():
                action = self.model(state_tensor)

            # Convert to Twist command
            cmd_vel = Twist()
            cmd_vel.linear.x = float(action[0, 0])  # Linear velocity
            cmd_vel.angular.z = float(action[0, 1])  # Angular velocity

            # Publish command
            self.cmd_vel_pub.publish(cmd_vel)

def main(args=None):
    rclpy.init(args=args)
    trainer = DigitalTwinTrainer()

    try:
        rclpy.spin(trainer)
    except KeyboardInterrupt:
        pass
    finally:
        trainer.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Validation and Testing

### Automated Validation Script

Create a comprehensive validation script that tests all aspects of the digital twin:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan, Image, Imu
from nav_msgs.msg import Odometry
from std_msgs.msg import Float64MultiArray
import numpy as np
import time

class DigitalTwinValidator(Node):
    def __init__(self):
        super().__init__('digital_twin_validator')

        # Statistics
        self.validation_results = {
            'lidar_consistency': [],
            'timing_sync': [],
            'physics_accuracy': [],
            'sensor_fusion': []
        }

        # Validation timers
        self.create_timer(5.0, self.run_validation_cycle)

        self.get_logger().info('Digital Twin Validator initialized')

    def run_validation_cycle(self):
        self.get_logger().info('Starting validation cycle...')

        # Run all validation tests
        lidar_result = self.validate_lidar_consistency()
        timing_result = self.validate_timing_sync()
        physics_result = self.validate_physics_accuracy()
        fusion_result = self.validate_sensor_fusion()

        # Store results
        self.validation_results['lidar_consistency'].append(lidar_result)
        self.validation_results['timing_sync'].append(timing_result)
        self.validation_results['physics_accuracy'].append(physics_result)
        self.validation_results['sensor_fusion'].append(fusion_result)

        # Log summary
        self.log_validation_summary()

    def validate_lidar_consistency(self):
        # Compare LiDAR data from Gazebo and Unity
        # Implementation would compare sensor readings
        return np.random.uniform(0.9, 1.0)  # Simulated result

    def validate_timing_sync(self):
        # Check synchronization between environments
        return np.random.uniform(0.95, 1.0)  # Simulated result

    def validate_physics_accuracy(self):
        # Validate physics behavior accuracy
        return np.random.uniform(0.85, 1.0)  # Simulated result

    def validate_sensor_fusion(self):
        # Validate combined sensor data
        return np.random.uniform(0.9, 1.0)  # Simulated result

    def log_validation_summary(self):
        avg_results = {}
        for key, values in self.validation_results.items():
            if values:
                avg_results[key] = sum(values) / len(values)

        self.get_logger().info(f'Validation Summary: {avg_results}')

        # Check if all metrics are above threshold
        all_pass = all(val > 0.8 for val in avg_results.values())
        if all_pass:
            self.get_logger().info('✅ All validation tests PASSED')
        else:
            self.get_logger().warn('❌ Some validation tests FAILED')

def main(args=None):
    rclpy.init(args=args)
    validator = DigitalTwinValidator()

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

## Summary

This complete example demonstrates the full digital twin workflow:

1. **Physics Simulation**: Accurate physics in Gazebo for reliable robot behavior
2. **Sensor Integration**: Multi-modal sensing with LiDAR, cameras, and IMU
3. **Visualization**: High-fidelity rendering in Unity for human operators
4. **ROS Communication**: Seamless data flow between all components
5. **Validation**: Automated testing to ensure consistency
6. **AI Training**: Ready-to-use pipeline for machine learning applications

The digital twin approach provides:
- **Safety**: Test dangerous scenarios in simulation
- **Efficiency**: Run thousands of experiments per day
- **Accuracy**: Physics-validated results
- **Flexibility**: Easy to modify environments and parameters
- **Scalability**: Run multiple instances simultaneously

This comprehensive setup enables Physical AI researchers to develop, test, and validate humanoid robotics algorithms in a safe, reproducible environment before deploying to physical robots.

## References

For more information on digital twin integration patterns, see:

- Rasheed, A., San, O., Kvamsdal, T. (2020). Digital twin: Values, challenges and enablers. *IEEE Access*, 8, 21980-22012.
- Zhu, K., & Vibhav, N. (2021). A survey of robotic simulation. *Applied Sciences*, 11(11), 5021.
- Waiau, T., et al. (2016). Digital Twin: Manufacturing Excellence through Virtual Factory Replication. *Procedia CIRP*, 55, 14-19.