---
sidebar_position: 5
title: "Unity Physics Configuration"
---

# Unity Physics Configuration

## Overview

Unity's physics system, based on the PhysX engine, provides high-fidelity rendering and real-time physics simulation. This guide covers how to configure Unity for digital twin applications, focusing on rendering and environment building rather than complex physics, as specified in the project requirements.

## Understanding Unity Physics vs Gazebo Physics

While Gazebo focuses on accurate physics simulation for robotics, Unity emphasizes:

- **High-fidelity visualization**: Realistic rendering and lighting
- **Environment building**: Creating detailed, interactive environments
- **Real-time performance**: Maintaining high frame rates for smooth visualization
- **Visual consistency**: Ensuring the digital twin looks realistic

Unity physics should complement, not replace, Gazebo's accurate physics simulation.

## Physics Manager Configuration

### Accessing Physics Settings

1. In Unity, go to **Edit** → **Project Settings** → **Physics**
2. Here you'll find the main physics configuration options

### Key Physics Settings

#### 2D vs 3D Physics
- **Use 2D Physics**: Only enable if creating 2D applications
- **Use 3D Physics**: Enabled by default for 3D applications

#### Gravity Configuration
- **Default Gravity**: Set to (0, -9.81, 0) to match Earth's gravity
- This should match the gravity setting in your Gazebo simulation for consistency

#### Solver Configuration
- **Solver Iteration Count**: 6-10 for balance of accuracy/performance
- **Solver Velocity Iteration Count**: 1-3 for contact resolution
- Higher values = more accurate but slower performance

#### Layer Collision Matrix
- Configure which layers collide with each other
- Use for optimization (disable collisions between non-interacting objects)

## Rigidbody Configuration

### Adding Physics to Objects

For objects that need physics simulation:

1. Select the GameObject
2. Add **Rigidbody** component via **Add Component** → **Physics** → **Rigidbody**

### Rigidbody Properties

#### Mass and Inertia
```csharp
// Example script to configure Rigidbody properties
using UnityEngine;

public class PhysicsSetup : MonoBehaviour
{
    void Start()
    {
        Rigidbody rb = GetComponent<Rigidbody>();

        // Set mass (should match URDF mass values)
        rb.mass = 1.0f;

        // Set drag and angular drag for air resistance
        rb.drag = 0.1f;
        rb.angularDrag = 0.05f;

        // Set to kinematic if controlled by animation/simulation
        rb.isKinematic = false;
    }
}
```

#### Collision Detection Modes
- **Discrete**: Default, good for most objects
- **Continuous**: For fast-moving objects to prevent tunneling
- **Continuous Dynamic**: For fast-moving objects that need collision detection

### Constraints
Use constraints to limit movement:
- **Freeze Position X/Y/Z**: Prevent movement along specific axes
- **Freeze Rotation X/Y/Z**: Prevent rotation around specific axes

## Collider Configuration

### Adding Colliders

For objects to participate in physics:

1. Select the GameObject
2. Add **Collider** component via **Add Component** → **Physics** → **[Collider Type]**

### Common Collider Types

#### Primitive Colliders
- **Box Collider**: For cubic/rectangular objects
- **Sphere Collider**: For spherical objects
- **Capsule Collider**: For cylindrical objects, good for humanoid limbs

#### Complex Colliders
- **Mesh Collider**: For complex shapes (use convex for moving objects)
- **Terrain Collider**: For terrain objects

### Example Collider Setup
```csharp
using UnityEngine;

public class ColliderSetup : MonoBehaviour
{
    void Start()
    {
        // Add appropriate collider based on object type
        if (gameObject.CompareTag("RobotArm"))
        {
            CapsuleCollider capsule = gameObject.AddComponent<CapsuleCollider>();
            capsule.center = Vector3.zero;
            capsule.radius = 0.02f;
            capsule.height = 0.15f;
        }
        else if (gameObject.CompareTag("RobotBody"))
        {
            BoxCollider box = gameObject.AddComponent<BoxCollider>();
            box.center = Vector3.zero;
            box.size = new Vector3(0.2f, 0.1f, 0.1f);
        }
    }
}
```

## Environment Building

### Creating Realistic Environments

#### Terrain System
1. **GameObject** → **3D Object** → **Terrain**
2. Use terrain tools to sculpt landscapes
3. Add textures for realistic ground surfaces

#### Static vs Dynamic Objects
- **Static objects**: Mark with **Static** checkbox for optimization
- **Dynamic objects**: Objects that move/interact during simulation

