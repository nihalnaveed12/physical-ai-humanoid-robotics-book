---
sidebar_position: 3
title: "LiDAR-Based Perception: Point Clouds & Obstacle Detection"
---

# LiDAR-Based Perception: Point Clouds & Obstacle Detection

## Overview

LiDAR (Light Detection and Ranging) sensors are essential for robotic perception, providing precise 3D spatial information through laser ranging. This section covers how to simulate LiDAR sensors in Gazebo and process the resulting point cloud data for obstacle detection and spatial understanding in humanoid robotics applications.

## Understanding LiDAR in Robotics

### LiDAR Fundamentals

LiDAR sensors emit laser pulses and measure the time it takes for the light to return after reflecting off objects. This creates a "point cloud" of distance measurements that robots use for:

- **Obstacle Detection**: Identifying and mapping obstacles in the environment
- **Localization**: Determining robot position relative to known landmarks
- **Mapping**: Creating 3D maps of the environment
- **Navigation**: Planning safe paths through cluttered environments

### Types of LiDAR Sensors

- **2D LiDAR**: Single horizontal scanning plane (e.g., Hokuyo UTM-30LX)
- **3D LiDAR**: Multiple scanning planes for full 3D coverage (e.g., Velodyne VLP-16)
- **Solid-State LiDAR**: No moving parts, electronic beam steering

## Setting up LiDAR in Gazebo

### 2D LiDAR Configuration

To add a 2D LiDAR sensor to your robot model:

```xml
<gazebo reference="lidar_mount">
  <sensor name="lidar_2d" type="ray">
    <pose>0.05 0 0.05 0 0 0</pose>
    <ray>
      <scan>
        <horizontal>
          <samples>720</samples>
          <resolution>1.0</resolution>
          <min_angle>-3.14159</min_angle> <!-- -π radians -->
          <max_angle>3.14159</max_angle>  <!-- π radians -->
        </horizontal>
      </scan>
      <range>
        <min>0.1</min>
        <max>30.0</max>
        <resolution>0.01</resolution>
      </range>
    </ray>
    <plugin name="lidar_2d_controller" filename="libgazebo_ros_laser.so">
      <ros>
        <namespace>lidar_2d</namespace>
        <remapping>~/out:=scan</remapping>
      </ros>
      <output_type>sensor_msgs/LaserScan</output_type>
      <frame_name>lidar_link</frame_name>
      <topic>scan</topic>
      <update_rate>10</update_rate>
    </plugin>
  </sensor>
</gazebo>
```

### 3D LiDAR Configuration

For a 3D LiDAR sensor with multiple scanning planes:

```xml
<gazebo reference="lidar_mount">
  <sensor name="lidar_3d" type="ray">
    <pose>0.05 0 0.05 0 0 0</pose>
    <ray>
      <scan>
        <horizontal>
          <samples>1080</samples>
          <resolution>1.0</resolution>
          <min_angle>-3.14159</min_angle>
          <max_angle>3.14159</max_angle>
        </horizontal>
        <vertical>
          <samples>16</samples>
          <resolution>0.2618</resolution> <!-- 15 degrees between beams -->
          <min_angle>-0.2618</min_angle>  <!-- -15 degrees -->
          <max_angle>0.2618</max_angle>   <!-- 15 degrees -->
        </vertical>
      </scan>
      <range>
        <min>0.1</min>
        <max>100.0</max>
        <resolution>0.01</resolution>
      </range>
    </ray>
    <plugin name="lidar_3d_controller" filename="libgazebo_ros_velodyne_gpu_laser.so">
      <ros>
        <namespace>lidar_3d</namespace>
        <remapping>~/out:=points</remapping>
      </ros>
      <output_type>sensor_msgs/PointCloud2</output_type>
      <frame_name>lidar_link</frame_name>
      <topic>points</topic>
      <update_rate>10</update_rate>
    </plugin>
  </sensor>
</gazebo>
```

## Processing LiDAR Data

### Basic LiDAR Processing in ROS 2

Here's a Python example for processing LiDAR data:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan, PointCloud2
from sensor_msgs_py import point_cloud2
from std_msgs.msg import Float32
import numpy as np
from scipy.spatial import KDTree


