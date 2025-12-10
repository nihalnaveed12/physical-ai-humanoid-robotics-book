---
sidebar_position: 2
title: "Gazebo Setup Guide"
---

# Gazebo Setup Guide

## Overview

Gazebo is a physics-based simulation environment that provides realistic robot simulation capabilities. This guide will walk you through setting up Gazebo for digital twin applications with humanoid robots and Physical AI development.

## Prerequisites

Before beginning this setup, ensure you have:

- ROS 2 Humble Hawksbill installed (covered in Module 1)
- Basic understanding of ROS 2 concepts
- Ubuntu 22.04 LTS or equivalent Linux distribution

## Installing Gazebo

### Step 1: Install Gazebo Packages

Gazebo Fortress is the recommended version for ROS 2 Humble:

```bash
sudo apt update
sudo apt install ros-humble-gazebo-ros-pkgs ros-humble-gazebo-plugins ros-humble-gazebo-dev
```

### Step 2: Verify Installation

Check that Gazebo is properly installed:

```bash
gz sim --version
```

You should see version information for Gazebo Fortress or Garden.

### Step 3: Source ROS 2

Always source ROS 2 before working with Gazebo:

```bash
source /opt/ros/humble/setup.bash
```

For convenience, add this to your `~/.bashrc`:

```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
```

## Basic Gazebo Environment

### Launching Gazebo

Start Gazebo with an empty world:

```bash
gz sim
```

This will open the Gazebo GUI with a default empty environment.

### Understanding the Interface

The Gazebo interface consists of:

1. **Menu Bar**: File, Edit, View, Tools, Window, Help
2. **Toolbar**: Play, Pause, Reset simulation controls
3. **Scene**: 3D visualization of the simulation environment
4. **Tree View**: List of models and entities in the scene
5. **Layer Panel**: Additional visualization layers
6. **Inspector**: Properties of selected objects

## Setting up a Basic Robot Model

### Creating a Simple URDF

First, let's create a simple humanoid robot model. Create the file `simple_humanoid.urdf`:

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid">
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
</robot>
```

### Spawning the Robot in Gazebo

Save the URDF file and spawn it in Gazebo:

```bash
# Make sure ROS 2 is sourced
source /opt/ros/humble/setup.bash

# Spawn the robot (assuming the URDF is in your current directory)
ros2 run gazebo_ros spawn_entity.py -entity simple_humanoid -file://$(pwd)/simple_humanoid.urdf
```

### Using the Provided Example URDF

To use the example humanoid robot URDF provided in this module:

1. First, locate the example file:
   ```
   frontend/docs/module2-digital-twin/assets/urdf-examples/simple_humanoid.urdf
   ```

2. Copy the file to your working directory or a ROS package:
   ```bash
   # Create a directory for robot models
   mkdir -p ~/robot_models
   cp frontend/docs/module2-digital-twin/assets/urdf-examples/simple_humanoid.urdf ~/robot_models/
   ```

3. Launch Gazebo and spawn the robot:
   ```bash
   # Launch Gazebo with an empty world
   ros2 launch gazebo_ros empty_world.launch.py

   # In a new terminal, spawn the robot
   source /opt/ros/humble/setup.bash
   ros2 run gazebo_ros spawn_entity.py -entity simple_humanoid -file:///home/$(whoami)/robot_models/simple_humanoid.urdf
   ```

### Creating a Launch File for the Robot

For easier launching, create a launch file that starts both Gazebo and spawns the robot:

Create `launch_robot.launch.py`:

```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node

def generate_launch_description():
    # Get the package share directory for gazebo_ros
    gazebo_ros_dir = get_package_share_directory('gazebo_ros')

    # Path to the robot URDF file
    robot_urdf_path = '/home/$(whoami)/robot_models/simple_humanoid.urdf'  # Update this path as needed

    # Launch Gazebo
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(gazebo_ros_dir, 'launch', 'empty_world.launch.py')
        ),
        launch_arguments={
            'world': os.path.join(gazebo_ros_dir, 'worlds', 'empty.world'),
        }.items(),
    )

    # Spawn the robot
    spawn_entity = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=[
            '-entity', 'simple_humanoid',
            '-file', robot_urdf_path,
        ],
        output='screen',
    )

    return LaunchDescription([
        gazebo,
        spawn_entity,
    ])
