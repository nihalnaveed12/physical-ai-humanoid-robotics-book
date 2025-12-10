---
sidebar_position: 7
title: "Depth Camera Simulation"
---

# Depth Camera Simulation

## Overview

Depth cameras provide 3D spatial information by capturing both color (RGB) and depth (distance) data for each pixel. This guide covers how to simulate depth cameras in both Gazebo and Unity environments for digital twin applications, enabling advanced perception capabilities in humanoid robots.

## Understanding Depth Cameras in Robotics

Depth cameras combine RGB imaging with depth sensing to provide rich 3D perception data. They are essential for:

- **3D Object Recognition**: Identifying objects in 3D space
- **Scene Understanding**: Understanding spatial relationships between objects
- **Grasping and Manipulation**: Providing precise 3D coordinates for robotic arms
- **SLAM (Simultaneous Localization and Mapping)**: Creating 3D maps of environments
- **Human-Robot Interaction**: Detecting and tracking humans in 3D space

Common depth camera technologies include:
- **Stereo Vision**: Two cameras to calculate depth via triangulation
- **Structured Light**: Projecting patterns to calculate depth
- **Time-of-Flight (ToF)**: Measuring light travel time to calculate distance

## Depth Camera Simulation in Gazebo

### Adding Depth Camera to URDF

To add a depth camera to your robot model in Gazebo, define it in your URDF file:

```xml
<!-- Add this to your robot URDF file -->
<link name="camera_link">
  <visual>
    <geometry>
      <box size="0.05 0.05 0.02"/>
    </geometry>
    <material name="black">
      <color rgba="0 0 0 1"/>
    </material>
  </visual>
  <collision>
    <geometry>
      <box size="0.05 0.05 0.02"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="0.05"/>
    <inertia ixx="0.00001" ixy="0" ixz="0" iyy="0.00001" iyz="0" izz="0.00001"/>
  </inertial>
</link>

<joint name="camera_joint" type="fixed">
  <parent link="head"/>
  <child link="camera_link"/>
  <origin xyz="0.02 0 0.02" rpy="0 0 0"/>  <!-- Position on robot head -->
</joint>

<!-- Gazebo-specific depth camera sensor definition -->
<gazebo reference="camera_link">
  <sensor name="depth_camera" type="depth">
    <pose>0 0 0 0 0 0</pose>
    <camera name="depth_cam">
      <horizontal_fov>1.047</horizontal_fov>  <!-- 60 degrees in radians -->
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.1</near>  <!-- Minimum range (m) -->
        <far>10.0</far>   <!-- Maximum range (m) -->
      </clip>
      <noise>
        <type>gaussian</type>
        <mean>0.0</mean>
        <stddev>0.01</stddev>
      </noise>
    </camera>
    <plugin name="camera_controller" filename="libgazebo_ros_openni_kinect.so">
      <ros>
        <namespace>camera</namespace>
        <remapping>~/rgb/image_raw:=image</remapping>
        <remapping>~/depth/image_raw:=depth</remapping>
        <remapping>~/rgb/camera_info:=camera_info</remapping>
        <remapping>~/depth/camera_info:=depth_camera_info</remapping>
      </ros>
      <camera_name>depth_camera</camera_name>
      <image_topic_name>image</image_topic_name>
      <depth_image_topic_name>depth</depth_image_topic_name>
      <depth_image_camera_info_topic_name>depth_camera_info</depth_image_camera_info_topic_name>
      <point_cloud_topic_name>points</point_cloud_topic_name>
      <frame_name>camera_link</frame_name>
      <baseline>0.1</baseline>
      <distortion_k1>0.0</distortion_k1>
      <distortion_k2>0.0</distortion_k2>
      <distortion_k3>0.0</distortion_k3>
      <distortion_t1>0.0</distortion_t1>
      <distortion_t2>0.0</distortion_t2>
      <point_cloud_cutoff>0.1</point_cloud_cutoff>
      <point_cloud_cutoff_max>3.0</point_cloud_cutoff_max>
      <Cx>0</Cx>
      <Cy>0</Cy>
    </plugin>
  </sensor>
</gazebo>
```

### Depth Camera Configuration Parameters

#### Camera Properties
- **horizontal_fov**: Horizontal field of view in radians (60° = 1.047 rad)
- **image**: Resolution and format of captured images
  - **width/height**: Image dimensions (640x480 is common)
  - **format**: Color format (R8G8B8 for RGB)