class LiDARProcessor(Node):
    def __init__(self):
        super().__init__('lidar_processor')

        # Subscription to LiDAR data
        self.scan_subscription = self.create_subscription(
            LaserScan,
            '/lidar_2d/scan',
            self.scan_callback,
            10)

        self.pointcloud_subscription = self.create_subscription(
            PointCloud2,
            '/lidar_3d/points',
            self.pointcloud_callback,
            10)

        # Publishers for processed data
        self.obstacle_publisher = self.create_publisher(
            Float32,
            '/lidar/closest_obstacle',
            10)

        self.get_logger().info('LiDAR Processor initialized')

    def scan_callback(self, msg):
        """Process 2D LiDAR scan data"""
        try:
            # Convert ranges to numpy array
            ranges = np.array(msg.ranges)
            valid_ranges = ranges[np.isfinite(ranges)]  # Remove invalid readings

            if len(valid_ranges) > 0:
                # Find closest obstacle
                min_distance = np.min(valid_ranges)

                # Publish closest obstacle distance
                obstacle_msg = Float32()
                obstacle_msg.data = float(min_distance)
                self.obstacle_publisher.publish(obstacle_msg)

                # Calculate statistics
                avg_distance = np.mean(valid_ranges)
                max_distance = np.max(valid_ranges)

                self.get_logger().info(
                    f'LIDAR - Closest: {min_distance:.2f}m, '
                    f'Avg: {avg_distance:.2f}m, '
                    f'Max: {max_distance:.2f}m'
                )

                # Detect obstacles in front of robot (front 60 degrees)
                front_ranges = self.get_front_ranges(msg)
                if len(front_ranges) > 0:
                    front_min = np.min(front_ranges)
                    if front_min < 1.0:  # Alert if obstacle within 1 meter
                        self.get_logger().warn(f'OBSTACLE AHEAD: {front_min:.2f}m')

        except Exception as e:
            self.get_logger().error(f'Error processing LiDAR scan: {e}')

    def get_front_ranges(self, scan_msg):
        """Extract ranges in front of the robot (±30 degrees)"""
        # Calculate indices for front sector (±30 degrees)
        angle_increment = scan_msg.angle_increment
        angle_min = scan_msg.angle_min

        # Define front sector angles
        front_min_angle = -np.pi/6  # -30 degrees
        front_max_angle = np.pi/6   # 30 degrees

        # Calculate index range for front sector
        start_idx = int((front_min_angle - angle_min) / angle_increment)
        end_idx = int((front_max_angle - angle_min) / angle_increment)

        # Ensure indices are within bounds
        start_idx = max(0, min(start_idx, len(scan_msg.ranges)))
        end_idx = max(0, min(end_idx, len(scan_msg.ranges)))

        # Extract front ranges
        front_ranges = np.array(scan_msg.ranges[start_idx:end_idx])
        front_ranges = front_ranges[np.isfinite(front_ranges)]  # Remove invalid readings

        return front_ranges

    def pointcloud_callback(self, msg):
        """Process 3D LiDAR point cloud data"""
        try:
            # Extract point cloud data
            points_list = []
            for point in point_cloud2.read_points(msg, field_names=['x', 'y', 'z'], skip_nans=True):
                points_list.append([point[0], point[1], point[2]])

            if len(points_list) > 0:
                points = np.array(points_list)

                # Calculate point cloud statistics
                x_range = np.max(points[:, 0]) - np.min(points[:, 0])
                y_range = np.max(points[:, 1]) - np.min(points[:, 1])
                z_range = np.max(points[:, 2]) - np.min(points[:, 2])

                self.get_logger().info(
                    f'POINT CLOUD - Points: {len(points)}, '
                    f'X-range: {x_range:.2f}m, '
                    f'Y-range: {y_range:.2f}m, '
                    f'Z-range: {z_range:.2f}m'
                )

                # Perform basic clustering to identify objects
                clusters = self.cluster_points(points)
                self.get_logger().info(f'Detected {len(clusters)} clusters in point cloud')

        except Exception as e:
            self.get_logger().error(f'Error processing point cloud: {e}')

    def cluster_points(self, points, eps=0.5, min_samples=10):
        """Simple DBSCAN-like clustering for object detection"""
        if len(points) == 0:
            return []

        # Create KD-tree for efficient neighbor search
        tree = KDTree(points)

        visited = set()
        clusters = []

        for i, point in enumerate(points):
            if i in visited:
                continue

            # Find neighbors within epsilon distance
            neighbors = tree.query_ball_point(point, eps)

            if len(neighbors) >= min_samples:
                # This is a cluster center - collect all connected points
                cluster = []
                to_visit = neighbors[:]

                while to_visit:
                    idx = to_visit.pop()
                    if idx not in visited:
                        visited.add(idx)
                        cluster.append(idx)

                        # Add neighbors of this point to visit list
                        new_neighbors = tree.query_ball_point(points[idx], eps)
                        for neighbor_idx in new_neighbors:
                            if neighbor_idx not in visited:
                                to_visit.append(neighbor_idx)

                if len(cluster) >= min_samples:
                    clusters.append(cluster)

        return clusters


