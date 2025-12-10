---
sidebar_position: 2
---

# Humanoid Robot URDF

Creating URDF models for humanoid robots presents unique challenges compared to wheeled or simple articulated robots. Humanoid robots have complex kinematics with multiple degrees of freedom designed to mimic human movement.

## Humanoid Robot Structure

A typical humanoid robot consists of:

- **Torso**: The central body containing main processors and power
- **Head**: With sensors (cameras, IMU) and possibly a display
- **Arms**: Shoulders, elbows, wrists, and often articulated hands
- **Legs**: Hips, knees, ankles, and feet
- **Joints**: Multiple revolute joints to enable human-like movement

## Key Considerations for Humanoid URDF

### Kinematic Chains
Humanoid robots have multiple kinematic chains:
- Left arm: torso → shoulder → elbow → wrist
- Right arm: torso → shoulder → elbow → wrist
- Left leg: torso → hip → knee → ankle
- Right leg: torso → hip → knee → ankle

### Degrees of Freedom
Humanoid robots typically have 20+ degrees of freedom:
- Head: 2-3 DOF (pitch, yaw, possibly roll)
- Each arm: 6-7 DOF (shoulder: 3, elbow: 1, wrist: 2-3)
- Each leg: 6 DOF (hip: 3, knee: 1, ankle: 2)
- Torso: 0-3 DOF (waist rotation)

## Basic Humanoid URDF Structure

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid">
  <!-- Torso -->
  <link name="torso">
    <visual>
      <geometry>
        <box size="0.3 0.2 0.5"/>
      </geometry>
      <material name="gray">
        <color rgba="0.5 0.5 0.5 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.3 0.2 0.5"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="5.0"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Head -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
      <material name="skin">
        <color rgba="1 0.8 0.6 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.002" ixy="0" ixz="0" iyy="0.002" iyz="0" izz="0.002"/>
    </inertial>
  </link>

  <!-- Neck joint -->
  <joint name="neck_joint" type="revolute">
    <parent link="torso"/>
    <child link="head"/>
    <origin xyz="0 0 0.3" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-0.5" upper="0.5" effort="10" velocity="2"/>
  </joint>

  <!-- Left arm - Shoulder -->
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
      <mass value="0.5"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
    </inertial>
  </link>

  <joint name="left_shoulder_joint" type="revolute">
    <parent link="torso"/>
    <child link="left_shoulder"/>
    <origin xyz="0.15 0 0.2" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="2"/>
  </joint>

  <!-- Left arm - Upper arm -->
  <link name="left_upper_arm">
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
    <inertial>
      <mass value="0.8"/>
      <inertia ixx="0.005" ixy="0" ixz="0" iyy="0.005" iyz="0" izz="0.001"/>
    </inertial>
  </link>

  <joint name="left_elbow_joint" type="revolute">
    <parent link="left_shoulder"/>
    <child link="left_upper_arm"/>
    <origin xyz="0 0 -0.1" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="0" upper="3.14" effort="10" velocity="2"/>
  </joint>
</robot>
```

## Humanoid Joint Limitations

### Safety Considerations
Humanoid joints need careful limit setting to prevent damage:

```xml
<!-- Shoulder joint with realistic limits -->
<joint name="right_shoulder_pitch" type="revolute">
  <parent link="torso"/>
  <child link="right_shoulder"/>
  <origin xyz="-0.15 0 0.2" rpy="0 0 0"/>
  <axis xyz="0 0 1"/>
  <limit lower="-2.0" upper="1.5" effort="20" velocity="1.5"/>
  <safety_controller k_position="10" k_velocity="10"
                   soft_lower_limit="-1.9" soft_upper_limit="1.4"/>
</joint>
```

### Human-like Ranges of Motion
- Shoulder: ~180° in multiple axes
- Elbow: ~0° to 160° flexion
- Wrist: ~±90° in 2 axes
- Hip: ~±45° in 3 axes
- Knee: ~0° to 130° flexion
- Ankle: ~±30° in 2 axes

## Complex Humanoid Features

### Transmission Elements
For simulation and control, add transmission elements:

```xml
<transmission name="left_elbow_trans">
  <type>transmission_interface/SimpleTransmission</type>
  <joint name="left_elbow_joint">
    <hardwareInterface>hardware_interface/PositionJointInterface</hardwareInterface>
  </joint>
  <actuator name="left_elbow_motor">
    <mechanicalReduction>1</mechanicalReduction>
  </actuator>
</transmission>
```

### Gazebo-Specific Elements
For simulation in Gazebo:

```xml
<gazebo reference="torso">
  <material>Gazebo/Gray</material>
  <mu1>0.2</mu1>
  <mu2>0.2</mu2>
</gazebo>
```

## Balancing Considerations

### Center of Mass
Humanoid robots need careful mass distribution:

```xml
<!-- Torso with lower center of mass -->
<inertial>
  <mass value="8.0"/>
  <origin xyz="0 0 -0.1"/>  <!-- Lower CoM for stability -->
  <inertia ixx="0.2" ixy="0" ixz="0" iyy="0.2" iyz="0" izz="0.3"/>
</inertial>
```

### Foot Design
Important for stability:

```xml
<link name="left_foot">
  <visual>
    <geometry>
      <box size="0.2 0.1 0.05"/>
    </geometry>
  </visual>
  <collision>
    <geometry>
      <box size="0.2 0.1 0.05"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="0.5"/>
    <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.002" iyz="0" izz="0.002"/>
  </inertial>
</link>
```

## URDF Best Practices for Humanoids

### Organization
Organize your URDF files for maintainability:

```
humanoid_robot/
├── urdf/
│   ├── robot.urdf.xacro
│   ├── torso.xacro
│   ├── head.xacro
│   ├── arm.xacro
│   └── leg.xacro
```

### Use Xacro for Complex Models
Xacro (XML Macros) helps manage complex humanoid models:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="humanoid">
  <xacro:property name="M_PI" value="3.1415926535897931" />

  <!-- Define a macro for arms -->
  <xacro:macro name="arm" params="side reflect">
    <link name="${side}_shoulder">
      <!-- Arm link definition -->
    </link>
    <!-- More arm components -->
  </xacro:macro>

  <!-- Use the macro for both arms -->
  <xacro:arm side="left" reflect="1" />
  <xacro:arm side="right" reflect="-1" />
</robot>
```

Humanoid URDF models require careful attention to kinematics, joint limits, and mass distribution to enable stable and realistic movement. These models form the foundation for humanoid robot simulation and control.