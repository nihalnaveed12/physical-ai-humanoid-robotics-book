---
sidebar_position: 6
title: "Kalman Filter Implementation: Optimal State Estimation"
---

# Kalman Filter Implementation: Optimal State Estimation

## Overview

The Kalman filter is a mathematical method for optimally estimating the state of a dynamic system from a series of noisy measurements. It's particularly useful in robotics for sensor fusion, state estimation, and prediction. This section covers the theory and practical implementation of Kalman filters for humanoid robotics applications.

## Mathematical Foundation

### The Kalman Filter Algorithm

The Kalman filter operates in two main steps: prediction and update.

#### 1. Prediction Step
```
x_pred = F * x_prev + B * u
P_pred = F * P_prev * F^T + Q
```

#### 2. Update Step
```
K = P_pred * H^T * (H * P_pred * H^T + R)^(-1)
x_new = x_pred + K * (z - H * x_pred)
P_new = (I - K * H) * P_pred
```

Where:
- `x` = state vector
- `P` = state covariance matrix
- `F` = state transition model
- `B` = control input model
- `u` = control input vector
- `Q` = process noise covariance
- `H` = observation model
- `R` = observation noise covariance
- `K` = Kalman gain
- `z` = measurement vector

## Basic Kalman Filter Implementation

### 1. Simple 1D Kalman Filter

Let's start with a simple 1D example to understand the basics:

```python
#!/usr/bin/env python3
import numpy as np
import matplotlib.pyplot as plt


class SimpleKalmanFilter:
    def __init__(self, initial_state, initial_uncertainty, process_noise, measurement_noise):
        """
        Initialize 1D Kalman Filter

        Args:
            initial_state: Initial estimate of the state
            initial_uncertainty: Initial uncertainty (variance)
            process_noise: Process noise (system model uncertainty)
            measurement_noise: Measurement noise (sensor uncertainty)
        """
        self.x = initial_state  # State estimate
        self.P = initial_uncertainty  # Uncertainty estimate
        self.Q = process_noise  # Process noise
        self.R = measurement_noise  # Measurement noise

        # For 1D, state transition is identity (constant velocity model)
        self.F = 1.0
        # For 1D, measurement model is identity
        self.H = 1.0

    def predict(self):
        """Prediction step"""
        # State prediction (for constant model, state doesn't change)
        # x_pred = F * x
        self.x = self.F * self.x

        # Uncertainty prediction
        # P_pred = F * P * F^T + Q
        self.P = self.F * self.P * self.F + self.Q

    def update(self, measurement):
        """Update step with new measurement"""
        # Innovation (measurement prediction error)
        # y = z - H * x_pred
        y = measurement - self.H * self.x

        # Innovation covariance
        # S = H * P_pred * H^T + R
        S = self.H * self.P * self.H + self.R

        # Kalman gain
        # K = P_pred * H^T * S^(-1)
        K = self.P * self.H / S

        # Update state estimate
        # x_new = x_pred + K * y
        self.x = self.x + K * y

        # Update uncertainty
        # P_new = (I - K * H) * P_pred
        self.P = (1 - K * self.H) * self.P

        return self.x, self.P


def example_1d_tracking():
    """Example: Tracking a moving object with noisy measurements"""
    # Generate true trajectory (constant velocity)
    dt = 0.1
    n_steps = 100
    true_position = 10.0  # Initial position
    true_velocity = 2.0   # Constant velocity
    positions = []
    velocities = []

    for i in range(n_steps):
        positions.append(true_position)
        velocities.append(true_velocity)
        true_position += true_velocity * dt

    # Add measurement noise
    measurement_noise = 0.5
    measurements = [pos + np.random.normal(0, measurement_noise) for pos in positions]

    # Initialize Kalman filter
    kf = SimpleKalmanFilter(
        initial_state=positions[0],  # Start with first measurement
        initial_uncertainty=1.0,     # Initial uncertainty
        process_noise=0.1,           # Process noise (motion uncertainty)
        measurement_noise=measurement_noise**2  # Measurement noise
    )

    # Run Kalman filter
    filtered_positions = []
    uncertainties = []

    for measurement in measurements:
        # Prediction step
        kf.predict()

        # Update step
        filtered_pos, uncertainty = kf.update(measurement)

        filtered_positions.append(filtered_pos)
        uncertainties.append(uncertainty)

    # Plot results
    plt.figure(figsize=(12, 8))

    plt.subplot(2, 1, 1)
    plt.plot(positions, label='True Position', linewidth=2)
    plt.plot(measurements, 'o', alpha=0.5, label='Noisy Measurements')
    plt.plot(filtered_positions, label='Kalman Filter Estimate', linewidth=2)
    plt.fill_between(range(len(filtered_positions)),
                     [p - np.sqrt(u) for p, u in zip(filtered_positions, uncertainties)],
                     [p + np.sqrt(u) for p, u in zip(filtered_positions, uncertainties)],
                     alpha=0.3, label='Uncertainty')
    plt.legend()
    plt.title('1D Kalman Filter: Position Tracking')
    plt.ylabel('Position')

    plt.subplot(2, 1, 2)
    plt.plot(uncertainties)
    plt.title('Uncertainty Over Time')
    plt.ylabel('Variance')
    plt.xlabel('Time Step')

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    example_1d_tracking()
```

### 2. Extended Kalman Filter (EKF) for Nonlinear Systems

For nonlinear systems, we use the Extended Kalman Filter:

```python
#!/usr/bin/env python3
import numpy as np
from scipy.linalg import block_diag


class ExtendedKalmanFilter:
    def __init__(self, state_dim, measurement_dim, initial_state=None):
        """
        Initialize Extended Kalman Filter for nonlinear systems

        Args:
            state_dim: Dimension of the state vector
            measurement_dim: Dimension of the measurement vector
            initial_state: Initial state vector (optional)
        """
        self.state_dim = state_dim
        self.measurement_dim = measurement_dim

        # Initialize state estimate
        if initial_state is not None:
            self.x = np.array(initial_state, dtype=float)
        else:
            self.x = np.zeros(state_dim)

        # Initialize state covariance
        self.P = np.eye(state_dim) * 1000.0  # High initial uncertainty

        # Process noise covariance
        self.Q = np.eye(state_dim) * 0.1

        # Measurement noise covariance
        self.R = np.eye(measurement_dim) * 1.0

    def predict(self, dt, control_input=None):
        """
        Prediction step using nonlinear motion model

        Args:
            dt: Time step
            control_input: Control input vector (optional)
        """
        # Get Jacobian of motion model
        F = self.jacobian_motion_model(self.x, dt, control_input)

        # Predict state using motion model
        self.x = self.motion_model(self.x, dt, control_input)

        # Predict covariance
        self.P = F @ self.P @ F.T + self.Q

    def update(self, measurement):
        """
        Update step with measurement

        Args:
            measurement: Measurement vector
        """
        # Get Jacobian of measurement model
        H = self.jacobian_measurement_model(self.x)

        # Predicted measurement
        h_x = self.measurement_model(self.x)

        # Innovation (measurement residual)
        y = measurement - h_x

        # Innovation covariance
        S = H @ self.P @ H.T + self.R

        # Kalman gain
        K = self.P @ H.T @ np.linalg.inv(S)

        # Update state
        self.x = self.x + K @ y

        # Update covariance
        self.P = (np.eye(self.state_dim) - K @ H) @ self.P

    def motion_model(self, x, dt, control_input=None):
        """
        Nonlinear motion model - override this method

        Args:
            x: Current state
            dt: Time step
            control_input: Control input (optional)

        Returns:
            Predicted next state
        """
        raise NotImplementedError("Implement motion_model in subclass")

    def jacobian_motion_model(self, x, dt, control_input=None):
        """
        Jacobian of motion model (F matrix) - override this method
        """
        raise NotImplementedError("Implement jacobian_motion_model in subclass")

    def measurement_model(self, x):
        """
        Nonlinear measurement model - override this method

        Args:
            x: Current state

        Returns:
            Predicted measurement
        """
        raise NotImplementedError("Implement measurement_model in subclass")

    def jacobian_measurement_model(self, x):
        """
        Jacobian of measurement model (H matrix) - override this method
        """
        raise NotImplementedError("Implement jacobian_measurement_model in subclass")


class Robot2DEKF(ExtendedKalmanFilter):
    """
    EKF for 2D robot localization with position and orientation
    State: [x, y, theta, v, omega] (position, orientation, linear velocity, angular velocity)
    """
    def __init__(self, initial_state=None):
        super().__init__(state_dim=5, measurement_dim=3, initial_state=initial_state)

        # Process noise - higher for velocity components
        self.Q = np.diag([0.1, 0.1, 0.05, 0.5, 0.2])  # [x, y, theta, v, omega]

        # Measurement noise for [range, bearing, theta]
        self.R = np.diag([0.1, 0.05, 0.05])

    def motion_model(self, x, dt, control_input=None):
        """
        Motion model for differential drive robot
        State: [x, y, theta, v, omega]
        """
        x_pred = np.zeros_like(x)

        if control_input is not None:
            v_cmd, omega_cmd = control_input
        else:
            v_cmd, omega_cmd = x[3], x[4]  # Use current velocities

        theta = x[2]

        if abs(omega_cmd) < 1e-6:  # Straight line motion
            x_pred[0] = x[0] + v_cmd * dt * np.cos(theta)
            x_pred[1] = x[1] + v_cmd * dt * np.sin(theta)
            x_pred[2] = theta + omega_cmd * dt
        else:  # Circular motion
            radius = v_cmd / omega_cmd
            x_pred[0] = x[0] + radius * (np.sin(theta + omega_cmd * dt) - np.sin(theta))
            x_pred[1] = x[1] + radius * (np.cos(theta) - np.cos(theta + omega_cmd * dt))
            x_pred[2] = theta + omega_cmd * dt

        x_pred[3] = v_cmd  # Linear velocity
        x_pred[4] = omega_cmd  # Angular velocity

        return x_pred

    def jacobian_motion_model(self, x, dt, control_input=None):
        """
        Jacobian of motion model
        """
        theta = x[2]

        if control_input is not None:
            v_cmd, omega_cmd = control_input
        else:
            v_cmd, omega_cmd = x[3], x[4]

        F = np.eye(5)  # Start with identity

        if abs(omega_cmd) < 1e-6:  # Straight line
            F[0, 2] = -v_cmd * dt * np.sin(theta)
            F[0, 3] = dt * np.cos(theta)

            F[1, 2] = v_cmd * dt * np.cos(theta)
            F[1, 3] = dt * np.sin(theta)

            F[2, 4] = dt
        else:  # Circular motion
            radius = v_cmd / omega_cmd

            F[0, 2] = radius * (np.cos(theta + omega_cmd * dt) - np.cos(theta))
            F[0, 3] = (np.sin(theta + omega_cmd * dt) - np.sin(theta)) / omega_cmd
            F[0, 4] = radius * dt * np.cos(theta + omega_cmd * dt) - (
                v_cmd / omega_cmd**2) * (np.sin(theta + omega_cmd * dt) - np.sin(theta))

            F[1, 2] = radius * (np.sin(theta) - np.sin(theta + omega_cmd * dt))
            F[1, 3] = (np.cos(theta) - np.cos(theta + omega_cmd * dt)) / omega_cmd
            F[1, 4] = radius * dt * np.sin(theta + omega_cmd * dt) + (
                v_cmd / omega_cmd**2) * (np.cos(theta) - np.cos(theta + omega_cmd * dt))

            F[2, 4] = dt

        return F

    def measurement_model(self, x):
        """
        Measurement model: [range, bearing, theta] from landmarks
        For this example, we'll assume we measure our own orientation
        """
        # In a real scenario, this would convert state to expected measurements
        # For simplicity, we'll return [x_pos, y_pos, theta]
        return np.array([x[0], x[1], x[2]])

    def jacobian_measurement_model(self, x):
        """
        Jacobian of measurement model
        """
        H = np.zeros((3, 5))
        H[0, 0] = 1.0  # Partial of x_pos w.r.t x
        H[1, 1] = 1.0  # Partial of y_pos w.r.t y
        H[2, 2] = 1.0  # Partial of theta w.r.t theta

        return H


def example_robot_localization():
    """Example: 2D robot localization using EKF"""
    # Initialize EKF
    initial_state = np.array([0.0, 0.0, 0.0, 1.0, 0.1])  # [x, y, theta, v, omega]
    ekf = Robot2DEKF(initial_state=initial_state)

    # Simulate robot motion and measurements
    dt = 0.1
    n_steps = 100
    true_states = []
    measurements = []
    estimates = []

    current_state = initial_state.copy()

    for i in range(n_steps):
        # True motion (with noise)
        v_true = 1.0 + 0.1 * np.random.randn()
        omega_true = 0.1 + 0.05 * np.random.randn()

        # Update true state
        theta = current_state[2]
        current_state[0] += v_true * dt * np.cos(theta)
        current_state[1] += v_true * dt * np.sin(theta)
        current_state[2] += omega_true * dt
        current_state[3] = v_true
        current_state[4] = omega_true

        true_states.append(current_state.copy())

        # Generate noisy measurement
        meas_x = current_state[0] + 0.1 * np.random.randn()
        meas_y = current_state[1] + 0.1 * np.random.randn()
        meas_theta = current_state[2] + 0.05 * np.random.randn()

        measurements.append(np.array([meas_x, meas_y, meas_theta]))

        # EKF prediction step
        ekf.predict(dt, control_input=[v_true, omega_true])

        # EKF update step
        ekf.update(measurements[-1])

        estimates.append(ekf.x.copy())

    # Convert to arrays for plotting
    true_states = np.array(true_states)
    measurements = np.array(measurements)
    estimates = np.array(estimates)

    # Plot results
    plt.figure(figsize=(15, 5))

    # Plot trajectory
    plt.subplot(1, 3, 1)
    plt.plot(true_states[:, 0], true_states[:, 1], 'g-', label='True Trajectory', linewidth=2)
    plt.plot(measurements[:, 0], measurements[:, 1], 'r.', alpha=0.5, label='Noisy Measurements')
    plt.plot(estimates[:, 0], estimates[:, 1], 'b-', label='EKF Estimate', linewidth=2)
    plt.axis('equal')
    plt.title('Robot Trajectory')
    plt.xlabel('X Position')
    plt.ylabel('Y Position')
    plt.legend()
    plt.grid(True)

    # Plot X position over time
    plt.subplot(1, 3, 2)
    plt.plot(true_states[:, 0], 'g-', label='True X', linewidth=2)
    plt.plot(measurements[:, 0], 'r.', alpha=0.5, label='Measured X')
    plt.plot(estimates[:, 0], 'b-', label='EKF X', linewidth=2)
    plt.title('X Position Over Time')
    plt.xlabel('Time Step')
    plt.ylabel('X Position')
    plt.legend()
    plt.grid(True)

    # Plot Y position over time
    plt.subplot(1, 3, 3)
    plt.plot(true_states[:, 1], 'g-', label='True Y', linewidth=2)
    plt.plot(measurements[:, 1], 'r.', alpha=0.5, label='Measured Y')
    plt.plot(estimates[:, 1], 'b-', label='EKF Y', linewidth=2)
    plt.title('Y Position Over Time')
    plt.xlabel('Time Step')
    plt.ylabel('Y Position')
    plt.legend()
    plt.grid(True)

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    example_robot_localization()
```