def main(args=None):
    rclpy.init(args=args)
    processor = LiDARProcessor()

    try:
        rclpy.spin(processor)
    except KeyboardInterrupt:
        pass
    finally:
        processor.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Obstacle Detection Algorithms

### Simple Obstacle Detection

Here's a more advanced obstacle detection implementation:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan
from geometry_msgs.msg import PointStamped
from visualization_msgs.msg import Marker, MarkerArray
import numpy as np
import math


class ObstacleDetector(Node):
    def __init__(self):
        super().__init__('obstacle_detector')

        # Subscription to LiDAR data
        self.scan_subscription = self.create_subscription(
            LaserScan,
            '/lidar_2d/scan',
            self.scan_callback,
            10)

        # Publishers for obstacle detection results
        self.obstacle_points_publisher = self.create_publisher(
            PointStamped,
            '/lidar/obstacle_points',
            10)

        self.obstacle_markers_publisher = self.create_publisher(
            MarkerArray,
            '/lidar/obstacle_markers',
            10)

        # Parameters
        self.declare_parameter('obstacle_distance_threshold', 1.0)  # meters
        self.declare_parameter('obstacle_cluster_min_points', 5)
        self.declare_parameter('obstacle_cluster_max_distance', 0.3)  # meters

        self.get_logger().info('Obstacle Detector initialized')

    def scan_callback(self, msg):
        """Process LiDAR scan and detect obstacles"""
        try:
            threshold = self.get_parameter('obstacle_distance_threshold').value

            # Convert polar coordinates to Cartesian
            angles = np.linspace(msg.angle_min, msg.angle_max, len(msg.ranges))
            valid_indices = np.isfinite(msg.ranges) & (np.array(msg.ranges) < threshold)

            if np.any(valid_indices):
                # Get obstacle points in Cartesian coordinates
                ranges = np.array(msg.ranges)[valid_indices]
                angles_filtered = angles[valid_indices]

                x_coords = ranges * np.cos(angles_filtered)
                y_coords = ranges * np.sin(angles_filtered)

                # Group nearby points into obstacle clusters
                clusters = self.group_obstacles(x_coords, y_coords)

                # Publish visualization markers for detected obstacles
                self.publish_obstacle_markers(clusters, msg.header)

                self.get_logger().info(f'Detected {len(clusters)} obstacle clusters')

        except Exception as e:
            self.get_logger().error(f'Error in obstacle detection: {e}')

    def group_obstacles(self, x_coords, y_coords):
        """Group nearby points into obstacle clusters"""
        clusters = []
        visited = set()

        for i in range(len(x_coords)):
            if i in visited:
                continue

            # Start a new cluster
            cluster = [(x_coords[i], y_coords[i])]
            visited.add(i)

            # Find neighboring points
            for j in range(i+1, len(x_coords)):
                if j in visited:
                    continue

                # Calculate distance to current cluster points
                dist = math.sqrt((x_coords[j] - x_coords[i])**2 + (y_coords[j] - y_coords[i])**2)

                if dist < self.get_parameter('obstacle_cluster_max_distance').value:
                    cluster.append((x_coords[j], y_coords[j]))
                    visited.add(j)

            # Only keep clusters with minimum number of points
            if len(cluster) >= self.get_parameter('obstacle_cluster_min_points').value:
                clusters.append(cluster)

        return clusters

    def publish_obstacle_markers(self, clusters, header):
        """Publish visualization markers for obstacles"""
        marker_array = MarkerArray()

        for i, cluster in enumerate(clusters):
            # Create marker for cluster centroid
            marker = Marker()
            marker.header = header
            marker.ns = "lidar_obstacles"
            marker.id = i
            marker.type = Marker.SPHERE
            marker.action = Marker.ADD

            # Calculate centroid of cluster
            avg_x = sum(p[0] for p in cluster) / len(cluster)
            avg_y = sum(p[1] for p in cluster) / len(cluster)

            marker.pose.position.x = avg_x
            marker.pose.position.y = avg_y
            marker.pose.position.z = 0.0
            marker.pose.orientation.w = 1.0

            # Size based on cluster spread
            spread = max(
                max(p[0] for p in cluster) - min(p[0] for p in cluster),
                max(p[1] for p in cluster) - min(p[1] for p in cluster)
            )
            marker.scale.x = max(0.1, spread)
            marker.scale.y = max(0.1, spread)
            marker.scale.z = 0.1

            marker.color.r = 1.0
            marker.color.g = 0.0
            marker.color.b = 0.0
            marker.color.a = 0.8

            marker_array.markers.append(marker)

        self.obstacle_markers_publisher.publish(marker_array)


