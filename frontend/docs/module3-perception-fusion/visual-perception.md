---
sidebar_position: 2
title: "Visual Perception: RGB and Depth Processing"
---

# Visual Perception: RGB and Depth Processing

## Overview

Visual perception is a critical component of Physical AI systems, enabling robots to interpret and understand their environment through cameras. This section covers how to process both RGB (color) and depth information in simulation environments, providing the foundation for computer vision applications in humanoid robotics.

## Understanding Visual Perception in Robotics

### RGB Vision

RGB cameras provide rich visual information that robots use for:
- **Object Recognition**: Identifying objects in the environment
- **Scene Understanding**: Understanding spatial relationships between objects
- **Navigation**: Path planning and obstacle avoidance
- **Human-Robot Interaction**: Recognizing gestures and facial expressions

### Depth Perception

Depth cameras (RGB-D) add the crucial third dimension to visual information:
- **3D Reconstruction**: Building 3D models of the environment
- **Obstacle Detection**: Identifying obstacles with precise distance information
- **Manipulation**: Providing accurate positioning for robotic arms
- **SLAM**: Simultaneous Localization and Mapping with depth information

## Setting up Visual Perception in Gazebo

### RGB Camera Configuration

To add an RGB camera to your robot in Gazebo:

```xml
<gazebo reference="camera_mount">
  <sensor name="rgb_camera" type="camera">
    <pose>0.02 0 0.02 0 0 0</pose>
    <camera name="rgb_cam">
      <horizontal_fov>1.047</horizontal_fov>  <!-- 60 degrees -->
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.1</near>
        <far>10.0</far>
      </clip>
    </camera>
    <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
      <ros>
        <namespace>camera</namespace>
        <remapping>~/image_raw:=image</remapping>
        <remapping>~/camera_info:=camera_info</remapping>
      </ros>
      <camera_name>rgb_camera</camera_name>
      <image_topic_name>image</image_topic_name>
      <camera_info_topic_name>camera_info</camera_info_topic_name>
      <frame_name>camera_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

### Depth Camera Configuration

For depth camera simulation with realistic depth data:

```xml
<gazebo reference="camera_mount">
  <sensor name="depth_camera" type="depth">
    <pose>0.02 0 0.02 0 0 0</pose>
    <camera name="depth_cam">
      <horizontal_fov>1.047</horizontal_fov>  <!-- 60 degrees -->
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <depth_camera>
        <output>depths</output>
      </depth_camera>
      <clip>
        <near>0.1</near>
        <far>10.0</far>
      </clip>
    </camera>
    <plugin name="depth_camera_controller" filename="libgazebo_ros_openni_kinect.so">
      <ros>
        <namespace>depth_camera</namespace>
        <remapping>~/rgb/image_raw:=image</remapping>
        <remapping>~/depth/image_raw:=depth</remapping>
        <remapping>~/rgb/camera_info:=camera_info</remapping>
      </ros>
      <camera_name>depth_camera</camera_name>
      <image_topic_name>image</image_topic_name>
      <depth_image_topic_name>depth</depth_image_topic_name>
      <point_cloud_topic_name>points</point_cloud_topic_name>
      <frame_name>camera_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

## Processing RGB Data

### Basic RGB Processing Pipeline

Here's a Python example for processing RGB camera data in ROS 2:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2
import numpy as np


class RGBProcessor(Node):
    def __init__(self):
        super().__init__('rgb_processor')

        # Subscription to camera image
        self.subscription = self.create_subscription(
            Image,
            '/camera/image',
            self.image_callback,
            10)

        # Publisher for processed image (optional)
        self.publisher = self.create_publisher(
            Image,
            '/camera/processed_image',
            10)

        # CV Bridge for converting ROS Image to OpenCV format
        self.cv_bridge = CvBridge()

        self.get_logger().info('RGB Processor initialized')

    def image_callback(self, msg):
        try:
            # Convert ROS Image message to OpenCV image
            cv_image = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Process the image (example: detect edges)
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)

            # Optional: overlay edges on original image
            edge_overlay = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
            combined = cv2.addWeighted(cv_image, 0.7, edge_overlay, 0.3, 0)

            # Convert back to ROS Image message
            processed_msg = self.cv_bridge.cv2_to_imgmsg(combined, encoding='bgr8')
            processed_msg.header = msg.header  # Preserve timestamp and frame

            # Publish processed image
            self.publisher.publish(processed_msg)

            # Log some statistics
            height, width, channels = cv_image.shape
            self.get_logger().info(f'Processed image: {width}x{height}, {channels} channels')

        except Exception as e:
            self.get_logger().error(f'Error processing image: {e}')