### Lighting Configuration
```csharp
using UnityEngine;

public class EnvironmentLighting : MonoBehaviour
{
    void Start()
    {
        // Configure lighting to match Gazebo environment
        Light sunLight = FindObjectOfType<Light>();
        if (sunLight != null)
        {
            sunLight.type = LightType.Directional;
            sunLight.color = Color.white;
            sunLight.intensity = 1.0f;
            sunLight.transform.rotation = Quaternion.Euler(50, -30, 0);
        }
    }
}
```

## Material and Surface Properties

### Physics Materials

Create Physics Materials for different surface properties:

1. **Create** → **Physics Material** in Project window
2. Configure friction and bounce properties

#### Common Material Properties
| Surface Type | Static Friction | Dynamic Friction | Bounciness |
|--------------|----------------|------------------|------------|
| Concrete | 0.9 | 0.8 | 0.1 |
| Wood | 0.4 | 0.3 | 0.2 |
| Ice | 0.1 | 0.05 | 0.0 |
| Rubber | 1.0 | 0.9 | 0.7 |

### Applying Physics Materials
```csharp
using UnityEngine;

public class MaterialSetup : MonoBehaviour
{
    public PhysicMaterial material;

    void Start()
    {
        Collider col = GetComponent<Collider>();
        if (col != null)
        {
            col.material = material;
        }
    }
}
```

## Performance Optimization

### Physics Optimization Techniques

#### Fixed Timestep
- **Edit** → **Project Settings** → **Time**
- **Fixed Timestep**: 0.02 (50 FPS) for real-time simulation
- **Maximum Allowed Timestep**: 0.333 for stability

#### Object Pooling
For frequently created/destroyed objects:
```csharp
using System.Collections.Generic;
using UnityEngine;

public class ObjectPool : MonoBehaviour
{
    [SerializeField] private GameObject prefab;
    [SerializeField] private int poolSize = 10;
    private Queue<GameObject> pool = new Queue<GameObject>();

    void Start()
    {
        for (int i = 0; i < poolSize; i++)
        {
            GameObject obj = Instantiate(prefab);
            obj.SetActive(false);
            pool.Enqueue(obj);
        }
    }

    public GameObject GetObject()
    {
        if (pool.Count > 0)
        {
            GameObject obj = pool.Dequeue();
            obj.SetActive(true);
            return obj;
        }
        else
        {
            return Instantiate(prefab);
        }
    }

    public void ReturnObject(GameObject obj)
    {
        obj.SetActive(false);
        pool.Enqueue(obj);
    }
}
```

## Visualization-First Configuration

### Focus on Rendering vs Physics

For digital twin applications where visualization is primary:

#### Quality Settings
1. **Edit** → **Project Settings** → **Quality**
2. Adjust settings for optimal visual quality:
   - **Shadows**: Enable for realistic lighting
   - **Anti-Aliasing**: Enable for smooth edges
   - **Anisotropic Filtering**: Enable for texture quality
   - **Realtime Reflections**: Enable for reflective surfaces

#### Rendering Configuration
```csharp
using UnityEngine;

public class RenderingSetup : MonoBehaviour
{
    void Start()
    {
        // Configure for high-quality rendering
        QualitySettings.shadowDistance = 100f;
        QualitySettings.shadowResolution = ShadowResolution.High;
        QualitySettings.antiAliasing = 2; // 2x MSAA
    }
}
```

## Synchronization with Gazebo

### State Synchronization Concepts

Unity should primarily focus on visualization while Gazebo handles accurate physics:

1. **Receive state from Gazebo**: Joint positions, robot poses
2. **Visualize in Unity**: Update Unity transforms based on received data
3. **Maintain visual consistency**: Ensure Unity environment matches Gazebo