def main(args=None):
    rclpy.init(args=args)
    detector = ObstacleDetector()

    try:
        rclpy.spin(detector)
    except KeyboardInterrupt:
        pass
    finally:
        detector.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Unity LiDAR Simulation

### Simulating LiDAR in Unity

For Unity, you can simulate LiDAR using raycasting:

```csharp
using System.Collections.Generic;
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Sensor_msgs;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Std_msgs;

public class UnityLiDARSimulation : MonoBehaviour
{
    ROSConnection ros;
    public string lidarTopic = "unity/lidar/scan";
    public int rayCount = 360;
    public float maxDistance = 30.0f;
    public float angleRange = 360f;
    public float updateRate = 10f;

    private float updateInterval;
    private float lastUpdateTime;
    private LaserScanMsg scanMsgTemplate;

    void Start()
    {
        ros = ROSConnection.instance;
        updateInterval = 1.0f / updateRate;
        lastUpdateTime = Time.time;

        // Create template message with fixed parameters
        scanMsgTemplate = new LaserScanMsg();
        scanMsgTemplate.angle_min = -Mathf.PI;
        scanMsgTemplate.angle_max = Mathf.PI;
        scanMsgTemplate.angle_increment = (2 * Mathf.PI) / rayCount;
        scanMsgTemplate.time_increment = 0;
        scanMsgTemplate.scan_time = 1.0f / updateRate;
        scanMsgTemplate.range_min = 0.1f;
        scanMsgTemplate.range_max = maxDistance;
        scanMsgTemplate.ranges = new double[rayCount];
    }

    void Update()
    {
        if (Time.time - lastUpdateTime >= updateInterval)
        {
            SimulateLiDAR();
            lastUpdateTime = Time.time;
        }
    }

    void SimulateLiDAR()
    {
        float angleStep = angleRange / rayCount;
        List<double> ranges = new List<double>();

        for (int i = 0; i < rayCount; i++)
        {
            float angle = Mathf.Deg2Rad * (i * angleStep - angleRange / 2);

            // Calculate ray direction in world space
            Vector3 direction = new Vector3(
                Mathf.Cos(angle),
                0,
                Mathf.Sin(angle)
            );

            // Rotate direction by robot's rotation
            direction = transform.rotation * direction;

            // Perform raycast
            RaycastHit hit;
            if (Physics.Raycast(transform.position, direction, out hit, maxDistance))
            {
                ranges.Add(hit.distance);
            }
            else
            {
                // No obstacle detected, return maximum range
                ranges.Add(double.PositiveInfinity);
            }
        }

        // Create and populate LaserScan message
        LaserScanMsg scanMsg = scanMsgTemplate;
        scanMsg.header = new HeaderMsg
        {
            stamp = new TimeMsg
            {
                sec = (int)System.DateTime.UtcNow.Subtract(
                    new System.DateTime(1970, 1, 1)).TotalSeconds,
                nanosec = 0
            },
            frame_id = "lidar_link"
        };

        scanMsg.ranges = ranges.ToArray();

        // Publish the message
        ros.Publish(lidarTopic, scanMsg);
    }
}
```

## Point Cloud Processing

### Converting LiDAR Data to Point Clouds

For 3D processing, you might want to convert LiDAR scans to point clouds:

```python
#!/usr/bin/env python3
import numpy as np
from scipy.spatial.transform import Rotation as R


def lidar_scan_to_pointcloud(ranges, angle_min, angle_max, num_beams, position=(0, 0, 0), rotation=(0, 0, 0)):
    """
    Convert LiDAR scan to 3D point cloud

    Args:
        ranges: Array of distance measurements
        angle_min: Minimum angle of scan
        angle_max: Maximum angle of scan
        num_beams: Number of beams in scan
        position: Robot position (x, y, z)
        rotation: Robot rotation (roll, pitch, yaw)

    Returns:
        numpy array of 3D points (Nx3)
    """
    # Calculate angle increment
    angle_increment = (angle_max - angle_min) / (num_beams - 1)

    # Generate angles for each beam
    angles = np.array([angle_min + i * angle_increment for i in range(num_beams)])

    # Filter out invalid ranges (NaN, infinity)
    valid_mask = np.isfinite(ranges)
    valid_angles = angles[valid_mask]
    valid_ranges = np.array(ranges)[valid_mask]

    # Convert polar to Cartesian coordinates in robot frame
    x_robot = valid_ranges * np.cos(valid_angles)
    y_robot = valid_ranges * np.sin(valid_angles)
    z_robot = np.zeros_like(x_robot)  # 2D LiDAR is in XY plane

    # Stack points in robot frame
    points_robot = np.column_stack([x_robot, y_robot, z_robot])

    # Apply robot rotation and translation
    if rotation != (0, 0, 0):
        rot = R.from_euler('xyz', rotation)
        points_robot = rot.apply(points_robot)

    # Translate to world coordinates
    points_world = points_robot + np.array(position)

    return points_world


def downsample_pointcloud(points, voxel_size=0.1):
    """
    Downsample point cloud using voxel grid filtering

    Args:
        points: Nx3 numpy array of 3D points
        voxel_size: Size of each voxel in meters

    Returns:
        Downsampled point cloud
    """
    if len(points) == 0:
        return points

    # Calculate voxel indices for each point
    voxel_coords = np.floor(points / voxel_size).astype(int)

    # Group points by voxel
    voxel_dict = {}
    for i, coord in enumerate(voxel_coords):
        key = tuple(coord)
        if key not in voxel_dict:
            voxel_dict[key] = []
        voxel_dict[key].append(points[i])

    # Take centroid of each voxel
    downsampled_points = []
    for points_in_voxel in voxel_dict.values():
        centroid = np.mean(points_in_voxel, axis=0)
        downsampled_points.append(centroid)

    return np.array(downsampled_points)
```

### Advanced Point Cloud Processing Techniques

Point clouds from 3D LiDAR sensors require specialized processing techniques to extract meaningful information for robotics applications.

#### 1. Ground Plane Segmentation

Ground plane segmentation is crucial for separating obstacles from the ground surface:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import PointCloud2
from sensor_msgs_py import point_cloud2
from std_msgs.msg import Header
from geometry_msgs.msg import Point
from visualization_msgs.msg import Marker, MarkerArray
import numpy as np
from sklearn.cluster import DBSCAN


class GroundPlaneSegmentation(Node):
    def __init__(self):
        super().__init__('ground_plane_segmentation')

        # Subscription to point cloud data
        self.pc_subscription = self.create_subscription(
            PointCloud2,
            '/lidar_3d/points',
            self.pc_callback,
            10)

        # Publisher for ground points (visualization)
        self.ground_publisher = self.create_publisher(
            PointCloud2,
            '/lidar/ground_points',
            10)

        # Publisher for obstacle points (visualization)
        self.obstacle_publisher = self.create_publisher(
            PointCloud2,
            '/lidar/obstacle_points',
            10)

        # Publisher for visualization markers
        self.marker_publisher = self.create_publisher(
            MarkerArray,
            '/lidar/plane_markers',
            10)

        self.get_logger().info('Ground Plane Segmentation initialized')

    def pc_callback(self, msg):
        """Process point cloud and segment ground plane"""
        try:
            # Extract point cloud data
            points_list = []
            for point in point_cloud2.read_points(msg, field_names=['x', 'y', 'z'], skip_nans=True):
                points_list.append([point[0], point[1], point[2]])

            if len(points_list) == 0:
                return

            points = np.array(points_list)

            # Separate ground and obstacle points using RANSAC-like approach
            ground_points, obstacle_points = self.separate_ground_obstacles(points)

            # Publish segmented point clouds
            if len(ground_points) > 0:
                ground_pc_msg = self.create_pointcloud_msg(ground_points, msg.header)
                self.ground_publisher.publish(ground_pc_msg)

            if len(obstacle_points) > 0:
                obstacle_pc_msg = self.create_pointcloud_msg(obstacle_points, msg.header)
                self.obstacle_publisher.publish(obstacle_pc_msg)

            # Publish visualization markers for the ground plane
            self.publish_ground_plane_marker(ground_points, msg.header)

            self.get_logger().info(
                f'Ground plane segmentation: {len(ground_points)} ground points, '
                f'{len(obstacle_points)} obstacle points'
            )

        except Exception as e:
            self.get_logger().error(f'Error in ground plane segmentation: {e}')

    def separate_ground_obstacles(self, points, z_threshold=0.1, max_distance=0.2):
        """
        Separate ground and obstacle points based on Z-height
        This is a simplified approach - in practice, you'd use RANSAC for plane fitting
        """
        # Calculate z-coordinate statistics
        z_median = np.median(points[:, 2])
        z_std = np.std(points[:, 2])

        # Identify ground points (close to ground level)
        ground_mask = points[:, 2] <= (z_median + z_threshold)
        ground_points = points[ground_mask]
        obstacle_points = points[~ground_mask]

        return ground_points, obstacle_points

    def create_pointcloud_msg(self, points, header):
        """Create PointCloud2 message from numpy array"""
        from std_msgs.msg import Header
        from sensor_msgs.msg import PointField
        from sensor_msgs_py import point_cloud2
        import struct

        # Create header
        new_header = Header()
        new_header.stamp = header.stamp
        new_header.frame_id = header.frame_id

        # Define point fields
        fields = [
            PointField(name='x', offset=0, datatype=PointField.FLOAT32, count=1),
            PointField(name='y', offset=4, datatype=PointField.FLOAT32, count=1),
            PointField(name='z', offset=8, datatype=PointField.FLOAT32, count=1),
        ]

        # Create PointCloud2 message
        pc_msg = point_cloud2.create_cloud(new_header, fields, points)
        return pc_msg

    def publish_ground_plane_marker(self, ground_points, header):
        """Publish visualization marker for the ground plane"""
        if len(ground_points) < 3:
            return

        marker_array = MarkerArray()

        # Create a plane marker
        plane_marker = Marker()
        plane_marker.header = header
        plane_marker.ns = "ground_plane"
        plane_marker.id = 0
        plane_marker.type = Marker.CUBE
        plane_marker.action = Marker.ADD

        # Calculate plane dimensions
        x_min, x_max = np.min(ground_points[:, 0]), np.max(ground_points[:, 0])
        y_min, y_max = np.min(ground_points[:, 1]), np.max(ground_points[:, 1])
        z_avg = np.mean(ground_points[:, 2])

        # Set position and scale
        plane_marker.pose.position.x = (x_min + x_max) / 2
        plane_marker.pose.position.y = (y_min + y_max) / 2
        plane_marker.pose.position.z = z_avg
        plane_marker.pose.orientation.w = 1.0

        plane_marker.scale.x = x_max - x_min
        plane_marker.scale.y = y_max - y_min
        plane_marker.scale.z = 0.01  # Very thin plane

        # Set color (light blue for ground)
        plane_marker.color.r = 0.0
        plane_marker.color.g = 0.5
        plane_marker.color.b = 1.0
        plane_marker.color.a = 0.3

        marker_array.markers.append(plane_marker)
        self.marker_publisher.publish(marker_array)