## Multi-Sensor Kalman Filter

### Sensor Fusion with Kalman Filter

Now let's implement a Kalman filter that fuses data from multiple sensors:

```python
#!/usr/bin/env python3
import numpy as np
import matplotlib.pyplot as plt


class MultiSensorKalmanFilter:
    """
    Kalman filter for fusing data from multiple sensors (IMU, LiDAR, Camera)
    State: [x, y, z, vx, vy, vz, qx, qy, qz, qw] (position, velocity, orientation quaternion)
    """
    def __init__(self):
        # State: [x, y, z, vx, vy, vz, qx, qy, qz, qw]
        self.state_dim = 10

        # Initialize state [x, y, z, vx, vy, vz, qx, qy, qz, qw]
        self.x = np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0])  # Zero orientation quaternion

        # Initialize state covariance
        self.P = np.eye(self.state_dim) * 1000.0  # High initial uncertainty

        # Process noise covariance (tuned for typical robot motion)
        self.Q = np.diag([0.1, 0.1, 0.1, 0.5, 0.5, 0.5, 0.01, 0.01, 0.01, 0.01])

        # Measurement noise covariances (different for each sensor type)
        self.R_imu = np.diag([0.01, 0.01, 0.01, 0.001, 0.001, 0.001])  # [acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z]
        self.R_lidar = np.diag([0.1, 0.1, 0.1])  # [x, y, z position]
        self.R_camera = np.diag([0.2, 0.2])  # [u, v image coordinates]

    def predict(self, dt, control_input=None):
        """
        Prediction step using motion model

        Args:
            dt: Time step
            control_input: Optional control input (e.g., motor commands)
        """
        # Linearized motion model Jacobian
        F = self._get_motion_model_jacobian(dt)

        # Apply motion model to predict next state
        self.x = self._motion_model(self.x, dt, control_input)

        # Predict covariance
        self.P = F @ self.P @ F.T + self.Q

    def _motion_model(self, x, dt, control_input=None):
        """
        Nonlinear motion model
        """
        x_pred = x.copy()

        # Extract state components
        pos = x[:3]      # [x, y, z]
        vel = x[3:6]     # [vx, vy, vz]
        quat = x[6:10]   # [qx, qy, qz, qw]

        # Update position based on velocity
        x_pred[:3] = pos + vel * dt

        # For this example, assume constant velocity model
        # In practice, this would include control inputs and dynamics
        x_pred[3:6] = vel  # Velocity remains approximately constant

        # Orientation update (simplified - in practice would use quaternion integration)
        # For small dt, we can approximate
        if control_input is not None:
            # Use control input to update orientation
            omega = control_input[6:9]  # Angular velocity from control
            x_pred[6:10] = self._integrate_quaternion(quat, omega, dt)
        else:
            # Keep orientation constant if no control input
            x_pred[6:10] = quat

        # Normalize quaternion
        norm = np.linalg.norm(x_pred[6:10])
        if norm > 0:
            x_pred[6:10] /= norm

        return x_pred

    def _get_motion_model_jacobian(self, dt):
        """
        Jacobian of motion model (F matrix)
        """
        F = np.eye(self.state_dim)

        # Position from velocity
        F[0, 3] = dt  # dx/dvx
        F[1, 4] = dt  # dy/dvy
        F[2, 5] = dt  # dz/dvz

        # For this simple model, other derivatives are zero
        # In a more complex model, you would include Coriolis effects, etc.

        return F

    def _integrate_quaternion(self, q, omega, dt):
        """
        Integrate quaternion with angular velocity
        """
        # Convert to rotation vector
        omega_norm = np.linalg.norm(omega)

        if omega_norm > 1e-6:
            axis = omega / omega_norm
            angle = omega_norm * dt

            # Convert to quaternion
            sin_half_angle = np.sin(angle / 2)
            cos_half_angle = np.cos(angle / 2)

            dq = np.array([
                axis[0] * sin_half_angle,
                axis[1] * sin_half_angle,
                axis[2] * sin_half_angle,
                cos_half_angle
            ])
        else:
            # No rotation
            dq = np.array([0.0, 0.0, 0.0, 1.0])

        # Multiply quaternions: q_new = q * dq
        q_new = self._quat_multiply(q, dq)

        # Normalize
        q_new = q_new / np.linalg.norm(q_new)

        return q_new

    def _quat_multiply(self, q1, q2):
        """
        Multiply two quaternions
        """
        w1, x1, y1, z1 = q1[3], q1[0], q1[1], q1[2]
        w2, x2, y2, z2 = q2[3], q2[0], q2[1], q2[2]

        w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2
        x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2
        y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2
        z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2

        return np.array([x, y, z, w])

    def update_imu(self, accel_measurement, gyro_measurement, dt):
        """
        Update with IMU measurement

        Args:
            accel_measurement: [ax, ay, az] - linear acceleration
            gyro_measurement: [wx, wy, wz] - angular velocity
            dt: Time step for integration
        """
        # Measurement vector [accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z]
        z = np.concatenate([accel_measurement, gyro_measurement])

        # Measurement model H maps state to measurement space
        # For IMU, we're measuring acceleration and angular velocity
        H = np.zeros((6, self.state_dim))

        # Accelerometer model (simplified - measures acceleration in body frame)
        # For this example, we'll use a direct measurement model
        # In practice, you'd transform to body frame and account for gravity
        H[0, 0] = 1.0  # Measures x position (simplified)
        H[1, 1] = 1.0  # Measures y position (simplified)
        H[2, 2] = 1.0  # Measures z position (simplified)

        # Gyro measures angular velocity directly
        # For this example, we'll assume direct measurement
        # In practice, you'd have a more complex relationship

        # Innovation
        h_x = H @ self.x  # Predicted measurement
        y = z - h_x  # Innovation

        # Innovation covariance
        S = H @ self.P @ H.T + self.R_imu

        # Kalman gain
        K = self.P @ H.T @ np.linalg.inv(S)

        # Update state
        self.x = self.x + K @ y

        # Update covariance
        self.P = (np.eye(self.state_dim) - K @ H) @ self.P

    def update_lidar(self, position_measurement):
        """
        Update with LiDAR position measurement

        Args:
            position_measurement: [x, y, z] - position measurement
        """
        # Measurement vector [x, y, z]
        z = position_measurement

        # Measurement model H maps state to measurement space
        H = np.zeros((3, self.state_dim))
        H[0, 0] = 1.0  # Maps state x to measurement x
        H[1, 1] = 1.0  # Maps state y to measurement y
        H[2, 2] = 1.0  # Maps state z to measurement z

        # Innovation
        h_x = H @ self.x  # Predicted measurement
        y = z - h_x  # Innovation

        # Innovation covariance
        S = H @ self.P @ H.T + self.R_lidar

        # Kalman gain
        K = self.P @ H.T @ np.linalg.inv(S)

        # Update state
        self.x = self.x + K @ y

        # Update covariance
        self.P = (np.eye(self.state_dim) - K @ H) @ self.P

    def update_camera(self, image_measurement, camera_params):
        """
        Update with camera measurement (simplified)

        Args:
            image_measurement: [u, v] - image coordinates
            camera_params: Camera intrinsic parameters
        """
        # For this simplified example, we'll just use a basic projection model
        # In practice, you'd have a more sophisticated model with 3D-2D projection

        # Measurement vector [u, v]
        z = image_measurement

        # Extract position from state
        pos = self.x[:3]

        # Simplified projection (in practice, use full camera model)
        # This is a placeholder - in reality you'd have a complex nonlinear projection
        H = np.zeros((2, self.state_dim))
        H[0, 0] = camera_params['fx']  # x to u
        H[1, 1] = camera_params['fy']  # y to v

        # Innovation
        h_x = H @ self.x[:2]  # Simplified - only use x,y for projection
        y = z - h_x  # Innovation

        # Innovation covariance (simplified)
        R_cam_simplified = np.diag([self.R_camera[0], self.R_camera[1]])
        S = H[:, :2] @ self.P[:2, :2] @ H[:, :2].T + R_cam_simplified

        # Kalman gain (simplified)
        K = np.zeros((self.state_dim, 2))
        K[:2, :] = self.P[:2, :2] @ H[:, :2].T @ np.linalg.inv(S)

        # Update state
        self.x = self.x + K @ y

        # Update covariance
        self.P = (np.eye(self.state_dim) - K @ H[:, :2]) @ self.P

    def get_state(self):
        """
        Get current state estimate
        """
        return self.x.copy()

    def get_covariance(self):
        """
        Get current covariance estimate
        """
        return self.P.copy()


def example_multi_sensor_fusion():
    """Example: Multi-sensor fusion with IMU, LiDAR, and camera"""
    # Initialize filter
    kf = MultiSensorKalmanFilter()

    # Simulation parameters
    dt = 0.01  # 100 Hz
    duration = 10.0  # 10 seconds
    steps = int(duration / dt)

    # Store results for plotting
    true_states = []
    estimated_states = []
    measurements_lidar = []

    # Initial conditions
    true_pos = np.array([0.0, 0.0, 0.0])
    true_vel = np.array([1.0, 0.5, 0.0])  # Moving diagonally
    true_acc = np.array([0.1, 0.05, 0.0])  # Constant acceleration

    for i in range(steps):
        # True motion
        true_pos += true_vel * dt + 0.5 * true_acc * dt**2
        true_vel += true_acc * dt

        # Add process noise to simulate real world
        true_pos += np.random.normal(0, 0.01, 3)
        true_vel += np.random.normal(0, 0.005, 3)

        true_states.append(np.concatenate([true_pos, true_vel, [0, 0, 0, 1]]))  # Add dummy orientation

        # Prediction step
        kf.predict(dt)

        # Simulate sensor measurements with noise
        if i % 10 == 0:  # LiDAR at 10 Hz
            lidar_pos = true_pos + np.random.normal(0, 0.1, 3)  # LiDAR noise
            kf.update_lidar(lidar_pos)
            measurements_lidar.append(lidar_pos)

        if i % 5 == 0:  # IMU at 20 Hz
            # Accelerometer measurement (includes gravity and motion)
            gravity = np.array([0, 0, 9.81])
            measured_accel = true_acc + gravity + np.random.normal(0, 0.01, 3)
            measured_gyro = np.array([0.01, 0.005, 0.0]) + np.random.normal(0, 0.001, 3)  # Angular velocity
            kf.update_imu(measured_accel, measured_gyro, dt)

        # Camera measurements would be added here

        estimated_states.append(kf.get_state().copy())

    # Convert to arrays
    true_states = np.array(true_states)
    estimated_states = np.array(estimated_states)
    measurements_lidar = np.array(measurements_lidar)

    # Plot results
    plt.figure(figsize=(15, 10))

    # Plot X position
    plt.subplot(3, 2, 1)
    plt.plot(true_states[:, 0], label='True X', linewidth=2)
    plt.plot(estimated_states[:, 0], label='Estimated X', linewidth=2)
    if len(measurements_lidar) > 0:
        lidar_indices = np.arange(0, len(estimated_states), 10)[:len(measurements_lidar)]
        plt.scatter(lidar_indices, measurements_lidar[:, 0], c='red', s=10, alpha=0.5, label='LiDAR X')
    plt.title('X Position Over Time')
    plt.xlabel('Time Step')
    plt.ylabel('Position (m)')
    plt.legend()
    plt.grid(True)

    # Plot Y position
    plt.subplot(3, 2, 2)
    plt.plot(true_states[:, 1], label='True Y', linewidth=2)
    plt.plot(estimated_states[:, 1], label='Estimated Y', linewidth=2)
    if len(measurements_lidar) > 0:
        plt.scatter(lidar_indices, measurements_lidar[:, 1], c='red', s=10, alpha=0.5, label='LiDAR Y')
    plt.title('Y Position Over Time')
    plt.xlabel('Time Step')
    plt.ylabel('Position (m)')
    plt.legend()
    plt.grid(True)

    # Plot Z position
    plt.subplot(3, 2, 3)
    plt.plot(true_states[:, 2], label='True Z', linewidth=2)
    plt.plot(estimated_states[:, 2], label='Estimated Z', linewidth=2)
    if len(measurements_lidar) > 0:
        plt.scatter(lidar_indices, measurements_lidar[:, 2], c='red', s=10, alpha=0.5, label='LiDAR Z')
    plt.title('Z Position Over Time')
    plt.xlabel('Time Step')
    plt.ylabel('Position (m)')
    plt.legend()
    plt.grid(True)

    # Plot X velocity
    plt.subplot(3, 2, 4)
    plt.plot(true_states[:, 3], label='True VX', linewidth=2)
    plt.plot(estimated_states[:, 3], label='Estimated VX', linewidth=2)
    plt.title('X Velocity Over Time')
    plt.xlabel('Time Step')
    plt.ylabel('Velocity (m/s)')
    plt.legend()
    plt.grid(True)

    # Plot Y velocity
    plt.subplot(3, 2, 5)
    plt.plot(true_states[:, 4], label='True VY', linewidth=2)
    plt.plot(estimated_states[:, 4], label='Estimated VY', linewidth=2)
    plt.title('Y Velocity Over Time')
    plt.xlabel('Time Step')
    plt.ylabel('Velocity (m/s)')
    plt.legend()
    plt.grid(True)

    # Plot trajectory in 2D
    plt.subplot(3, 2, 6)
    plt.plot(true_states[:, 0], true_states[:, 1], 'g-', label='True Trajectory', linewidth=2)
    plt.plot(estimated_states[:, 0], estimated_states[:, 1], 'b-', label='Estimated Trajectory', linewidth=2)
    if len(measurements_lidar) > 0:
        plt.scatter(measurements_lidar[:, 0], measurements_lidar[:, 1], c='red', s=10, alpha=0.5, label='LiDAR Measurements')
    plt.axis('equal')
    plt.title('Trajectory in XY Plane')
    plt.xlabel('X Position (m)')
    plt.ylabel('Y Position (m)')
    plt.legend()
    plt.grid(True)

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    example_multi_sensor_fusion()
```