#### Range Parameters
- **near/far clip**: Minimum and maximum distance for depth sensing
- **point_cloud_cutoff**: Minimum distance for point cloud generation
- **point_cloud_cutoff_max**: Maximum distance for point cloud generation

#### Noise Parameters
- **mean/stddev**: Gaussian noise parameters to simulate real sensor noise
- **type**: Noise model (gaussian is most common)

### Advanced Depth Camera Configuration

For higher-quality depth sensing:

```xml
<sensor name="high_res_depth_camera" type="depth">
  <camera name="high_res_cam">
    <horizontal_fov>1.047</horizontal_fov>
    <image>
      <width>1280</width>  <!-- Higher resolution -->
      <height>720</height>
      <format>R8G8B8</format>
    </image>
    <clip>
      <near>0.05</near>   <!-- Closer minimum range -->
      <far>15.0</far>     <!-- Extended maximum range -->
    </clip>
    <noise>
      <type>gaussian</type>
      <mean>0.0</mean>
      <stddev>0.005</stddev>  <!-- Lower noise for higher quality -->
    </noise>
  </camera>
  <plugin name="high_res_camera_controller" filename="libgazebo_ros_openni_kinect.so">
    <ros>
      <namespace>camera_high_res</namespace>
      <remapping>~/rgb/image_raw:=image</remapping>
      <remapping>~/depth/image_raw:=depth</remapping>
      <remapping>~/rgb/camera_info:=camera_info</remapping>
      <remapping>~/depth/camera_info:=depth_camera_info</remapping>
      <remapping>~/points:=pointcloud</remapping>
    </ros>
    <camera_name>high_res_depth_camera</camera_name>
    <image_topic_name>image</image_topic_name>
    <depth_image_topic_name>depth</depth_image_topic_name>
    <point_cloud_topic_name>pointcloud</point_cloud_topic_name>
    <frame_name>camera_link</frame_name>
    <update_rate>30</update_rate>  <!-- Higher update rate -->
    <baseline>0.075</baseline>
    <point_cloud_cutoff>0.05</point_cloud_cutoff>
    <point_cloud_cutoff_max>10.0</point_cloud_cutoff_max>
  </plugin>
</sensor>
```

## Depth Camera Data Processing

### Understanding Depth Camera Messages

Depth cameras output multiple message types:

1. **sensor_msgs/Image**: RGB color image
2. **sensor_msgs/Image**: Depth image (16-bit or 32-bit float)
3. **sensor_msgs/CameraInfo**: Camera intrinsic parameters
4. **sensor_msgs/PointCloud2**: 3D point cloud (optional)

```python
# Example Python code to process depth camera data
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo
from cv_bridge import CvBridge
import numpy as np
import cv2

class DepthCameraProcessor(Node):
    def __init__(self):
        super().__init__('depth_camera_processor')
        self.bridge = CvBridge()

        # Subscribers for RGB and depth images
        self.rgb_sub = self.create_subscription(
            Image,
            '/camera/image',  # RGB image topic
            self.rgb_callback,
            10)

        self.depth_sub = self.create_subscription(
            Image,
            '/camera/depth',  # Depth image topic
            self.depth_callback,
            10)

    def rgb_callback(self, msg):
        # Convert ROS Image message to OpenCV image
        cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

        # Process RGB image
        height, width, channels = cv_image.shape
        self.get_logger().info(f'RGB Image: {width}x{height}, {channels} channels')

    def depth_callback(self, msg):
        # Convert depth image to numpy array
        depth_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='passthrough')

        # Process depth data
        height, width = depth_image.shape

        # Example: Calculate distance to center pixel
        center_depth = depth_image[height//2, width//2]
        if np.isfinite(center_depth):
            self.get_logger().info(f'Center pixel depth: {center_depth:.2f}m')

        # Example: Find depth statistics
        valid_depths = depth_image[np.isfinite(depth_image)]
        if len(valid_depths) > 0:
            avg_depth = np.mean(valid_depths)
            min_depth = np.min(valid_depths)
            max_depth = np.max(valid_depths)
            self.get_logger().info(f'Depth stats - Avg: {avg_depth:.2f}m, Min: {min_depth:.2f}m, Max: {max_depth:.2f}m')
```

### Point Cloud Generation

Convert depth images to 3D point clouds:

```python
def depth_to_pointcloud(self, depth_image, camera_info):
    """Convert depth image to 3D point cloud"""
    # Get camera intrinsic parameters
    fx = camera_info.k[0]  # Focal length x
    fy = camera_info.k[4]  # Focal length y
    cx = camera_info.k[2]  # Principal point x
    cy = camera_info.k[5]  # Principal point y

    height, width = depth_image.shape
    points = []

    for v in range(height):
        for u in range(width):
            depth = depth_image[v, u]

            if np.isfinite(depth) and depth > 0:
                # Convert pixel coordinates to 3D world coordinates
                x = (u - cx) * depth / fx
                y = (v - cy) * depth / fy
                z = depth

                points.append([x, y, z])

    return np.array(points)

def process_pointcloud(self, points):
    """Process 3D point cloud data"""
    if len(points) == 0:
        return

    # Example: Calculate bounding box
    min_coords = np.min(points, axis=0)
    max_coords = np.max(points, axis=0)
    center = (min_coords + max_coords) / 2

    self.get_logger().info(f'Point cloud center: {center}')
    self.get_logger().info(f'Bounding box: {min_coords} to {max_coords}')
```

## Depth Camera Simulation in Unity

### Unity Depth Camera Implementation

Since Unity doesn't have native depth cameras, we simulate them using multiple rendering techniques:

```csharp
using System.Collections.Generic;
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Sensor_msgs;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Std_msgs;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Geometry_msgs;

public class UnityDepthCameraSimulation : MonoBehaviour
{
    ROSConnection ros;
    public string imageTopic = "unity_camera/image";
    public string depthTopic = "unity_camera/depth";
    public string pointCloudTopic = "unity_camera/points";

    public Camera depthCamera;
    public int width = 640;
    public int height = 480;
    public float updateRate = 30f;  // Hz

    private RenderTexture colorTexture;
    private RenderTexture depthTexture;
    private Texture2D colorTexture2D;
    private Texture2D depthTexture2D;
    private float updateInterval;
    private float lastUpdateTime;

    void Start()
    {
        ros = ROSConnection.instance;
        updateInterval = 1.0f / updateRate;
        lastUpdateTime = Time.time;

        // Create render textures for color and depth
        colorTexture = new RenderTexture(width, height, 24, RenderTextureFormat.ARGB32);
        depthTexture = new RenderTexture(width, height, 24, RenderTextureFormat.Depth);

        // Create 2D textures for reading
        colorTexture2D = new Texture2D(width, height, TextureFormat.RGB24, false);
        depthTexture2D = new Texture2D(width, height, TextureFormat.RFloat, false);

        // Configure the depth camera if not set in editor
        if (depthCamera == null)
        {
            depthCamera = GetComponent<Camera>();
        }

        depthCamera.targetTexture = colorTexture;
        depthCamera.depthTextureMode = DepthTextureMode.Depth;
    }

    void Update()
    {
        if (Time.time - lastUpdateTime >= updateInterval)
        {
            CaptureAndPublishData();
            lastUpdateTime = Time.time;
        }
    }

    void CaptureAndPublishData()
    {
        // Render the scene from the camera
        depthCamera.targetTexture = colorTexture;
        depthCamera.Render();

        // Read color texture
        RenderTexture.active = colorTexture;
        colorTexture2D.ReadPixels(new Rect(0, 0, width, height), 0, 0);
        colorTexture2D.Apply();

        // Read depth texture
        depthCamera.targetTexture = depthTexture;
        depthCamera.Render();
        RenderTexture.active = depthTexture;
        depthTexture2D.ReadPixels(new Rect(0, 0, width, height), 0, 0);
        depthTexture2D.Apply();

        // Publish RGB image
        PublishRGBImage();

        // Publish depth image
        PublishDepthImage();

        // Optionally publish point cloud
        PublishPointCloud();
    }

    void PublishRGBImage()
    {
        // Convert texture to byte array
        byte[] imageData = colorTexture2D.EncodeToJPG();

        // Create ROS Image message
        ImageMsg imageMsg = new ImageMsg();
        imageMsg.header = CreateHeader();
        imageMsg.height = (uint)height;
        imageMsg.width = (uint)width;
        imageMsg.encoding = "rgb8";
        imageMsg.is_bigendian = 0;
        imageMsg.step = (uint)(width * 3);  // 3 bytes per pixel for RGB
        imageMsg.data = imageData;

        ros.Publish(imageTopic, imageMsg);
    }

    void PublishDepthImage()
    {
        // Convert depth texture to float array
        Color32[] depthColors = depthTexture2D.GetPixels32();
        float[] depthData = new float[depthColors.Length];

        for (int i = 0; i < depthColors.Length; i++)
        {
            // Convert from Color32 to depth value (this is a simplified approach)
            // In practice, you'd need more sophisticated depth extraction
            depthData[i] = depthColors[i].r / 255.0f * 10.0f;  // Scale to 0-10m range
        }

        // Create ROS Image message for depth
        ImageMsg depthMsg = new ImageMsg();
        depthMsg.header = CreateHeader();
        depthMsg.height = (uint)height;
        depthMsg.width = (uint)width;
        depthMsg.encoding = "32FC1";  // 32-bit float, single channel
        depthMsg.is_bigendian = 0;
        depthMsg.step = (uint)(width * sizeof(float));

        // Convert float array to byte array
        byte[] depthBytes = new byte[depthData.Length * sizeof(float)];
        for (int i = 0; i < depthData.Length; i++)
        {
            byte[] floatBytes = System.BitConverter.GetBytes(depthData[i]);
            System.Buffer.BlockCopy(floatBytes, 0, depthBytes, i * sizeof(float), sizeof(float));
        }
        depthMsg.data = depthBytes;

        ros.Publish(depthTopic, depthMsg);
    }

    void PublishPointCloud()
    {
        // Generate point cloud from depth data
        Color32[] depthColors = depthTexture2D.GetPixels32();

        // This is a simplified point cloud generation
        // In practice, you'd use camera intrinsics to convert depth to 3D points
        List<float> points = new List<float>();

        float fovX = depthCamera.fieldOfView * Mathf.Deg2Rad;
        float fovY = fovX * (height / (float)width);  // Approximate

        for (int y = 0; y < height; y++)
        {
            for (int x = 0; x < width; x++)
            {
                int idx = y * width + x;
                float depth = depthColors[idx].r / 255.0f * 10.0f;  // 0-10m

                if (depth > 0 && depth < 10.0f)  // Valid depth range
                {
                    // Calculate 3D coordinates
                    float angleX = (x - width / 2.0f) / (width / 2.0f) * (fovX / 2);
                    float angleY = (y - height / 2.0f) / (height / 2.0f) * (fovY / 2);

                    float x3d = depth * Mathf.Tan(angleX);
                    float y3d = depth * Mathf.Tan(angleY);
                    float z3d = depth;

                    // Transform from camera space to world space
                    Vector3 worldPoint = depthCamera.transform.TransformPoint(new Vector3(x3d, -y3d, z3d));

                    points.Add(worldPoint.x);
                    points.Add(worldPoint.y);
                    points.Add(worldPoint.z);
                }
            }
        }

        // Create PointCloud2 message
        PointCloud2Msg pcMsg = new PointCloud2Msg();
        pcMsg.header = CreateHeader();
        pcMsg.height = 1;
        pcMsg.width = (uint)points.Count / 3;
        pcMsg.is_dense = true;
        pcMsg.is_bigendian = false;

        // Define fields (x, y, z)
        pcMsg.fields = new PointFieldMsg[3];
        pcMsg.fields[0] = new PointFieldMsg { name = "x", offset = 0, datatype = 7, count = 1 }; // FLOAT32
        pcMsg.fields[1] = new PointFieldMsg { name = "y", offset = 4, datatype = 7, count = 1 }; // FLOAT32
        pcMsg.fields[2] = new PointFieldMsg { name = "z", offset = 8, datatype = 7, count = 1 }; // FLOAT32
        pcMsg.point_step = 12; // 3 floats * 4 bytes each
        pcMsg.row_step = pcMsg.point_step * pcMsg.width;

        // Convert points to byte array
        List<byte> pcBytes = new List<byte>();
        for (int i = 0; i < points.Count; i++)
        {
            byte[] floatBytes = System.BitConverter.GetBytes(points[i]);
            pcBytes.AddRange(floatBytes);
        }
        pcMsg.data = pcBytes.ToArray();

        ros.Publish(pointCloudTopic, pcMsg);
    }

    HeaderMsg CreateHeader()
    {
        return new HeaderMsg
        {
            stamp = new TimeMsg
            {
                sec = (int)System.DateTime.UtcNow.Subtract(
                    new System.DateTime(1970, 1, 1)).TotalSeconds,
                nanosec = 0
            },
            frame_id = "camera_link"
        };
    }

    void OnDestroy()
    {
        if (colorTexture != null) colorTexture.Release();
        if (depthTexture != null) depthTexture.Release();
        if (colorTexture2D != null) Destroy(colorTexture2D);
        if (depthTexture2D != null) Destroy(depthTexture2D);
    }
}
```