def main(args=None):
    rclpy.init(args=args)
    node = GroundPlaneSegmentation()

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

#### 2. Point Cloud Clustering for Object Detection

Clustering algorithms can group points that belong to the same object:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import PointCloud2
from sensor_msgs_py import point_cloud2
from visualization_msgs.msg import MarkerArray
import numpy as np
from sklearn.cluster import DBSCAN


class PointCloudClustering(Node):
    def __init__(self):
        super().__init__('pointcloud_clustering')

        # Subscription to point cloud data
        self.pc_subscription = self.create_subscription(
            PointCloud2,
            '/lidar_3d/points',
            self.pc_callback,
            10)

        # Publisher for cluster visualization
        self.cluster_publisher = self.create_publisher(
            MarkerArray,
            '/lidar/cluster_markers',
            10)

        # Parameters
        self.declare_parameter('cluster_eps', 0.5)  # Maximum distance between points in cluster
        self.declare_parameter('cluster_min_points', 10)  # Minimum points to form cluster

        self.get_logger().info('Point Cloud Clustering initialized')

    def pc_callback(self, msg):
        """Process point cloud and perform clustering"""
        try:
            # Extract point cloud data
            points_list = []
            for point in point_cloud2.read_points(msg, field_names=['x', 'y', 'z'], skip_nans=True):
                points_list.append([point[0], point[1], point[2]])

            if len(points_list) < 10:  # Need minimum points for clustering
                return

            points = np.array(points_list)

            # Perform DBSCAN clustering
            eps = self.get_parameter('cluster_eps').value
            min_points = self.get_parameter('cluster_min_points').value

            clustering = DBSCAN(eps=eps, min_samples=min_points).fit(points)
            labels = clustering.labels_

            # Count clusters (excluding noise points labeled as -1)
            n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
            n_noise = list(labels).count(-1)

            # Publish cluster visualization markers
            self.publish_cluster_markers(points, labels, msg.header)

            self.get_logger().info(
                f'Clustering results: {n_clusters} clusters, {n_noise} noise points'
            )

        except Exception as e:
            self.get_logger().error(f'Error in point cloud clustering: {e}')

    def publish_cluster_markers(self, points, labels, header):
        """Publish visualization markers for clusters"""
        marker_array = MarkerArray()

        # Get unique cluster labels (excluding noise -1)
        unique_labels = set(labels)
        if -1 in unique_labels:
            unique_labels.remove(-1)

        colors = [
            (1.0, 0.0, 0.0),  # Red
            (0.0, 1.0, 0.0),  # Green
            (0.0, 0.0, 1.0),  # Blue
            (1.0, 1.0, 0.0),  # Yellow
            (1.0, 0.0, 1.0),  # Magenta
            (0.0, 1.0, 1.0),  # Cyan
        ]

        for i, label in enumerate(unique_labels):
            # Get points belonging to this cluster
            cluster_points = points[labels == label]

            if len(cluster_points) == 0:
                continue

            # Create marker for cluster centroid
            marker = Marker()
            marker.header = header
            marker.ns = "pointcloud_clusters"
            marker.id = i
            marker.type = Marker.SPHERE
            marker.action = Marker.ADD

            # Calculate centroid of cluster
            centroid = np.mean(cluster_points, axis=0)

            marker.pose.position.x = centroid[0]
            marker.pose.position.y = centroid[1]
            marker.pose.position.z = centroid[2]
            marker.pose.orientation.w = 1.0

            # Size based on cluster spread
            spread = max(
                np.max(cluster_points[:, 0]) - np.min(cluster_points[:, 0]),
                np.max(cluster_points[:, 1]) - np.min(cluster_points[:, 1]),
                np.max(cluster_points[:, 2]) - np.min(cluster_points[:, 2])
            )
            marker.scale.x = max(0.2, spread)
            marker.scale.y = max(0.2, spread)
            marker.scale.z = max(0.2, spread)

            # Assign color based on cluster ID
            color_idx = i % len(colors)
            marker.color.r = colors[color_idx][0]
            marker.color.g = colors[color_idx][1]
            marker.color.b = colors[color_idx][2]
            marker.color.a = 0.8

            marker_array.markers.append(marker)

        self.cluster_publisher.publish(marker_array)


