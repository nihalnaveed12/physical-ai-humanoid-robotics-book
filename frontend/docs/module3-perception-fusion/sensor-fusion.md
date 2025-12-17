---
sidebar_position: 5
title: "Sensor Fusion Fundamentals: Combining Multiple Sensors"
---

# Sensor Fusion Fundamentals: Combining Multiple Sensors

## Overview

Sensor fusion is the process of combining data from multiple sensors to achieve more accurate, reliable, and robust perception than would be possible with any individual sensor. In humanoid robotics, sensor fusion combines data from cameras, LiDAR, IMUs, and other sensors to create a comprehensive understanding of the environment and robot state.

## Understanding Sensor Fusion in Robotics

### Why Sensor Fusion is Important

Robotics applications face several challenges that make sensor fusion essential:

- **Sensor Limitations**: Each sensor has limitations (e.g., cameras fail in low light, LiDAR struggles with transparent objects)
- **Environmental Variability**: Conditions change (lighting, weather, terrain) affecting sensor performance
- **Redundancy**: Multiple sensors provide backup when one fails
- **Complementary Information**: Different sensors provide different types of information that complement each other

### Types of Sensor Fusion

#### 1. Data-Level Fusion
- Combines raw sensor data before processing
- Example: Combining multiple camera images to form a panoramic view

#### 2. Feature-Level Fusion
- Extracts features from each sensor, then combines features
- Example: Combining visual features with LiDAR features for object recognition

#### 3. Decision-Level Fusion
- Each sensor makes independent decisions, then combines decisions
- Example: Multiple classifiers voting on object type

#### 4. Hybrid Fusion
- Combines multiple fusion levels
- Most common approach in robotics

## Mathematical Foundations

### Probabilistic Framework

Sensor fusion typically operates within a probabilistic framework where sensor measurements are treated as random variables with associated uncertainties:

```
P(state | measurements) ∝ P(measurements | state) × P(state)
```

Where:
- `P(state | measurements)` is the posterior probability of the state given measurements
- `P(measurements | state)` is the likelihood of measurements given the state
- `P(state)` is the prior probability of the state

### Covariance and Uncertainty

Each sensor measurement has associated uncertainty represented by a covariance matrix:

```python
# Example covariance matrix for a 3D position measurement
R = [[σx²,   0,   0],   # Variance in x direction
     [  0, σy²,   0],   # Variance in y direction
     [  0,   0, σz²]]   # Variance in z direction
```

## Common Fusion Algorithms

### 1. Weighted Average Fusion

For independent measurements of the same quantity, a weighted average provides optimal combination:

```python
def weighted_average_fusion(measurements, uncertainties):
    """
    Fuse multiple measurements using inverse covariance weighting

    Args:
        measurements: List of measurements [x1, x2, ...]
        uncertainties: List of uncertainties [σ1, σ2, ...]

    Returns:
        Fused estimate and its uncertainty
    """
    weights = [1.0 / (σ**2) for σ in uncertainties]
    total_weight = sum(weights)

    fused_estimate = sum(w * x for w, x in zip(weights, measurements)) / total_weight
    fused_uncertainty = 1.0 / total_weight

    return fused_estimate, fused_uncertainty
```

### 2. Kalman Filter

The Kalman filter is optimal for linear systems with Gaussian noise:

```python
import numpy as np

class KalmanFilter:
    def __init__(self, state_dim, measurement_dim):
        self.state_dim = state_dim
        self.measurement_dim = measurement_dim

        # State vector (e.g., [position, velocity])
        self.x = np.zeros(state_dim)

        # State covariance matrix
        self.P = np.eye(state_dim)

        # Process noise covariance
        self.Q = np.eye(state_dim)

        # Measurement noise covariance
        self.R = np.eye(measurement_dim)

        # State transition model
        self.F = np.eye(state_dim)

        # Measurement model
        self.H = np.zeros((measurement_dim, state_dim))

    def predict(self):
        """Prediction step"""
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q

    def update(self, z):
        """Update step with measurement z"""
        # Innovation
        y = z - self.H @ self.x

        # Innovation covariance
        S = self.H @ self.P @ self.H.T + self.R

        # Kalman gain
        K = self.P @ self.H.T @ np.linalg.inv(S)

        # Update state estimate
        self.x = self.x + K @ y

        # Update covariance
        self.P = (np.eye(self.state_dim) - K @ self.H) @ self.P
```

### 3. Extended Kalman Filter (EKF)

For nonlinear systems, the EKF linearizes around the current estimate:

```python
class ExtendedKalmanFilter:
    def __init__(self, state_dim, measurement_dim):
        self.state_dim = state_dim
        self.measurement_dim = measurement_dim
        self.x = np.zeros(state_dim)
        self.P = np.eye(state_dim)
        self.Q = np.eye(state_dim)
        self.R = np.eye(measurement_dim)

    def predict(self, control_input=None):
        """Nonlinear prediction step"""
        # Apply nonlinear motion model
        self.x = self.motion_model(self.x, control_input)

        # Linearize motion model (Jacobian)
        F = self.jacobian_motion_model(self.x, control_input)

        # Update covariance
        self.P = F @ self.P @ F.T + self.Q

    def update(self, z):
        """Nonlinear update step"""
        # Predicted measurement
        h_x = self.measurement_model(self.x)

        # Innovation
        y = z - h_x

        # Linearize measurement model (Jacobian)
        H = self.jacobian_measurement_model(self.x)

        # Innovation covariance
        S = H @ self.P @ H.T + self.R

        # Kalman gain
        K = self.P @ H.T @ np.linalg.inv(S)

        # Update state
        self.x = self.x + K @ y
        self.P = (np.eye(self.state_dim) - K @ H) @ self.P

    def motion_model(self, x, u):
        """Nonlinear motion model - implement based on your system"""
        raise NotImplementedError

    def measurement_model(self, x):
        """Nonlinear measurement model - implement based on your sensors"""
        raise NotImplementedError

    def jacobian_motion_model(self, x, u):
        """Jacobian of motion model"""
        raise NotImplementedError

    def jacobian_measurement_model(self, x):
        """Jacobian of measurement model"""
        raise NotImplementedError
```

## Multi-Sensor Fusion Examples

### 1. Camera-LiDAR Fusion

Combining visual and LiDAR data provides rich environmental understanding:

```python
import numpy as np
import cv2

class CameraLidarFusion:
    def __init__(self, camera_matrix, distortion_coeffs):
        self.camera_matrix = camera_matrix
        self.distortion_coeffs = distortion_coeffs

    def project_lidar_to_camera(self, lidar_points, T_cam_lidar):
        """
        Project LiDAR points to camera image coordinates

        Args:
            lidar_points: Nx3 array of LiDAR points [x, y, z]
            T_cam_lidar: 4x4 transformation matrix from LiDAR to camera frame

        Returns:
            2D image coordinates and corresponding 3D depths
        """
        # Transform points to camera frame
        points_h = np.hstack([lidar_points, np.ones((len(lidar_points), 1))])
        points_cam = (T_cam_lidar @ points_h.T).T[:, :3]

        # Project to image coordinates
        points_2d, _ = cv2.projectPoints(
            points_cam.reshape(-1, 1, 3),
            np.zeros(3), np.zeros(3),  # No rotation/translation needed
            self.camera_matrix,
            self.distortion_coeffs
        )

        points_2d = points_2d.reshape(-1, 2)

        # Extract depths (z-coordinates in camera frame)
        depths = points_cam[:, 2]

        return points_2d, depths

    def associate_features(self, image, lidar_points, T_cam_lidar):
        """
        Associate visual features with LiDAR points
        """
        # Extract visual features (e.g., SIFT, ORB)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        orb = cv2.ORB_create()
        keypoints, descriptors = orb.detectAndCompute(gray, None)

        if len(keypoints) == 0 or len(lidar_points) == 0:
            return [], []

        # Project LiDAR points to image
        lidar_2d, lidar_depths = self.project_lidar_to_camera(lidar_points, T_cam_lidar)

        # Find correspondences between keypoints and projected LiDAR points
        associations = []
        for i, kp in enumerate(keypoints):
            kp_coords = np.array([kp.pt[0], kp.pt[1]])

            # Find closest LiDAR point
            distances = np.linalg.norm(lidar_2d - kp_coords, axis=1)
            min_idx = np.argmin(distances)

            if distances[min_idx] < 10:  # Threshold for association
                associations.append({
                    'image_keypoint': i,
                    'lidar_point': min_idx,
                    'distance': distances[min_idx],
                    'lidar_depth': lidar_depths[min_idx]
                })

        return associations, descriptors
```

### 2. IMU-LiDAR Fusion

Combining IMU and LiDAR provides motion-compensated point clouds:

```python
import numpy as np
from scipy.spatial.transform import Rotation as R

class ImuLidarFusion:
    def __init__(self):
        self.imu_orientation = R.from_quat([0, 0, 0, 1])
        self.imu_velocity = np.zeros(3)
        self.imu_position = np.zeros(3)
        self.last_imu_time = None

    def update_imu_state(self, gyro, accel, dt):
        """
        Update IMU-based state estimate
        """
        # Integrate angular velocity for orientation
        gyro_norm = np.linalg.norm(gyro)
        if gyro_norm > 1e-6:
            axis = gyro / gyro_norm
            angle = gyro_norm * dt
            dq = R.from_rotvec(axis * angle)
            self.imu_orientation = self.imu_orientation * dq

        # Integrate acceleration for velocity and position
        # Remove gravity from accelerometer
        gravity = np.array([0, 0, -9.81])
        rotated_gravity = self.imu_orientation.apply(gravity)
        net_accel = accel - rotated_gravity

        self.imu_velocity += net_accel * dt
        self.imu_position += self.imu_velocity * dt

    def compensate_lidar_motion(self, lidar_scan, timestamps, imu_data):
        """
        Compensate LiDAR scan for motion between beam acquisitions

        Args:
            lidar_scan: Original LiDAR point cloud
            timestamps: Time of each beam acquisition
            imu_data: Interpolated IMU data for each timestamp

        Returns:
            Motion-compensated point cloud
        """
        compensated_points = []

        for i, point in enumerate(lidar_scan):
            # Get IMU state at beam acquisition time
            if i < len(imu_data):
                imu_pos = imu_data[i]['position']
                imu_rot = imu_data[i]['orientation']

                # Transform point from end position back to start position
                # This compensates for motion during scan
                point_global = imu_rot.apply(point) + imu_pos
                point_start = self.imu_orientation.inv().apply(point_global - self.imu_position)

                compensated_points.append(point_start)
            else:
                compensated_points.append(point)

        return np.array(compensated_points)
```

## Fusion Architectures

### 1. Centralized Fusion

All sensor data is processed in a central node:

```
Sensor 1 ──┐
Sensor 2 ──┤
Sensor 3 ──┤──→ Central Fusion Node
Sensor 4 ──┤
Sensor 5 ──┘
```

**Advantages:**
- Optimal fusion using all correlations
- Global optimization possible

**Disadvantages:**
- Single point of failure
- High computational load
- Communication bottlenecks

### 2. Distributed Fusion

Each sensor processes its data locally, then combines results:

```
Sensor 1 ──┐    ┌── Local Processing ──┐
Sensor 2 ──┤    │                      │
          │──→ │                      ├──→ Global Fusion
Sensor 3 ──┤    │    Local Processing  │
Sensor 4 ──┘    └── Local Processing ──┘
```

**Advantages:**
- Robust to sensor failures
- Lower communication requirements
- Scalable architecture

**Disadvantages:**
- Suboptimal due to uncorrelated information
- More complex to implement

### 3. Hierarchical Fusion

Combines centralized and distributed approaches:

```
Level 1: Local sensor fusion
    ├── Camera + Depth camera → Visual fusion
    ├── Multiple LiDARs → LiDAR fusion
    └── IMU + Odometry → Motion fusion

Level 2: Cross-modal fusion
    ├── Visual + LiDAR → Environment fusion
    └── Motion + Environment → State estimation
```

## Implementation Considerations

### 1. Time Synchronization

Sensor data must be properly time-stamped and synchronized:

```python
class TimeSynchronizer:
    def __init__(self, max_time_diff=0.1):
        self.max_time_diff = max_time_diff
        self.buffers = {}

    def add_measurement(self, sensor_id, data, timestamp):
        """Add measurement to buffer"""
        if sensor_id not in self.buffers:
            self.buffers[sensor_id] = []

        self.buffers[sensor_id].append((timestamp, data))

        # Remove old measurements
        current_time = timestamp
        for sid in self.buffers:
            self.buffers[sid] = [
                (t, d) for t, d in self.buffers[sid]
                if abs(t - current_time) <= self.max_time_diff
            ]

    def get_synchronized_measurements(self, required_sensors, target_time):
        """Get synchronized measurements for all required sensors"""
        synchronized_data = {}

        for sensor_id in required_sensors:
            if sensor_id not in self.buffers:
                return None

            # Find closest measurement to target time
            buffer = self.buffers[sensor_id]
            if not buffer:
                return None

            closest_idx = min(range(len(buffer)),
                            key=lambda i: abs(buffer[i][0] - target_time))

            closest_time, closest_data = buffer[closest_idx]

            if abs(closest_time - target_time) <= self.max_time_diff:
                synchronized_data[sensor_id] = closest_data
            else:
                return None

        return synchronized_data
```

### 2. Data Association

Correctly matching measurements from different sensors:

```python
def associate_measurements(measurements_a, measurements_b, max_distance=1.0):
    """
    Associate measurements from two sensors
    """
    associations = []

    for i, meas_a in enumerate(measurements_a):
        for j, meas_b in enumerate(measurements_b):
            # Calculate distance between measurements
            distance = np.linalg.norm(meas_a.position - meas_b.position)

            if distance <= max_distance:
                associations.append((i, j, distance))

    # Use Hungarian algorithm for optimal assignment
    from scipy.optimize import linear_sum_assignment

    if associations:
        # Create cost matrix
        cost_matrix = np.full((len(measurements_a), len(measurements_b)), np.inf)

        for i, j, dist in associations:
            cost_matrix[i, j] = dist

        row_indices, col_indices = linear_sum_assignment(cost_matrix)

        # Return optimal associations
        return [(i, j) for i, j in zip(row_indices, col_indices)
                if cost_matrix[i, j] < max_distance]

    return []
```

## Performance Evaluation

### Metrics for Fusion Quality

1. **Accuracy**: How close fused estimates are to ground truth
2. **Consistency**: Whether uncertainty estimates match actual errors
3. **Robustness**: Performance degradation when individual sensors fail
4. **Latency**: Time from sensor input to fused output
5. **Computational Load**: CPU and memory requirements

### Testing Methodologies

1. **Simulation**: Use ground truth from simulators
2. **Calibration Objects**: Use known objects for validation
3. **Multiple Scenarios**: Test in various environments
4. **Sensor Failure Tests**: Verify graceful degradation

## Best Practices

### 1. Modular Design

Design fusion modules to be easily replaceable:

```python
from abc import ABC, abstractmethod

class FusionAlgorithm(ABC):
    @abstractmethod
    def fuse(self, measurements, covariances):
        pass

class KalmanFusion(FusionAlgorithm):
    def fuse(self, measurements, covariances):
        # Implement Kalman fusion
        pass

class ParticleFilterFusion(FusionAlgorithm):
    def fuse(self, measurements, covariances):
        # Implement particle filter fusion
        pass
```

### 2. Uncertainty Propagation

Always track and propagate uncertainty through the fusion process:

```python
def propagate_uncertainty(jacobian, input_covariance):
    """Propagate uncertainty through a transformation"""
    return jacobian @ input_covariance @ jacobian.T
```

### 3. Adaptive Fusion

Adjust fusion parameters based on sensor quality:

```python
def adaptive_fusion(measurements, sensor_qualities):
    """
    Adjust fusion weights based on sensor quality
    """
    # Calculate adaptive weights based on quality
    weights = [quality / sum(sensor_qualities)
               for quality in sensor_qualities]

    # Apply weighted fusion
    fused_result = sum(w * m for w, m in zip(weights, measurements))
    return fused_result
```

## Fusion Algorithm Examples: LiDAR and IMU Integration

### 1. LiDAR-IMU State Estimation

Combining LiDAR and IMU data provides accurate state estimation by leveraging the high-rate IMU data for motion compensation and the precise LiDAR measurements for position updates:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Imu, PointCloud2, LaserScan
from nav_msgs.msg import Odometry
from geometry_msgs.msg import PointStamped
from sensor_msgs_py import point_cloud2
from std_msgs.msg import Header
import numpy as np
from scipy.spatial.transform import Rotation as R
import tf2_ros


