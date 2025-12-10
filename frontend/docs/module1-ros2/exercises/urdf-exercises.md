---
sidebar_position: 3
---

# URDF Modeling Exercises

This section provides hands-on exercises to reinforce your understanding of URDF modeling for humanoid robots.

## Exercise 1: Simple Robot Model

**Objective**: Create a basic mobile robot URDF model with wheels and a chassis.

### Steps:
1. Create a URDF file for a simple 2-wheeled robot
2. Include the base chassis and two wheels
3. Define appropriate visual, collision, and inertial properties
4. Validate the URDF file using `check_urdf`

### Solution Template:
```xml
<?xml version="1.0"?>
<robot name="simple_robot">
  <!-- Base link -->
  <link name="base_link">
    <visual>
      <!-- TODO: Define visual geometry for the base -->
    </visual>
    <collision>
      <!-- TODO: Define collision geometry for the base -->
    </collision>
    <inertial>
      <!-- TODO: Define mass and inertia for the base -->
    </inertial>
  </link>

  <!-- Left wheel -->
  <link name="left_wheel">
    <visual>
      <!-- TODO: Define visual geometry for the left wheel -->
    </visual>
    <collision>
      <!-- TODO: Define collision geometry for the left wheel -->
    </collision>
    <inertial>
      <!-- TODO: Define mass and inertia for the left wheel -->
    </inertial>
  </link>

  <!-- Right wheel -->
  <link name="right_wheel">
    <visual>
      <!-- TODO: Define visual geometry for the right wheel -->
    </visual>
    <collision>
      <!-- TODO: Define collision geometry for the right wheel -->
    </collision>
    <inertial>
      <!-- TODO: Define mass and inertia for the right wheel -->
    </inertial>
  </link>

  <!-- Joints connecting wheels to base -->
  <!-- TODO: Define joints connecting wheels to the base -->
</robot>
```

### Validation Command:
```bash
check_urdf simple_robot.urdf
```

## Exercise 2: Articulated Arm

**Objective**: Create a 3-DOF robotic arm using URDF.

### Steps:
1. Create links for the base, upper arm, and lower arm
2. Define revolute joints connecting the links
3. Add appropriate joint limits
4. Include visual and collision properties for each link

### Solution Template:
```xml
<?xml version="1.0"?>
<robot name="robotic_arm">
  <!-- Base of the arm -->
  <link name="arm_base">
    <!-- TODO: Define base link properties -->
  </link>

  <!-- Shoulder joint -->
  <joint name="shoulder_joint" type="revolute">
    <!-- TODO: Define joint connecting base to upper arm -->
  </joint>

  <!-- Upper arm -->
  <link name="upper_arm">
    <!-- TODO: Define upper arm link properties -->
  </link>

  <!-- Elbow joint -->
  <joint name="elbow_joint" type="revolute">
    <!-- TODO: Define joint connecting upper arm to lower arm -->
  </joint>

  <!-- Lower arm -->
  <link name="lower_arm">
    <!-- TODO: Define lower arm link properties -->
  </link>

  <!-- Wrist joint -->
  <joint name="wrist_joint" type="revolute">
    <!-- TODO: Define joint for wrist rotation -->
  </joint>

  <!-- End effector -->
  <link name="end_effector">
    <!-- TODO: Define end effector link -->
  </link>
</robot>
```

## Exercise 3: Humanoid Torso

**Objective**: Create the upper body of a humanoid robot with head and arms.

### Steps:
1. Create the torso link with appropriate dimensions
2. Add a head link with neck joint
3. Create left and right arm chains (shoulder, elbow, wrist)
4. Use realistic joint limits based on human anatomy
5. Apply appropriate materials and colors

### Solution Template:
```xml
<?xml version="1.0"?>
<robot name="humanoid_torso">
  <!-- Torso -->
  <link name="torso">
    <visual>
      <geometry>
        <box size="0.3 0.3 0.6"/>
      </geometry>
      <material name="body_material">
        <color rgba="0.8 0.8 0.8 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.3 0.3 0.6"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10.0"/>
      <origin xyz="0 0 0"/>
      <inertia ixx="0.5" ixy="0" ixz="0" iyy="0.5" iyz="0" izz="0.2"/>
    </inertial>
  </link>

  <!-- Head -->
  <link name="head">
    <!-- TODO: Define head link with visual, collision, and inertial properties -->
  </link>

  <!-- Neck joint -->
  <joint name="neck_joint" type="revolute">
    <!-- TODO: Define neck joint with appropriate limits -->
  </joint>

  <!-- TODO: Add left and right arms with shoulder, elbow, and wrist joints -->
  <!-- Use xacro macros to avoid duplication -->
</robot>
```

## Exercise 4: Using Xacro for Humanoid

**Objective**: Convert the humanoid model to use Xacro for better maintainability.

### Steps:
1. Create a main URDF file that includes Xacro components
2. Define Xacro macros for repeated elements (arms, legs)
3. Use Xacro properties for consistent measurements
4. Include the humanoid model with both arms and legs

### Main URDF Template:
```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="xacro_humanoid">
  <!-- Properties -->
  <xacro:property name="M_PI" value="3.14159265359"/>
  <xacro:property name="torso_mass" value="15.0"/>
  <xacro:property name="arm_mass" value="2.0"/>
  <!-- TODO: Add more properties -->

  <!-- Include components -->
  <!-- TODO: Include torso, head, and limb components -->

  <!-- Torso -->
  <link name="torso">
    <!-- TODO: Define torso with properties -->
  </link>

  <!-- Head -->
  <link name="head">
    <!-- TODO: Define head -->
  </link>

  <joint name="neck_joint" type="revolute">
    <!-- TODO: Define neck joint -->
  </joint>

  <!-- Use macros for arms and legs -->
  <!-- TODO: Call arm and leg macros for both sides -->
</robot>
```