## Unscented Kalman Filter (UKF)

For highly nonlinear systems, the Unscented Kalman Filter often performs better:

```python
#!/usr/bin/env python3
import numpy as np


class UnscentedKalmanFilter:
    """
    Unscented Kalman Filter implementation
    Better for highly nonlinear systems than EKF
    """
    def __init__(self, state_dim, measurement_dim):
        self.state_dim = state_dim
        self.measurement_dim = measurement_dim

        # Initialize state and covariance
        self.x = np.zeros(state_dim)
        self.P = np.eye(state_dim) * 0.1

        # UKF parameters
        self.alpha = 1e-3  # Spread of sigma points
        self.kappa = 0     # Secondary scaling parameter
        self.beta = 2      # Prior knowledge of distribution (2 for Gaussian)

        # Calculate UKF parameters
        self.lmbda = self.alpha**2 * (state_dim + self.kappa) - state_dim
        self.gamma = np.sqrt(state_dim + self.lmbda)

        # Weights
        self.Wm = np.full(2 * state_dim + 1, 1.0 / (2 * (state_dim + self.lmbda)))
        self.Wc = self.Wm.copy()
        self.Wm[0] = self.lmbda / (state_dim + self.lmbda)
        self.Wc[0] = self.lmbda / (state_dim + self.lmbda) + (1 - self.alpha**2 + self.beta)

        # Process and measurement noise
        self.Q = np.eye(state_dim) * 0.1
        self.R = np.eye(measurement_dim) * 1.0

    def predict(self, dt, control_input=None):
        """
        Prediction step using unscented transform
        """
        # Generate sigma points
        sigma_points = self._sigma_points()

        # Propagate sigma points through motion model
        propagated_points = []
        for point in sigma_points:
            propagated = self._motion_model(point, dt, control_input)
            propagated_points.append(propagated)

        propagated_points = np.array(propagated_points)

        # Calculate predicted state and covariance
        self.x = np.sum(self.Wm[:, np.newaxis] * propagated_points, axis=0)

        P_pred = np.zeros((self.state_dim, self.state_dim))
        for i in range(len(propagated_points)):
            diff = propagated_points[i] - self.x
            P_pred += self.Wc[i] * np.outer(diff, diff)

        self.P = P_pred + self.Q

    def update(self, measurement):
        """
        Update step using unscented transform
        """
        # Generate sigma points
        sigma_points = self._sigma_points()

        # Transform sigma points through measurement model
        transformed_points = []
        for point in sigma_points:
            transformed = self._measurement_model(point)
            transformed_points.append(transformed)

        transformed_points = np.array(transformed_points)

        # Calculate predicted measurement
        z_pred = np.sum(self.Wm[:, np.newaxis] * transformed_points, axis=0)

        # Calculate innovation covariance
        P_zz = np.zeros((self.measurement_dim, self.measurement_dim))
        for i in range(len(transformed_points)):
            diff = transformed_points[i] - z_pred
            P_zz += self.Wc[i] * np.outer(diff, diff)

        P_zz += self.R

        # Calculate cross-covariance
        P_xz = np.zeros((self.state_dim, self.measurement_dim))
        for i in range(len(sigma_points)):
            x_diff = sigma_points[i] - self.x
            z_diff = transformed_points[i] - z_pred
            P_xz += self.Wc[i] * np.outer(x_diff, z_diff)

        # Calculate Kalman gain
        K = P_xz @ np.linalg.inv(P_zz)

        # Update state and covariance
        innovation = measurement - z_pred
        self.x = self.x + K @ innovation
        self.P = self.P - K @ P_zz @ K.T

    def _sigma_points(self):
        """
        Generate sigma points for unscented transform
        """
        # Calculate square root of covariance
        U = self.gamma * np.linalg.cholesky(self.P + 1e-9 * np.eye(self.state_dim))

        # Generate sigma points
        sigma_points = np.zeros((2 * self.state_dim + 1, self.state_dim))
        sigma_points[0] = self.x  # Center point

        for i in range(self.state_dim):
            sigma_points[i + 1] = self.x + U[i]
            sigma_points[self.state_dim + i + 1] = self.x - U[i]

        return sigma_points

    def _motion_model(self, x, dt, control_input=None):
        """
        Nonlinear motion model - implement based on your system
        """
        # Placeholder - implement your specific motion model
        # For example, for a constant velocity model:
        result = x.copy()
        result[:3] += x[3:6] * dt  # Update position based on velocity
        # Velocity remains the same in constant velocity model
        return result

    def _measurement_model(self, x):
        """
        Nonlinear measurement model - implement based on your sensors
        """
        # Placeholder - implement your specific measurement model
        # For example, if measuring position:
        return x[:self.measurement_dim].copy()


def example_ukf():
    """Example of UKF for nonlinear system"""
    # For this example, we'll create a simple UKF for a 2D tracking problem
    # where the measurement model is nonlinear (range and bearing)

    class BearingRangeUKF(UnscentedKalmanFilter):
        def __init__(self):
            super().__init__(state_dim=4, measurement_dim=2)  # [x, y, vx, vy], measurements: [range, bearing]

            # Initialize with some reasonable values
            self.x = np.array([0.0, 0.0, 1.0, 0.1])  # Start at origin, moving in x direction
            self.P = np.diag([100, 100, 10, 10])  # High uncertainty in position, lower in velocity

            # Process and measurement noise
            self.Q = np.diag([0.1, 0.1, 0.5, 0.5])  # Process noise for [x, y, vx, vy]
            self.R = np.diag([0.5, 0.05])  # Measurement noise for [range, bearing]

        def _motion_model(self, x, dt, control_input=None):
            """Constant velocity motion model"""
            F = np.array([
                [1, 0, dt, 0],
                [0, 1, 0, dt],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ])
            return F @ x

        def _measurement_model(self, x):
            """Nonlinear measurement model: convert [x, y] to [range, bearing]"""
            px, py = x[0], x[1]
            range_meas = np.sqrt(px**2 + py**2)
            bearing = np.arctan2(py, px)
            return np.array([range_meas, bearing])

    # Run example
    ukf = BearingRangeUKF()

    # Simulate trajectory
    dt = 0.1
    n_steps = 100

    true_states = []
    measurements = []
    estimates = []

    true_state = np.array([0.0, 0.0, 1.0, 0.1])  # [x, y, vx, vy]

    for i in range(n_steps):
        # True motion
        true_state[0] += true_state[2] * dt
        true_state[1] += true_state[3] * dt

        # Add some process noise
        true_state += np.random.normal(0, 0.01, 4)

        true_states.append(true_state.copy())

        # Generate measurement
        range_true = np.sqrt(true_state[0]**2 + true_state[1]**2)
        bearing_true = np.arctan2(true_state[1], true_state[0])

        # Add measurement noise
        range_meas = range_true + np.random.normal(0, 0.5)
        bearing_meas = bearing_true + np.random.normal(0, 0.05)

        measurements.append(np.array([range_meas, bearing_meas]))

        # UKF prediction and update
        ukf.predict(dt)
        ukf.update(measurements[-1])

        estimates.append(ukf.x.copy())

    # Convert to arrays
    true_states = np.array(true_states)
    measurements = np.array(measurements)
    estimates = np.array(estimates)

    # Plot results
    plt.figure(figsize=(15, 5))

    # Plot trajectory
    plt.subplot(1, 3, 1)
    plt.plot(true_states[:, 0], true_states[:, 1], 'g-', label='True Trajectory', linewidth=2)
    plt.plot(estimates[:, 0], estimates[:, 1], 'b-', label='UKF Estimate', linewidth=2)
    plt.scatter([0], [0], c='red', s=100, marker='x', label='Start')
    plt.axis('equal')
    plt.title('UKF 2D Tracking')
    plt.xlabel('X Position')
    plt.ylabel('Y Position')
    plt.legend()
    plt.grid(True)

    # Plot X position over time
    plt.subplot(1, 3, 2)
    plt.plot(true_states[:, 0], 'g-', label='True X', linewidth=2)
    plt.plot(estimates[:, 0], 'b-', label='UKF X', linewidth=2)
    plt.title('X Position Over Time')
    plt.xlabel('Time Step')
    plt.ylabel('X Position')
    plt.legend()
    plt.grid(True)

    # Plot Y position over time
    plt.subplot(1, 3, 3)
    plt.plot(true_states[:, 1], 'g-', label='True Y', linewidth=2)
    plt.plot(estimates[:, 1], 'b-', label='UKF Y', linewidth=2)
    plt.title('Y Position Over Time')
    plt.xlabel('Time Step')
    plt.ylabel('Y Position')
    plt.legend()
    plt.grid(True)

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    example_ukf()
```