class LidarImuFusion(Node):
    def __init__(self):
        super().__init__('lidar_imu_fusion')

        # Subscription to sensor data
        self.imu_sub = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10
        )

        self.lidar_sub = self.create_subscription(
            PointCloud2,
            '/lidar_3d/points',
            self.lidar_callback,
            10
        )

        # Publishers for fused output
        self.odom_pub = self.create_publisher(
            Odometry,
            '/lidar_imu_fused/odom',
            10
        )

        self.position_pub = self.create_publisher(
            PointStamped,
            '/lidar_imu_fused/position',
            10
        )

        # State variables
        self.position = np.array([0.0, 0.0, 0.0])
        self.velocity = np.array([0.0, 0.0, 0.0])
        self.orientation = R.from_quat([0, 0, 0, 1])
        self.linear_acceleration = np.array([0.0, 0.0, 0.0])
        self.angular_velocity = np.array([0.0, 0.0, 0.0])

        # Covariance matrices
        self.position_cov = np.eye(3) * 1.0
        self.velocity_cov = np.eye(3) * 1.0
        self.orientation_cov = np.eye(3) * 0.1

        # Time tracking
        self.last_imu_time = None
        self.last_lidar_time = None

        # Motion model parameters
        self.gravity = np.array([0, 0, -9.81])

        # LiDAR processing parameters
        self.lidar_pose_history = []
        self.max_history = 100

        self.get_logger().info('LiDAR-IMU Fusion Node initialized')

    def imu_callback(self, msg):
        """Process IMU data for motion integration"""
        try:
            current_time = msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9

            if self.last_imu_time is not None:
                dt = current_time - self.last_imu_time

                # Extract IMU measurements
                linear_acc = np.array([
                    msg.linear_acceleration.x,
                    msg.linear_acceleration.y,
                    msg.linear_acceleration.z
                ])

                angular_vel = np.array([
                    msg.angular_velocity.x,
                    msg.angular_velocity.y,
                    msg.angular_velocity.z
                ])

                # Update orientation using angular velocity integration
                angular_vel_norm = np.linalg.norm(angular_vel)
                if angular_vel_norm > 1e-6:
                    rotation_angle = angular_vel_norm * dt
                    rotation_axis = angular_vel / angular_vel_norm
                    dq = R.from_rotvec(rotation_axis * rotation_angle)
                    self.orientation = self.orientation * dq

                # Transform acceleration to world frame and remove gravity
                world_acc = self.orientation.apply(linear_acc)
                net_acc = world_acc - self.gravity

                # Update velocity and position using acceleration
                self.velocity += net_acc * dt
                self.position += self.velocity * dt + 0.5 * net_acc * dt**2

                # Update uncertainty (simplified model)
                self.velocity_cov += np.eye(3) * (dt * 0.1)**2
                self.position_cov += np.eye(3) * (dt * 0.5)**2

                # Store measurements for fusion
                self.linear_acceleration = linear_acc
                self.angular_velocity = angular_vel

            self.last_imu_time = current_time

            # Publish current estimate from IMU integration
            self.publish_state_estimate(msg.header)

        except Exception as e:
            self.get_logger().error(f'Error processing IMU data: {e}')

    def lidar_callback(self, msg):
        """Process LiDAR data for position correction"""
        try:
            # Extract position estimate from LiDAR scan
            # This is a simplified approach - in practice, you'd use
            # feature matching, ICP, or other registration techniques
            lidar_position = self.process_lidar_scan(msg)

            if lidar_position is not None:
                # Fuse LiDAR position with current estimate
                self.fuse_lidar_position(lidar_position, msg.header)

        except Exception as e:
            self.get_logger().error(f'Error processing LiDAR data: {e}')

    def process_lidar_scan(self, msg):
        """
        Extract position information from LiDAR scan
        This is a simplified implementation - in practice, use ICP or feature matching
        """
        try:
            # Extract point cloud data
            points_list = []
            for point in point_cloud2.read_points(msg, field_names=['x', 'y', 'z'], skip_nans=True):
                points_list.append([point[0], point[1], point[2]])

            if len(points_list) < 10:  # Need minimum points for reliable estimate
                return None

            points = np.array(points_list)

            # For this example, use the centroid of ground points
            # In practice, you'd identify landmarks or use registration
            # Here we'll assume the robot position can be estimated from the scan

            # Filter points that are likely to be in the immediate vicinity
            # This is a simplified approach
            if len(points) > 0:
                # Calculate centroid as position estimate (simplified)
                centroid = np.mean(points, axis=0)

                # This is a placeholder - in reality, you'd use scan matching
                # or landmark-based localization
                return centroid[:3]  # Return x, y, z

        except Exception as e:
            self.get_logger().error(f'Error processing LiDAR scan: {e}')
            return None

    def fuse_lidar_position(self, lidar_pos, header):
        """
        Fuse LiDAR position estimate with current state
        """
        try:
            # For this example, we'll use a simple weighted fusion
            # In practice, use a proper Kalman filter or optimization-based approach

            # Calculate innovation (difference between prediction and measurement)
            innovation = lidar_pos - self.position

            # Simple fusion using fixed weights
            # In practice, weights would be based on relative uncertainties
            lidar_weight = 0.3  # Trust LiDAR for absolute position
            prediction_weight = 0.7  # Trust IMU integration for smoothness

            # Update position estimate
            self.position = prediction_weight * self.position + lidar_weight * lidar_pos

            # Update position covariance
            # Simplified: reduce uncertainty when LiDAR measurement is incorporated
            self.position_cov *= 0.8  # Reduce uncertainty

            # Publish fused estimate
            self.publish_state_estimate(header)

        except Exception as e:
            self.get_logger().error(f'Error fusing LiDAR position: {e}')

    def publish_state_estimate(self, header):
        """Publish current state estimate"""
        try:
            # Create Odometry message
            odom_msg = Odometry()
            odom_msg.header = Header()
            odom_msg.header.stamp = header.stamp
            odom_msg.header.frame_id = 'map'
            odom_msg.child_frame_id = 'base_link'

            # Set position
            odom_msg.pose.pose.position.x = float(self.position[0])
            odom_msg.pose.pose.position.y = float(self.position[1])
            odom_msg.pose.pose.position.z = float(self.position[2])

            # Set orientation
            quat = self.orientation.as_quat()
            odom_msg.pose.pose.orientation.x = float(quat[0])
            odom_msg.pose.pose.orientation.y = float(quat[1])
            odom_msg.pose.pose.orientation.z = float(quat[2])
            odom_msg.pose.pose.orientation.w = float(quat[3])

            # Set velocity
            odom_msg.twist.twist.linear.x = float(self.velocity[0])
            odom_msg.twist.twist.linear.y = float(self.velocity[1])
            odom_msg.twist.twist.linear.z = float(self.velocity[2])

            # Set covariances
            # Position covariance
            for i in range(3):
                for j in range(3):
                    odom_msg.pose.covariance[i*6 + j] = float(self.position_cov[i, j])

            # Velocity covariance
            for i in range(3):
                for j in range(3):
                    odom_msg.twist.covariance[i*6 + j] = float(self.velocity_cov[i, j])

            self.odom_pub.publish(odom_msg)

            # Publish position as PointStamped
            pos_msg = PointStamped()
            pos_msg.header = header
            pos_msg.header.frame_id = 'map'
            pos_msg.point.x = float(self.position[0])
            pos_msg.point.y = float(self.position[1])
            pos_msg.point.z = float(self.position[2])

            self.position_pub.publish(pos_msg)

        except Exception as e:
            self.get_logger().error(f'Error publishing state estimate: {e}')


def main(args=None):
    rclpy.init(args=args)
    node = LidarImuFusion()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### 2. Advanced LiDAR-IMU Fusion with Extended Kalman Filter

For more sophisticated fusion, implement an EKF that properly combines LiDAR and IMU measurements:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Imu, PointCloud2
from nav_msgs.msg import Odometry
from geometry_msgs.msg import PointStamped
from sensor_msgs_py import point_cloud2
from std_msgs.msg import Header
import numpy as np
from scipy.spatial.transform import Rotation as R


