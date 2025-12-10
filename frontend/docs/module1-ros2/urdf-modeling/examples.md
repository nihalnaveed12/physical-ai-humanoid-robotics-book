---
sidebar_position: 3
---

# URDF Modeling Examples

This section provides practical examples of URDF models, from simple to complex, with a focus on humanoid robotics applications.

## Example 1: Simple Wheeled Robot

Let's start with a simple mobile robot to understand basic URDF concepts:

```xml
<?xml version="1.0"?>
<robot name="simple_robot">
  <!-- Base link -->
  <link name="base_link">
    <visual>
      <origin xyz="0 0 0.1" rpy="0 0 0"/>
      <geometry>
        <box size="0.5 0.3 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0.1" rpy="0 0 0"/>
      <geometry>
        <box size="0.5 0.3 0.2"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 0.1" rpy="0 0 0"/>
      <inertia ixx="0.05" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Left wheel -->
  <link name="left_wheel">
    <visual>
      <origin xyz="0 0 0" rpy="1.5708 0 0"/>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="1.5708 0 0"/>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.2"/>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.002"/>
    </inertial>
  </link>

  <!-- Right wheel -->
  <link name="right_wheel">
    <visual>
      <origin xyz="0 0 0" rpy="1.5708 0 0"/>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="1.5708 0 0"/>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.2"/>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.002"/>
    </inertial>
  </link>

  <!-- Joints -->
  <joint name="left_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="left_wheel"/>
    <origin xyz="0.15 0.2 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>

  <joint name="right_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="right_wheel"/>
    <origin xyz="0.15 -0.2 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>
</robot>
```

## Example 2: Simple Humanoid Torso

A basic humanoid torso with head:

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid_torso">
  <!-- Torso -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.3 0.25 0.6"/>
      </geometry>
      <material name="body_color">
        <color rgba="0.8 0.8 0.8 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.3 0.25 0.6"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="5.0"/>
      <origin xyz="0 0 0.1"/>
      <inertia ixx="0.2" ixy="0" ixz="0" iyy="0.2" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Head -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.12"/>
      </geometry>
      <material name="skin_color">
        <color rgba="1 0.8 0.6 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.12"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.5"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.01"/>
    </inertial>
  </link>

  <!-- Neck joint -->
  <joint name="neck_joint" type="revolute">
    <parent link="base_link"/>
    <child link="head"/>
    <origin xyz="0 0 0.35" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-0.7" upper="0.7" effort="5" velocity="2"/>
  </joint>

  <!-- Left shoulder -->
  <link name="left_shoulder">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.1"/>
      </geometry>
      <material name="joint_color">
        <color rgba="0.3 0.3 0.3 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.05" length="0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.3"/>
      <inertia ixx="0.0005" ixy="0" ixz="0" iyy="0.0005" iyz="0" izz="0.0002"/>
    </inertial>
  </link>

  <joint name="left_shoulder_joint" type="revolute">
    <parent link="base_link"/>
    <child link="left_shoulder"/>
    <origin xyz="0.17 0.1 0.2" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="2"/>
  </joint>

  <!-- Right shoulder (using mirror) -->
  <link name="right_shoulder">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.1"/>
      </geometry>
      <material name="joint_color">
        <color rgba="0.3 0.3 0.3 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.05" length="0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.3"/>
      <inertia ixx="0.0005" ixy="0" ixz="0" iyy="0.0005" iyz="0" izz="0.0002"/>
    </inertial>
  </link>

  <joint name="right_shoulder_joint" type="revolute">
    <parent link="base_link"/>
    <child link="right_shoulder"/>
    <origin xyz="0.17 -0.1 0.2" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="2"/>
  </joint>