## Comparison: EKF vs UKF

Understanding the differences between Extended Kalman Filter (EKF) and Unscented Kalman Filter (UKF) is crucial for selecting the right approach for your robotics application:

### When to Use Each Filter

**Extended Kalman Filter (EKF):**
- Use when the system has mild nonlinearities
- Lower computational complexity O(n²) vs O(n³) for UKF
- Good for systems where linearization is reasonably accurate
- More suitable for real-time applications with limited computational resources
- Works well for bearing-only measurements, range measurements

**Unscented Kalman Filter (UKF):**
- Use when the system has strong nonlinearities
- Better for highly nonlinear measurement models (e.g., radar, angle measurements)
- More accurate than EKF when linearization errors are significant
- Better handling of non-Gaussian noise
- Computational complexity is higher but still manageable for many applications

### Performance Comparison Example

Here's a comparison showing how EKF and UKF perform differently on a nonlinear system:

```python
#!/usr/bin/env python3
import numpy as np
import matplotlib.pyplot as plt


def compare_ekf_ukf():
    """
    Compare EKF and UKF performance on a nonlinear bearing-range tracking problem
    """
    # System parameters
    dt = 0.1
    n_steps = 100

    # True trajectory: circular motion
    true_states = []
    measurements = []

    # Start at [10, 0] moving in circular path
    state = np.array([10.0, 0.0, 0.0, 2.0])  # [x, y, vx, vy]

    for i in range(n_steps):
        # Circular motion: add centripetal acceleration
        radius = np.sqrt(state[0]**2 + state[1]**2)
        if radius > 0:
            ax = -0.4 * state[0] / radius  # Centripetal acceleration towards origin
            ay = -0.4 * state[1] / radius
        else:
            ax, ay = 0, 0

        # Update state
        state[0] += state[2] * dt
        state[1] += state[3] * dt
        state[2] += ax * dt
        state[3] += ay * dt

        # Add process noise
        state += np.random.normal(0, 0.01, 4)

        true_states.append(state.copy())

        # Generate bearing-range measurement
        range_true = np.sqrt(state[0]**2 + state[1]**2)
        bearing_true = np.arctan2(state[1], state[0])

        # Add measurement noise
        range_meas = range_true + np.random.normal(0, 0.1)
        bearing_meas = bearing_true + np.random.normal(0, 0.05)

        measurements.append(np.array([range_meas, bearing_meas]))

    true_states = np.array(true_states)
    measurements = np.array(measurements)

    # EKF implementation for comparison
    class BearingRangeEKF:
        def __init__(self):
            self.x = np.array([8.0, 0.0, 1.0, 1.0])  # Initial estimate
            self.P = np.diag([100, 100, 10, 10])
            self.Q = np.diag([0.1, 0.1, 0.5, 0.5])
            self.R = np.diag([0.01, 0.0025])  # [range_var, bearing_var]

        def predict(self, dt):
            # Simple constant velocity model
            F = np.array([
                [1, 0, dt, 0],
                [0, 1, 0, dt],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ])
            self.x = F @ self.x
            self.P = F @ self.P @ F.T + self.Q

        def update(self, z):
            # Measurement model: h(x) = [sqrt(x² + y²), atan2(y, x)]
            px, py = self.x[0], self.x[1]
            range_pred = np.sqrt(px**2 + py**2)
            bearing_pred = np.arctan2(py, px)

            # Jacobian of measurement model
            if range_pred > 1e-6:
                H = np.array([
                    [px/range_pred, py/range_pred, 0, 0],  # partial range/partial state
                    [-py/(range_pred**2), px/(range_pred**2), 0, 0]  # partial bearing/partial state
                ])
            else:
                H = np.zeros((2, 4))

            # Innovation
            y = np.array([range_pred, bearing_pred])
            innovation = z - y

            # Wrap bearing innovation to [-π, π]
            innovation[1] = np.arctan2(np.sin(innovation[1]), np.cos(innovation[1]))

            # Kalman gain
            S = H @ self.P @ H.T + self.R
            K = self.P @ H.T @ np.linalg.inv(S)

            # Update
            self.x = self.x + K @ innovation
            self.P = (np.eye(4) - K @ H) @ self.P

    # Run EKF
    ekf = BearingRangeEKF()
    ekf_estimates = []

    for i in range(n_steps):
        ekf.predict(dt)
        ekf.update(measurements[i])
        ekf_estimates.append(ekf.x.copy())

    ekf_estimates = np.array(ekf_estimates)

    # Run UKF (using the implementation from previous section)
    ukf = BearingRangeUKF()  # From the UKF example above
    ukf_estimates = []

    # Reset UKF initial state to match EKF
    ukf.x = np.array([8.0, 0.0, 1.0, 1.0])
    ukf.P = np.diag([100, 100, 10, 10])

    for i in range(n_steps):
        ukf.predict(dt)
        ukf.update(measurements[i])
        ukf_estimates.append(ukf.x.copy())

    ukf_estimates = np.array(ukf_estimates)

    # Calculate errors
    ekf_errors = np.linalg.norm(true_states[:, :2] - ekf_estimates[:, :2], axis=1)
    ukf_errors = np.linalg.norm(true_states[:, :2] - ukf_estimates[:, :2], axis=1)

    # Plot comparison
    plt.figure(figsize=(18, 12))

    # Plot trajectories
    plt.subplot(2, 3, 1)
    plt.plot(true_states[:, 0], true_states[:, 1], 'g-', label='True Trajectory', linewidth=2)
    plt.plot(ekf_estimates[:, 0], ekf_estimates[:, 1], 'r-', label='EKF Estimate', linewidth=1, alpha=0.7)
    plt.plot(ukf_estimates[:, 0], ukf_estimates[:, 1], 'b-', label='UKF Estimate', linewidth=1, alpha=0.7)
    plt.scatter([10], [0], c='red', s=100, marker='x', label='Start')
    plt.axis('equal')
    plt.title('Trajectory Comparison: EKF vs UKF')
    plt.xlabel('X Position')
    plt.ylabel('Y Position')
    plt.legend()
    plt.grid(True)

    # Plot X position
    plt.subplot(2, 3, 2)
    plt.plot(true_states[:, 0], 'g-', label='True X', linewidth=2)
    plt.plot(ekf_estimates[:, 0], 'r-', label='EKF X', linewidth=1)
    plt.plot(ukf_estimates[:, 0], 'b-', label='UKF X', linewidth=1)
    plt.title('X Position Comparison')
    plt.xlabel('Time Step')
    plt.ylabel('X Position')
    plt.legend()
    plt.grid(True)

    # Plot Y position
    plt.subplot(2, 3, 3)
    plt.plot(true_states[:, 1], 'g-', label='True Y', linewidth=2)
    plt.plot(ekf_estimates[:, 1], 'r-', label='EKF Y', linewidth=1)
    plt.plot(ukf_estimates[:, 1], 'b-', label='UKF Y', linewidth=1)
    plt.title('Y Position Comparison')
    plt.xlabel('Time Step')
    plt.ylabel('Y Position')
    plt.legend()
    plt.grid(True)

    # Plot position errors
    plt.subplot(2, 3, 4)
    plt.plot(ekf_errors, 'r-', label='EKF Position Error', linewidth=1)
    plt.plot(ukf_errors, 'b-', label='UKF Position Error', linewidth=1)
    plt.title('Position Error Comparison')
    plt.xlabel('Time Step')
    plt.ylabel('Position Error (m)')
    plt.legend()
    plt.grid(True)

    # Plot error statistics
    plt.subplot(2, 3, 5)
    plt.hist(ekf_errors, bins=30, alpha=0.5, label='EKF Errors', density=True)
    plt.hist(ukf_errors, bins=30, alpha=0.5, label='UKF Errors', density=True)
    plt.title('Error Distribution')
    plt.xlabel('Position Error (m)')
    plt.ylabel('Density')
    plt.legend()
    plt.grid(True)

    # Print statistics
    print(f"EKF - RMSE: {np.sqrt(np.mean(ekf_errors**2)):.3f}, Std: {np.std(ekf_errors):.3f}")
    print(f"UKF - RMSE: {np.sqrt(np.mean(ukf_errors**2)):.3f}, Std: {np.std(ukf_errors):.3f}")

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    compare_ekf_ukf()
```