class LidarImuEKF(Node):
    """
    Extended Kalman Filter for LiDAR-IMU fusion
    State: [x, y, z, vx, vy, vz, qx, qy, qz, qw, bg_x, bg_y, bg_z, ba_x, ba_y, ba_z]
    (position, velocity, orientation, gyro bias, accel bias)
    """
    def __init__(self):
        super().__init__('lidar_imu_ekf')

        # Initialize state vector [x, y, z, vx, vy, vz, qx, qy, qz, qw, bg_x, bg_y, bg_z, ba_x, ba_y, ba_z]
        self.state_dim = 16
        self.x = np.zeros(self.state_dim)
        self.x[9] = 1.0  # Initialize quaternion to [0, 0, 0, 1] (no rotation)

        # Initialize covariance matrix
        self.P = np.eye(self.state_dim) * 1000.0  # High initial uncertainty
        self.P[6:10, 6:10] = np.eye(4) * 0.1     # Lower uncertainty for orientation

        # Process noise covariance
        self.Q = np.eye(self.state_dim)
        self.Q[0:3, 0:3] *= 0.1   # Position process noise
        self.Q[3:6, 3:6] *= 0.5   # Velocity process noise
        self.Q[6:10, 6:10] *= 0.01 # Orientation process noise
        self.Q[10:13, 10:13] *= 0.001 # Gyro bias process noise
        self.Q[13:16, 13:16] *= 0.01  # Accel bias process noise

        # Measurement noise covariance
        self.R_imu = np.diag([0.01, 0.01, 0.01, 0.001, 0.001, 0.001])  # [acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z]
        self.R_lidar = np.diag([0.1, 0.1, 0.1])  # [x, y, z]

        # Subscription to sensor data
        self.imu_sub = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10
        )

        self.lidar_sub = self.create_subscription(
            PointCloud2,
            '/lidar_3d/points',
            self.lidar_callback,
            10
        )

        # Publishers for fused output
        self.odom_pub = self.create_publisher(
            Odometry,
            '/lidar_imu_ekf/odom',
            10
        )

        self.position_pub = self.create_publisher(
            PointStamped,
            '/lidar_imu_ekf/position',
            10
        )

        # Time tracking
        self.last_time = None

        # Gravity vector
        self.gravity = np.array([0, 0, -9.81])

        self.get_logger().info('LiDAR-IMU EKF Node initialized')

    def imu_predict(self, linear_acc, angular_vel, dt):
        """
        Prediction step using IMU measurements
        """
        # Extract state components
        pos = self.x[0:3]      # Position [x, y, z]
        vel = self.x[3:6]      # Velocity [vx, vy, vz]
        quat = self.x[6:10]    # Orientation quaternion [qx, qy, qz, qw]
        gyro_bias = self.x[10:13]  # Gyro bias
        accel_bias = self.x[13:16] # Accel bias

        # Correct measurements with bias
        corrected_acc = linear_acc - accel_bias
        corrected_gyro = angular_vel - gyro_bias

        # Normalize quaternion
        quat_norm = np.linalg.norm(quat)
        if quat_norm > 0:
            quat = quat / quat_norm

        # Convert quaternion to rotation matrix
        r = R.from_quat([quat[0], quat[1], quat[2], quat[3]])
        rot_matrix = r.as_matrix()

        # Predict new orientation
        # Use quaternion integration
        omega_skew = np.array([
            [0, -corrected_gyro[2], corrected_gyro[1]],
            [corrected_gyro[2], 0, -corrected_gyro[0]],
            [-corrected_gyro[1], corrected_gyro[0], 0]
        ])

        # Quaternion derivative
        omega_quat = np.array([
            corrected_gyro[0], corrected_gyro[1], corrected_gyro[2], 0
        ])

        # Convert to quaternion form
        Omega_matrix = np.array([
            [0, -corrected_gyro[0], -corrected_gyro[1], -corrected_gyro[2]],
            [corrected_gyro[0], 0, corrected_gyro[2], -corrected_gyro[1]],
            [corrected_gyro[1], -corrected_gyro[2], 0, corrected_gyro[0]],
            [corrected_gyro[2], corrected_gyro[1], -corrected_gyro[0], 0]
        ])

        # Integrate quaternion
        quat_dot = 0.5 * Omega_matrix @ quat
        new_quat = quat + quat_dot * dt
        new_quat = new_quat / np.linalg.norm(new_quat)

        # Transform acceleration to world frame
        world_acc = rot_matrix @ corrected_acc + self.gravity

        # Predict new velocity and position
        new_vel = vel + world_acc * dt
        new_pos = pos + vel * dt + 0.5 * world_acc * dt**2

        # Update state vector
        self.x[0:3] = new_pos
        self.x[3:6] = new_vel
        self.x[6:10] = new_quat

        # Jacobian of motion model
        F = self.jacobian_motion_model(linear_acc, angular_vel, dt)

        # Predict covariance
        self.P = F @ self.P @ F.T + self.Q

    def jacobian_motion_model(self, linear_acc, angular_vel, dt):
        """
        Calculate Jacobian of motion model
        """
        F = np.eye(self.state_dim)

        # Get rotation matrix from current orientation
        quat = self.x[6:10]
        r = R.from_quat([quat[0], quat[1], quat[2], quat[3]])
        rot_matrix = r.as_matrix()

        # Position from velocity
        F[0:3, 3:6] = np.eye(3) * dt

        # Velocity from acceleration
        # This is simplified - in practice, you'd have the full Jacobian
        # with respect to orientation
        F[3:6, 6:9] = self.compute_velocity_orientation_jacobian(rot_matrix, linear_acc, dt)

        # Orientation update Jacobian (simplified)
        F[6:10, 6:10] = self.compute_quaternion_jacobian(angular_vel, dt)

        return F

    def compute_velocity_orientation_jacobian(self, rot_matrix, linear_acc, dt):
        """
        Compute Jacobian of velocity with respect to orientation
        """
        # This is a simplified version - full implementation would be more complex
        # For now, we'll return zeros
        return np.zeros((3, 3))

    def compute_quaternion_jacobian(self, angular_vel, dt):
        """
        Compute Jacobian of quaternion propagation
        """
        # Simplified Jacobian
        return np.eye(4)

    def lidar_update(self, lidar_pos):
        """
        Update step with LiDAR position measurement
        """
        # Measurement model H maps state to measurement space
        # LiDAR measures position [x, y, z]
        H = np.zeros((3, self.state_dim))
        H[0, 0] = 1.0  # Maps state x to measurement x
        H[1, 1] = 1.0  # Maps state y to measurement y
        H[2, 2] = 1.0  # Maps state z to measurement z

        # Predicted measurement
        h_x = H @ self.x

        # Innovation
        y = lidar_pos - h_x[0:3]

        # Innovation covariance
        S = H @ self.P @ H.T + self.R_lidar

        # Kalman gain
        K = self.P @ H.T @ np.linalg.inv(S)

        # Update state
        self.x = self.x + K @ np.concatenate([y, np.zeros(self.state_dim - 3)])

        # Update covariance
        self.P = (np.eye(self.state_dim) - K @ H) @ self.P

    def imu_callback(self, msg):
        """Process IMU measurements for prediction"""
        try:
            current_time = msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9

            if self.last_time is not None:
                dt = current_time - self.last_time

                # Extract IMU measurements
                linear_acc = np.array([
                    msg.linear_acceleration.x,
                    msg.linear_acceleration.y,
                    msg.linear_acceleration.z
                ])

                angular_vel = np.array([
                    msg.angular_velocity.x,
                    msg.angular_velocity.y,
                    msg.angular_velocity.z
                ])

                # Prediction step
                self.imu_predict(linear_acc, angular_vel, dt)

            self.last_time = current_time

            # Publish current estimate
            self.publish_state_estimate(msg.header)

        except Exception as e:
            self.get_logger().error(f'Error processing IMU data: {e}')

    def lidar_callback(self, msg):
        """Process LiDAR measurements for update"""
        try:
            # Extract position from LiDAR scan
            lidar_pos = self.extract_position_from_lidar(msg)

            if lidar_pos is not None:
                # Update step
                self.lidar_update(lidar_pos)

        except Exception as e:
            self.get_logger().error(f'Error processing LiDAR data: {e}')

    def extract_position_from_lidar(self, msg):
        """
        Extract position information from LiDAR scan
        This is a simplified implementation
        """
        try:
            # Extract point cloud data
            points_list = []
            for point in point_cloud2.read_points(msg, field_names=['x', 'y', 'z'], skip_nans=True):
                points_list.append([point[0], point[1], point[2]])

            if len(points_list) < 10:
                return None

            points = np.array(points_list)

            # For this example, use a simplified approach
            # In practice, you'd use scan matching or landmark identification
            # Return the centroid of the closest points as position estimate
            distances = np.linalg.norm(points, axis=1)
            closest_idx = np.argmin(distances)

            # This is a placeholder - in reality, you'd have a reference point
            # or use scan matching to determine position
            return points[closest_idx]

        except Exception as e:
            self.get_logger().error(f'Error extracting position from LiDAR: {e}')
            return None

    def publish_state_estimate(self, header):
        """Publish current state estimate"""
        try:
            # Create Odometry message
            odom_msg = Odometry()
            odom_msg.header = Header()
            odom_msg.header.stamp = header.stamp
            odom_msg.header.frame_id = 'map'
            odom_msg.child_frame_id = 'base_link'

            # Set position
            odom_msg.pose.pose.position.x = float(self.x[0])
            odom_msg.pose.pose.position.y = float(self.x[1])
            odom_msg.pose.pose.position.z = float(self.x[2])

            # Set orientation
            odom_msg.pose.pose.orientation.x = float(self.x[6])
            odom_msg.pose.pose.orientation.y = float(self.x[7])
            odom_msg.pose.pose.orientation.z = float(self.x[8])
            odom_msg.pose.pose.orientation.w = float(self.x[9])

            # Set velocity
            odom_msg.twist.twist.linear.x = float(self.x[3])
            odom_msg.twist.twist.linear.y = float(self.x[4])
            odom_msg.twist.twist.linear.z = float(self.x[5])

            # Set covariances (position only for this example)
            for i in range(3):
                for j in range(3):
                    odom_msg.pose.covariance[i*6 + j] = float(self.P[i, j])
                    odom_msg.twist.covariance[i*6 + j] = float(self.P[i+3, j+3])

            self.odom_pub.publish(odom_msg)

            # Publish position as PointStamped
            pos_msg = PointStamped()
            pos_msg.header = header
            pos_msg.header.frame_id = 'map'
            pos_msg.point.x = float(self.x[0])
            pos_msg.point.y = float(self.x[1])
            pos_msg.point.z = float(self.x[2])

            self.position_pub.publish(pos_msg)

        except Exception as e:
            self.get_logger().error(f'Error publishing state estimate: {e}')