def main(args=None):
    rclpy.init(args=args)
    processor = RGBProcessor()

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

### Basic Perception Processing Techniques

Visual perception in robotics involves several fundamental processing techniques that extract meaningful information from raw image data. Here are key approaches for processing RGB data:

#### 1. Color-Based Segmentation

Color segmentation is useful for identifying objects of specific colors in the environment:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2
import numpy as np


class ColorSegmentationNode(Node):
    def __init__(self):
        super().__init__('color_segmentation')

        self.subscription = self.create_subscription(
            Image,
            '/camera/image',
            self.image_callback,
            10)

        self.publisher = self.create_publisher(
            Image,
            '/camera/segmented_image',
            10)

        self.cv_bridge = CvBridge()

    def image_callback(self, msg):
        try:
            cv_image = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Convert BGR to HSV for better color segmentation
            hsv = cv2.cvtColor(cv_image, cv2.COLOR_BGR2HSV)

            # Define range for red color (in HSV)
            lower_red1 = np.array([0, 50, 50])
            upper_red1 = np.array([10, 255, 255])
            lower_red2 = np.array([170, 50, 50])
            upper_red2 = np.array([180, 255, 255])

            # Create masks for red color
            mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
            mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
            mask_red = mask1 + mask2

            # Apply morphological operations to clean up the mask
            kernel = np.ones((5,5), np.uint8)
            mask_red = cv2.morphologyEx(mask_red, cv2.MORPH_OPEN, kernel)
            mask_red = cv2.morphologyEx(mask_red, cv2.MORPH_CLOSE, kernel)

            # Apply mask to original image
            segmented = cv2.bitwise_and(cv_image, cv_image, mask=mask_red)

            # Convert back to ROS Image message
            result_msg = self.cv_bridge.cv2_to_imgmsg(segmented, encoding='bgr8')
            result_msg.header = msg.header
            self.publisher.publish(result_msg)

        except Exception as e:
            self.get_logger().error(f'Error in color segmentation: {e}')
```

#### 2. Edge Detection and Contour Analysis

Edge detection helps identify object boundaries and shapes:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2
import numpy as np


class EdgeDetectionNode(Node):
    def __init__(self):
        super().__init__('edge_detection')

        self.subscription = self.create_subscription(
            Image,
            '/camera/image',
            self.image_callback,
            10)

        self.publisher = self.create_publisher(
            Image,
            '/camera/edge_image',
            10)

        self.cv_bridge = CvBridge()

    def image_callback(self, msg):
        try:
            cv_image = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Convert to grayscale
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)

            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)

            # Apply Canny edge detection
            edges = cv2.Canny(blurred, 50, 150)

            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            # Draw contours on original image
            contour_image = cv_image.copy()
            cv2.drawContours(contour_image, contours, -1, (0, 255, 0), 2)

            # Filter contours by area to find significant objects
            min_area = 100
            significant_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_area]

            # Draw only significant contours
            filtered_image = cv_image.copy()
            cv2.drawContours(filtered_image, significant_contours, -1, (0, 0, 255), 3)

            # Convert back to ROS Image message
            result_msg = self.cv_bridge.cv2_to_imgmsg(filtered_image, encoding='bgr8')
            result_msg.header = msg.header
            self.publisher.publish(result_msg)

            # Log number of significant contours found
            self.get_logger().info(f'Found {len(significant_contours)} significant contours')

        except Exception as e:
            self.get_logger().error(f'Error in edge detection: {e}')
```

#### 3. Feature Detection and Matching

Feature detection helps identify distinctive points in images that can be used for object recognition or tracking:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2
import numpy as np


