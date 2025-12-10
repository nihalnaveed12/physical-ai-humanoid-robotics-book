# Quickstart Guide: Module 2: The Digital Twin (Gazebo & Unity)

## Prerequisites

Before starting with the digital twin module, ensure you have:

- ROS 2 Humble Hawksbill installed
- Gazebo (Fortress or Garden) installed
- Unity 2022.3 LTS or newer
- Basic understanding of ROS 2 concepts (covered in Module 1)

## Setup Environment

### Gazebo Setup

1. Install Gazebo packages:
```bash
sudo apt update
sudo apt install ros-humble-gazebo-ros-pkgs ros-humble-gazebo-plugins ros-humble-gazebo-dev
```

2. Verify installation:
```bash
gz sim --version
```

### Unity Setup

1. Install Unity Hub and Unity 2022.3 LTS
2. Install ROS# package via Unity Package Manager
3. Set up ROS TCP Connector in Unity project

## Basic Digital Twin Example

### Step 1: Create a Simple Robot Model

Create a basic URDF file for a humanoid robot:

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.2 0.1 0.1"/>
      </geometry>
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
</robot>
```

### Step 2: Launch Gazebo Simulation

```bash
# Source ROS 2
source /opt/ros/humble/setup.bash

# Launch robot in Gazebo
ros2 launch gazebo_ros spawn_entity.py entity:=simple_humanoid -file://path/to/robot.urdf
```

### Step 3: Basic Unity Integration

1. Import the robot model into Unity
2. Create a basic scene with the robot
3. Set up ROS communication for state synchronization

## Running the Examples

Each section of this module includes runnable examples. To run the examples:

1. Navigate to the example directory
2. Follow the README instructions for each specific example
3. Verify that the simulation runs correctly in both environments

## Troubleshooting

- If Gazebo fails to start, check that X11 forwarding is enabled if running in a container
- For Unity ROS connection issues, verify that both ROS master and Unity TCP connector are running
- Ensure all dependencies are properly installed and sourced

## Next Steps

After completing the quickstart, proceed to:
1. The Introduction section to understand digital twins in Physical AI
2. Gazebo Physics Simulation for detailed physics configuration
3. Unity High-Fidelity Environments for visualization techniques
4. Sensor Simulation for integrating realistic sensor data