def main(args=None):
    rclpy.init(args=args)
    node = LidarImuEKF()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Multi-Sensor Integration: Depth Camera and LiDAR Fusion

### 1. Depth Camera and LiDAR Data Association

Fusing depth camera and LiDAR data requires careful consideration of the different sensing modalities and their complementary strengths. Depth cameras provide dense color and depth information in a limited range, while LiDAR provides sparse but accurate 3D measurements over a longer range.

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, PointCloud2, CameraInfo
from geometry_msgs.msg import PointStamped
from sensor_msgs_py import point_cloud2
from cv_bridge import CvBridge
import cv2
import numpy as np
from scipy.spatial import cKDTree


class DepthCameraLidarFusion(Node):
    def __init__(self):
        super().__init__('depth_camera_lidar_fusion')

        # Subscription to sensor data
        self.depth_sub = self.create_subscription(
            Image,
            '/depth_camera/image',
            self.depth_callback,
            10
        )

        self.lidar_sub = self.create_subscription(
            PointCloud2,
            '/lidar_3d/points',
            self.lidar_callback,
            10
        )

        self.camera_info_sub = self.create_subscription(
            CameraInfo,
            '/depth_camera/camera_info',
            self.camera_info_callback,
            10
        )

        # Publisher for fused point cloud
        self.fused_cloud_pub = self.create_publisher(
            PointCloud2,
            '/fused/points',
            10
        )

        self.bridge = CvBridge()

        # Camera intrinsic parameters
        self.camera_matrix = None
        self.distortion_coeffs = None
        self.image_shape = None

        # Stores for synchronization
        self.latest_depth_image = None
        self.latest_lidar_points = None
        self.latest_camera_info = None

        # Processing parameters
        self.max_depth_association_distance = 0.1  # meters
        self.lidar_roi_size = 0.05  # meters for ROI around projected points

        self.get_logger().info('Depth Camera-LiDAR Fusion Node initialized')

    def camera_info_callback(self, msg):
        """Store camera intrinsic parameters"""
        self.camera_matrix = np.array(msg.k).reshape(3, 3)
        self.distortion_coeffs = np.array(msg.d)
        self.image_shape = (msg.height, msg.width)

    def depth_callback(self, msg):
        """Process depth camera data"""
        try:
            # Convert ROS Image to OpenCV
            if msg.encoding == '32FC1':
                depth_image = self.bridge.imgmsg_to_cv2(msg)
            elif msg.encoding == '16UC1':
                depth_image = self.bridge.imgmsg_to_cv2(msg).astype(np.float32) / 1000.0  # Convert mm to meters
            else:
                self.get_logger().error(f'Unsupported depth encoding: {msg.encoding}')
                return

            self.latest_depth_image = depth_image
            self.process_fusion_if_ready()

        except Exception as e:
            self.get_logger().error(f'Error processing depth image: {e}')

    def lidar_callback(self, msg):
        """Process LiDAR point cloud data"""
        try:
            # Extract point cloud data
            points_list = []
            for point in point_cloud2.read_points(msg, field_names=['x', 'y', 'z'], skip_nans=True):
                points_list.append([point[0], point[1], point[2]])

            if len(points_list) > 0:
                self.latest_lidar_points = np.array(points_list)
                self.process_fusion_if_ready()

        except Exception as e:
            self.get_logger().error(f'Error processing LiDAR data: {e}')

    def process_fusion_if_ready(self):
        """Process fusion when both sensors have data"""
        if (self.latest_depth_image is not None and
            self.latest_lidar_points is not None and
            self.camera_matrix is not None):

            try:
                # Perform depth camera and LiDAR fusion
                fused_points = self.fuse_depth_lidar(
                    self.latest_depth_image,
                    self.latest_lidar_points
                )

                # Publish fused point cloud
                self.publish_fused_cloud(fused_points)

            except Exception as e:
                self.get_logger().error(f'Error in fusion process: {e}')

    def fuse_depth_lidar(self, depth_image, lidar_points):
        """
        Fuse depth camera and LiDAR data
        """
        # Project LiDAR points to image space
        projected_points = self.project_lidar_to_image(lidar_points)

        # Get valid pixels in image
        valid_depth_mask = np.isfinite(depth_image) & (depth_image > 0)
        image_points = np.column_stack(np.where(valid_depth_mask))
        image_depths = depth_image[valid_depth_mask]

        # Create 3D points from depth image
        image_3d_points = []
        for (v, u), depth in zip(image_points, image_depths):
            if depth > 0:
                # Convert image coordinates to 3D world coordinates
                X, Y, Z = self.pixel_to_3d(u, v, depth)
                if X is not None and Y is not None and Z is not None:
                    image_3d_points.append([X, Y, Z])

        if len(image_3d_points) > 0:
            image_3d_points = np.array(image_3d_points)

        # Combine LiDAR and depth camera points
        if len(image_3d_points) > 0:
            fused_points = np.vstack([lidar_points, image_3d_points])
        else:
            fused_points = lidar_points

        # Apply outlier removal and filtering
        fused_points = self.filter_fused_points(fused_points)

        return fused_points

    def project_lidar_to_image(self, lidar_points):
        """
        Project LiDAR 3D points to image coordinates
        """
        if self.camera_matrix is None:
            return np.array([])

        # Apply camera projection
        points_2d, _ = cv2.projectPoints(
            lidar_points.reshape(-1, 1, 3).astype(np.float32),
            np.zeros(3), np.zeros(3),  # No rotation/translation
            self.camera_matrix,
            self.distortion_coeffs if self.distortion_coeffs is not None else np.zeros(5)
        )

        return points_2d.reshape(-1, 2)

    def pixel_to_3d(self, u, v, depth):
        """
        Convert image pixel coordinates to 3D world coordinates
        """
        if self.camera_matrix is None:
            return None, None, None

        # Convert to normalized coordinates
        x_norm = (u - self.camera_matrix[0, 2]) / self.camera_matrix[0, 0]
        y_norm = (v - self.camera_matrix[1, 2]) / self.camera_matrix[1, 1]

        # Convert to 3D world coordinates
        X = x_norm * depth
        Y = y_norm * depth
        Z = depth

        return X, Y, Z

    def filter_fused_points(self, points):
        """
        Apply filtering to remove outliers and noise
        """
        if len(points) == 0:
            return points

        # Remove points with invalid coordinates
        valid_mask = np.all(np.isfinite(points), axis=1)
        points = points[valid_mask]

        # Remove points that are too far away
        distances = np.linalg.norm(points, axis=1)
        distance_mask = distances < 50.0  # Filter points beyond 50m
        points = points[distance_mask]

        # Apply statistical outlier removal
        if len(points) > 10:
            points = self.remove_statistical_outliers(points)

        return points

    def remove_statistical_outliers(self, points, k=20, std_dev_thresh=2.0):
        """
        Remove statistical outliers using k-nearest neighbors
        """
        if len(points) <= k:
            return points

        # Build KD-tree for efficient neighbor search
        tree = cKDTree(points)

        # Calculate average distance to k nearest neighbors for each point
        distances, _ = tree.query(points, k=k+1)  # +1 because point is its own neighbor
        avg_distances = np.mean(distances[:, 1:], axis=1)  # Exclude self-distance

        # Calculate mean and std of average distances
        mean_dist = np.mean(avg_distances)
        std_dist = np.std(avg_distances)

        # Keep points within threshold
        valid_mask = avg_distances < (mean_dist + std_dev_thresh * std_dist)
        return points[valid_mask]

    def publish_fused_cloud(self, points):
        """
        Publish fused point cloud
        """
        if len(points) == 0:
            return

        # Convert to PointCloud2 message
        from std_msgs.msg import Header
        from sensor_msgs.msg import PointField
        from sensor_msgs_py import point_cloud2

        header = Header()
        header.stamp = self.get_clock().now().to_msg()
        header.frame_id = 'base_link'

        # Define point fields
        fields = [
            PointField(name='x', offset=0, datatype=PointField.FLOAT32, count=1),
            PointField(name='y', offset=4, datatype=PointField.FLOAT32, count=1),
            PointField(name='z', offset=8, datatype=PointField.FLOAT32, count=1),
        ]

        # Create PointCloud2 message
        pc_msg = point_cloud2.create_cloud(header, fields, points)
        self.fused_cloud_pub.publish(pc_msg)


