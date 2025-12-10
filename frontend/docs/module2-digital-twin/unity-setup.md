---
sidebar_position: 3
title: "Unity Setup Guide"
---

# Unity Setup Guide

## Overview

Unity is a powerful game engine that provides high-fidelity rendering and visualization capabilities. This guide will walk you through setting up Unity for digital twin applications with humanoid robots and Physical AI development, focusing on visualization rather than game mechanics.

## Prerequisites

Before beginning this setup, ensure you have:

- Unity 2022.3 LTS or newer installed
- Basic understanding of Unity interface (scenes, game objects, components)
- Windows, macOS, or Linux system with adequate graphics capabilities

## Installing Unity

### Step 1: Download Unity Hub

1. Visit the Unity website: https://unity.com/
2. Download Unity Hub (the recommended installer)
3. Install Unity Hub on your system

### Step 2: Install Unity Editor

1. Open Unity Hub
2. Go to the "Installs" tab
3. Click "Add" to install a new Unity version
4. Select "2022.3 LTS" (Long Term Support) or the latest LTS version
5. Choose the modules you need:
   - Windows/Mac/Linux Build Support (depending on your platform)
   - Visual Studio Tools for Unity (optional but recommended)

### Step 3: Create a New Project

1. In Unity Hub, click "New Project"
2. Select the "3D (Built-in Render Pipeline)" template
3. Name your project "DigitalTwinRobotics"
4. Choose a location to save your project
5. Click "Create Project"

## Unity Robotics Setup

### Installing Unity Robotics Package

Unity provides the Robotics package for integration with ROS (Robot Operating System):

1. In Unity, go to **Window** → **Package Manager**
2. In the Package Manager, click the **+** button in the top-left corner
3. Select **"Add package from git URL..."**
4. Enter: `com.unity.robotics.ros-tcp-connector`
5. Click **"Add"**

This will install the ROS TCP Connector package.

### Alternative: Using Unity Robotics Hub

For the complete robotics toolset:

1. Clone the Unity Robotics Hub repository:
   ```bash
   git clone https://github.com/Unity-Technologies/Unity-Robotics-Hub.git
   ```
2. Import the necessary packages into your Unity project

## Setting up a Basic Robot Model

### Creating a Simple Humanoid Robot

1. In the Unity Editor:
   - Right-click in the Hierarchy panel
   - Select **3D Object** → **Capsule** (for the torso)
   - Rename this object to "RobotBase"

2. Add additional body parts:
   - Create a **Capsule** for the head and position it above the torso
   - Create **Capsules** for arms and legs
   - Organize them as children of "RobotBase"

3. Adjust materials:
   - Create a new Material in the Project panel
   - Apply colors to distinguish different body parts
   - Assign materials to your robot components

### Example Robot Hierarchy

```
RobotBase
├── Torso (Capsule)
├── Head (Capsule)
├── LeftArm (Capsule)
├── RightArm (Capsule)
├── LeftLeg (Capsule)
└── RightLeg (Capsule)
```

## ROS Communication Setup

### Configuring ROS TCP Connector

1. In the Unity menu, go to **Robots** → **ROS Settings**
2. Set the **ROS IP** to your ROS master IP (usually `127.0.0.1` for local)
3. Set the **ROS Port** (default is `10000`)
4. Check **"Auto-Initialize"** to connect automatically

### Creating a ROS Connection Script

Create a C# script to handle ROS communication:

```csharp
using System.Collections;
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Std_msgs;

public class RobotController : MonoBehaviour
{
    ROSConnection ros;
    public string rosTopicName = "unity_robot_position";

    // Start is called before the first frame update
    void Start()
    {
        // Get the ROS connection static instance
        ros = ROSConnection.instance;
    }

    // Update is called once per frame
    void Update()
    {
        // Send position data to ROS
        ros.Publish(rosTopicName, new StringMsg(
            "Position: " + transform.position.x + ", " + transform.position.y + ", " + transform.position.z
        ));
    }
}
```

### Adding the Script to Your Robot

1. Create a new C# script in Unity (Assets → Create → C# Script)
2. Name it "RobotController"
3. Replace the default content with the code above
4. Attach the script to your "RobotBase" GameObject
5. Adjust the `rosTopicName` as needed

### Importing the Humanoid Robot Model

To use the example humanoid robot model provided in this module:

1. Locate the example URDF file:
   ```
   frontend/docs/module2-digital-twin/assets/urdf-examples/simple_humanoid.urdf
   ```

2. Note that Unity cannot directly import URDF files. You'll need to convert the model to a Unity-compatible format (FBX, OBJ, etc.) or recreate the model in Unity based on the URDF specifications.

3. For a simple approach, create the humanoid robot in Unity based on the URDF specifications:
   - Base link: Box collider (0.2×0.1×0.1 m)
   - Head: Sphere (radius 0.05 m)
   - Arms and legs: Capsules with appropriate lengths and radii
   - Connect with appropriate joints (hinges for shoulders, elbows, hips, knees)

4. Create a simple C# script to receive joint positions from ROS and update the Unity robot model:

```csharp
using System.Collections.Generic;
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Sensor_msgs;

public class RobotJointController : MonoBehaviour
{
    ROSConnection ros;
    public string jointStatesTopic = "joint_states";

    // Dictionary to store joint GameObjects by name
    Dictionary<string, Transform> jointMap = new Dictionary<string, Transform>();

    // Joint position storage
    Dictionary<string, float> jointPositions = new Dictionary<string, float>();

    void Start()
    {
        ros = ROSConnection.instance;
        ros.Subscribe<JointStateMsg>(jointStatesTopic, JointStateCallback);

        // Initialize joint map - adjust names based on your URDF
        jointMap["left_shoulder_joint"] = transform.Find("LeftShoulder");
        jointMap["left_elbow_joint"] = transform.Find("LeftElbow");
        jointMap["right_shoulder_joint"] = transform.Find("RightShoulder");
        jointMap["right_elbow_joint"] = transform.Find("RightElbow");
        // Add more joints as needed
    }

    void JointStateCallback(JointStateMsg jointState)
    {
        // Update joint positions from ROS message
        for (int i = 0; i < jointState.name.Count; i++)
        {
            string jointName = jointState.name[i];
            if (jointMap.ContainsKey(jointName))
            {
                jointPositions[jointName] = jointState.position[i];
            }
        }
    }

    void Update()
    {
        // Apply joint positions to Unity transforms
        foreach (var joint in jointPositions)
        {
            if (jointMap.ContainsKey(joint.Key))
            {
                // Example: rotate the joint around its local Y-axis
                // Adjust this based on your specific joint configuration
                jointMap[joint.Key].localRotation = Quaternion.Euler(0, joint.Value * Mathf.Rad2Deg, 0);
            }
        }
    }
}
```

### Setting Up Unity-ROS Communication

1. Create an empty GameObject in your scene named "ROSManager"
2. Attach the RobotJointController script to this object
3. Make sure your ROS master is running and the IP addresses match in Unity's ROS Settings
4. Publish joint states from your ROS system to synchronize with Unity

## Physics Configuration in Unity

### Understanding Unity Physics

Unity uses the PhysX physics engine by default, which is optimized for real-time rendering rather than scientific accuracy. For digital twin applications:

1. Go to **Edit** → **Project Settings** → **Physics**
2. Adjust the following settings:
   - **Fixed Timestep**: 0.02 (50 FPS) for real-time simulation
   - **Maximum Allowed Timestep**: 0.333 for stability
   - **Solver Iteration Count**: 6-10 for balance of accuracy/performance

### Adding Colliders to Robot Parts

1. Select each robot part in the hierarchy
2. Add a **Collider** component (Box Collider, Capsule Collider, etc.)
3. Adjust collider size to match the visual mesh
4. For physics simulation, also add a **Rigidbody** component

## Visualization and Rendering

### Setting up the Scene

1. Create a simple environment:
   - Add a **Plane** for the ground
   - Add **Directional Light** for illumination
   - Adjust lighting to match your simulation requirements

2. Configure the main camera:
   - Adjust field of view for realistic perspective
   - Position to get good views of your robot
   - Consider adding multiple cameras for different perspectives

### Quality Settings

For optimal visualization:

1. Go to **Edit** → **Project Settings** → **Quality**
2. Adjust settings based on your hardware capabilities:
   - **Shadows**: Enable for realistic lighting
   - **Anti-Aliasing**: Enable for smooth edges
   - **Anisotropic Filtering**: Enable for texture quality

## Integration with Gazebo

### Synchronization Concepts

To maintain consistency between Gazebo and Unity simulations:

1. **Shared Robot Model**: Use the same URDF/SDF for both environments where possible
2. **Synchronized Physics**: Match gravity, mass, and friction parameters
3. **ROS Bridge**: Use ROS as the communication layer between environments

### Example Synchronization Approach

1. Use Gazebo for physics-accurate simulation
2. Use Unity for high-fidelity visualization
3. Synchronize state via ROS topics:
   - Joint positions
   - Robot poses
   - Sensor data

## Troubleshooting Common Issues

### Unity Crashes or Performance Issues

- Check system requirements are met
- Reduce quality settings if needed
- Close other applications to free up resources

### ROS Connection Issues

- Verify ROS master is running
- Check IP addresses and ports match
- Ensure firewall allows connections on the specified port

### Model Import Problems

- Verify model formats are supported (.fbx, .obj, .dae)
- Check scale and orientation of imported models
- Ensure materials and textures are properly imported

## Next Steps

After completing the Unity setup:

1. Explore advanced visualization techniques
2. Add sensor simulation capabilities ([LiDAR Simulation](lidar-simulation.md), [Depth Camera Simulation](depth-camera-simulation.md), [IMU Simulation](imu-simulation.md))
3. Implement ROS communication for state synchronization
4. Create custom environments for your specific use case
5. Integrate with Gazebo for physics-accurate simulation ([Gazebo Setup](gazebo-setup.md))

## Related Sections

- [Gazebo Setup Guide](gazebo-setup.md) - Complementary physics simulation environment
- [Unity Physics Configuration](unity-physics.md) - Physics parameter tuning
- [LiDAR Simulation](lidar-simulation.md) - Sensor simulation in Unity
- [Integration Examples](integration-examples.md) - Complete workflows combining Gazebo and Unity

## References

- Unity Robotics Hub: https://github.com/Unity-Technologies/Unity-Robotics-Hub
- Unity ROS TCP Connector: https://github.com/Unity-Technologies/ROS-TCP-Connector
- Unity Documentation: https://docs.unity3d.com/
- Unity Robotics Package: https://docs.unity3d.com/Packages/com.unity.robotics.ros-tcp-connector@latest

---

This guide provides the foundation for using Unity in your digital twin applications. The next section will cover Unity-specific physics configuration for optimal simulation performance.