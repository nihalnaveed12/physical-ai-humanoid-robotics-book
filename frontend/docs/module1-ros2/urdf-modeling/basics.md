---
sidebar_position: 1
---

# URDF Basics

**URDF** (Unified Robot Description Format) is an XML-based format used in ROS to describe robot models. It defines the physical and visual properties of a robot, including its links, joints, and other properties needed for simulation and visualization.

## What is URDF?

URDF stands for Unified Robot Description Format. It's an XML format that describes robots in terms of:

- **Links**: Rigid parts of the robot (e.g., chassis, arms, wheels)
- **Joints**: Connections between links that allow motion
- **Visual properties**: How the robot looks in simulation/visualization
- **Collision properties**: How the robot interacts with the environment
- **Inertial properties**: Physical properties for physics simulation

## Basic URDF Structure

A minimal URDF file has this structure:

```xml
<?xml version="1.0"?>
<robot name="my_robot">
  <!-- Links definition -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="1 1 1"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <box size="1 1 1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1"/>
      <inertia ixx="1" ixy="0" ixz="0" iyy="1" iyz="0" izz="1"/>
    </inertial>
  </link>
</robot>
```

## Links

A **link** represents a rigid part of the robot. Each link can have:

- **Visual**: How the link appears in visualization
- **Collision**: How the link interacts in collision detection
- **Inertial**: Physical properties for dynamics simulation

### Link Properties

```xml
<link name="wheel_link">
  <!-- Visual properties -->
  <visual>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <cylinder radius="0.1" length="0.05"/>
    </geometry>
    <material name="blue">
      <color rgba="0 0 1 1"/>
    </material>
  </visual>

  <!-- Collision properties -->
  <collision>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <cylinder radius="0.1" length="0.05"/>
    </geometry>
  </collision>

  <!-- Inertial properties -->
  <inertial>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <mass value="0.5"/>
    <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.02"/>
  </inertial>
</link>
```

## Joints

A **joint** connects two links and defines how they can move relative to each other.

### Joint Types

- **revolute**: Rotational joint with limits
- **continuous**: Rotational joint without limits
- **prismatic**: Linear sliding joint with limits
- **fixed**: No movement (rigid connection)
- **floating**: 6 DOF (not commonly used)
- **planar**: Motion on a plane (not commonly used)

### Joint Definition

```xml
<joint name="wheel_joint" type="continuous">
  <parent link="base_link"/>
  <child link="wheel_link"/>
  <origin xyz="0.2 0 0" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
</joint>
```

## Geometry Types

URDF supports several geometry types:

### Primitive Shapes
- `<box size="x y z"/>`
- `<cylinder radius="r" length="l"/>`
- `<sphere radius="r"/>`

### Mesh Geometry
```xml
<mesh filename="package://my_robot/meshes/wheel.dae" scale="1 1 1"/>
```

## Materials

Materials define the visual appearance:

```xml
<material name="red">
  <color rgba="1 0 0 1"/>
</material>

<material name="blue">
  <color rgba="0 0 1 1"/>
</material>

<material name="white">
  <texture filename="package://my_robot/materials/textures/white.png"/>
</material>
```

## Complete Example: Simple Robot

```xml
<?xml version="1.0"?>
<robot name="simple_robot">
  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <cylinder radius="0.2" length="0.1"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 0.8"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.2" length="0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.2"/>
    </inertial>
  </link>

  <!-- Wheel links -->
  <link name="wheel_left">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.2"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.002"/>
    </inertial>
  </link>

  <!-- Joints -->
  <joint name="left_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="wheel_left"/>
    <origin xyz="0 0.15 -0.05" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
  </joint>
</robot>
```

## URDF Tools

### Checking URDF
Use the `check_urdf` command to validate your URDF:

```bash
check_urdf /path/to/robot.urdf
```

### Visualizing URDF
Use RViz or other tools to visualize your robot:

```bash
rviz2
```

## Best Practices

- Start simple and add complexity gradually
- Use consistent naming conventions
- Validate your URDF regularly
- Use appropriate units (meters for length, kilograms for mass)
- Keep visual and collision geometries as simple as possible while maintaining accuracy

URDF is fundamental to robotics simulation and visualization in ROS. Mastering URDF is essential for creating accurate robot models for humanoid robotics applications.