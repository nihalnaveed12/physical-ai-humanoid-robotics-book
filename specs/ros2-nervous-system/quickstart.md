# Quickstart Guide: Module 1: The Robotic Nervous System (ROS 2)

**Feature**: Module 1: The Robotic Nervous System (ROS 2)
**Date**: 2025-12-09

## Prerequisites

- Ubuntu 22.04 LTS (or equivalent Linux distribution)
- ROS 2 Humble Hawksbill installed
- Python 3.8 or higher
- Basic knowledge of Python programming
- Understanding of Linux command line

## Setup Environment

1. **Install ROS 2 Humble Hawksbill**:
   ```bash
   # Add ROS 2 repository
   sudo apt update && sudo apt install -y curl gnupg lsb-release
   sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(source /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
   sudo apt update
   sudo apt install ros-humble-desktop
   ```

2. **Setup ROS 2 Environment**:
   ```bash
   source /opt/ros/humble/setup.bash
   ```

3. **Install Python dependencies**:
   ```bash
   pip3 install rclpy
   ```

## Basic ROS 2 Concepts

### Creating a Node
```python
import rclpy
from rclpy.node import Node

class MinimalNode(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        # Node initialization code here

def main(args=None):
    rclpy.init(args=args)
    minimal_node = MinimalNode()
    rclpy.spin(minimal_node)
    minimal_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Running Examples
1. Source your ROS 2 environment: `source /opt/ros/humble/setup.bash`
2. Navigate to your workspace
3. Build: `colcon build`
4. Source the workspace: `source install/setup.bash`
5. Run examples as described in the module content

## Verification Steps

- Verify ROS 2 installation: `ros2 --version`
- Test basic ROS 2 commands: `ros2 topic list`
- Confirm Python-ROS bridge: `python3 -c "import rclpy"`
- Validate URDF parsing: `check_urdf /path/to/urdf/file.urdf`

## Troubleshooting

- If ROS 2 commands are not found, ensure the environment is sourced
- If Python packages are not found, check Python path and installation
- For URDF errors, validate XML syntax and required elements