### Xacro Arm Macro Template:
```xml
<xacro:macro name="arm" params="side reflect">
  <!-- Shoulder -->
  <link name="${side}_shoulder">
    <!-- TODO: Define shoulder link -->
  </link>

  <joint name="${side}_shoulder_joint" type="revolute">
    <!-- TODO: Define shoulder joint -->
  </joint>

  <!-- TODO: Define upper arm, elbow joint, lower arm, wrist joint -->
</xacro:macro>
```

## Exercise 5: Adding Gazebo Integration

**Objective**: Extend your URDF model with Gazebo-specific elements.

### Steps:
1. Add Gazebo materials to your links
2. Include physics properties for simulation
3. Add transmission elements for joint control
4. Define plugins for sensors or controllers

### Solution Template:
```xml
<?xml version="1.0"?>
<robot name="gazebo_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="1 1 1"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="1 1 1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Gazebo-specific elements -->
  <gazebo reference="base_link">
    <material>Gazebo/Blue</material>
    <mu1>0.2</mu1>
    <mu2>0.2</mu2>
  </gazebo>

  <!-- Joint with transmission for control -->
  <joint name="example_joint" type="revolute">
    <parent link="base_link"/>
    <child link="arm_link"/>
    <origin xyz="0.5 0 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="1"/>
  </joint>

  <transmission name="example_transmission">
    <type>transmission_interface/SimpleTransmission</type>
    <joint name="example_joint">
      <hardwareInterface>hardware_interface/EffortJointInterface</hardwareInterface>
    </joint>
    <actuator name="example_motor">
      <mechanicalReduction>1</mechanicalReduction>
    </actuator>
  </transmission>
</robot>
```

## Exercise 6: Humanoid with Sensors

**Objective**: Add sensor elements to your humanoid model for perception.

### Steps:
1. Add camera sensors to the head
2. Include IMU sensors for balance
3. Add force/torque sensors to feet
4. Define appropriate mounting positions

### Solution Template:
```xml
<?xml version="1.0"?>
<robot name="sensor_humanoid">
  <!-- Base links (torso, head, limbs) -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="2.0"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.01"/>
    </inertial>
  </link>

  <!-- Camera sensor -->
  <gazebo reference="head">
    <sensor name="camera" type="camera">
      <pose>0.08 0 0 0 0 0</pose>
      <camera>
        <horizontal_fov>1.089</horizontal_fov>
        <image>
          <width>640</width>
          <height>480</height>
        </image>
        <clip>
          <near>0.1</near>
          <far>100</far>
        </clip>
      </camera>
      <always_on>true</always_on>
      <update_rate>30</update_rate>
      <visualize>true</visualize>
    </sensor>
  </gazebo>

  <!-- IMU sensor -->
  <gazebo reference="torso">
    <sensor name="imu" type="imu">
      <always_on>true</always_on>
      <update_rate>100</update_rate>
      <visualize>false</visualize>
    </sensor>
  </gazebo>

  <!-- Force/Torque sensor in foot -->
  <link name="left_foot">
    <!-- TODO: Define foot link -->
  </link>

  <gazebo reference="left_foot">
    <sensor name="left_foot_ft" type="force_torque">
      <always_on>true</always_on>
      <update_rate>100</update_rate>
    </sensor>
  </gazebo>
</robot>
```

## Exercise 7: Complete Humanoid Model

**Objective**: Create a complete humanoid robot model with all components.

### Steps:
1. Combine all previous exercises into one model
2. Ensure proper kinematic chains
3. Use consistent naming conventions
4. Include all necessary inertial properties
5. Validate the complete model

### Solution Template:
```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="complete_humanoid">
  <!-- Include all necessary xacro files -->
  <!-- TODO: Define complete humanoid with torso, head, arms, and legs -->

  <!-- Define all joints with proper limits and safety controllers -->
  <!-- TODO: Add all joints with realistic limits -->

  <!-- Add transmissions for all actuated joints -->
  <!-- TODO: Add transmission elements -->

  <!-- Add Gazebo plugins and sensors -->
  <!-- TODO: Add simulation-specific elements -->
</robot>
```

## Self-Assessment Questions

After completing these exercises, answer these questions:

1. What are the three required elements for every URDF link?
2. What's the difference between visual and collision properties?
3. Why are inertial properties important in URDF models?
4. How do joint limits prevent damage to real robots?
5. What is the purpose of the `origin` element in joints and links?
6. How does Xacro help in creating complex robot models?
7. What are the advantages of using Gazebo integration in URDF?
8. How do you validate a URDF file before using it?

## Visualization and Testing

After creating your URDF models:

1. **Validate the URDF**:
   ```bash
   check_urDF your_model.urdf
   ```

2. **Visualize in RViz**:
   ```bash
   ros2 run rviz2 rviz2
   # Add RobotModel display and set topic to your robot description
   ```

3. **Use joint state publisher GUI**:
   ```bash
   ros2 run joint_state_publisher_gui joint_state_publisher_gui
   ```

## Advanced Challenge: Walking Pattern

As an advanced challenge, create a URDF model that demonstrates a simple walking pattern by animating the joint states through a sequence of poses that represent a walking gait cycle.

## Solutions and Further Learning

After completing these exercises, you should be able to:
- Create complex robot models using URDF
- Use Xacro to manage complex models efficiently
- Integrate your models with simulation environments
- Apply proper inertial and physical properties
- Add sensors and actuators to your robot models

These skills are essential for creating accurate humanoid robot models for simulation and control.