def main(args=None):
    rclpy.init(args=args)
    node = DepthCameraLidarFusion()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### 2. Feature-Based Fusion of Depth Camera and LiDAR

For more sophisticated fusion, we can extract and match features from both sensors:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, PointCloud2, CameraInfo
from geometry_msgs.msg import PoseArray, PointStamped
from sensor_msgs_py import point_cloud2
from cv_bridge import CvBridge
import cv2
import numpy as np
from scipy.spatial import cKDTree


class FeatureBasedFusion(Node):
    def __init__(self):
        super().__init__('feature_based_fusion')

        # Subscription to sensor data
        self.image_sub = self.create_subscription(
            Image,
            '/camera/image',
            self.image_callback,
            10
        )

        self.depth_sub = self.create_subscription(
            Image,
            '/depth_camera/image',
            self.depth_callback,
            10
        )

        self.lidar_sub = self.create_subscription(
            PointCloud2,
            '/lidar_3d/points',
            self.lidar_callback,
            10
        )

        self.camera_info_sub = self.create_subscription(
            CameraInfo,
            '/camera/camera_info',
            self.camera_info_callback,
            10
        )

        # Publishers
        self.feature_matches_pub = self.create_publisher(
            PoseArray,
            '/fusion/feature_matches',
            10
        )

        self.enhanced_cloud_pub = self.create_publisher(
            PointCloud2,
            '/fusion/enhanced_points',
            10
        )

        self.bridge = CvBridge()

        # Camera parameters
        self.camera_matrix = None
        self.distortion_coeffs = None

        # Feature detector
        self.orb = cv2.ORB_create(nfeatures=500)
        self.bf_matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

        # Stores for processing
        self.latest_rgb = None
        self.latest_depth = None
        self.latest_lidar = None
        self.latest_features = None

        self.get_logger().info('Feature-Based Fusion Node initialized')

    def camera_info_callback(self, msg):
        """Store camera intrinsic parameters"""
        self.camera_matrix = np.array(msg.k).reshape(3, 3)
        self.distortion_coeffs = np.array(msg.d)

    def image_callback(self, msg):
        """Process RGB image for feature extraction"""
        try:
            # Convert to OpenCV format
            rgb_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')
            self.latest_rgb = rgb_image

            # Extract features
            gray = cv2.cvtColor(rgb_image, cv2.COLOR_BGR2GRAY)
            keypoints, descriptors = self.orb.detectAndCompute(gray, None)

            if descriptors is not None:
                self.latest_features = {
                    'keypoints': keypoints,
                    'descriptors': descriptors,
                    'image': rgb_image
                }

            self.process_fusion_if_ready()

        except Exception as e:
            self.get_logger().error(f'Error processing image: {e}')

    def depth_callback(self, msg):
        """Process depth image"""
        try:
            if msg.encoding == '32FC1':
                depth_image = self.bridge.imgmsg_to_cv2(msg)
            elif msg.encoding == '16UC1':
                depth_image = self.bridge.imgmsg_to_cv2(msg).astype(np.float32) / 1000.0
            else:
                self.get_logger().error(f'Unsupported depth encoding: {msg.encoding}')
                return

            self.latest_depth = depth_image
            self.process_fusion_if_ready()

        except Exception as e:
            self.get_logger().error(f'Error processing depth: {e}')

    def lidar_callback(self, msg):
        """Process LiDAR point cloud"""
        try:
            points_list = []
            for point in point_cloud2.read_points(msg, field_names=['x', 'y', 'z'], skip_nans=True):
                points_list.append([point[0], point[1], point[2]])

            if len(points_list) > 0:
                self.latest_lidar = np.array(points_list)
                self.process_fusion_if_ready()

        except Exception as e:
            self.get_logger().error(f'Error processing LiDAR: {e}')

    def process_fusion_if_ready(self):
        """Process fusion when all data is available"""
        if (self.latest_features is not None and
            self.latest_depth is not None and
            self.latest_lidar is not None and
            self.camera_matrix is not None):

            try:
                # Perform feature-based fusion
                enhanced_points = self.fuse_with_features(
                    self.latest_features,
                    self.latest_depth,
                    self.latest_lidar
                )

                # Publish results
                self.publish_enhanced_cloud(enhanced_points)

            except Exception as e:
                self.get_logger().error(f'Error in feature fusion: {e}')

    def fuse_with_features(self, features, depth_image, lidar_points):
        """
        Fuse RGB-D and LiDAR using feature matching
        """
        # Project LiDAR points to image space
        projected_lidar = self.project_points_to_image(lidar_points)

        # Extract depth values at projected LiDAR locations
        valid_projection_mask = (
            (projected_lidar[:, 0] >= 0) & (projected_lidar[:, 0] < depth_image.shape[1]) &
            (projected_lidar[:, 1] >= 0) & (projected_lidar[:, 1] < depth_image.shape[0])
        )

        projected_lidar = projected_lidar[valid_projection_mask]
        lidar_points_filtered = lidar_points[valid_projection_mask]

        # Get depth values at LiDAR projection points
        lidar_depths = []
        for u, v in projected_lidar.astype(int):
            depth_val = depth_image[v, u] if 0 <= v < depth_image.shape[0] and 0 <= u < depth_image.shape[1] else None
            if depth_val is not None and np.isfinite(depth_val) and depth_val > 0:
                lidar_depths.append(depth_val)
            else:
                lidar_depths.append(None)

        # Filter out invalid depths
        valid_depth_mask = [d is not None for d in lidar_depths]
        lidar_depths = [d for d, valid in zip(lidar_depths, valid_depth_mask) if valid]
        projected_lidar = projected_lidar[valid_depth_mask]
        lidar_points_filtered = lidar_points_filtered[valid_depth_mask]

        # Create enhanced point cloud by combining LiDAR with RGB-D data
        enhanced_points = lidar_points_filtered.copy()

        # Add RGB-D derived points where LiDAR is sparse
        rgb_depth_points = self.extract_depth_features(depth_image, features['keypoints'])

        if len(rgb_depth_points) > 0:
            # Combine both point clouds
            enhanced_points = np.vstack([enhanced_points, rgb_depth_points])

        return enhanced_points

    def project_points_to_image(self, points):
        """
        Project 3D points to image coordinates
        """
        if self.camera_matrix is None:
            return np.array([])

        # Apply camera projection
        points_2d, _ = cv2.projectPoints(
            points.reshape(-1, 1, 3).astype(np.float32),
            np.zeros(3), np.zeros(3),
            self.camera_matrix,
            self.distortion_coeffs if self.distortion_coeffs is not None else np.zeros(5)
        )

        return points_2d.reshape(-1, 2)

    def extract_depth_features(self, depth_image, keypoints):
        """
        Extract 3D points from depth image at keypoint locations
        """
        if keypoints is None:
            return np.array([])

        points_3d = []
        for kp in keypoints:
            u, v = int(kp.pt[0]), int(kp.pt[1])

            # Check if within image bounds
            if 0 <= u < depth_image.shape[1] and 0 <= v < depth_image.shape[0]:
                depth = depth_image[v, u]

                if np.isfinite(depth) and depth > 0:
                    # Convert to 3D
                    X, Y, Z = self.pixel_to_3d(u, v, depth)
                    if X is not None and Y is not None and Z is not None:
                        points_3d.append([X, Y, Z])

        return np.array(points_3d) if points_3d else np.array([]).reshape(0, 3)

    def pixel_to_3d(self, u, v, depth):
        """
        Convert image pixel to 3D world coordinates
        """
        if self.camera_matrix is None:
            return None, None, None

        x_norm = (u - self.camera_matrix[0, 2]) / self.camera_matrix[0, 0]
        y_norm = (v - self.camera_matrix[1, 2]) / self.camera_matrix[1, 1]

        X = x_norm * depth
        Y = y_norm * depth
        Z = depth

        return X, Y, Z

    def publish_enhanced_cloud(self, points):
        """
        Publish enhanced fused point cloud
        """
        if len(points) == 0:
            return

        from std_msgs.msg import Header
        from sensor_msgs.msg import PointField
        from sensor_msgs_py import point_cloud2

        header = Header()
        header.stamp = self.get_clock().now().to_msg()
        header.frame_id = 'base_link'

        fields = [
            PointField(name='x', offset=0, datatype=PointField.FLOAT32, count=1),
            PointField(name='y', offset=4, datatype=PointField.FLOAT32, count=1),
            PointField(name='z', offset=8, datatype=PointField.FLOAT32, count=1),
        ]

        pc_msg = point_cloud2.create_cloud(header, fields, points)
        self.enhanced_cloud_pub.publish(pc_msg)


