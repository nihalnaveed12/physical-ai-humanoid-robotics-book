# Data Model: Module 2: The Digital Twin (Gazebo & Unity)

## Key Entities

### Digital Twin Environment
- **Description**: A virtual representation of a physical humanoid robot system that includes physics simulation, sensor simulation, and environmental modeling
- **Attributes**:
  - environment_type (gazebo|unity)
  - physics_engine (ode|dart|bullet|physx)
  - gravity_settings (Vector3: x, y, z)
  - collision_models (list of collision model configurations)
  - sensor_configurations (list of sensor settings)

### Simulation Configuration
- **Description**: The set of parameters, models, and settings that define how a digital twin behaves in Gazebo and Unity environments
- **Attributes**:
  - robot_model_path (string: path to URDF/SDF)
  - environment_path (string: path to world/scene file)
  - physics_parameters (dict: engine-specific settings)
  - sensor_parameters (dict: sensor-specific settings)
  - rendering_settings (dict: visualization parameters)

### Sensor Data Streams
- **Description**: Simulated data outputs from virtual sensors (LiDAR, depth cameras, IMU) that mirror real-world sensor behavior
- **Attributes**:
  - sensor_type (lidar|depth_camera|imu)
  - data_format (string: message type, e.g., sensor_msgs/LaserScan)
  - update_rate (float: Hz)
  - data_payload (varies by sensor type)
  - topic_name (string: ROS topic for data stream)

### Physics Configuration
- **Description**: Settings that control the physics simulation behavior in both environments
- **Attributes**:
  - gravity (Vector3: x, y, z components)
  - time_step (float: simulation time step in seconds)
  - max_step_size (float: maximum allowed step size)
  - real_time_factor (float: real-time simulation speed)
  - physics_engine (string: engine name)

### Environment Assets
- **Description**: Files and resources needed for the simulation environments
- **Attributes**:
  - asset_type (urdf|sdf|unity_scene|mesh|texture)
  - file_path (string: relative path from project root)
  - dependencies (list: other assets this asset depends on)
  - format_version (string: version of the format)

## Relationships

- Digital Twin Environment **contains** multiple Simulation Configurations
- Simulation Configuration **uses** one Physics Configuration
- Simulation Configuration **includes** multiple Sensor Data Streams
- Simulation Configuration **references** multiple Environment Assets

## Validation Rules

1. **Digital Twin Environment**:
   - environment_type must be either 'gazebo' or 'unity'
   - gravity_settings must be a valid 3D vector
   - sensor_configurations must be a valid list of sensor configurations

2. **Simulation Configuration**:
   - robot_model_path must point to a valid URDF (for Gazebo) or Unity model
   - physics_parameters must be compatible with the selected physics engine
   - all referenced assets must exist

3. **Sensor Data Streams**:
   - sensor_type must be one of the supported types (lidar, depth_camera, imu)
   - update_rate must be positive
   - topic_name must follow ROS naming conventions

4. **Physics Configuration**:
   - gravity components must be within realistic ranges
   - time_step must be positive
   - real_time_factor must be positive

5. **Environment Assets**:
   - file_path must exist and be accessible
   - asset_type must be one of the supported types