### Example Synchronization Script
```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Std_msgs;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Geometry_msgs;
using System.Collections.Generic;

public class UnityGazeboSync : MonoBehaviour
{
    ROSConnection ros;
    public string jointStateTopic = "unity_joint_states";
    public string robotPoseTopic = "unity_robot_pose";

    // Dictionary to store robot parts by joint name
    Dictionary<string, Transform> robotParts = new Dictionary<string, Transform>();

    void Start()
    {
        ros = ROSConnection.instance;

        // Subscribe to joint states from Gazebo
        ros.Subscribe<Unity.Robotics.ROSTCPConnector.MessageTypes.Sensor_msgs.JointStateMsg>(
            "gazebo_joint_states", JointStateCallback);

        // Initialize robot parts mapping
        InitializeRobotParts();
    }

    void InitializeRobotParts()
    {
        // Map joint names to Unity transforms
        // These should match your URDF joint names
        Transform robotBase = transform; // Your robot root transform
        robotParts["left_shoulder_joint"] = robotBase.Find("LeftShoulder");
        robotParts["left_elbow_joint"] = robotBase.Find("LeftElbow");
        robotParts["right_shoulder_joint"] = robotBase.Find("RightShoulder");
        robotParts["right_elbow_joint"] = robotBase.Find("RightElbow");
        // Add more joints as needed
    }

    void JointStateCallback(Unity.Robotics.ROSTCPConnector.MessageTypes.Sensor_msgs.JointStateMsg jointState)
    {
        for (int i = 0; i < jointState.name.Count; i++)
        {
            string jointName = jointState.name[i];
            float jointPosition = (float)jointState.position[i];

            if (robotParts.ContainsKey(jointName))
            {
                // Apply joint position to Unity transform
                // Adjust the transformation based on your joint configuration
                Transform jointTransform = robotParts[jointName];
                jointTransform.localRotation = Quaternion.Euler(0, jointPosition * Mathf.Rad2Deg, 0);
            }
        }
    }
}
```

## Environment Examples

### Creating a Simple Room Environment

```csharp
using UnityEngine;

public class SimpleRoomEnvironment : MonoBehaviour
{
    void Start()
    {
        CreateRoom();
        AddLighting();
    }

    void CreateRoom()
    {
        // Create floor
        GameObject floor = GameObject.CreatePrimitive(PrimitiveType.Cube);
        floor.name = "Floor";
        floor.transform.localScale = new Vector3(10f, 0.1f, 10f);
        floor.transform.position = new Vector3(0, -0.05f, 0);
        floor.GetComponent<Renderer>().material.color = Color.gray;

        // Create walls
        CreateWall(new Vector3(0, 2.5f, -5f), new Vector3(10f, 5f, 0.1f)); // Back wall
        CreateWall(new Vector3(0, 2.5f, 5f), new Vector3(10f, 5f, 0.1f));  // Front wall
        CreateWall(new Vector3(-5f, 2.5f, 0), new Vector3(0.1f, 5f, 10f)); // Left wall
        CreateWall(new Vector3(5f, 2.5f, 0), new Vector3(0.1f, 5f, 10f));  // Right wall
    }

    GameObject CreateWall(Vector3 position, Vector3 size)
    {
        GameObject wall = GameObject.CreatePrimitive(PrimitiveType.Cube);
        wall.name = "Wall";
        wall.transform.localScale = size;
        wall.transform.position = position;
        wall.GetComponent<Renderer>().material.color = Color.white;

        // Make static for optimization
        wall.tag = "Untagged";
        return wall;
    }

    void AddLighting()
    {
        // Add directional light
        GameObject lightObj = new GameObject("Main Light");
        Light light = lightObj.AddComponent<Light>();
        light.type = LightType.Directional;
        light.color = Color.white;
        light.intensity = 1.0f;
        light.transform.rotation = Quaternion.Euler(50, -30, 0);
    }
}
```

## Troubleshooting Common Issues

### Physics Performance Issues
- Reduce number of active rigidbodies
- Use object pooling for frequently created objects
- Adjust solver iteration counts for performance vs accuracy

### Visual Artifacts
- Ensure colliders match visual meshes
- Check for overlapping colliders
- Verify material assignments

### Synchronization Problems
- Verify ROS connection is established
- Check that topic names match between systems
- Ensure coordinate system consistency (Unity uses left-handed, Gazebo uses right-handed)

## Validation of Unity Setup

### Testing Visualization Consistency

1. Compare visual appearance with Gazebo environment
2. Verify that robot models look similar in both environments
3. Test that lighting and materials appear consistent

### Performance Testing
Monitor frame rate and adjust settings:
- Target 30-60 FPS for smooth visualization
- Use Unity Profiler to identify bottlenecks
- Optimize materials and lighting for performance

## Next Steps

After configuring Unity physics for visualization:

1. Create more complex environments for your specific use cases
2. Set up sensor simulation (covered in the next section)
3. Implement ROS communication for state synchronization
4. Test integration with Gazebo simulation

## References

- Unity Physics Manual: https://docs.unity3d.com/Manual/PhysicsSection.html
- PhysX Documentation: https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/
- Unity Robotics Package: https://docs.unity3d.com/Packages/com.unity.robotics.ros-tcp-connector@latest

---

This guide provides the foundation for configuring Unity for digital twin visualization applications. The next section will cover sensor simulation for both Gazebo and Unity environments.