class FeatureDetectionNode(Node):
    def __init__(self):
        super().__init__('feature_detection')

        self.subscription = self.create_subscription(
            Image,
            '/camera/image',
            self.image_callback,
            10)

        self.publisher = self.create_publisher(
            Image,
            '/camera/feature_image',
            10)

        self.cv_bridge = CvBridge()

        # Initialize ORB detector
        self.orb = cv2.ORB_create(nfeatures=500)

    def image_callback(self, msg):
        try:
            cv_image = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Convert to grayscale
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)

            # Detect keypoints and descriptors
            keypoints, descriptors = self.orb.detectAndCompute(gray, None)

            # Draw keypoints on image
            feature_image = cv2.drawKeypoints(cv_image, keypoints, None,
                                            flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)

            # Convert back to ROS Image message
            result_msg = self.cv_bridge.cv2_to_imgmsg(feature_image, encoding='bgr8')
            result_msg.header = msg.header
            self.publisher.publish(result_msg)

            # Log number of features found
            self.get_logger().info(f'Found {len(keypoints) if keypoints else 0} features')

        except Exception as e:
            self.get_logger().error(f'Error in feature detection: {e}')
```

## Processing Depth Data

### Basic Depth Processing Pipeline

Here's how to process depth camera data in ROS 2:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo
from cv_bridge import CvBridge
import numpy as np
import cv2


class DepthProcessor(Node):
    def __init__(self):
        super().__init__('depth_processor')

        # Subscriptions
        self.depth_subscription = self.create_subscription(
            Image,
            '/depth_camera/depth',
            self.depth_callback,
            10)

        self.info_subscription = self.create_subscription(
            CameraInfo,
            '/depth_camera/camera_info',
            self.info_callback,
            10)

        # Publisher for processed depth data
        self.publisher = self.create_publisher(
            Image,
            '/depth_camera/processed_depth',
            10)

        # CV Bridge for converting ROS Image to NumPy array
        self.cv_bridge = CvBridge()

        # Camera intrinsics
        self.camera_intrinsics = None

        self.get_logger().info('Depth Processor initialized')

    def info_callback(self, msg):
        # Store camera intrinsics for 3D reconstruction
        self.camera_intrinsics = {
            'fx': msg.k[0],  # Focal length x
            'fy': msg.k[4],  # Focal length y
            'cx': msg.k[2],  # Principal point x
            'cy': msg.k[5],  # Principal point y
        }

    def depth_callback(self, msg):
        try:
            # Convert depth image to NumPy array
            if msg.encoding == '32FC1':
                # 32-bit float depth values
                depth_array = self.cv_bridge.imgmsg_to_cv2(msg)
            elif msg.encoding == '16UC1':
                # 16-bit unsigned integer depth values (millimeters)
                depth_image = self.cv_bridge.imgmsg_to_cv2(msg)
                depth_array = depth_image.astype(np.float32) / 1000.0  # Convert mm to meters
            else:
                self.get_logger().error(f'Unsupported depth encoding: {msg.encoding}')
                return

            # Process depth data
            height, width = depth_array.shape

            # Find closest and farthest points in view
            valid_depths = depth_array[np.isfinite(depth_array) & (depth_array > 0)]
            if len(valid_depths) > 0:
                min_depth = np.min(valid_depths)
                max_depth = np.max(valid_depths)

                self.get_logger().info(f'Depth range: {min_depth:.2f}m to {max_depth:.2f}m')

                # Example: Create a mask for objects within 2 meters
                close_objects_mask = (depth_array > 0) & (depth_array < 2.0)

                # Calculate average depth in center region
                center_region = depth_array[
                    height//4:3*height//4,
                    width//4:3*width//4
                ]
                center_valid = center_region[np.isfinite(center_region) & (center_region > 0)]
                if len(center_valid) > 0:
                    avg_center_depth = np.mean(center_valid)
                    self.get_logger().info(f'Average depth in center: {avg_center_depth:.2f}m')

            # Optional: Create depth visualization
            # Normalize for visualization (0-255 range)
            if len(valid_depths) > 0:
                normalized_depth = ((depth_array - min_depth) / (max_depth - min_depth) * 255).astype(np.uint8)
                # Convert to 3-channel for visualization
                depth_viz = cv2.applyColorMap(normalized_depth, cv2.COLORMAP_JET)

                # Convert back to ROS Image message
                viz_msg = self.cv_bridge.cv2_to_imgmsg(depth_viz, encoding='bgr8')
                viz_msg.header = msg.header
                self.publisher.publish(viz_msg)

        except Exception as e:
            self.get_logger().error(f'Error processing depth: {e}')


def main(args=None):
    rclpy.init(args=args)
    processor = DepthProcessor()

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

## Point Cloud Generation from Depth Data

### Converting Depth to 3D Point Clouds

One of the most important applications of depth data is generating 3D point clouds:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo
from sensor_msgs_py import point_cloud2
from sensor_msgs.msg import PointCloud2, PointField
from cv_bridge import CvBridge
import numpy as np
import struct


class DepthToPointCloud(Node):
    def __init__(self):
        super().__init__('depth_to_pointcloud')

        # Subscriptions
        self.depth_subscription = self.create_subscription(
            Image,
            '/depth_camera/depth',
            self.depth_callback,
            10)

        self.info_subscription = self.create_subscription(
            CameraInfo,
            '/depth_camera/camera_info',
            self.info_callback,
            10)

        # Publisher for point cloud
        self.pc_publisher = self.create_publisher(
            PointCloud2,
            '/depth_camera/points',
            10)

        self.cv_bridge = CvBridge()
        self.camera_info = None

        self.get_logger().info('Depth to PointCloud converter initialized')

    def info_callback(self, msg):
        self.camera_info = msg

    def depth_callback(self, msg):
        if self.camera_info is None:
            return  # Wait for camera info

        try:
            # Convert depth image to numpy array
            depth_array = self.cv_bridge.imgmsg_to_cv2(msg)

            # Get camera intrinsics
            fx = self.camera_info.k[0]
            fy = self.camera_info.k[4]
            cx = self.camera_info.k[2]
            cy = self.camera_info.k[5]

            height, width = depth_array.shape

            # Generate point cloud
            points = []
            for v in range(height):
                for u in range(width):
                    depth = depth_array[v, u]

                    if np.isfinite(depth) and depth > 0:
                        # Convert pixel coordinates to 3D world coordinates
                        x = (u - cx) * depth / fx
                        y = (v - cy) * depth / fy
                        z = depth

                        points.append([x, y, z])

            # Create PointCloud2 message
            header = msg.header
            fields = [
                PointField(name='x', offset=0, datatype=PointField.FLOAT32, count=1),
                PointField(name='y', offset=4, datatype=PointField.FLOAT32, count=1),
                PointField(name='z', offset=8, datatype=PointField.FLOAT32, count=1),
            ]

            # Create point cloud message
            pc_msg = point_cloud2.create_cloud(header, fields, points)
            self.pc_publisher.publish(pc_msg)

            self.get_logger().info(f'Published point cloud with {len(points)} points')

        except Exception as e:
            self.get_logger().error(f'Error converting depth to point cloud: {e}')


def main(args=None):
    rclpy.init(args=args)
    converter = DepthToPointCloud()

    try:
        rclpy.spin(converter)
    except KeyboardInterrupt:
        pass
    finally:
        converter.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Unity Visual Perception Setup

### Setting up Camera Simulation in Unity

For Unity, you can simulate cameras using Unity's built-in camera system with custom scripts to mimic depth camera functionality:

```csharp
using System.Collections.Generic;
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Sensor_msgs;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Geometry_msgs;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Std_msgs;

