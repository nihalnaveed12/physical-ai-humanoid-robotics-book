# Digital Twin Interface Contract

## Overview
This contract defines the expected interfaces, data formats, and behaviors for the digital twin simulation components in both Gazebo and Unity environments.

## Simulation Configuration Interface

### Configuration Schema
```yaml
simulation_config:
  robot_model: string  # Path to URDF (Gazebo) or asset (Unity)
  environment: string  # Path to SDF world or Unity scene
  physics:
    engine: "ode" | "dart" | "bullet" | "physx"
    gravity: [float, float, float]  # [x, y, z] in m/s²
    time_step: float  # Simulation time step in seconds
    real_time_factor: float  # Real-time simulation speed
  sensors:
    - type: "lidar" | "depth_camera" | "imu"
      name: string
      topic: string  # ROS topic name
      update_rate: float  # Hz
      parameters: object  # Sensor-specific parameters
```

### Expected Behaviors
- Configuration files must validate against the schema
- All paths must be resolvable within the project context
- Physics parameters must be within realistic ranges
- Sensor topics must follow ROS naming conventions

## Sensor Data Interface

### LiDAR Data Format
- Topic: `/sensor/lidar/scan` (or configured topic)
- Message Type: `sensor_msgs/LaserScan`
- Expected Fields: `ranges`, `intensities`, `angle_min`, `angle_max`, `angle_increment`, `time_increment`, `scan_time`, `range_min`, `range_max`

### Depth Camera Data Format
- Topic: `/sensor/depth/image` (or configured topic)
- Message Type: `sensor_msgs/Image` + `sensor_msgs/CameraInfo`
- Expected Fields: Image data, camera intrinsic parameters

### IMU Data Format
- Topic: `/sensor/imu/data` (or configured topic)
- Message Type: `sensor_msgs/Imu`
- Expected Fields: `orientation`, `angular_velocity`, `linear_acceleration`, and their covariances

## Environment Synchronization Interface

### State Synchronization
- Robot joint states must be synchronized between Gazebo and Unity when both are running
- Transform data (position, orientation) must match within tolerance
- Simulation time must be consistent across environments

### Tolerance Requirements
- Position: ±0.01m
- Orientation: ±0.1 degrees
- Timing: ±0.01s

## Validation Requirements

### Setup Validation
- All referenced model files must exist and be valid
- All referenced environment files must exist and be valid
- All sensor configurations must be valid for the target environment

### Runtime Validation
- Simulation must run for minimum 30 seconds without errors
- Sensor data must be published at expected rates
- All ROS topics must be accessible and publishing data

## Error Handling

### Configuration Errors
- Invalid configuration files must produce clear error messages
- Missing dependencies must be clearly identified
- Unsupported parameters must be rejected with explanation

### Runtime Errors
- Simulation failures must be logged with sufficient detail for debugging
- Sensor failures must be detectable and reported
- Connection failures between environments must be handled gracefully