### Key Differences Summary

| Aspect | Extended Kalman Filter (EKF) | Unscented Kalman Filter (UKF) |
|--------|------------------------------|-------------------------------|
| **Nonlinear Handling** | Uses linearization (Jacobian) | Uses deterministic sampling (sigma points) |
| **Accuracy** | Approximate, depends on linearization quality | More accurate for highly nonlinear systems |
| **Computational Cost** | O(n²) to O(n³) | O(n³) but with higher constant factor |
| **Implementation Complexity** | Requires Jacobian computation | No Jacobian needed |
| **Robustness** | Can diverge with poor linearization | More robust to nonlinearities |
| **When to Use** | Mild nonlinearities, real-time systems | Strong nonlinearities, accuracy critical |

In robotics applications, UKF is often preferred for sensor fusion involving bearing measurements, radar data, or other highly nonlinear sensor models, while EKF works well for systems with mild nonlinearities and where computational efficiency is critical.

## Integration with ROS 2

### ROS 2 Node for Kalman Filter

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Imu, LaserScan
from geometry_msgs.msg import PointStamped, PoseWithCovarianceStamped
from nav_msgs.msg import Odometry
from std_msgs.msg import Header
import numpy as np
from scipy.spatial.transform import Rotation as R


class KalmanFilterNode(Node):
    def __init__(self):
        super().__init__('kalman_filter_node')

        # Initialize multi-sensor Kalman filter
        self.kf = MultiSensorKalmanFilter()

        # Subscriptions
        self.imu_sub = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10
        )

        self.lidar_sub = self.create_subscription(
            LaserScan,
            '/lidar_2d/scan',
            self.lidar_callback,
            10
        )

        # Publishers
        self.odom_pub = self.create_publisher(
            Odometry,
            '/kalman_filter/odom',
            10
        )

        self.position_pub = self.create_publisher(
            PointStamped,
            '/kalman_filter/position',
            10
        )

        # Timer for prediction step
        self.timer = self.create_timer(0.01, self.prediction_step)  # 100 Hz

        # Store last IMU time for integration
        self.last_imu_time = None

        self.get_logger().info('Kalman Filter Node initialized')

    def imu_callback(self, msg):
        """Process IMU measurements"""
        try:
            current_time = msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9

            if self.last_imu_time is not None:
                dt = current_time - self.last_imu_time

                # Extract IMU data
                accel = np.array([
                    msg.linear_acceleration.x,
                    msg.linear_acceleration.y,
                    msg.linear_acceleration.z
                ])

                gyro = np.array([
                    msg.angular_velocity.x,
                    msg.angular_velocity.y,
                    msg.angular_velocity.z
                ])

                # Update Kalman filter with IMU data
                self.kf.update_imu(accel, gyro, dt)

            self.last_imu_time = current_time

        except Exception as e:
            self.get_logger().error(f'Error processing IMU data: {e}')

    def lidar_callback(self, msg):
        """Process LiDAR measurements for position update"""
        try:
            # This is a simplified approach - in practice, you'd need to extract
            # landmark positions or features from the LiDAR scan

            # For this example, we'll assume the LiDAR provides position measurements
            # (e.g., from landmark detection or SLAM)

            # Extract some representative points from the scan
            if len(msg.ranges) > 0:
                # Convert some scan points to Cartesian coordinates
                # This is simplified - real implementation would use feature extraction
                angles = np.linspace(msg.angle_min, msg.angle_max, len(msg.ranges))

                # Find valid measurements (not infinite or NaN)
                valid_mask = np.isfinite(msg.ranges)
                valid_ranges = np.array(msg.ranges)[valid_mask]
                valid_angles = angles[valid_mask]

                if len(valid_ranges) > 0:
                    # Calculate a representative position from the scan
                    # (This is a simplified approach)
                    x_coords = valid_ranges * np.cos(valid_angles)
                    y_coords = valid_ranges * np.sin(valid_angles)

                    # Use centroid as position measurement
                    pos_x = np.mean(x_coords) if len(x_coords) > 0 else 0.0
                    pos_y = np.mean(y_coords) if len(y_coords) > 0 else 0.0

                    # For now, assume z=0 (2D case)
                    position = np.array([pos_x, pos_y, 0.0])

                    # Update Kalman filter with position measurement
                    self.kf.update_lidar(position)

        except Exception as e:
            self.get_logger().error(f'Error processing LiDAR data: {e}')

    def prediction_step(self):
        """Timer callback for prediction step"""
        try:
            # Perform prediction step (assuming dt = 0.01s for 100Hz)
            self.kf.predict(0.01)

            # Publish current estimate
            self.publish_state_estimate()

        except Exception as e:
            self.get_logger().error(f'Error in prediction step: {e}')

    def publish_state_estimate(self):
        """Publish current state estimate"""
        try:
            state = self.kf.get_state()

            # Create Odometry message
            odom_msg = Odometry()
            odom_msg.header = Header()
            odom_msg.header.stamp = self.get_clock().now().to_msg()
            odom_msg.header.frame_id = 'map'
            odom_msg.child_frame_id = 'base_link'

            # Set position
            odom_msg.pose.pose.position.x = float(state[0])
            odom_msg.pose.pose.position.y = float(state[1])
            odom_msg.pose.pose.position.z = float(state[2])

            # Set orientation (from quaternion in state)
            odom_msg.pose.pose.orientation.x = float(state[6])
            odom_msg.pose.pose.orientation.y = float(state[7])
            odom_msg.pose.pose.orientation.z = float(state[8])
            odom_msg.pose.pose.orientation.w = float(state[9])

            # Set velocities
            odom_msg.twist.twist.linear.x = float(state[3])
            odom_msg.twist.twist.linear.y = float(state[4])
            odom_msg.twist.twist.linear.z = float(state[5])

            # Set covariance from filter
            cov = self.kf.get_covariance()
            # Position covariance (upper-left 3x3 block of state covariance)
            for i in range(3):
                for j in range(3):
                    odom_msg.pose.covariance[i*6 + j] = float(cov[i, j])

            # Velocity covariance (lower-right 3x3 block of state covariance)
            for i in range(3):
                for j in range(3):
                    odom_msg.twist.covariance[i*6 + j] = float(cov[i+3, j+3])

            self.odom_pub.publish(odom_msg)

            # Publish position as PointStamped
            pos_msg = PointStamped()
            pos_msg.header = Header()
            pos_msg.header.stamp = odom_msg.header.stamp
            pos_msg.header.frame_id = 'map'
            pos_msg.point.x = float(state[0])
            pos_msg.point.y = float(state[1])
            pos_msg.point.z = float(state[2])

            self.position_pub.publish(pos_msg)

        except Exception as e:
            self.get_logger().error(f'Error publishing state estimate: {e}')