def main(args=None):
    rclpy.init(args=args)
    node = FeatureBasedFusion()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Next Steps

After implementing basic sensor fusion:

1. Move to Kalman filter implementation for optimal fusion
2. Create simulation environments for testing fusion algorithms
3. Implement advanced fusion techniques like particle filters
4. Test fusion in complex scenarios with multiple sensor failures

## References

1. Bar-Shalom, Y., Li, X. R., & Kirubarajan, T. (2001). *Tracking and Data Fusion: A Handbook of Algorithms*. YBS Publishing.

2. Liggins, M. E., Hall, D. L., & Llinas, J. (2009). *Handbook of Multisensor Data Fusion: Theory and Practice*. CRC Press.

3. Thrun, S., Burgard, W., & Fox, D. (2005). *Probabilistic Robotics*. MIT Press. Chapter 11 covers sensor fusion.

4. Julier, S. J., & Uhlmann, J. K. (2004). Unscented filtering and nonlinear estimation. *Proceedings of the IEEE*, 92(3), 401-422.

5. Reif, K., Gunther, S., Yaz, E., & Unbehauen, R. (1999). Stochastic stability of the discrete-time extended Kalman filter. *IEEE Transactions on Automatic Control*, 44(4), 714-728.

---

This guide provides the foundation for implementing sensor fusion in your digital twin environment. The next section will cover Kalman filter implementation for optimal state estimation.