def main(args=None):
    rclpy.init(args=args)
    node = PointCloudClustering()

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

#### 3. Point Cloud Feature Extraction

Extracting features from point clouds is essential for object recognition and classification:

```python
#!/usr/bin/env python3
import numpy as np
from sklearn.decomposition import PCA
from scipy.spatial.distance import pdist, squareform


def extract_pointcloud_features(points):
    """
    Extract geometric features from a point cloud for object recognition

    Args:
        points: Nx3 numpy array of 3D points

    Returns:
        Dictionary of geometric features
    """
    if len(points) < 3:
        return {}

    features = {}

    # Basic statistics
    features['num_points'] = len(points)
    features['centroid'] = np.mean(points, axis=0)
    features['variance'] = np.var(points, axis=0)
    features['std'] = np.std(points, axis=0)

    # Bounding box dimensions
    features['min_coords'] = np.min(points, axis=0)
    features['max_coords'] = np.max(points, axis=0)
    features['dimensions'] = features['max_coords'] - features['min_coords']

    # Volume approximation
    features['volume'] = np.prod(features['dimensions'])

    # Principal Component Analysis for shape features
    pca = PCA(n_components=3)
    pca.fit(points)
    features['pca_components'] = pca.components_
    features['pca_explained_variance'] = pca.explained_variance_

    # Calculate eigenvalues (shape descriptors)
    cov_matrix = np.cov(points.T)
    eigenvalues, _ = np.linalg.eigh(cov_matrix)
    # Sort in descending order
    eigenvalues = np.sort(eigenvalues)[::-1]

    # Shape descriptors based on eigenvalues
    if eigenvalues[0] > 0:
        features['linearity'] = (eigenvalues[0] - eigenvalues[1]) / eigenvalues[0]
        features['planarity'] = (eigenvalues[1] - eigenvalues[2]) / eigenvalues[0]
        features['sphericity'] = eigenvalues[2] / eigenvalues[0]

    # Distance-based features
    if len(points) > 1:
        distances = pdist(points)
        features['avg_distance'] = np.mean(distances)
        features['std_distance'] = np.std(distances)
        features['min_distance'] = np.min(distances)
        features['max_distance'] = np.max(distances)

    return features


def classify_pointcloud_object(features):
    """
    Simple classification based on geometric features

    Args:
        features: Dictionary of point cloud features

    Returns:
        String classification
    """
    if not features:
        return "unknown"

    # Extract key features
    dimensions = features.get('dimensions', np.array([0, 0, 0]))
    linearity = features.get('linearity', 0)
    planarity = features.get('planarity', 0)
    sphericity = features.get('sphericity', 0)

    # Simple classification rules
    if dimensions[2] > max(dimensions[0], dimensions[1]) * 2:
        # Tall object (e.g., pole, tree)
        return "tall_object"
    elif planarity > 0.7:
        # Planar object (e.g., wall, ground)
        return "planar_object"
    elif linearity > 0.7:
        # Linear object (e.g., pole, fence)
        return "linear_object"
    elif sphericity > 0.8:
        # Spherical object (e.g., ball, round object)
        return "spherical_object"
    elif dimensions[0] > 2.0 and dimensions[1] > 1.0:
        # Large ground-level object (e.g., car, furniture)
        return "large_object"
    else:
        # Default classification
        return "small_object"


# Example usage in a ROS 2 node
def analyze_pointcloud_in_ros():
    """
    Example of how to use point cloud feature extraction in a ROS 2 context
    """
    # This would be integrated into a ROS 2 node callback
    # For demonstration, we'll create a sample point cloud

    # Simulate a point cloud (e.g., from a box)
    np.random.seed(42)
    x = np.random.uniform(-1.0, 1.0, 100)
    y = np.random.uniform(-0.5, 0.5, 100)
    z = np.random.uniform(0, 0.2, 100)
    points = np.column_stack([x, y, z])

    # Extract features
    features = extract_pointcloud_features(points)

    # Classify object
    classification = classify_pointcloud_object(features)

    print(f"Object classification: {classification}")
    print(f"Number of points: {features['num_points']}")
    print(f"Dimensions: {features['dimensions']}")
    print(f"Linearity: {features['linearity']:.3f}")
    print(f"Planarity: {features['planarity']:.3f}")
    print(f"Sphericity: {features['sphericity']:.3f}")

    return features, classification
```