</robot>
```

## Example 3: Complete Humanoid with Xacro

Using Xacro to create a more complex humanoid efficiently:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="xacro_humanoid">
  <xacro:property name="M_PI" value="3.14159265359"/>
  <xacro:property name="torso_height" value="0.6"/>
  <xacro:property name="torso_width" value="0.3"/>
  <xacro:property name="torso_depth" value="0.25"/>

  <!-- Inertial macro -->
  <xacro:macro name="default_inertial" params="mass">
    <inertial>
      <mass value="${mass}" />
      <inertia ixx="1.0" ixy="0.0" ixz="0.0" iyy="1.0" iyz="0.0" izz="1.0" />
    </inertial>
  </xacro:macro>

  <!-- Arm macro -->
  <xacro:macro name="arm" params="side reflect">
    <!-- Shoulder -->
    <link name="${side}_shoulder">
      <visual>
        <geometry>
          <cylinder radius="0.04" length="0.08"/>
        </geometry>
        <material name="dark_gray">
          <color rgba="0.3 0.3 0.3 1"/>
        </material>
      </visual>
      <collision>
        <geometry>
          <cylinder radius="0.04" length="0.08"/>
        </geometry>
      </collision>
      <xacro:default_inertial mass="0.5"/>
    </link>

    <joint name="${side}_shoulder_joint" type="revolute">
      <parent link="torso"/>
      <child link="${side}_shoulder"/>
      <origin xyz="0.17 ${0.11 * reflect} 0.2" rpy="0 0 0"/>
      <axis xyz="0 0 1"/>
      <limit lower="${-90 * M_PI / 180}" upper="${90 * M_PI / 180}" effort="20" velocity="2"/>
    </joint>

    <!-- Upper arm -->
    <link name="${side}_upper_arm">
      <visual>
        <geometry>
          <cylinder radius="0.04" length="0.3"/>
        </geometry>
        <material name="arm_color">
          <color rgba="0.7 0.7 0.7 1"/>
        </material>
      </visual>
      <collision>
        <geometry>
          <cylinder radius="0.04" length="0.3"/>
        </geometry>
      </collision>
      <xacro:default_inertial mass="0.8"/>
    </link>

    <joint name="${side}_elbow_joint" type="revolute">
      <parent link="${side}_shoulder"/>
      <child link="${side}_upper_arm"/>
      <origin xyz="0 ${0.05 * reflect} -0.1" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>
      <limit lower="0" upper="${160 * M_PI / 180}" effort="20" velocity="2"/>
    </joint>

    <!-- Lower arm -->
    <link name="${side}_lower_arm">
      <visual>
        <geometry>
          <cylinder radius="0.03" length="0.25"/>
        </geometry>
        <material name="arm_color">
          <color rgba="0.7 0.7 0.7 1"/>
        </material>
      </visual>
      <collision>
        <geometry>
          <cylinder radius="0.03" length="0.25"/>
        </geometry>
      </collision>
      <xacro:default_inertial mass="0.6"/>
    </link>

    <joint name="${side}_wrist_joint" type="revolute">
      <parent link="${side}_upper_arm"/>
      <child link="${side}_lower_arm"/>
      <origin xyz="0 ${0.05 * reflect} -0.25" rpy="0 0 0"/>
      <axis xyz="0 0 1"/>
      <limit lower="${-90 * M_PI / 180}" upper="${90 * M_PI / 180}" effort="10" velocity="2"/>
    </joint>
  </xacro:macro>

  <!-- Torso -->
  <link name="torso">
    <visual>
      <geometry>
        <box size="${torso_width} ${torso_depth} ${torso_height}"/>
      </geometry>
      <material name="body_color">
        <color rgba="0.8 0.8 0.8 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="${torso_width} ${torso_depth} ${torso_height}"/>
      </geometry>
    </collision>
    <xacro:default_inertial mass="8.0"/>
  </link>

  <!-- Head -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
      <material name="skin_color">
        <color rgba="1 0.8 0.6 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
    </collision>
    <xacro:default_inertial mass="1.0"/>
  </link>

  <joint name="neck_joint" type="revolute">
    <parent link="torso"/>
    <child link="head"/>
    <origin xyz="0 0 ${torso_height/2 + 0.1}" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="${-30 * M_PI / 180}" upper="${30 * M_PI / 180}" effort="5" velocity="1"/>
  </joint>

  <!-- Create both arms using the macro -->
  <xacro:arm side="left" reflect="1"/>
  <xacro:arm side="right" reflect="-1"/>

  <!-- Add legs similarly... -->
  <xacro:macro name="leg" params="side reflect">
    <!-- Hip -->
    <link name="${side}_hip">
      <visual>
        <geometry>
          <cylinder radius="0.05" length="0.1"/>
        </geometry>
        <material name="dark_gray">
          <color rgba="0.3 0.3 0.3 1"/>
        </material>
      </visual>
      <collision>
        <geometry>
          <cylinder radius="0.05" length="0.1"/>
        </geometry>
      </collision>
      <xacro:default_inertial mass="0.8"/>
    </link>

    <joint name="${side}_hip_joint" type="revolute">
      <parent link="torso"/>
      <child link="${side}_hip"/>
      <origin xyz="-0.15 ${0.08 * reflect} 0" rpy="0 0 0"/>
      <axis xyz="0 0 1"/>
      <limit lower="${-45 * M_PI / 180}" upper="${45 * M_PI / 180}" effort="30" velocity="1.5"/>
    </joint>

    <!-- Thigh -->
    <link name="${side}_thigh">
      <visual>
        <geometry>
          <cylinder radius="0.05" length="0.4"/>
        </geometry>
        <material name="leg_color">
          <color rgba="0.6 0.6 0.6 1"/>
        </material>
      </visual>
      <collision>
        <geometry>
          <cylinder radius="0.05" length="0.4"/>
        </geometry>
      </collision>
      <xacro:default_inertial mass="1.5"/>
    </link>

    <joint name="${side}_knee_joint" type="revolute">
      <parent link="${side}_hip"/>
      <child link="${side}_thigh"/>
      <origin xyz="0 0 -0.4" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>
      <limit lower="0" upper="${130 * M_PI / 180}" effort="30" velocity="1.5"/>
    </joint>

    <!-- Shank -->
    <link name="${side}_shank">
      <visual>
        <geometry>
          <cylinder radius="0.045" length="0.4"/>
        </geometry>
        <material name="leg_color">
          <color rgba="0.6 0.6 0.6 1"/>
        </material>
      </visual>
      <collision>
        <geometry>
          <cylinder radius="0.045" length="0.4"/>
        </geometry>
      </collision>
      <xacro:default_inertial mass="1.2"/>
    </link>

    <joint name="${side}_ankle_joint" type="revolute">
      <parent link="${side}_thigh"/>
      <child link="${side}_shank"/>
      <origin xyz="0 0 -0.4" rpy="0 0 0"/>
      <axis xyz="0 0 1"/>
      <limit lower="${-30 * M_PI / 180}" upper="${30 * M_PI / 180}" effort="20" velocity="1"/>
    </joint>

    <!-- Foot -->
    <link name="${side}_foot">
      <visual>
        <geometry>
          <box size="0.18 0.08 0.06"/>
        </geometry>
        <material name="foot_color">
          <color rgba="0.2 0.2 0.2 1"/>
        </material>
      </visual>
      <collision>
        <geometry>
          <box size="0.18 0.08 0.06"/>
        </geometry>
      </collision>
      <xacro:default_inertial mass="0.5"/>
    </link>

    <joint name="${side}_foot_joint" type="revolute">
      <parent link="${side}_shank"/>
      <child link="${side}_foot"/>
      <origin xyz="0 0 -0.08" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>
      <limit lower="${-20 * M_PI / 180}" upper="${20 * M_PI / 180}" effort="15" velocity="1"/>
    </joint>
  </xacro:macro>

  <!-- Create both legs -->
  <xacro:leg side="left" reflect="1"/>
  <xacro:leg side="right" reflect="-1"/>
</robot>
```