def main(args=None):
    rclpy.init(args=args)
    node = KalmanFilterNode()

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

## Performance Considerations

### 1. Computational Complexity

The Kalman filter's computational complexity is O(n³) for the matrix inversion in the update step, where n is the state dimension. For real-time applications:

```python
def optimize_kalman_computations():
    """
    Tips for optimizing Kalman filter computations
    """
    # 1. Use sparse matrices if your system matrices are sparse
    from scipy.sparse import csc_matrix

    # 2. Pre-allocate matrices to avoid repeated allocation
    P_pred = np.zeros((state_dim, state_dim))
    S = np.zeros((measurement_dim, measurement_dim))
    K = np.zeros((state_dim, measurement_dim))

    # 3. Use Cholesky decomposition for positive definite matrices
    import scipy.linalg
    S_chol = scipy.linalg.cholesky(S, lower=True)
    K = scipy.linalg.solve_triangular(S_chol, P_pred @ H.T, lower=True)

    # 4. For time-invariant systems, pre-compute and cache matrices
    # if F, Q, H, R are constant, the steady-state Kalman gain can be pre-computed
```

### 2. Numerical Stability

```python
def ensure_numerical_stability(P, min_eigenvalue=1e-9):
    """
    Ensure covariance matrix is positive definite
    """
    # Check if matrix is positive definite
    eigenvals = np.linalg.eigvals(P)
    if np.any(eigenvals < min_eigenvalue):
        # Add small value to diagonal to ensure positive definiteness
        P = P + np.eye(P.shape[0]) * min_eigenvalue

    # Ensure symmetry
    P = (P + P.T) / 2.0

    return P
```