public class UnityCameraSimulation : MonoBehaviour
{
    ROSConnection ros;
    public string rgbTopic = "unity/camera/rgb";
    public string depthTopic = "unity/camera/depth";
    public string pointCloudTopic = "unity/camera/points";

    public Camera rgbCamera;
    public int width = 640;
    public int height = 480;
    public float updateRate = 30f;  // Hz

    private RenderTexture colorTexture;
    private Texture2D readbackTexture;
    private float updateInterval;
    private float lastUpdateTime;

    void Start()
    {
        ros = ROSConnection.instance;
        updateInterval = 1.0f / updateRate;
        lastUpdateTime = Time.time;

        // Create render texture for camera
        colorTexture = new RenderTexture(width, height, 24, RenderTextureFormat.ARGB32);
        readbackTexture = new Texture2D(width, height, TextureFormat.RGB24, false);

        // Set up camera if not already configured
        if (rgbCamera == null)
        {
            rgbCamera = GetComponent<Camera>();
        }

        rgbCamera.targetTexture = colorTexture;
    }

    void Update()
    {
        if (Time.time - lastUpdateTime >= updateInterval)
        {
            CaptureAndPublishImage();
            lastUpdateTime = Time.time;
        }
    }

    void CaptureAndPublishImage()
    {
        // Render the scene
        rgbCamera.Render();

        // Read the pixels
        RenderTexture.active = colorTexture;
        readbackTexture.ReadPixels(new Rect(0, 0, width, height), 0, 0);
        readbackTexture.Apply();

        // Convert to byte array
        byte[] imageBytes = readbackTexture.EncodeToJPG();

        // Create ROS Image message
        ImageMsg imageMsg = new ImageMsg();
        imageMsg.header = new HeaderMsg
        {
            stamp = new TimeMsg
            {
                sec = (int)System.DateTime.UtcNow.Subtract(new System.DateTime(1970, 1, 1)).TotalSeconds,
                nanosec = 0
            },
            frame_id = "unity_camera"
        };
        imageMsg.height = (uint)height;
        imageMsg.width = (uint)width;
        imageMsg.encoding = "rgb8";
        imageMsg.is_bigendian = 0;
        imageMsg.step = (uint)(width * 3);  // 3 bytes per pixel for RGB
        imageMsg.data = imageBytes;

        // Publish the image
        ros.Publish(rgbTopic, imageMsg);
    }

