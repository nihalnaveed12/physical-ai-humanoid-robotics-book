---
sidebar_position: 4
title: "Gazebo Physics Configuration"
---

# Gazebo Physics Configuration

## Overview

Physics configuration in Gazebo is critical for creating accurate digital twins that behave realistically. This guide covers how to configure gravity, collisions, physics engines, and sample worlds to match real-world physics for Physical AI training.

## Understanding Gazebo Physics

Gazebo uses physics engines to simulate real-world physics in the virtual environment. The main physics engines available are:

- **ODE (Open Dynamics Engine)**: Default engine, stable for robotic applications
- **DART (Dynamic Animation and Robotics Toolkit)**: More advanced physics, better contact handling
- **Bullet**: Good performance, widely used in game development

For humanoid robotics applications, ODE is typically the most stable choice.

## Physics Engine Configuration

### Setting Up Physics in World Files

Physics parameters are configured in SDF world files. Here's a basic example:

```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="physics_world">
    <!-- Physics Engine Configuration -->
    <physics name="1ms" default="0" type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
      <gravity>0 0 -9.8</gravity>

      <!-- ODE-specific parameters -->
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

    <!-- Your models and environment here -->
  </world>
</sdf>
```

### Key Physics Parameters Explained

- **max_step_size**: Simulation time step (smaller = more accurate but slower)
  - Recommended: 0.001s for precise control, 0.01s for performance
- **real_time_factor**: Target simulation speed (1.0 = real-time)
  - Set to 0.1 for 10x slower than real-time, 2.0 for 2x faster
- **real_time_update_rate**: How many times per second to update (Hz)
  - Should be 1/max_step_size for real-time performance
- **gravity**: Gravity vector in m/s² (standard Earth gravity is [0, 0, -9.8])

## Gravity Configuration

### Standard Earth Gravity
```xml
<gravity>0 0 -9.8</gravity>
```

### Custom Gravity (e.g., Moon simulation)
```xml
<gravity>0 0 -1.62</gravity>
```

### Zero Gravity (Space simulation)
```xml
<gravity>0 0 0</gravity>
```

### Non-Standard Gravity Directions
For testing robot stability in different orientations:
```xml
<!-- Gravity pointing in X direction -->
<gravity>9.8 0 0</gravity>

<!-- Gravity pointing in Y direction -->
<gravity>0 9.8 0</gravity>

<!-- Diagonal gravity -->
<gravity>-3.0 -3.0 -3.0</gravity>
```

### Launching with Custom Gravity
You can also set gravity when launching Gazebo:
```bash
# Launch with custom gravity values
ros2 launch gazebo_ros empty_world.launch.py \
  gravity_x:=0 \
  gravity_y:=0 \
  gravity_z:=-1.62  # Moon gravity
```

### Gravity Validation
To validate that gravity is correctly configured:

1. **Drop Test**: Place an object at a known height and measure fall time
   - Theoretical time: `t = √(2h/g)`
   - Example: Object dropped from 1m should hit ground in ~0.45s (with g=9.8)

2. **Rolling Test**: Place a sphere on an inclined plane
   - Should accelerate according to `a = g * sin(θ)` (friction permitting)

3. **Pendulum Test**: Create a simple pendulum
   - Period should be `T = 2π√(L/g)` where L is pendulum length

## Collision Detection Configuration

### Collision Properties in URDF

Collision properties are defined in your robot's URDF file:

```xml
<link name="base_link">
  <collision>
    <geometry>
      <box size="0.2 0.1 0.1"/>
    </geometry>
    <!-- Surface properties -->
    <surface>
      <friction>
        <ode>
          <mu>1.0</mu>  <!-- Static friction coefficient -->
          <mu2>1.0</mu2> <!-- Dynamic friction coefficient -->
        </ode>
      </friction>
      <bounce>
        <restitution_coefficient>0.1</restitution_coefficient>
        <threshold>100000</threshold>
      </bounce>
      <contact>
        <ode>
          <soft_cfm>0.000001</soft_cfm>
          <soft_erp>0.2</soft_erp>
          <kp>1000000000000.0</kp>  <!-- Contact stiffness -->
          <kd>1.0</kd>              <!-- Contact damping -->
        </ode>
      </contact>
    </surface>
  </collision>
</link>
```

### Friction Coefficients for Different Materials

| Material | Static Friction (μ) | Dynamic Friction (μ₂) |
|----------|-------------------|---------------------|
| Rubber on concrete | 1.0 | 0.8 |
| Steel on steel | 0.74 | 0.57 |
| Wood on wood | 0.25-0.5 | 0.2-0.5 |
| Ice on ice | 0.1 | 0.03 |

## Sample Worlds with Physics Configuration

### Basic Physics Test World

Create `physics_test.sdf` in your worlds directory:

```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="physics_test_world">
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

    <!-- A simple box to test physics -->
    <model name="test_box">
      <pose>0 0 2 0 0 0</pose>
      <link name="link">
        <inertial>
          <mass>1.0</mass>
          <inertia>
            <ixx>0.001667</ixx>
            <ixy>0</ixy>
            <ixz>0</ixz>
            <iyy>0.001667</iyy>
            <iyz>0</iyz>
            <izz>0.001667</izz>
          </inertia>
        </inertial>
        <collision name="collision">
          <geometry>
            <box size="0.1 0.1 0.1"/>
          </geometry>
          <surface>
            <friction>
              <ode>
                <mu>0.8</mu>
                <mu2>0.6</mu2>
              </ode>
            </friction>
          </surface>
        </collision>
        <visual name="visual">
          <geometry>
            <box size="0.1 0.1 0.1"/>
          </geometry>
          <material>
            <ambient>1 0 0 1</ambient>
            <diffuse>1 0 0 1</diffuse>
          </material>
        </visual>
      </link>
    </model>

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

## Gravity Adjustment Examples

### Launching with Different Gravity Settings

Create a launch file to test different gravity settings:

```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import PathJoinSubstitution, LaunchConfiguration
from ament_index_python.packages import get_package_share_directory


def generate_launch_description():
    # Declare launch arguments
    gravity_x = DeclareLaunchArgument(
        'gravity_x', default_value='0.0',
        description='Gravity X component'
    )
    gravity_y = DeclareLaunchArgument(
        'gravity_y', default_value='0.0',
        description='Gravity Y component'
    )
    gravity_z = DeclareLaunchArgument(
        'gravity_z', default_value='-9.8',
        description='Gravity Z component'
    )

    # Launch Gazebo with custom gravity
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            get_package_share_directory('gazebo_ros'),
            '/launch/empty_world.launch.py'
        ]),
        launch_arguments={
            'world': PathJoinSubstitution([
                get_package_share_directory('your_package'),
                'worlds',
                'physics_test.sdf'
            ]),
            'physics': 'ode',
            'gravity_x': LaunchConfiguration('gravity_x'),
            'gravity_y': LaunchConfiguration('gravity_y'),
            'gravity_z': LaunchConfiguration('gravity_z'),
        }.items()
    )

    return LaunchDescription([
        gravity_x,
        gravity_y,
        gravity_z,
        gazebo,
    ])
```

## Collision Model Examples

### Different Collision Shapes

```xml
<!-- Sphere collision -->
<collision>
  <geometry>
    <sphere radius="0.05"/>
  </geometry>
</collision>

<!-- Box collision -->
<collision>
  <geometry>
    <box size="0.1 0.1 0.1"/>
  </geometry>
</collision>

<!-- Cylinder collision -->
<collision>
  <geometry>
    <cylinder radius="0.05" length="0.1"/>
  </geometry>
</collision>

<!-- Mesh collision -->
<collision>
  <geometry>
    <mesh>
      <uri>file://meshes/complex_shape.dae</uri>
    </mesh>
  </geometry>
</collision>
```

### Collision Properties for Different Materials

#### Rubber (High Friction, High Bounce)
```xml
<collision>
  <geometry>
    <sphere radius="0.05"/>
  </geometry>
  <surface>
    <friction>
      <ode>
        <mu>1.0</mu>
        <mu2>0.8</mu2>
      </ode>
    </friction>
    <bounce>
      <restitution_coefficient>0.8</restitution_coefficient>
      <threshold>100000</threshold>
    </bounce>
    <contact>
      <ode>
        <soft_cfm>0.000001</soft_cfm>
        <soft_erp>0.2</soft_erp>
        <kp>1000000000000.0</kp>
        <kd>1.0</kd>
      </ode>
    </contact>
  </surface>
</collision>
```

#### Ice (Low Friction, Low Bounce)
```xml
<collision>
  <geometry>
    <box size="0.1 0.1 0.1"/>
  </geometry>
  <surface>
    <friction>
      <ode>
        <mu>0.1</mu>
        <mu2>0.05</mu2>
      </ode>
    </friction>
    <bounce>
      <restitution_coefficient>0.1</restitution_coefficient>
      <threshold>100000</threshold>
    </bounce>
    <contact>
      <ode>
        <soft_cfm>0.001</soft_cfm>
        <soft_erp>0.1</soft_erp>
        <kp>100000000000.0</kp>
        <kd>10.0</kd>
      </ode>
    </contact>
  </surface>
</collision>
```

#### Concrete (Medium Friction, Low Bounce)
```xml
<collision>
  <geometry>
    <cylinder radius="0.05" length="0.1"/>
  </geometry>
  <surface>
    <friction>
      <ode>
        <mu>0.8</mu>
        <mu2>0.6</mu2>
      </ode>
    </friction>
    <bounce>
      <restitution_coefficient>0.2</restitution_coefficient>
      <threshold>100000</threshold>
    </bounce>
    <contact>
      <ode>
        <soft_cfm>0.0001</soft_cfm>
        <soft_erp>0.15</soft_erp>
        <kp>1000000000000.0</kp>
        <kd>2.0</kd>
      </ode>
    </contact>
  </surface>