### Optimizing Unity Depth Camera Performance

For better performance with depth cameras:

```csharp
public class OptimizedDepthCamera : MonoBehaviour
{
    public int width = 640;
    public int height = 480;
    public float updateRate = 15f;  // Lower update rate for performance

    private RenderTexture colorTexture;
    private RenderTexture depthTexture;
    private Texture2D readbackTexture;
    private byte[] imageDataCache;
    private float[] depthDataCache;

    void Start()
    {
        // Create textures once
        colorTexture = new RenderTexture(width, height, 24, RenderTextureFormat.ARGB32);
        depthTexture = new RenderTexture(width, height, 24, RenderTextureFormat.Depth);
        readbackTexture = new Texture2D(width, height, TextureFormat.RGB24, false);

        // Pre-allocate arrays to avoid garbage collection
        imageDataCache = new byte[width * height * 3];
        depthDataCache = new float[width * height];
    }

    void CaptureOptimized()
    {
        // Render to texture
        Camera cam = GetComponent<Camera>();
        cam.targetTexture = colorTexture;
        cam.Render();

        // Read pixels efficiently
        RenderTexture.active = colorTexture;
        readbackTexture.ReadPixels(new Rect(0, 0, width, height), 0, 0);

        // Process data without creating new objects
        ProcessImageData(readbackTexture.GetPixels32());
    }

    void ProcessImageData(Color32[] pixels)
    {
        // Convert and cache image data efficiently
        for (int i = 0; i < pixels.Length; i++)
        {
            imageDataCache[i * 3] = pixels[i].r;
            imageDataCache[i * 3 + 1] = pixels[i].g;
            imageDataCache[i * 3 + 2] = pixels[i].b;
        }
    }
}
```

## Integration with ROS 2

### Depth Camera Data Synchronization

To synchronize depth camera data between Gazebo and Unity:

```python
# Python example for synchronizing depth camera data
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo
from message_filters import ApproximateTimeSynchronizer, Subscriber
import numpy as np

class DepthCameraSynchronizer(Node):
    def __init__(self):
        super().__init__('depth_camera_synchronizer')

        # Create subscribers for both RGB images
        gazebo_rgb_sub = Subscriber(self, Image, '/gazebo/camera/image')
        unity_rgb_sub = Subscriber(self, Image, '/unity/camera/image')

        # Create subscribers for both depth images
        gazebo_depth_sub = Subscriber(self, Image, '/gazebo/camera/depth')
        unity_depth_sub = Subscriber(self, Image, '/unity/camera/depth')

        # Synchronize RGB and depth pairs
        gazebo_ats = ApproximateTimeSynchronizer(
            [gazebo_rgb_sub, gazebo_depth_sub],
            queue_size=10,
            slop=0.1
        )
        gazebo_ats.registerCallback(self.gazebo_sync_callback)

        unity_ats = ApproximateTimeSynchronizer(
            [unity_rgb_sub, unity_depth_sub],
            queue_size=10,
            slop=0.1
        )
        unity_ats.registerCallback(self.unity_sync_callback)

    def gazebo_sync_callback(self, rgb_msg, depth_msg):
        self.get_logger().info(f'Gazebo: RGB={len(rgb_msg.data)}, Depth={len(depth_msg.data)}')

    def unity_sync_callback(self, rgb_msg, depth_msg):
        self.get_logger().info(f'Unity: RGB={len(rgb_msg.data)}, Depth={len(depth_msg.data)}')
```

### Depth Camera Data Validation

To validate your depth camera simulation:

```python
class DepthCameraValidator(Node):
    def __init__(self):
        super().__init__('depth_camera_validator')

        self.rgb_sub = self.create_subscription(
            Image,
            '/camera/image',
            self.validate_rgb,
            10)

        self.depth_sub = self.create_subscription(
            Image,
            '/camera/depth',
            self.validate_depth,
            10)

    def validate_rgb(self, msg):
        expected_size = msg.width * msg.height * 3  # RGB = 3 bytes per pixel

        if len(msg.data) != expected_size:
            self.get_logger().warn(f'RGB image size mismatch: {len(msg.data)} vs {expected_size}')
            return

        if msg.encoding != 'rgb8' and msg.encoding != 'bgr8':
            self.get_logger().warn(f'Unexpected RGB encoding: {msg.encoding}')
            return

        self.get_logger().info(f'RGB validation passed: {msg.width}x{msg.height}')

    def validate_depth(self, msg):
        expected_size = msg.width * msg.height * 4  # 32-bit float = 4 bytes per pixel

        if len(msg.data) != expected_size:
            self.get_logger().warn(f'Depth image size mismatch: {len(msg.data)} vs {expected_size}')
            return

        if msg.encoding != '32FC1':
            self.get_logger().warn(f'Unexpected depth encoding: {msg.encoding}')
            return

        # Check that depth values are reasonable
        depth_array = np.frombuffer(msg.data, dtype=np.float32).reshape((msg.height, msg.width))
        valid_depths = depth_array[np.isfinite(depth_array) & (depth_array > 0)]

        if len(valid_depths) > 0:
            if np.min(valid_depths) < 0.05 or np.max(valid_depths) > 20.0:  # Outside expected range
                self.get_logger().warn(f'Depth values outside expected range: {np.min(valid_depths)} - {np.max(valid_depths)}')
            else:
                self.get_logger().info(f'Depth validation passed: range {np.min(valid_depths):.2f} - {np.max(valid_depths):.2f}m')
```

## Real-World Examples

### Object Recognition Scenario

For object recognition with depth data:

```xml
<!-- Add objects to your world file for testing -->
<model name="test_cube">
  <pose>1 0 0.5 0 0 0</pose>
  <link name="link">
    <collision name="collision">
      <geometry>
        <box size="0.2 0.2 0.2"/>
      </geometry>
    </collision>
    <visual name="visual">
      <geometry>
        <box size="0.2 0.2 0.2"/>
      </geometry>
      <material>
        <ambient>1 0 0 1</ambient>
        <diffuse>1 0 0 1</diffuse>
      </material>
    </visual>
  </link>
</model>
```

### Indoor Navigation with Depth Perception

Configure camera for indoor navigation:

```xml
<!-- Mount camera at appropriate height for indoor navigation -->
<joint name="camera_joint" type="fixed">
  <parent link="head"/>
  <child link="camera_link"/>
  <origin xyz="0.02 0 0.1" rpy="0 0 0"/>  <!-- Higher for better floor visibility -->
</joint>

<!-- Adjust for indoor lighting conditions -->
<gazebo reference="camera_link">
  <sensor name="indoor_camera" type="depth">
    <camera name="indoor_cam">
      <horizontal_fov>1.396</horizontal_fov>  <!-- 80 degrees for wider view -->
      <clip>
        <near>0.1</near>
        <far>8.0</far>  <!-- Indoor range -->
      </clip>
    </camera>
  </sensor>
</gazebo>
```

## Troubleshooting Common Issues

### Depth Camera Not Publishing Data

1. **Check Gazebo sensor loading**:
   ```bash
   # Verify the depth camera is loaded
   gz topic -i -t /camera/image
   gz topic -i -t /camera/depth
   ```

2. **Verify URDF syntax**:
   ```bash
   # Check URDF validity
   check_urdf your_robot.urdf
   ```

3. **Check ROS topics**:
   ```bash
   # List all camera topics
   ros2 topic list | grep camera
   ```

### Performance Issues

- **Reduce resolution**: Lower from 1280x720 to 640x480
- **Lower update rate**: Reduce from 30Hz to 15Hz
- **Limit range**: Reduce far clip distance if not needed
- **Use compressed images**: Enable image compression for transmission

### Inconsistent Data Between Gazebo and Unity

- **Ensure same camera parameters**: FOV, resolution, and clipping planes should match
- **Coordinate systems**: Ensure both use same frame of reference
- **Noise models**: Add similar noise to Unity simulation to match Gazebo

## Next Steps

After implementing depth camera simulation:

1. Test with various lighting and object configurations
2. Implement IMU simulation (next section)
3. Create sensor fusion algorithms combining RGB-D and other sensors
4. Validate that simulated data matches expected real-world behavior

## References

- ROS 2 Sensor Messages: http://docs.ros.org/en/rolling/p/sensor_msgs/
- Gazebo Camera Sensors: https://classic.gazebosim.org/tutorials?tut=ros_gzplugins
- OpenNI Kinect Plugin: https://github.com/ros-simulation/gazebo_ros_pkgs/wiki/ROS-2-Migration:-OpenNI-Kinect-plugin
- Unity Camera Class: https://docs.unity3d.com/ScriptReference/Camera.html

---

This guide provides the foundation for implementing depth camera simulation in your digital twin environment. The next section will cover IMU simulation for inertial sensing.