    void OnDestroy()
    {
        if (colorTexture != null) colorTexture.Release();
        if (readbackTexture != null) DestroyImmediate(readbackTexture);
    }
}
```

## Validation and Testing

### Validating Visual Perception Results

To validate that your visual perception pipeline is working correctly:

1. **Check data flow**: Verify that camera topics are publishing data
   ```bash
   ros2 topic echo /camera/image
   ros2 topic echo /depth_camera/depth
   ```

2. **Verify image quality**:
   - Images should have expected resolution and format
   - Depth values should be in reasonable ranges
   - Point clouds should represent the scene geometry

3. **Test processing nodes**:
   - Ensure no errors in processing node logs
   - Verify that processed data is published correctly

## Performance Considerations

### Optimizing Visual Processing

For real-time visual perception in humanoid robotics:

- **Resolution**: Balance quality vs. processing speed (640x480 often sufficient for perception)
- **Frame Rate**: Match to physics simulation rate (typically 30-60 FPS)
- **Processing Pipeline**: Use efficient algorithms and consider multi-threading
- **Memory Management**: Reuse buffers where possible to avoid allocation overhead

## Troubleshooting Common Issues

### Camera Not Publishing Data

1. **Check Gazebo plugins**: Verify camera plugin is loaded
   ```bash
   gz topic -l | grep camera
   ```

2. **Verify URDF**: Check that camera is properly attached to robot

3. **ROS topics**: Ensure topic names match between publisher and subscriber

### Depth Data Issues

1. **Invalid values**: Handle infinite and NaN values appropriately
2. **Units**: Verify depth values are in meters (not millimeters)
3. **Range**: Check that depth values are within expected range

## Next Steps

After implementing visual perception:

1. Move to LiDAR perception for additional sensing modalities
2. Integrate IMU data for state estimation
3. Implement sensor fusion to combine multiple sensor inputs
4. Test perception in complex environments with varied lighting conditions

## References

1. Geiger, A., Lenz, P., & Urtasun, R. (2013). Are we ready for autonomous driving? The KITTI vision benchmark suite. *IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*, 3354-3361.

2. Murillo, A. C., & Sagues, C. (2017). Vision-based localization from the ground up. *IEEE Transactions on Robotics*, 33(1), 156-172.

3. Rusu, R. B., & Cousins, S. (2011). 3D is here: Point Cloud Library (PCL). *IEEE International Conference on Robotics and Automation (ICRA)*, 1-4.

4. Zhang, Z. (2012). A flexible new technique for camera calibration. *IEEE Transactions on Pattern Analysis and Machine Intelligence*, 22(11), 1330-1334.

5. OpenCV Contributors. (2025). OpenCV Library. *Open Source Computer Vision*. https://opencv.org/

---

This guide provides the foundation for implementing visual perception in your digital twin environment. The next section will cover LiDAR-based perception for 3D spatial understanding.