</collision>
```

### Complex Collision with Multiple Properties

For a humanoid robot foot that needs to interact with various surfaces:

```xml
<link name="foot">
  <collision>
    <geometry>
      <box size="0.1 0.05 0.05"/>
    </geometry>
    <surface>
      <!-- High friction for stable walking -->
      <friction>
        <ode>
          <mu>0.9</mu>
          <mu2>0.8</mu2>
        </ode>
      </friction>
      <!-- Low bounce to prevent unrealistic jumping -->
      <bounce>
        <restitution_coefficient>0.05</restitution_coefficient>
        <threshold>100000</threshold>
      </bounce>
      <!-- Contact properties for stable contact -->
      <contact>
        <ode>
          <soft_cfm>0.00001</soft_cfm>
          <soft_erp>0.1</soft_erp>
          <kp>1000000000000.0</kp>
          <kd>0.5</kd>
        </ode>
      </contact>
    </surface>
  </collision>
</link>
```

### Collision Filtering with Categories and Masks

For complex scenarios where you want to control which objects collide:

```xml
<gazebo reference="robot_link">
  <collision>
    <surface>
      <!-- Only collide with environment objects (category 1), not other robots (category 2) -->
      <contact>
        <collide_without_contact_bitmask>1</collide_without_contact_bitmask>
        <collide_bitmask>1</collide_bitmask>
      </contact>
    </surface>
  </collision>
</gazebo>
```
```

## Performance Optimization

### Physics Settings for Performance vs Accuracy

For **High Performance** (less accurate):
```xml
<physics name="fast" type="ode">
  <max_step_size>0.01</max_step_size>
  <real_time_factor>2</real_time_factor>
  <ode>
    <solver>
      <iters>5</iters>
    </solver>
  </ode>
</physics>
```

For **High Accuracy** (slower):
```xml
<physics name="accurate" type="ode">
  <max_step_size>0.0005</max_step_size>
  <real_time_factor>0.5</real_time_factor>
  <ode>
    <solver>
      <iters>20</iters>
    </solver>
    <constraints>
      <cfm>0.000001</cfm>
      <erp>0.1</erp>
    </constraints>
  </ode>
</physics>
```

## Troubleshooting Physics Issues

### Common Physics Problems and Solutions

1. **Objects falling through surfaces**: Increase constraint parameters
   ```xml
   <constraints>
     <contact_surface_layer>0.01</contact_surface_layer>
     <contact_max_correcting_vel>10</contact_max_correcting_vel>
   </constraints>
   ```

2. **Jittery movement**: Decrease time step or increase solver iterations
   ```xml
   <max_step_size>0.0005</max_step_size>
   <ode>
     <solver>
       <iters>20</iters>
     </solver>
   </ode>
   ```

3. **Objects sticking together**: Adjust restitution coefficients
   ```xml
   <bounce>
     <restitution_coefficient>0.01</restitution_coefficient>
   </bounce>
   ```

## Validation of Physics Configuration

### Testing Physics Accuracy

To validate that your physics configuration is accurate:

1. Drop an object from a known height and measure fall time
2. Compare with theoretical values: `t = √(2h/g)`
3. Test collision responses with known coefficients
4. Verify that friction prevents sliding on appropriate slopes

### Example Validation Script

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from gazebo_msgs.msg import LinkStates
from geometry_msgs.msg import Point
import math

class PhysicsValidator(Node):
    def __init__(self):
        super().__init__('physics_validator')
        self.subscription = self.create_subscription(
            LinkStates,
            '/gazebo/link_states',
            self.link_states_callback,
            10)
        self.start_time = self.get_clock().now()
        self.start_height = None
        self.test_object_name = 'test_box::link'

    def link_states_callback(self, msg):
        try:
            idx = msg.name.index(self.test_object_name)
            position = msg.pose[idx].position

            if self.start_height is None:
                self.start_height = position.z
                self.start_time = self.get_clock().now()
            else:
                # Calculate theoretical position: z = z0 - 0.5*g*t^2
                current_time = self.get_clock().now()
                elapsed = (current_time - self.start_time).nanoseconds / 1e9
                theoretical_z = self.start_height - 0.5 * 9.8 * elapsed**2
                actual_diff = abs(position.z - theoretical_z)

                if actual_diff < 0.1:  # Within 10cm tolerance
                    self.get_logger().info(f'Physics validation passed: diff={actual_diff:.3f}m')
                else:
                    self.get_logger().warn(f'Physics validation failed: diff={actual_diff:.3f}m')
        except ValueError:
            pass  # Object not found in link states

def main(args=None):
    rclpy.init(args=args)
    validator = PhysicsValidator()
    rclpy.spin(validator)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Next Steps

After configuring physics parameters:

1. Test with your specific robot models
2. Fine-tune parameters for your application
3. Set up sensor simulation (covered in the next section)
4. Create more complex environments with varied physics properties

## References

- Gazebo Physics Documentation: https://gazebosim.org/api/gazebo/6.0.0/physics.html
- ODE User Guide: http://ode.org/ode-dblib-userguide-0.12.pdf
- ROS 2 Gazebo Integration: https://classic.gazebosim.org/tutorials?tut=ros2_overview

---

This guide provides the foundation for configuring physics in Gazebo for accurate digital twin applications. The next section will cover Unity physics configuration for visualization consistency.