```

Then launch with:
```bash
ros2 launch launch_robot.launch.py
```

## Gazebo ROS Integration

### Launching with ROS 2 Bridge

To properly integrate with ROS 2, use the launch system:

```bash
# Launch Gazebo with ROS 2 bridge
ros2 launch gazebo_ros empty_world.launch.py
```

### Custom World Launch

Create a custom launch file to load your world and robot together. Create `launch_gazebo_robot.launch.py`:

```python
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import PathJoinSubstitution
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory


def generate_launch_description():
    ld = LaunchDescription()

    # Launch Gazebo with empty world
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            get_package_share_directory('gazebo_ros'),
            '/launch/empty_world.launch.py'
        ]),
    )
    ld.add_action(gazebo)

    # Spawn robot after Gazebo starts
    spawn_entity = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=[
            '-entity', 'simple_humanoid',
            '-file', PathJoinSubstitution([
                get_package_share_directory('your_robot_description'),
                'urdf',
                'simple_humanoid.urdf'
            ])
        ],
        output='screen'
    )
    ld.add_action(spawn_entity)

    return ld
```

## Physics Configuration

### Understanding Gazebo Physics

Gazebo uses the Open Dynamics Engine (ODE) by default, which is well-suited for humanoid robotics simulation. The physics parameters can be configured in your world file:

```xml
<physics name="1ms" default="0" type="ode">
  <max_step_size>0.001</max_step_size>
  <real_time_factor>1</real_time_factor>
  <real_time_update_rate>1000</real_time_update_rate>
  <gravity>0 0 -9.8</gravity>
</physics>
```

### Key Physics Parameters

- **max_step_size**: Simulation time step (smaller = more accurate but slower)
- **real_time_factor**: Target simulation speed (1.0 = real-time)
- **gravity**: Gravity vector (typically [0, 0, -9.8] for Earth gravity)

## Troubleshooting Common Issues

### Gazebo Won't Start

If Gazebo fails to start:

1. Check if you're running in a container without X11 forwarding
2. Verify OpenGL support: `glxinfo | grep "OpenGL renderer"`
3. Try running with software rendering: `MESA_GL_VERSION_OVERRIDE=3.3 gz sim`

### Robot Not Spawning

If the robot doesn't appear in Gazebo:

1. Verify the URDF file is valid: `check_urdf path/to/robot.urdf`
2. Check ROS 2 is sourced: `echo $ROS_DISTRO`
3. Verify Gazebo is running before spawning

## Next Steps

After completing the Gazebo setup:

1. Proceed to configure physics parameters as needed ([Physics Configuration](gazebo-physics.md))
2. Add sensors to your robot model ([Sensor Simulation](lidar-simulation.md), [Depth Camera](depth-camera-simulation.md), [IMU Simulation](imu-simulation.md))
3. Create custom environments for your specific use case
4. Integrate with Unity for high-fidelity visualization ([Unity Setup](unity-setup.md))

## Related Sections

- [Unity Setup Guide](unity-setup.md) - Complementary visualization environment
- [Gazebo Physics Configuration](gazebo-physics.md) - Physics parameter tuning
- [LiDAR Simulation](lidar-simulation.md) - Sensor integration in Gazebo
- [Integration Examples](integration-examples.md) - Complete workflows combining Gazebo and Unity

## References

- Gazebo Documentation: https://gazebosim.org/docs
- ROS 2 with Gazebo: https://classic.gazebosim.org/tutorials?tut=ros2_overview
- Open Dynamics Engine: http://ode.org/

---

This guide provides the foundation for using Gazebo in your digital twin applications. The next section will cover Unity setup for complementary high-fidelity visualization.