## Troubleshooting Common Issues

### 1. Filter Divergence

```python
def detect_filter_divergence(P, threshold=1000.0):
    """
    Detect if filter is diverging based on covariance values
    """
    # Check if any diagonal element of covariance matrix is too large
    diagonal_elements = np.diag(P)
    return np.any(diagonal_elements > threshold)

def reset_filter_if_diverged(self):
    """
    Reset filter if divergence is detected
    """
    if detect_filter_divergence(self.P):
        self.P = np.eye(self.state_dim) * 1000.0  # Reset to high uncertainty
        self.get_logger().warn('Filter reset due to divergence')
```

### 2. Tuning Process and Measurement Noise

```python
def tune_kalman_parameters():
    """
    Guidelines for tuning Q (process noise) and R (measurement noise)
    """
    # R (measurement noise) - generally known from sensor specifications
    # Accelerometer: ~0.01 to 0.1 m/s²
    # Gyroscope: ~0.001 to 0.01 rad/s
    # LiDAR: ~0.01 to 0.1 m

    # Q (process noise) - tune based on system dynamics
    # Higher Q: Trust measurements more, react faster to changes
    # Lower Q: Trust predictions more, smoother estimates but slower to adapt

    # Start with small Q and increase until you get desired response
    Q_initial = np.eye(state_dim) * 0.01
    R_initial = np.eye(measurement_dim) * 1.0

    # Use system identification techniques or empirical tuning
    return Q_initial, R_initial
```

## Next Steps

After implementing Kalman filters:

1. Explore particle filters for non-Gaussian distributions
2. Implement sensor-specific fusion techniques (visual-inertial, LiDAR-inertial)
3. Test in simulation and real-world scenarios
4. Optimize for computational efficiency

## References

1. Kalman, R. E. (1960). A new approach to linear filtering and prediction problems. *Journal of Basic Engineering*, 82(1), 35-45.

2. Welch, G., & Bishop, G. (2006). An introduction to the Kalman filter. *University of North Carolina at Chapel Hill*, 7(27), 1-16.

3. Thrun, S., Burgard, W., & Fox, D. (2005). *Probabilistic Robotics*. MIT Press. Chapter 3 covers Kalman filters.

4. Julier, S. J., & Uhlmann, J. K. (2004). Unscented filtering and nonlinear estimation. *Proceedings of the IEEE*, 92(3), 401-422.

5. Barfoot, T. D. (2017). *State Estimation for Robotics: A Matrix Lie Group Approach*. Cambridge University Press.

---

This guide provides comprehensive coverage of Kalman filter implementation for sensor fusion in robotics. The filter can be adapted for various robotic platforms and sensor configurations.