## Example 4: Using URDF with ROS

Loading and using URDF in ROS:

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState
from tf2_ros import TransformBroadcaster
from geometry_msgs.msg import TransformStamped

class URDFRobotSimulator(Node):
    def __init__(self):
        super().__init__('urdf_robot_simulator')

        # Publisher for joint states
        self.joint_pub = self.create_publisher(JointState, 'joint_states', 10)

        # Transform broadcaster for TF
        self.tf_broadcaster = TransformBroadcaster(self)

        # Timer to publish state
        self.timer = self.create_timer(0.1, self.publish_joint_states)

        # Initialize joint positions
        self.joint_names = [
            'neck_joint', 'left_shoulder_joint', 'left_elbow_joint',
            'right_shoulder_joint', 'right_elbow_joint', 'left_hip_joint',
            'left_knee_joint', 'left_ankle_joint', 'right_hip_joint',
            'right_knee_joint', 'right_ankle_joint'
        ]
        self.joint_positions = [0.0] * len(self.joint_names)

    def publish_joint_states(self):
        # Create joint state message
        msg = JointState()
        msg.name = self.joint_names
        msg.position = self.joint_positions
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = 'base_link'

        self.joint_pub.publish(msg)

        # Update joint positions (for simulation)
        for i in range(len(self.joint_positions)):
            self.joint_positions[i] += 0.01

def main(args=None):
    rclpy.init(args=args)
    node = URDFRobotSimulator()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Validation and Testing

### Validating URDF Files
Always validate your URDF files:

```bash
# Check the URDF file
check_urdf your_robot.urdf

# Or if using Xacro
ros2 run xacro xacro your_robot.urdf.xacro > output.urdf
check_urdf output.urdf
```

### Visualizing URDF
Use RViz to visualize your robot:

```bash
# Launch RViz with robot state publisher
ros2 run robot_state_publisher robot_state_publisher --ros-args -p robot_description:='$(cat your_robot.urdf)'
rviz2
```

These examples demonstrate how to create URDF models from simple to complex, with a focus on humanoid robotics applications. Use these as templates for your own robot models.