## Validation and Testing

### Validating LiDAR Perception

To validate that your LiDAR perception is working correctly:

1. **Check data flow**: Verify that LiDAR topics are publishing data
   ```bash
   ros2 topic echo /lidar_2d/scan
   ros2 topic echo /lidar_3d/points
   ```

2. **Visualize in RViz2**:
   ```bash
   rviz2
   ```
   Add LiDAR scan and point cloud displays to verify data quality

3. **Test processing nodes**: Ensure obstacle detection and clustering work correctly

## Performance Considerations

### Optimizing LiDAR Processing

For real-time LiDAR processing in humanoid robotics:

- **Ray count**: Balance quality vs. performance (360-1080 rays for 2D LiDAR)
- **Update rate**: Match to robot's navigation needs (typically 10-20 Hz)
- **Clustering algorithms**: Use efficient algorithms like KD-trees or voxel grids
- **Point cloud size**: Downsample when possible for faster processing

## Troubleshooting Common Issues

### LiDAR Not Publishing Data

1. **Check Gazebo plugins**: Verify LiDAR plugin is loaded
   ```bash
   gz topic -l | grep lidar
   ```

2. **Verify URDF**: Check that LiDAR is properly attached to robot

3. **ROS topics**: Ensure topic names match between publisher and subscriber

### Invalid Range Values

1. **NaN/Inf handling**: Always filter out invalid range values before processing
2. **Coordinate systems**: Ensure proper transformation between robot and world coordinates
3. **Units**: Verify distances are in meters as expected

## Next Steps

After implementing LiDAR perception:

1. Move to IMU-based state estimation for orientation and motion
2. Implement sensor fusion to combine LiDAR with other sensors
3. Create integration examples that combine all perception modalities
4. Test perception in complex environments with varied obstacles

## References

1. Thrun, S., Burgard, W., & Fox, D. (2005). *Probabilistic Robotics*. MIT Press. Chapter 6 covers range finder sensors and their applications in robotics.

2. Geiger, A., Lenz, P., & Urtasun, R. (2013). Are we ready for autonomous driving? The KITTI vision benchmark suite. *IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*, 3354-3361.

3. Rusu, R. B., & Cousins, S. (2011). 3D is here: Point Cloud Library (PCL). *IEEE International Conference on Robotics and Automation (ICRA)*, 1-4.

4. Zhang, J., & Singh, S. (2014). LOAM: Lidar Odometry and Mapping in Real-time. *Robotics: Science and Systems (RSS)*.

5. Behley, J., et al. (2019). SemanticKITTI: A Dataset for Semantic Scene Understanding of LiDAR Sequences. *IEEE International Conference on Computer Vision (ICCV)*, 9312-9321.

---

This guide provides the foundation for implementing LiDAR-based perception in your digital twin environment. The next section will cover IMU-based state estimation for understanding robot orientation and motion.